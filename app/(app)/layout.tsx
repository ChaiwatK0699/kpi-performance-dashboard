import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, role, status')
    .eq('id', user.id)
    .single();

  if (!profile || profile.status !== 'active') redirect('/pending-approval');

  const isAdminOrDev = profile.role === 'admin' || profile.role === 'dev';

  return (
    <div className="flex h-screen">
      <Sidebar isAdminOrDev={isAdminOrDev} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar name={`${profile.first_name} ${profile.last_name}`} role={profile.role} />
        <div className="flex-1 overflow-auto px-6 py-5 pb-10">
          <div className="max-w-[1320px] mx-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
