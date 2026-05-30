// 디자인 테마 목록 — ThemeSwitcher가 사용한다.
// key 는 <html data-theme="key"> 에 들어가고, index.css의 변수 블록과 매칭된다.
// 'soft'는 :root 기본값이라 data-theme를 비운다(아래 applyTheme 참고).
// swatch: 선택기 미리보기용 [배경, 표면, 액센트] 색.

export const THEMES = [
  {
    key: 'soft',
    label: 'Soft',
    desc: '깔끔한 라이트 · 기본',
    swatch: ['#f3f4f6', '#ffffff', '#374151'],
  },
  {
    key: 'warm',
    label: 'Warm',
    desc: '크림 + 테라코타 · 따뜻함',
    swatch: ['#f4ece1', '#fdfaf5', '#c2683f'],
  },
  {
    key: 'dark',
    label: 'Dark',
    desc: 'Linear 풍 다크 · 인디고',
    swatch: ['#0b0c0e', '#17191d', '#7c6cff'],
  },
  {
    key: 'mono',
    label: 'Mono',
    desc: '흑백 고대비 · 미니멀',
    swatch: ['#ffffff', '#f5f5f5', '#0a0a0a'],
  },
];

export const DEFAULT_THEME = 'soft';
export const STORAGE_KEY = 'timebox-theme';

// 테마를 <html>에 적용 + 저장. soft는 기본값이라 속성 제거.
export function applyTheme(key) {
  const root = document.documentElement;
  if (key && key !== DEFAULT_THEME) {
    root.dataset.theme = key;
  } else {
    delete root.dataset.theme;
  }
  try {
    localStorage.setItem(STORAGE_KEY, key);
  } catch {
    // ignore
  }
}

// 저장된 테마 읽기 (없으면 기본).
export function getStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}
