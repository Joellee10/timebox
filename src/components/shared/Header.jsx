import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { iconButton } from '../../ui/styles';

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
}

export default function Header({
  profile,
  updateProfile,
  selectedDate,
  setSelectedDate,
  navigateDate,
  isSaving,
  lastSyncError,
  onSignOut,
  showDetails = true,
}) {
  const dateInputRef = useRef(null);

  const statusAndSignOut = (
    <div className="flex items-center gap-1 flex-shrink-0">
      <button onClick={onSignOut} className={`p-1.5 ${iconButton}`} title="나가기">
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );

  if (!showDetails) {
    return (
      <div className="flex items-center justify-end gap-1 mb-2 sm:mb-3">{statusAndSignOut}</div>
    );
  }

  return (
    <div className="mb-4 sm:mb-6 bg-[var(--tb-surface)] border border-[var(--tb-border)] rounded-[var(--tb-radius)] shadow-[var(--tb-shadow)] p-3 sm:p-4">
      <div className="mb-2">
        <input
          value={profile.title}
          onChange={(e) => updateProfile({ ...profile, title: e.target.value })}
          placeholder="나의 Timebox"
          className="tb-heading text-lg sm:text-2xl text-[var(--tb-text)] bg-transparent border-none focus:outline-none w-full placeholder:text-[var(--tb-faint)]"
        />
        <input
          value={profile.subtitle}
          onChange={(e) => updateProfile({ ...profile, subtitle: e.target.value })}
          placeholder="한 줄 문구를 입력하세요"
          className="text-xs sm:text-sm text-[var(--tb-muted)] italic mt-1 bg-transparent border-none focus:outline-none w-full placeholder:text-[var(--tb-faint)]"
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 min-w-0">
          <button
            onClick={() => navigateDate(-1)}
            className={`p-1 ${iconButton} flex-shrink-0`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => dateInputRef.current?.showPicker()}
            className="text-sm sm:text-base text-[var(--tb-text)] font-medium hover:text-[var(--tb-accent)] transition-colors truncate"
          >
            {formatDate(selectedDate)}
          </button>
          <input
            ref={dateInputRef}
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="absolute opacity-0 w-0 h-0"
          />
          <button
            onClick={() => navigateDate(1)}
            className={`p-1 ${iconButton} flex-shrink-0`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {statusAndSignOut}
      </div>
    </div>
  );
}
