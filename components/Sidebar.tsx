'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ isAdminOrDev }: { isAdminOrDev: boolean }) {
  const pathname = usePathname();
  const isActive = (prefix: string) => pathname.startsWith(prefix);

  return (
    <div className="w-16 bg-[var(--rail)] h-screen flex flex-col items-center py-4.5 flex-shrink-0 relative z-30">
      <div className="w-8.5 h-8.5 rounded-lg bg-teal flex items-center justify-center text-white font-bold text-[13px] mb-7">
        KPI
      </div>

      <RailItem href="/ranking" icon="⌂" label="หน้าหลัก" active={isActive('/ranking') && pathname === '/ranking'} />

      <div className="group relative">
        <RailIcon icon="📊" label="Ranking" active={isActive('/ranking')} />
        <div className="hidden group-hover:flex absolute left-16 top-0 h-auto w-60 bg-[var(--panel)] border-r border-[var(--line)] shadow-lg p-3.5 flex-col z-40 rounded-r-lg">
          <div className="text-[11px] uppercase tracking-wide text-[var(--ink-soft)] mb-2 px-1.5">
            Ranking &amp; Performance
          </div>
          <Link href="/ranking" className="block px-2.5 py-2 rounded-md text-sm hover:bg-[var(--panel-2)]">
            ดูทั้งหมด (AD / Manager / Cluster Leader)
          </Link>
        </div>
      </div>

      {isAdminOrDev && (
        <div className="group relative">
          <RailIcon icon="🛠" label="หลังบ้าน" active={isActive('/backend') || isActive('/roster') || isActive('/users')} />
          <div className="hidden group-hover:flex absolute left-16 top-0 h-auto w-64 bg-[var(--panel)] border-r border-[var(--line)] shadow-lg p-3.5 flex-col z-40 rounded-r-lg">
            <div className="text-[11px] uppercase tracking-wide text-[var(--ink-soft)] mb-2 px-1.5">
              หลังบ้าน (Admin / Dev)
            </div>
            <Link href="/backend/kpi?dataset=ad" className="block px-2.5 py-2 rounded-md text-sm hover:bg-[var(--panel-2)]">
              แก้ไขคะแนน KPI — AD
            </Link>
            <Link href="/backend/kpi?dataset=manager" className="block px-2.5 py-2 rounded-md text-sm hover:bg-[var(--panel-2)]">
              แก้ไขคะแนน KPI — Manager
            </Link>
            <Link href="/roster" className="block px-2.5 py-2 rounded-md text-sm hover:bg-[var(--panel-2)]">
              จัดการชื่อ AD / Manager / Cluster Leader
            </Link>
            <Link href="/users" className="block px-2.5 py-2 rounded-md text-sm hover:bg-[var(--panel-2)]">
              ผู้ใช้งาน &amp; สิทธิ์การเข้าถึง
            </Link>
            <Link href="/audit-log" className="block px-2.5 py-2 rounded-md text-sm hover:bg-[var(--panel-2)]">
              Audit Log
            </Link>
          </div>
        </div>
      )}

      <div className="flex-1" />
    </div>
  );
}

function RailIcon({ icon, label, active }: { icon: string; label: string; active: boolean }) {
  return (
    <div
      title={label}
      className={`w-10 h-10 rounded-lg flex items-center justify-center mb-1.5 cursor-pointer relative text-lg transition
        ${active ? 'bg-white/10 text-white' : 'text-[var(--rail-ink)] hover:bg-white/10 hover:text-white'}`}
    >
      {active && <span className="absolute -left-4.5 top-2 bottom-2 w-[3px] bg-teal rounded" />}
      {icon}
    </div>
  );
}

function RailItem({ href, icon, label, active }: { href: string; icon: string; label: string; active: boolean }) {
  return (
    <Link href={href}>
      <RailIcon icon={icon} label={label} active={active} />
    </Link>
  );
}
