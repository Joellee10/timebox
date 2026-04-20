// UI 디자인 토큰 — 여기서 수정하면 앱 전체 톤이 바뀐다.

// 컨테이너
export const card = 'bg-white rounded-lg shadow-sm p-3 sm:p-6';

// 섹션 헤더 (border-b 포함)
export const sectionHeading =
  'text-sm sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 border-b border-gray-200 pb-2';

// 헤더 안의 회색 부가 텍스트 (카운트, 서브 라벨)
export const headingMuted = 'text-xs sm:text-sm font-normal text-gray-400';

// 서브 헤더 (border 없음)
export const subHeading = 'text-sm sm:text-base font-semibold text-gray-700';

// 리스트 아이템 (태스크 행, 우선순위 행)
export const listItem =
  'p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-all';

// 텍스트 input (BrainDump 등)
export const textInput =
  'p-2 sm:p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent';

// 칩 버튼 (둥근 pill)
export const chip = 'text-xs px-2.5 py-0.5 sm:py-1 rounded-full border transition-colors';
export const chipIdle =
  'bg-white border-gray-300 text-gray-600 hover:bg-gray-700 hover:text-white hover:border-gray-700';
export const chipActive = 'bg-gray-700 text-white border-gray-700 hover:bg-gray-800';
export const chipDisabled =
  'disabled:bg-gray-100 disabled:text-gray-300 disabled:border-gray-200 disabled:cursor-not-allowed';

// 조금 더 큰 칩 (History 날짜 버튼)
export const chipLg = 'px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm border transition-colors';

// 아이콘 버튼 (X, ArrowUp 등)
export const iconButton = 'text-gray-400 hover:text-gray-600';

// 점선 박스 (추가 버튼, 드롭존)
export const dashedBox =
  'border border-dashed border-gray-200 hover:border-gray-300 rounded-lg transition-colors';

// 보조 텍스트
export const mutedText = 'text-xs sm:text-sm text-gray-400';
