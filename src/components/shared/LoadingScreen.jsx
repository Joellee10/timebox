import React from 'react';
import { Loader } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-[var(--tb-bg)] min-h-screen font-sans flex items-center justify-center">
      <div className="text-center">
        <Loader className="w-8 h-8 text-[var(--tb-accent)] animate-spin mx-auto mb-3" />
        <p className="text-[var(--tb-muted)]">데이터를 불러오는 중...</p>
      </div>
    </div>
  );
}
