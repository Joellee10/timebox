import React from 'react';
import { X } from 'lucide-react';
import {
  card,
  sectionHeading,
  headingMuted,
  listItem,
  chip,
  chipIdle,
  chipActive,
  chipDisabled,
  iconButton,
  mutedText,
} from '../../ui/styles';

const BLOCKS = [
  { key: 'morning', label: '오전' },
  { key: 'afternoon1', label: '오후1' },
  { key: 'afternoon2', label: '오후2' },
];

const getText = (p) => (typeof p === 'string' ? p : p?.text ?? '');
const getPlacedIn = (p) => (typeof p === 'string' ? null : p?.placedIn ?? null);

export default function Priorities({
  priorities,
  timeBlocks,
  draggedItem,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onUpdate,
  onRemove,
  onMoveToBlock,
}) {
  return (
    <div className={`${card} min-h-[200px] lg:h-[360px] overflow-y-auto`}>
      <h2 className={sectionHeading}>
        Top 3 Priorities <span className={headingMuted}>{priorities.length}/3</span>
      </h2>
      <div className="space-y-2 sm:space-y-3">
        {priorities.map((priority, index) => {
          const text = getText(priority);
          const placedIn = getPlacedIn(priority);
          return (
            <div
              key={index}
              draggable
              onDragStart={() => onDragStart(index)}
              onDragOver={onDragOver}
              onDrop={() => onDrop(index)}
              onDragEnd={onDragEnd}
              className={`${listItem} cursor-move ${
                draggedItem?.type === 'priority' && draggedItem.index === index
                  ? 'opacity-50 scale-95'
                  : ''
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="w-6 h-6 sm:w-7 sm:h-7 bg-gray-700 text-white rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm flex-shrink-0">
                  {index + 1}
                </span>
                <input
                  value={text}
                  onChange={(e) => onUpdate(index, e.target.value)}
                  className="flex-1 p-1 border-none bg-transparent focus:outline-none text-sm"
                  placeholder={`Priority ${index + 1}...`}
                />
                <button onClick={() => onRemove(index)} className={iconButton}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              {onMoveToBlock && (
                <div className="flex gap-1.5 mt-2 ml-8 sm:ml-10">
                  {BLOCKS.map((block) => {
                    const isActive = placedIn === block.key;
                    const isFull = !isActive && (timeBlocks?.[block.key]?.length ?? 0) >= 3;
                    return (
                      <button
                        key={block.key}
                        onClick={() => onMoveToBlock(index, block.key)}
                        disabled={isFull || !text.trim()}
                        className={`${chip} ${isActive ? chipActive : chipIdle} ${chipDisabled}`}
                      >
                        {block.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        {priorities.length === 0 && (
          <p className={`${mutedText} text-center py-4`}>Brain Dump에서 추가하세요</p>
        )}
      </div>
    </div>
  );
}
