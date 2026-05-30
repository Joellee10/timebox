import React, { useState } from 'react';
import { supabase, DEV_CODE } from '../lib/supabase';

// 구글 G 로고 (멀티컬러)
function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.3C29.4 35 26.9 36 24 36c-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.6 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.4l6.3 5.3C41.4 36 44 30.6 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}

export default function LoginScreen({ onGoogle, onDev }) {
  const [error, setError] = useState('');
  const [showDev, setShowDev] = useState(false);
  const [devInput, setDevInput] = useState('');

  const handleGoogle = async () => {
    setError('');
    if (!supabase) {
      setError('서버가 아직 설정되지 않았어요. 개발자 모드로 들어가세요.');
      return;
    }
    try {
      const { error: e } = await onGoogle();
      if (e) setError(e.message);
    } catch (e) {
      setError(e?.message || '로그인에 실패했어요.');
    }
  };

  const handleDevSubmit = (e) => {
    e.preventDefault();
    if (devInput.trim() === DEV_CODE) {
      onDev();
    } else {
      setError('올바른 개발자 코드가 아니에요.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--tb-bg)] p-6">
      <div className="bg-[var(--tb-surface)] border-[length:var(--tb-border-width)] border-[var(--tb-border)] rounded-[var(--tb-radius)] shadow-[var(--tb-shadow)] p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="tb-heading text-2xl text-[var(--tb-text)]">Timebox</h1>
          <p className="text-sm text-[var(--tb-muted)] mt-1">하루를 계획하고 집중하세요</p>
        </div>

        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 py-3 bg-[var(--tb-surface)] border-[length:var(--tb-border-width)] border-[var(--tb-border)] rounded-[var(--tb-radius)] text-[var(--tb-text)] font-medium hover:bg-[var(--tb-inset)] transition-colors"
        >
          <GoogleIcon />
          Google로 계속하기
        </button>

        {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}

        <div className="mt-8 text-center">
          {!showDev ? (
            <button
              onClick={() => { setShowDev(true); setError(''); }}
              className="text-xs text-[var(--tb-faint)] hover:text-[var(--tb-muted)] transition-colors"
            >
              개발자 모드
            </button>
          ) : (
            <form onSubmit={handleDevSubmit} className="flex items-center gap-2 justify-center">
              <input
                value={devInput}
                onChange={(e) => { setDevInput(e.target.value); setError(''); }}
                placeholder="개발자 코드"
                autoFocus
                className="w-28 px-3 py-2 text-sm text-center bg-[var(--tb-inset)] text-[var(--tb-text)] border border-[var(--tb-border)] rounded-[var(--tb-radius)] focus:outline-none focus:ring-2 focus:ring-[var(--tb-accent)] placeholder:text-[var(--tb-faint)]"
              />
              <button
                type="submit"
                className="px-3 py-2 text-sm bg-[var(--tb-accent)] text-[var(--tb-accent-contrast)] rounded-[var(--tb-radius)] hover:opacity-90 transition-opacity"
              >
                입장
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
