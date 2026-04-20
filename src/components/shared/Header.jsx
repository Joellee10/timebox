import React, { useRef } from 'react';
import { Cloud, CloudOff, Loader, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
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
      <div className="flex items-center" title={lastSyncError || ''}>
        {isSaving ? (
          <Loader className="w-4 h-4 text-blue-500 animate-spin" />
        ) : lastSyncError ? (
          <CloudOff className="w-4 h-4 text-red-500" />
        ) : (
          <Cloud className="w-4 h-4 text-green-500" />
        )}
      </div>
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
    <div className="mb-4 sm:mb-6 bg-white rounded-lg shadow-sm p-3 sm:p-4">
      <div className="mb-2">
        <input
          value={profile.title}
          onChange={(e) => updateProfile({ ...profile, title: e.target.value })}
          placeholder="나의 Timebox"
          className="text-lg sm:text-2xl font-bold text-gray-800 bg-transparent border-none focus:outline-none w-full"
        />
        <input
          value={profile.subtitle}
          onChange={(e) => updateProfile({ ...profile, subtitle: e.target.value })}
          placeholder="한 줄 문구를 입력하세요"
          className="text-xs sm:text-sm text-gray-500 italic mt-1 bg-transparent border-none focus:outline-none w-full"
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
            className="text-sm sm:text-base text-gray-700 font-medium hover:text-blue-600 transition-colors truncate"
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
