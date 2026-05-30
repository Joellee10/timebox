import { createClient } from '@supabase/supabase-js';

// 개발자 백도어 코드 — 백엔드 없이 로컬(localStorage)로만 동작하는 모드.
export const DEV_CODE = '0000';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase env vars missing:', { supabaseUrl: !!supabaseUrl, supabaseAnonKey: !!supabaseAnonKey });
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Google OAuth 로그인 시작. 동의 후 현재 origin으로 리다이렉트되어 돌아온다.
export async function signInWithGoogle() {
  if (!supabase) throw new Error('Supabase not configured');
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
}

// 로그아웃.
export async function signOutUser() {
  if (!supabase) return;
  return supabase.auth.signOut();
}
