import React from 'react';
import { ArrowDown, Plus, X } from 'lucide-react';
import {
  card,
  sectionHeading,
  textInput,
  iconButton,
  dashedBox,
} from '../../ui/styles';

export default function BrainDump({
  items,
  priorities,
  onAdd,
  onUpdate,
  onRemove,
  onMoveToPriority,
  onKeyDown,
  showKeyboardHints = true,
}) {
  return (
    <div className={`${card} min-h-[250px] lg:h-[380px]`}>
      <h2 className={sectionHeading}>Brain Dump</h2>
      <div className="space-y-1.5 sm:space-y-2 max-h-[240px] overflow-y-auto">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5 sm:gap-2">
            <input
              value={item}
              onChange={(e) => onUpdate(index, e.target.value)}
              onKeyDown={(e) => onKeyDown(index, e)}
              data-braindump-index={index}
              placeholder="태스크를 적어보세요..."
              className={`flex-1 ${textInput}`}
            />
            <button
              onClick={() => onMoveToPriority(index)}
              disabled={!item.trim() || priorities.length >= 3}
              className={`p-1.5 sm:p-2 ${iconButton} disabled:text-gray-300 disabled:cursor-not-allowed`}
              title="우선순위로 이동"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => onRemove(index)}
              className={`p-1.5 sm:p-2 ${iconButton}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onAdd}
            className={`flex-1 flex items-center gap-2 p-2 sm:p-3 text-sm text-gray-400 hover:text-gray-600 ${dashedBox}`}
          >
            <Plus className="w-4 h-4" />
            <span>추가</span>
          </button>
          <span className="p-1.5 sm:p-2 invisible" aria-hidden="true">
            <X className="w-4 h-4" />
          </span>
          <span className="p-1.5 sm:p-2 invisible" aria-hidden="true">
            <X className="w-4 h-4" />
          </span>
        </div>
      </div>
      {showKeyboardHints && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">Cmd+P: 우선순위로 이동 / Enter: 다음 줄</p>
        </div>
      )}
    </div>
  );
}
