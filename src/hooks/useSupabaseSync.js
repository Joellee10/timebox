import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, DEV_CODE } from '../lib/supabase';

const STORAGE_KEY = 'timebox-v1';
const PROFILE_KEY = 'timebox-profile';

export function useSupabaseSync({ userId, data, setData, selectedDate, setSelectedDate }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSyncError, setLastSyncError] = useState(null);
  const [profile, setProfile] = useState({ title: '', subtitle: '' });
  const prevDataRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const profileTimerRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  // 백엔드 없이 로컬로만 동작하는 모드: 개발자 모드(0000) 또는 Supabase 미설정 시.
  const localOnly = !supabase || userId === DEV_CODE;

  // Supabase에서 전체 데이터 로드
  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      setIsLoading(true);

      // 로컬 전용 모드: localStorage에서만 로드하고 네트워크는 건드리지 않는다.
      if (localOnly) {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.data) setData(parsed.data);
            if (parsed?.selectedDate) setSelectedDate(parsed.selectedDate);
            prevDataRef.current = parsed?.data || {};
          } else {
            prevDataRef.current = {};
          }
          const rawProfile = localStorage.getItem(PROFILE_KEY);
          if (rawProfile) setProfile(JSON.parse(rawProfile));
        } catch {
          prevDataRef.current = {};
        }
        setLastSyncError(null);
        setIsLoading(false);
        isInitialLoadRef.current = false;
        return;
      }

      try {
        // 프로필 로드 (profiles 테이블, id = 로그인 사용자 UUID)
        const { data: profileData } = await supabase
          .from('profiles')
          .select('title, subtitle')
          .eq('id', userId)
          .maybeSingle();

        if (profileData) {
          setProfile({ title: profileData.title || '', subtitle: profileData.subtitle || '' });
        }

        const { data: rows, error } = await supabase
          .from('timebox_days')
          .select('date, day_data')
          .eq('user_id', userId);

        if (error) throw error;

        const loaded = {};
        for (const row of rows) {
          loaded[row.date] = row.day_data;
        }

        setData(loaded);
        prevDataRef.current = loaded;

        // localStorage에도 캐시
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: loaded, selectedDate }));
        setLastSyncError(null);
      } catch (err) {
        console.error('Supabase load failed, falling back to localStorage:', err);
        setLastSyncError(err.message);

        // 오프라인 폴백
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.data) setData(parsed.data);
            if (parsed?.selectedDate) setSelectedDate(parsed.selectedDate);
            prevDataRef.current = parsed?.data || {};
          }
        } catch {
          // ignore
        }
      } finally {
        setIsLoading(false);
        isInitialLoadRef.current = false;
      }
    };

    loadData();
  }, [userId]);

  // data 변경 시 디바운스 저장
  const saveToSupabase = useCallback(async (changedDate, dayData) => {
    if (!userId || localOnly) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('timebox_days')
        .upsert({
          user_id: userId,
          date: changedDate,
          day_data: dayData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,date' });

      if (error) throw error;
      setLastSyncError(null);
    } catch (err) {
      console.error('Supabase save failed:', err);
      setLastSyncError(err.message);
    } finally {
      setIsSaving(false);
    }
  }, [userId, localOnly]);

  useEffect(() => {
    // 초기 로드 중엔 저장하지 않음
    if (isInitialLoadRef.current || !userId) return;

    // localStorage에 즉시 캐시
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, selectedDate }));

    // 변경된 날짜 찾기
    const prev = prevDataRef.current || {};
    const changedDates = [];

    for (const date of Object.keys(data)) {
      if (JSON.stringify(data[date]) !== JSON.stringify(prev[date])) {
        changedDates.push(date);
      }
    }

    // 삭제된 날짜 처리
    for (const date of Object.keys(prev)) {
      if (!(date in data)) {
        changedDates.push(date);
      }
    }

    if (changedDates.length === 0) {
      prevDataRef.current = data;
      return;
    }

    // 로컬 전용 모드: localStorage 캐시만 하고 원격 저장은 건너뛴다.
    if (localOnly) {
      prevDataRef.current = { ...data };
      return;
    }

    // 디바운스 1.5초
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      for (const date of changedDates) {
        if (data[date]) {
          saveToSupabase(date, data[date]);
        } else {
          // 날짜 데이터가 삭제된 경우
          supabase
            .from('timebox_days')
            .delete()
            .eq('user_id', userId)
            .eq('date', date)
            .then(({ error }) => {
              if (error) console.error('Delete failed:', error);
            });
        }
      }
      prevDataRef.current = { ...data };
    }, 1500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [data, selectedDate, userId, localOnly, saveToSupabase]);

  // 프로필 업데이트 (디바운스)
  const updateProfile = useCallback((newProfile) => {
    setProfile(newProfile);

    // 로컬 전용 모드: localStorage에만 저장.
    if (localOnly) {
      try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
      } catch {
        // ignore
      }
      return;
    }

    if (profileTimerRef.current) clearTimeout(profileTimerRef.current);
    profileTimerRef.current = setTimeout(async () => {
      if (!userId) return;
      try {
        await supabase
          .from('profiles')
          .upsert(
            { id: userId, title: newProfile.title, subtitle: newProfile.subtitle },
            { onConflict: 'id' }
          );
      } catch (err) {
        console.error('Profile save failed:', err);
      }
    }, 1500);
  }, [userId, localOnly]);

  return { isLoading, isSaving, lastSyncError, profile, updateProfile };
}
