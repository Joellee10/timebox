import React, { useState } from 'react';
import { card, sectionHeading, mutedText } from '../../ui/styles';
import { getReminderPref, setReminderPref, applyReminder, isNative } from '../../lib/notifications';

export default function ReminderSettings() {
  const [pref, setPref] = useState(getReminderPref());
  const [msg, setMsg] = useState('');

  const update = async (next) => {
    setPref(next);
    setReminderPref(next);
    const result = await applyReminder(next);
    if (next.enabled && result === false) {
      setMsg('알림 권한이 꺼져 있어요. 기기 설정에서 Timebox 알림을 허용해주세요.');
    } else {
      setMsg('');
    }
  };

  return (
    <div className={card}>
      <h2 className={sectionHeading}>알림</h2>

      {!isNative() && (
        <p className={`${mutedText} mb-3`}>
          알림은 안드로이드 앱에서 동작합니다. (웹에서는 설정만 저장됨)
        </p>
      )}

      <div className="flex items-center justify-between py-2">
        <div>
          <p className="text-sm text-[var(--tb-text)]">매일 계획 리마인더</p>
          <p className="text-xs text-[var(--tb-faint)]">정한 시간에 하루 계획을 알려드려요</p>
        </div>
        <input
          type="checkbox"
          checked={pref.enabled}
          onChange={(e) => update({ ...pref, enabled: e.target.checked })}
          className="w-5 h-5 rounded accent-[var(--tb-accent)]"
        />
      </div>

      {pref.enabled && (
        <div className="flex items-center justify-between py-2 border-t border-[var(--tb-border)] mt-1">
          <span className="text-sm text-[var(--tb-text)]">시간</span>
          <input
            type="time"
            value={pref.time}
            onChange={(e) => update({ ...pref, time: e.target.value })}
            className="px-3 py-1.5 bg-[var(--tb-inset)] border border-[var(--tb-border)] rounded-[var(--tb-radius)] text-[var(--tb-text)] focus:outline-none focus:ring-2 focus:ring-[var(--tb-accent)]"
          />
        </div>
      )}

      {msg && <p className="text-xs text-red-500 mt-2">{msg}</p>}
    </div>
  );
}
