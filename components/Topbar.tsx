'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const ROLE_LABEL: Record<string, string> = { dev: 'Dev', admin: 'Admin', viewer: 'ผู้ใช้งาน', pending: 'รออนุมัติ' };

export default function Topbar({ name, role }: { name: string; role: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [theme, setTheme] = useState<'day' | 'night'>('day');

  useEffect(() => {
    const saved = (localStorage.getItem('theme') as 'day' | 'night') || 'day';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  function toggleTheme() {
    const next = theme === 'day' ? 'night' : 'day';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const initials = name
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="h-[60px] border-b border-[var(--line)] flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-2.5">
        <h2 className="text-[15px] font-semibold">ระบบประเมินผล KPI</h2>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-teal font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
          เชื่อมต่อฐานข้อมูลแล้ว
        </span>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 bg-[var(--panel-2)] border border-[var(--line)] rounded-full px-1 py-1"
        >
          <span className="text-[11.5px] text-[var(--ink-soft)] px-1">🌞</span>
          <span className="w-6.5 h-5.5 rounded-full bg-teal text-white flex items-center justify-center text-xs">
            {theme === 'day' ? '🌙' : '🌞'}
          </span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7.5 h-7.5 rounded-full bg-teal text-white text-xs flex items-center justify-center font-semibold">
            {initials || '?'}
          </div>
          <div className="text-xs leading-tight">
            <b className="block text-[13px]">{name}</b>
            <span className="text-[var(--ink-soft)]">{ROLE_LABEL[role] ?? role}</span>
          </div>
          <button onClick={handleLogout} className="ml-2 text-[11px] text-[var(--ink-soft)] hover:text-rose underline">
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  );
}
