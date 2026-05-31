import { createClient } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

// 개발자 백도어 코드 — 백엔드 없이 로컬(localStorage)로만 동작하는 모드.
export const DEV_CODE = '0000';

// 네이티브 OAuth 복귀용 딥링크 (AndroidManifest의 커스텀 스킴과 일치, Supabase Redirect URLs에 등록 필요)
export const NATIVE_REDIRECT = 'com.joel.timebox://login-callback';

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

// 구글 로그인.
// - 네이티브(안드로이드): 시스템 브라우저로 OAuth → 딥링크(NATIVE_REDIRECT)로 복귀.
//   복귀 처리는 useAuth의 appUrlOpen 리스너가 담당(토큰 파싱 → setSession).
//   (안드로이드 Credential Manager의 reauth 이슈를 우회)
// - 웹: 기존 리다이렉트 OAuth
export async function signInWithGoogle() {
  if (!supabase) throw new Error('Supabase not configured');

  if (Capacitor.isNativePlatform()) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: NATIVE_REDIRECT, skipBrowserRedirect: true },
    });
    if (error) throw error;
    if (!data?.url) throw new Error('OAuth URL을 받지 못했어요.');
    await Browser.open({ url: data.url, presentationStyle: 'popover' });
    return { data: null, error: null };
  }

  // 웹: 리다이렉트 플로우
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
}

// 딥링크 URL에서 토큰을 파싱해 세션을 설정한다. (네이티브 복귀 처리)
// 성공하면 true, 해당 URL이 아니면 false.
export async function completeNativeOAuth(url) {
  if (!supabase || !url) return false;
  // 토큰은 fragment(#) 또는 query(?)에 올 수 있음
  const hashIndex = url.indexOf('#');
  const queryIndex = url.indexOf('?');
  const raw = hashIndex >= 0 ? url.slice(hashIndex + 1) : queryIndex >= 0 ? url.slice(queryIndex + 1) : '';
  if (!raw) return false;
  const params = new URLSearchParams(raw);
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  if (access_token && refresh_token) {
    const { error } = await supabase.auth.setSession({ access_token, refresh_token });
    try { await Browser.close(); } catch { /* ignore */ }
    if (error) throw error;
    return true;
  }
  // PKCE code 플로우인 경우
  const code = params.get('code');
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    try { await Browser.close(); } catch { /* ignore */ }
    if (error) throw error;
    return true;
  }
  return false;
}

// 로그아웃.
export async function signOutUser() {
  if (!supabase) return;
  return supabase.auth.signOut();
}
