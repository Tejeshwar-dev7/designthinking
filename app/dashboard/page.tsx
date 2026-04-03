import { createServerSupabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ScannerClient } from '@/components/ScannerClient';
import { SentinelLayout } from '@/components/SentinelLayout';

export default async function DashboardPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  return (
    <SentinelLayout showSidebar={true}>
      <ScannerClient profile={profile} />
    </SentinelLayout>
  );
}
