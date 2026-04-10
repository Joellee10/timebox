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
    if (!supabase) { setLoading(false); setError('서버 설정 오류'); return; }
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
    if (!supabase) { setCreating(false); setError('서버 설정 오류'); return; }
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
    if (!confirm(`"${code}" 삭제?`)) return;
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
    <div className="min-h-screen bg-[#fafafa] px-4 py-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-lg font-semibold text-gray-900 mb-1">Admin</h1>
        <p className="text-xs text-gray-400 mb-6">Manage user codes</p>

        <form onSubmit={handleCreate} className="flex gap-2 mb-8">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-violet-400 placeholder-gray-300"
          />
          <input
            type="text"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            placeholder="Code (auto)"
            className="w-28 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-violet-400 placeholder-gray-300 font-mono"
          />
          <button
            type="submit"
            disabled={creating || !name.trim()}
            className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </form>

        {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

        <div className="text-xs text-gray-400 uppercase tracking-wider mb-3">
          Codes ({codes.length})
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm text-center py-8">...</p>
        ) : codes.length === 0 ? (
          <p className="text-gray-300 text-sm text-center py-8">No codes yet</p>
        ) : (
          <div className="space-y-0.5">
            {codes.map((item) => (
              <div
                key={item.code}
                className="group flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <code className="text-sm font-mono text-violet-600 font-medium">
                    {item.code}
                  </code>
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-xs text-gray-300">
                    {new Date(item.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopy(item.code)}
                    className="p-1.5 text-gray-300 hover:text-gray-600 transition-colors"
                  >
                    {copiedCode === item.code ? <Check className="w-3.5 h-3.5 text-violet-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDelete(item.code)}
                    className="p-1.5 text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
