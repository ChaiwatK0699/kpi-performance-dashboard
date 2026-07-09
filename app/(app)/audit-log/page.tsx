import { createClient } from '@/lib/supabase/server';

export default async function AuditLogPage() {
  const supabase = createClient();
  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*, profiles:actor_id(first_name, last_name)')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div>
      <h3 className="text-[15px] font-semibold mb-3.5">Audit Log</h3>
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl shadow p-4.5 overflow-auto max-h-[600px]">
        <table className="border-collapse w-full text-[12px]">
          <thead>
            <tr className="text-left text-[10.5px] uppercase text-[var(--ink-soft)]">
              <th className="border-b border-[var(--line-strong)] py-2">เวลา</th>
              <th className="border-b border-[var(--line-strong)] py-2">ผู้แก้ไข</th>
              <th className="border-b border-[var(--line-strong)] py-2">Action</th>
              <th className="border-b border-[var(--line-strong)] py-2">ตาราง</th>
              <th className="border-b border-[var(--line-strong)] py-2">Record ID</th>
            </tr>
          </thead>
          <tbody className="mono">
            {(logs ?? []).map((log: any) => (
              <tr key={log.id}>
                <td className="border-b border-[var(--line)] py-2">{new Date(log.created_at).toLocaleString('th-TH')}</td>
                <td className="border-b border-[var(--line)] py-2">
                  {log.profiles ? `${log.profiles.first_name} ${log.profiles.last_name}` : '—'}
                </td>
                <td className="border-b border-[var(--line)] py-2">{log.action}</td>
                <td className="border-b border-[var(--line)] py-2">{log.table_name}</td>
                <td className="border-b border-[var(--line)] py-2 text-[10.5px]">{log.record_id}</td>
              </tr>
            ))}
            {(!logs || logs.length === 0) && (
              <tr><td colSpan={5} className="text-center py-8 text-[var(--ink-soft)]">ยังไม่มีประวัติการแก้ไข</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
