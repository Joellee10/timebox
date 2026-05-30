import React, { useEffect } from 'react';
import TimeboxTool from './TimeboxTool';
import LoginScreen from './components/LoginScreen';
import LoadingScreen from './components/shared/LoadingScreen';
import ThemeSwitcher from './components/shared/ThemeSwitcher';
import { useAuth } from './hooks/useAuth';
import { applyTheme, getStoredTheme } from './ui/themes';
import { initReminders } from './lib/notifications';

export default function App() {
  const { loading, isAuthed, devMode, userId, signInWithGoogle, signOut, enterDevMode } = useAuth();

  // 저장된 디자인 테마 복원 + 알림 재예약(네이티브 한정)
  useEffect(() => {
    applyTheme(getStoredTheme());
    initReminders();
  }, []);

  const ready = isAuthed || devMode;

  return (
    <>
      {loading ? (
        <LoadingScreen />
      ) : !ready ? (
        <LoginScreen onGoogle={signInWithGoogle} onDev={enterDevMode} />
      ) : (
        <div className="min-h-screen flex justify-center items-start bg-[var(--tb-bg)]">
          <div className="w-full max-w-6xl">
            <TimeboxTool userId={userId} onSignOut={signOut} />
          </div>
        </div>
      )}
      <ThemeSwitcher />
    </>
  );
}
