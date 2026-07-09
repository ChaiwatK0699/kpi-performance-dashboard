'use client';

import { useTransition } from 'react';
import { updateUserRole, approveUser, suspendUser } from '@/app/(app)/users/actions';

interface ProfileRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'dev' | 'admin' | 'viewer' | 'pending';
  status: string;
  is_company_email: boolean;
}

const STATUS_LABEL: Record<string, string> = {
  active: 'ใช้งานอยู่',
  pending_verification: 'รอยืนยันอีเมล',
  pending_approval: 'รออนุมัติ',
  suspended: 'ระงับการใช้งาน'
};

export default function UsersTable({ profiles }: { profiles: ProfileRow[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <table className="border-collapse w-full text-[12.5px]">
      <thead>
        <tr className="text-left text-[10.8px] uppercase text-[var(--ink-soft)]">
          <th className="border-b border-[var(--line-strong)] py-2">ชื่อ - นามสกุล</th>
          <th className="border-b border-[var(--line-strong)] py-2">อีเมล</th>
          <th className="border-b border-[var(--line-strong)] py-2">สถานะ</th>
          <th className="border-b border-[var(--line-strong)] py-2">สิทธิ์ (Role)</th>
          <th className="border-b border-[var(--line-strong)] py-2"></th>
        </tr>
      </thead>
      <tbody>
        {profiles.map((p) => (
          <tr key={p.id}>
            <td className="border-b border-[var(--line)] py-2">{p.first_name} {p.last_name}</td>
            <td className="border-b border-[var(--line)] py-2">
              {p.email} {!p.is_company_email && <span className="text-amber text-[10.5px]">(นอกบริษัท)</span>}
            </td>
            <td className="border-b border-[var(--line)] py-2">
              <span className={p.status === 'active' ? 'text-green' : p.status === 'suspended' ? 'text-rose' : 'text-amber'}>
                {STATUS_LABEL[p.status] ?? p.status}
              </span>
            </td>
            <td className="border-b border-[var(--line)] py-2">
              <select
                defaultValue={p.role}
                onChange={(e) => startTransition(async () => { await updateUserRole(p.id, e.target.value as ProfileRow['role']); })}
                className="bg-[var(--panel-2)] border border-[var(--line-strong)] rounded px-2 py-1.5 outline-none focus:border-teal"
              >
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
                <option value="dev">Dev</option>
                <option value="pending">Pending</option>
              </select>
            </td>
            <td className="border-b border-[var(--line)] py-2 text-right space-x-2">
              {p.status !== 'active' && (
                <button
                  onClick={() => startTransition(async () => { await approveUser(p.id); })}
                  className="px-2.5 py-1.5 rounded bg-teal text-white text-[11.5px] font-semibold"
                >
                  อนุมัติ
                </button>
              )}
              {p.status === 'active' && (
                <button
                  onClick={() => startTransition(async () => { await suspendUser(p.id); })}
                  className="px-2.5 py-1.5 rounded border border-[var(--line-strong)] text-[11.5px]"
                >
                  ระงับ
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
      {isPending && <caption className="text-left text-[11px] text-[var(--ink-soft)] mt-2">กำลังบันทึก...</caption>}
    </table>
  );
}
