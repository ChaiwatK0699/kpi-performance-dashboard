import { createClient } from '@/lib/supabase/server';
import RosterTable from '@/components/RosterTable';

export default async function RosterPage({ searchParams }: { searchParams: { dataset?: string } }) {
  const datasetType = (searchParams.dataset === 'manager' ? 'manager' : 'ad') as 'ad' | 'manager';
  const supabase = createClient();

  const [{ data: employees }, { data: regions }] = await Promise.all([
    supabase.from('employees').select('*').eq('dataset_type', datasetType).eq('is_active', true).order('created_at'),
    supabase.from('regions').select('*')
  ]);

  return (
    <div>
      <h3 className="text-[15px] font-semibold mb-3.5">จัดการชื่อ AD / Manager / Cluster Leader</h3>
      <div className="flex gap-2 mb-4">
        <a
          href="/roster?dataset=ad"
          className={`px-4 py-2.5 rounded-lg border text-sm font-semibold ${
            datasetType === 'ad' ? 'bg-teal text-white border-teal' : 'bg-[var(--panel)] border-[var(--line-strong)] text-[var(--ink-soft)]'
          }`}
        >
          AD
        </a>
        <a
          href="/roster?dataset=manager"
          className={`px-4 py-2.5 rounded-lg border text-sm font-semibold ${
            datasetType === 'manager' ? 'bg-teal text-white border-teal' : 'bg-[var(--panel)] border-[var(--line-strong)] text-[var(--ink-soft)]'
          }`}
        >
          Manager
        </a>
        <span className="px-4 py-2.5 rounded-lg border text-sm font-semibold opacity-50 cursor-not-allowed border-[var(--line-strong)]">
          Cluster Leader
        </span>
      </div>
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl shadow p-4.5">
        <p className="text-[12.5px] text-[var(--ink-soft)] mb-3">
          แก้ไขชื่อ-นามสกุล, Region และรูปประจำตัว — บันทึกลง Supabase จริง (ตาราง employees + Storage bucket
          employee-photos)
        </p>
        <RosterTable datasetType={datasetType} employees={employees ?? []} regions={regions ?? []} />
      </div>
    </div>
  );
}
