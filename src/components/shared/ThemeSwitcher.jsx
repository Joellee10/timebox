import React, { useState } from 'react';
import { Palette, Check, X } from 'lucide-react';
import { THEMES, applyTheme, getStoredTheme } from '../../ui/themes';
import { syncStatusBar } from '../../lib/native';

// 디자인 비교/선택용 떠 있는 선택기. (확정 후 제거 예정)
// 모바일 하단 탭 네비를 가리지 않도록 bottom-24에 띄운다.
export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(getStoredTheme());

  const pick = (key) => {
    applyTheme(key);
    setCurrent(key);
    syncStatusBar(); // 네이티브 상태바 색을 새 테마에 맞춤
  };

  return (
    <div className="fixed right-4 bottom-24 sm:bottom-6 z-20 flex flex-col items-end gap-3">
      {open && (
        <div className="w-60 bg-[var(--tb-surface)] border border-[var(--tb-border)] rounded-[var(--tb-radius)] shadow-lg p-2">
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-xs font-semibold text-[var(--tb-muted)]">디자인 테마</span>
            <button onClick={() => setOpen(false)} className="text-[var(--tb-faint)] hover:text-[var(--tb-text)]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1">
            {THEMES.map((t) => {
              const active = current === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => pick(t.key)}
                  className={`w-full flex items-center gap-3 p-2 rounded-[var(--tb-radius)] text-left transition-colors ${
                    active ? 'bg-[var(--tb-inset)]' : 'hover:bg-[var(--tb-inset)]'
                  }`}
                >
                  <span className="flex -space-x-1 flex-shrink-0">
                    {t.swatch.map((c, i) => (
                      <span
                        key={i}
                        className="w-4 h-4 rounded-full border border-[var(--tb-border)]"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-[var(--tb-text)]">{t.label}</span>
                    <span className="block text-xs text-[var(--tb-faint)] truncate">{t.desc}</span>
                  </span>
                  {active && <Check className="w-4 h-4 text-[var(--tb-accent)] flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-12 h-12 rounded-full bg-[var(--tb-accent)] text-[var(--tb-accent-contrast)] shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
        title="디자인 테마 변경"
        aria-label="디자인 테마 변경"
      >
        <Palette className="w-5 h-5" />
      </button>
    </div>
  );
}
