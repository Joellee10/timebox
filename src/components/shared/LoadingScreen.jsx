import React from 'react';
import { Loader } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen font-sans flex items-center justify-center">
      <div className="text-center">
        <Loader className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
        <p className="text-gray-500">데이터를 불러오는 중...</p>
      </div>
    </div>
  );
}
