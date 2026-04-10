import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Copy, Check } from 'lucide-react';

function generateCode() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export default function AdminPanel() {
  const [codes, setCodes] = useState([]);
  const [name, setName] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [error, setError] = useState('');

  const fetchCodes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setCodes(data);
    setLoading(false);
  };

  useEffect(() => { fetchCodes(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    setError('');

    const code = customCode.trim() || generateCode();

    const { error: insertError } = await supabase
      .from('user_codes')
      .insert({ code, name: name.trim() });

    if (insertError) {
      setError(insertError.code === '23505' ? '이미 존재하는 코드입니다.' : insertError.message);
    } else {
      setName('');
      setCustomCode('');
      fetchCodes();
    }
    setCreating(false);
  };

  const handleDelete = async (code) => {
    if (!confirm(`"${code}" 코드를 삭제할까요? 해당 사용자의 모든 데이터도 삭제됩니다.`)) return;

    await supabase.from('timebox_days').delete().eq('user_code', code);
    await supabase.from('user_codes').delete().eq('code', code);
    fetchCodes();
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Timebox Admin</h1>
          <p className="text-sm text-gray-500 mb-6">사용자 코드를 생성하고 관리합니다</p>

          <form onSubmit={handleCreate} className="space-y-3">
            <div className="flex gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="사용자 이름"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="코드 (비우면 자동생성)"
                className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={creating || !name.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                생성
              </button>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            등록된 코드 ({codes.length})
          </h2>

          {loading ? (
            <p className="text-gray-500 text-center py-8">로딩 중...</p>
          ) : codes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">등록된 코드가 없습니다</p>
          ) : (
            <div className="space-y-2">
              {codes.map((item) => (
                <div
                  key={item.code}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <code className="px-3 py-1 bg-blue-100 text-blue-700 rounded font-mono text-sm font-semibold">
                      {item.code}
                    </code>
                    <span className="text-gray-700">{item.name}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(item.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(item.code)}
                      className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                      title="코드 복사"
                    >
                      {copiedCode === item.code ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(item.code)}
                      className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
