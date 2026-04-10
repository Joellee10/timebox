import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function CodeEntryScreen({ onSubmit }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');

    try {
      if (!supabase) { setError('서버 설정 오류'); return; }
      const { data, error: fetchError } = await supabase
        .from('user_codes')
        .select('code')
        .eq('code', trimmed)
        .single();

      if (fetchError || !data) {
        setError('유효하지 않은 코드입니다.');
        return;
      }

      localStorage.setItem('timebox-user-code', trimmed);
      onSubmit(trimmed);
    } catch {
      setError('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="w-full max-w-xs">
        <div className="text-center mb-8">
          <h1 className="text-lg font-semibold text-gray-900">Timebox</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(''); }}
            placeholder="Enter your code"
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-gray-700 text-center tracking-widest focus:outline-none focus:ring-1 focus:ring-violet-400 focus:border-violet-400 placeholder-gray-300"
            autoFocus
          />

          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full py-2.5 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
