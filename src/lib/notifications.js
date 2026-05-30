import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

// 매일 "계획 짜기" 리마인더 (로컬 알림). 네이티브에서만 실제 동작, 웹은 no-op.
const REMINDER_ID = 1001;
const PREF_KEY = 'timebox-reminder';
const DEFAULT_PREF = { enabled: false, time: '08:00' };

export const isNative = () => Capacitor.isNativePlatform();

export function getReminderPref() {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    return raw ? { ...DEFAULT_PREF, ...JSON.parse(raw) } : { ...DEFAULT_PREF };
  } catch {
    return { ...DEFAULT_PREF };
  }
}

export function setReminderPref(pref) {
  try {
    localStorage.setItem(PREF_KEY, JSON.stringify(pref));
  } catch {
    // ignore
  }
}

async function ensurePermission() {
  const status = await LocalNotifications.requestPermissions();
  return status.display === 'granted';
}

async function scheduleDailyReminder(time) {
  const [hour, minute] = time.split(':').map(Number);
  await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
  await LocalNotifications.schedule({
    notifications: [
      {
        id: REMINDER_ID,
        title: 'Timebox',
        body: '오늘 하루를 계획해볼까요? ✍️',
        schedule: { on: { hour, minute }, allowWhileIdle: true, repeats: true },
      },
    ],
  });
}

async function cancelReminder() {
  await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
}

// 설정(pref)에 맞춰 알림을 적용. 반환: true=성공, false=권한 거부, null=웹(no-op)
export async function applyReminder(pref) {
  if (!isNative()) return null;
  try {
    if (pref.enabled) {
      const ok = await ensurePermission();
      if (!ok) return false;
      await scheduleDailyReminder(pref.time);
      return true;
    }
    await cancelReminder();
    return true;
  } catch (e) {
    console.error('Reminder apply failed:', e);
    return false;
  }
}

// 앱 시작 시 저장된 설정대로 재예약 (네이티브 한정).
export async function initReminders() {
  if (!isNative()) return;
  const pref = getReminderPref();
  if (pref.enabled) await applyReminder(pref);
}
