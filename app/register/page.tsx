'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isCompanyEmail = /@ww/i.test(email);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // profiles row ถูกสร้างอัตโนมัติโดย DB trigger (handle_new_user)
    // ซึ่งเช็ค domain @ww... เองแล้วตั้ง status ให้ถูกต้อง (pending_verification / pending_approval)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName } }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(isCompanyEmail ? '/verify' : '/pending-approval');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <form
        onSubmit={handleRegister}
        className="w-[400px] bg-[var(--panel)] border border-[var(--line)] rounded-xl shadow-lg p-9"
      >
        <h1 className="text-xl font-semibold mb-1.5">สมัครสมาชิก</h1>
        <p className="text-[var(--ink-soft)] text-sm mb-6">กรอกข้อมูลเพื่อขอเข้าใช้งานระบบ</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs text-[var(--ink-soft)] mb-1.5">ชื่อ</label>
            <input
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--line-strong)] bg-[var(--panel-2)] outline-none focus:border-teal"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--ink-soft)] mb-1.5">นามสกุล</label>
            <input
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--line-strong)] bg-[var(--panel-2)] outline-none focus:border-teal"
            />
          </div>
        </div>
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
          {email && (
            <p className={`text-[11px] mt-1.5 ${isCompanyEmail ? 'text-green' : 'text-amber'}`}>
              {isCompanyEmail
                ? '✓ อีเมลบริษัท — ยืนยันตัวตนอัตโนมัติผ่านอีเมล'
                : '⚠ อีเมลนี้ต้องรอผู้ดูแลระบบอนุมัติก่อนใช้งาน'}
            </p>
          )}
        </div>
        <div className="mb-5">
          <label className="block text-xs text-[var(--ink-soft)] mb-1.5">รหัสผ่าน</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-[var(--line-strong)] bg-[var(--panel-2)] outline-none focus:border-teal"
          />
        </div>

        {error && <p className="text-rose text-xs mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-teal text-white font-semibold text-sm hover:brightness-110 disabled:opacity-60"
        >
          {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
        </button>

        <p className="mt-4 text-center text-xs text-[var(--ink-soft)]">
          มีบัญชีแล้ว?{' '}
          <a href="/login" className="text-teal font-medium">
            เข้าสู่ระบบ
          </a>
        </p>
      </form>
    </div>
  );
}
