import { createClient } from '@/lib/supabase/server';
import UsersTable from '@/components/UsersTable';

export default async function UsersPage() {
  const supabase = createClient();
  const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });

  return (
    <div>
      <h3 className="text-[15px] font-semibold mb-3.5">ผู้ใช้งาน &amp; สิทธิ์การเข้าถึง</h3>
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl shadow p-4.5">
        <UsersTable profiles={profiles ?? []} />
      </div>
    </div>
  );
}
