import React from 'react';
import { card, sectionHeading, subHeading, chipLg, chipIdle, chipActive } from '../../ui/styles';

export default function HistorySection({ data, selectedDate, setSelectedDate, showHeading = true }) {
  if (Object.keys(data).length === 0) return null;

  const selectedData = data[selectedDate];
  const allTasks = selectedData
    ? [
        ...(selectedData.timeBlocks?.morning || []),
        ...(selectedData.timeBlocks?.afternoon1 || []),
        ...(selectedData.timeBlocks?.afternoon2 || []),
      ].filter((task) => task && (task.text || task))
    : [];

  const completedTasks = allTasks.filter((task) => task.done);
  const pendingTasks = allTasks.filter((task) => !task.done);

  return (
    <div className={card}>
      {showHeading && <h2 className={sectionHeading}>History</h2>}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
        {Object.keys(data)
          .sort((a, b) => new Date(b) - new Date(a))
          .slice(0, 10)
          .map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`${chipLg} ${date === selectedDate ? chipActive : chipIdle}`}
            >
              {new Date(date).toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric',
              })}
            </button>
          ))}
      </div>

      {allTasks.length > 0 && (
        <div className="border-t border-[var(--tb-border)] pt-3 sm:pt-4">
          <div className="flex items-baseline gap-2 sm:gap-3 mb-2 sm:mb-3 flex-wrap">
            <h3 className={subHeading}>
              {new Date(selectedDate).toLocaleDateString('ko-KR', {
                month: 'long',
                day: 'numeric',
                weekday: 'short',
              })}
            </h3>
            <div className="flex gap-2 sm:gap-3 text-xs sm:text-sm text-[var(--tb-muted)]">
              <span>완료 {completedTasks.length}</span>
              <span>미완료 {pendingTasks.length}</span>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {completedTasks.length > 0 && (
              <div className="bg-[var(--tb-inset)] rounded-[var(--tb-radius)] p-2.5 sm:p-3 border border-[var(--tb-border)]">
                <h4 className="text-xs sm:text-sm font-medium text-[var(--tb-muted)] mb-1.5 sm:mb-2">
                  완료된 작업
                </h4>
                <div className="space-y-1">
                  {completedTasks.map((task, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs sm:text-sm">
                      <span className="line-through text-[var(--tb-faint)]">{task.text || task}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendingTasks.length > 0 && (
              <div className="bg-[var(--tb-inset)] rounded-[var(--tb-radius)] p-2.5 sm:p-3 border border-[var(--tb-border)]">
                <h4 className="text-xs sm:text-sm font-medium text-[var(--tb-muted)] mb-1.5 sm:mb-2">
                  미완료 작업
                </h4>
                <div className="space-y-1">
                  {pendingTasks.map((task, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs sm:text-sm">
                      <span className="text-[var(--tb-text)]">{task.text || task}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
