'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      setLoading(false);
      return;
    }
    router.push('/ranking');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <form
        onSubmit={handleLogin}
        className="w-[380px] bg-[var(--panel)] border border-[var(--line)] rounded-xl shadow-lg p-9"
      >
        <div className="flex items-center gap-2.5 mb-7">
          <div className="w-2.5 h-2.5 rounded-full bg-teal" />
          <span className="font-semibold tracking-wide text-sm">PMS · KPI PERFORMANCE</span>
        </div>
        <h1 className="text-xl font-semibold mb-1.5">เข้าสู่ระบบ</h1>
        <p className="text-[var(--ink-soft)] text-sm mb-6">ระบบติดตามและประเมินผล KPI รายเดือน</p>

        <div className="mb-4">
          <label className="block text-xs text-[var(--ink-soft)] mb-1.5">อีเมล</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-[var(--line-strong)] bg-[var(--panel-2)] outline-none focus:border-teal"
            placeholder="name@ww-company.com"
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs text-[var(--ink-soft)] mb-1.5">รหัสผ่าน</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-[var(--line-strong)] bg-[var(--panel-2)] outline-none focus:border-teal"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-rose text-xs mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-teal text-white font-semibold text-sm hover:brightness-110 disabled:opacity-60"
        >
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>

        <div className="mt-3.5 text-[11.5px] text-[var(--ink-soft)] bg-[var(--panel-2)] border border-dashed border-[var(--line-strong)] rounded-lg px-2.5 py-2 leading-relaxed">
          อีเมลบริษัท (ลงท้าย <b>@ww...</b>) ยืนยันอัตโนมัติ · อีเมลอื่นสมัครได้แต่ต้องรอผู้ดูแลระบบอนุมัติ
        </div>

        <p className="mt-4 text-center text-xs text-[var(--ink-soft)]">
          ยังไม่มีบัญชี?{' '}
          <a href="/register" className="text-teal font-medium">
            สมัครสมาชิก
          </a>
        </p>
      </form>
    </div>
  );
}
