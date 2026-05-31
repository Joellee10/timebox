import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const isNative = () => Capacitor.isNativePlatform();

// --tb-bg(또는 임의 색)의 밝기로 상태바 글자색을 정한다.
function isLight(hex) {
  const m = (hex || '').trim().replace('#', '');
  if (m.length < 6) return true;
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  // 상대 휘도 (sRGB 근사)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6;
}

// 현재 테마의 배경색에 상태바 색/글자 스타일을 맞춘다.
export async function syncStatusBar() {
  if (!isNative()) return;
  try {
    const bg = getComputedStyle(document.documentElement)
      .getPropertyValue('--tb-bg')
      .trim() || '#f3f4f6';
    const light = isLight(bg);
    await StatusBar.setOverlaysWebView({ overlay: false });
    // 밝은 배경 → 어두운 글자(Style.Light), 어두운 배경 → 밝은 글자(Style.Dark)
    await StatusBar.setStyle({ style: light ? Style.Light : Style.Dark });
    if (bg.startsWith('#')) await StatusBar.setBackgroundColor({ color: bg });
  } catch {
    // ignore
  }
}

// 앱 셸 준비 완료 시 1회 호출: 스플래시 숨김 + 상태바 동기화.
export async function initNativeChrome() {
  if (!isNative()) return;
  await syncStatusBar();
  try {
    await SplashScreen.hide();
  } catch {
    // ignore
  }
}

// 가벼운 햅틱 (웹/실패 시 no-op).
export async function haptic(style = 'light') {
  if (!isNative()) return;
  try {
    const map = { light: ImpactStyle.Light, medium: ImpactStyle.Medium, heavy: ImpactStyle.Heavy };
    await Haptics.impact({ style: map[style] || ImpactStyle.Light });
  } catch {
    // ignore
  }
}
