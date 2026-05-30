import { useState, useEffect, useCallback } from 'react';
import { supabase, signInWithGoogle as googleSignIn, signOutUser, DEV_CODE } from '../lib/supabase';

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

    return () => sub.subscription.unsubscribe();
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
