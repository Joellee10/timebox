import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'timebox-v1';

export function useSupabaseSync({ userCode, data, setData, selectedDate, setSelectedDate }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSyncError, setLastSyncError] = useState(null);
  const [profile, setProfile] = useState({ title: '', subtitle: '' });
  const prevDataRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const profileTimerRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  // Supabase에서 전체 데이터 로드
  useEffect(() => {
    if (!userCode) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        // 프로필 로드
        const { data: profileData } = await supabase
          .from('user_codes')
          .select('title, subtitle')
          .eq('code', userCode)
          .single();

        if (profileData) {
          setProfile({ title: profileData.title || '', subtitle: profileData.subtitle || '' });
        }

        const { data: rows, error } = await supabase
          .from('timebox_days')
          .select('date, day_data')
          .eq('user_code', userCode);

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
  }, [userCode]);

  // data 변경 시 디바운스 저장
  const saveToSupabase = useCallback(async (changedDate, dayData) => {
    if (!userCode) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('timebox_days')
        .upsert({
          user_code: userCode,
          date: changedDate,
          day_data: dayData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_code,date' });

      if (error) throw error;
      setLastSyncError(null);
    } catch (err) {
      console.error('Supabase save failed:', err);
      setLastSyncError(err.message);
    } finally {
      setIsSaving(false);
    }
  }, [userCode]);

  useEffect(() => {
    // 초기 로드 중엔 저장하지 않음
    if (isInitialLoadRef.current || !userCode) return;

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
            .eq('user_code', userCode)
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
  }, [data, selectedDate, userCode, saveToSupabase]);

  // 프로필 업데이트 (디바운스)
  const updateProfile = useCallback((newProfile) => {
    setProfile(newProfile);
    if (profileTimerRef.current) clearTimeout(profileTimerRef.current);
    profileTimerRef.current = setTimeout(async () => {
      if (!userCode) return;
      try {
        await supabase
          .from('user_codes')
          .update({ title: newProfile.title, subtitle: newProfile.subtitle })
          .eq('code', userCode);
      } catch (err) {
        console.error('Profile save failed:', err);
      }
    }, 1500);
  }, [userCode]);

  return { isLoading, isSaving, lastSyncError, profile, updateProfile };
}
