// UI 디자인 토큰 — 여기서 수정하면 앱 전체 톤이 바뀐다.
// 색/보더/라운드/그림자는 index.css의 시맨틱 변수(--tb-*)를 참조한다.
// 테마는 <html data-theme="..."> 로 전환된다 (ThemeSwitcher).

// 컨테이너
export const card =
  'bg-[var(--tb-surface)] border-[length:var(--tb-border-width)] border-[var(--tb-border)] rounded-[var(--tb-radius)] shadow-[var(--tb-shadow)] p-3 sm:p-6';

// 섹션 헤더 (border-b 포함) — tb-heading이 테마별 폰트/굵기/자간/대소문자 적용
export const sectionHeading =
  'tb-heading text-sm sm:text-xl text-[var(--tb-text)] mb-3 sm:mb-4 border-b border-[var(--tb-border)] pb-2';

// 헤더 안의 회색 부가 텍스트 (카운트, 서브 라벨)
export const headingMuted = 'text-xs sm:text-sm font-normal text-[var(--tb-faint)] normal-case';

// 서브 헤더 (border 없음)
export const subHeading = 'tb-heading text-sm sm:text-base text-[var(--tb-text)]';

// 리스트 아이템 (태스크 행, 우선순위 행)
export const listItem =
  'p-2 sm:p-3 bg-[var(--tb-inset)] rounded-[var(--tb-radius)] border border-[var(--tb-border)] hover:shadow-sm transition-all';

// 텍스트 input (BrainDump 등)
export const textInput =
  'p-2 sm:p-3 text-sm bg-[var(--tb-surface)] text-[var(--tb-text)] border border-[var(--tb-border)] rounded-[var(--tb-radius)] focus:ring-2 focus:ring-[var(--tb-accent)] focus:border-transparent placeholder:text-[var(--tb-faint)]';

// 칩 버튼 (둥근 pill)
export const chip = 'text-xs px-2.5 py-0.5 sm:py-1 rounded-full border transition-colors';
export const chipIdle =
  'bg-[var(--tb-surface)] border-[var(--tb-border)] text-[var(--tb-muted)] hover:bg-[var(--tb-accent)] hover:text-[var(--tb-accent-contrast)] hover:border-[var(--tb-accent)]';
export const chipActive =
  'bg-[var(--tb-accent)] text-[var(--tb-accent-contrast)] border-[var(--tb-accent)] opacity-100 hover:opacity-90';
export const chipDisabled =
  'disabled:bg-[var(--tb-inset)] disabled:text-[var(--tb-faint)] disabled:border-[var(--tb-border)] disabled:cursor-not-allowed';

// 조금 더 큰 칩 (History 날짜 버튼)
export const chipLg =
  'px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm border transition-colors';

// 아이콘 버튼 (X, ArrowUp 등)
export const iconButton = 'text-[var(--tb-faint)] hover:text-[var(--tb-text)]';

// 점선 박스 (추가 버튼, 드롭존)
export const dashedBox =
  'border border-dashed border-[var(--tb-border)] hover:border-[var(--tb-muted)] rounded-[var(--tb-radius)] transition-colors';

// 보조 텍스트
export const mutedText = 'text-xs sm:text-sm text-[var(--tb-faint)]';
