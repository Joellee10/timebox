import React, { useState } from 'react';
import TimeboxTool from './TimeboxTool';
import CodeEntryScreen from './components/CodeEntryScreen';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const isAdmin = new URLSearchParams(window.location.search).has('admin');

  const [userCode, setUserCode] = useState(() => {
    return localStorage.getItem('timebox-user-code') || null;
  });

  const handleSignOut = () => {
    localStorage.removeItem('timebox-user-code');
    localStorage.removeItem('timebox-v1');
    setUserCode(null);
  };

  if (isAdmin) {
    return <AdminPanel />;
  }

  if (!userCode) {
    return <CodeEntryScreen onSubmit={(code) => setUserCode(code)} />;
  }

  return (
    <div className="min-h-screen flex justify-center items-start bg-[#fafafa]">
      <div className="w-full max-w-6xl">
        <TimeboxTool userCode={userCode} onSignOut={handleSignOut} />
      </div>
    </div>
  );
}
