import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { supabase, signInWithGoogle as googleSignIn, signOutUser, completeNativeOAuth, DEV_CODE } from '../lib/supabase';

const DEV_FLAG = 'timebox-dev';

// 인증 상태 관리.
// - 로그인: Supabase Auth 세션
// - 개발자 모드: localStorage 플래그(timebox-dev). 백엔드 없이 로컬로 동작.
export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [devMode, setDevMode] = useState(() => {
    try {
      return localStorage.getItem(DEV_FLAG) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
    });

    // 네이티브: OAuth 딥링크 복귀 처리 (브라우저 → com.joel.timebox://login-callback#access_token=...)
    let urlListener;
    if (Capacitor.isNativePlatform()) {
      CapApp.addListener('appUrlOpen', ({ url }) => {
        completeNativeOAuth(url).catch((e) => console.error('OAuth 복귀 실패:', e?.message || e));
      }).then((l) => { urlListener = l; });
    }

    return () => {
      sub.subscription.unsubscribe();
      if (urlListener) urlListener.remove();
    };
  }, []);

  const enterDevMode = useCallback(() => {
    try {
      localStorage.setItem(DEV_FLAG, '1');
    } catch {
      // ignore
    }
    setDevMode(true);
  }, []);

  const signOut = useCallback(async () => {
    try {
      localStorage.removeItem(DEV_FLAG);
    } catch {
      // ignore
    }
    setDevMode(false);
    await signOutUser();
  }, []);

  const isAuthed = !!session;
  const userId = devMode ? DEV_CODE : session?.user?.id ?? null;

  return {
    loading,
    isAuthed,
    devMode,
    userId,
    user: session?.user ?? null,
    signInWithGoogle: googleSignIn,
    signOut,
    enterDevMode,
  };
}
