import React from 'react';
import { X } from 'lucide-react';
import { subHeading, headingMuted, listItem, dashedBox, iconButton } from '../../ui/styles';

export default function TimeBlockSection({
  title,
  timeRange,
  blockKey,
  items,
  draggedItem,
  onDragOver,
  onDrop,
  onItemDragStart,
  onItemDragEnd,
  onToggleDone,
  onRemove,
}) {
  return (
    <div className="border-l-2 sm:border-l-4 border-[var(--tb-accent)] pl-3 sm:pl-4">
      <div className="flex items-baseline gap-2 mb-2 sm:mb-3">
        <h3 className={subHeading}>
          {title} <span className={headingMuted}>{timeRange}</span>
        </h3>
      </div>
      <div
        className={`space-y-1.5 sm:space-y-2 mb-3 min-h-[60px] sm:min-h-[200px] p-2 sm:p-3 ${dashedBox} ${
          draggedItem &&
          (draggedItem.type === 'priority' ||
            (draggedItem.type === 'timeblock' && draggedItem.timeBlock !== blockKey)) &&
          items.length < 3
            ? 'border-[var(--tb-accent)] bg-[var(--tb-inset)]'
            : ''
        }`}
        onDragOver={onDragOver}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDrop(blockKey);
        }}
      >
        {items.map((item, index) => (
          <div
            key={index}
            draggable
            onDragStart={() => onItemDragStart(blockKey, index)}
            onDragEnd={onItemDragEnd}
            className={`flex items-center gap-2 ${listItem} cursor-move ${
              draggedItem?.type === 'timeblock' &&
              draggedItem.timeBlock === blockKey &&
              draggedItem.index === index
                ? 'opacity-50'
                : ''
            } ${item.done || false ? 'opacity-75' : ''}`}
          >
            <input
              type="checkbox"
              checked={item.done || false}
              onChange={() => onToggleDone(blockKey, index)}
              className="w-4 h-4 sm:w-5 sm:h-5 rounded border-2 border-[var(--tb-border)] focus:ring-2 focus:ring-[var(--tb-accent)] transition-colors accent-[var(--tb-accent)]"
            />
            <span
              className={`flex-1 text-sm font-semibold ${
                item.done || false ? 'line-through text-[var(--tb-faint)]' : 'text-[var(--tb-text)]'
              }`}
            >
              {item.text || item}
            </span>
            <button onClick={() => onRemove(blockKey, index)} className={iconButton}>
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center text-xs sm:text-sm text-[var(--tb-faint)] py-2 sm:py-8">비어있음</div>
        )}
      </div>
    </div>
  );
}
