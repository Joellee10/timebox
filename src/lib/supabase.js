import { createClient } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';

// 개발자 백도어 코드 — 백엔드 없이 로컬(localStorage)로만 동작하는 모드.
export const DEV_CODE = '0000';

// 구글 Web OAuth 클라이언트 ID (공개값). 네이티브 로그인의 serverClientId로도 쓰인다.
const GOOGLE_WEB_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID ||
  '717669906784-2v03u7b8s83dcotooabkas9v33t8f8e2.apps.googleusercontent.com';

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

let socialInited = false;
async function ensureSocialInit() {
  if (socialInited) return;
  await SocialLogin.initialize({ google: { webClientId: GOOGLE_WEB_CLIENT_ID } });
  socialInited = true;
}

// 구글 로그인.
// - 네이티브(안드로이드): 네이티브 구글 로그인으로 idToken 획득 → signInWithIdToken
//   (WebView에서는 구글이 리다이렉트 OAuth를 차단하므로 네이티브 방식 필수)
// - 웹: 기존 리다이렉트 OAuth
export async function signInWithGoogle() {
  if (!supabase) throw new Error('Supabase not configured');

  if (Capacitor.isNativePlatform()) {
    await ensureSocialInit();
    const res = await SocialLogin.login({
      provider: 'google',
      options: { scopes: ['email', 'profile'] },
    });
    const idToken = res?.result?.idToken;
    if (!idToken) throw new Error('구글 로그인에서 idToken을 받지 못했어요.');
    const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
    if (error) throw error;
    return { data: null, error: null };
  }

  // 웹: 리다이렉트 플로우
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
}

// 로그아웃.
export async function signOutUser() {
  if (Capacitor.isNativePlatform()) {
    try {
      await SocialLogin.logout({ provider: 'google' });
    } catch {
      // 로그인 상태가 아니면 무시
    }
  }
  if (!supabase) return;
  return supabase.auth.signOut();
}
