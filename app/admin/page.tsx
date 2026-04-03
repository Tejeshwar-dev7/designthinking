import { createServerSupabase } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SentinelLayout } from '@/components/SentinelLayout';
import { DeleteStudentButton } from '@/components/DeleteStudentButton';

export default async function AdminPortalPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('auth_user_id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return (
      <SentinelLayout showSidebar={false}>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-error max-w-md w-full text-center">
             <div className="w-16 h-16 bg-error-container rounded-full flex items-center justify-center mx-auto mb-4 text-error text-2xl font-black">!</div>
             <h2 className="text-xl font-headline font-bold text-on-surface">Access Denied</h2>
             <p className="text-on-surface-variant font-body mt-2 text-sm leading-relaxed mb-6">
               You are logged in as a student. Only authorized administrators can access the command center.
             </p>
             <Link href="/enroll" className="inline-block w-full py-2.5 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary/90 transition-colors">
               Go back to My Profile
             </Link>
          </div>
        </div>
      </SentinelLayout>
    );
  }

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: students, error } = await adminSupabase
    .from('profiles')
    .select('*, attendance_logs(id, status)')
    .eq('role', 'student')
    .order('created_at', { ascending: false });

  if (error) {
     console.error("Admin fetch error:", error);
  }

  return (
    <SentinelLayout showSidebar={true}>
      <div className="max-w-7xl mx-auto p-8 lg:p-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface mb-2">Personnel Directory</h1>
            <p className="text-outline font-body">Manage and monitor {students?.length || 0} registered identities within the SENTINEL perimeter.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.6875rem] font-bold tracking-widest text-outline uppercase ml-1">Department</label>
              <select className="bg-surface-container-highest border-none rounded-xl py-2.5 pl-4 pr-10 text-sm font-semibold text-on-surface-variant focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer appearance-none">
                <option>All Departments</option>
                <option>Engineering</option>
                <option>Operations</option>
                <option>Administration</option>
                <option>Security</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.6875rem] font-bold tracking-widest text-outline uppercase ml-1">Status</label>
              <select className="bg-surface-container-highest border-none rounded-xl py-2.5 pl-4 pr-10 text-sm font-semibold text-on-surface-variant focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer appearance-none">
                <option>All Status</option>
                <option>Present</option>
                <option>Absent</option>
                <option>Late</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {students?.map((student: any) => {
            const logs = student.attendance_logs as any[];
            const isPresent = logs?.some((l: any) => l.status === 'present');
            
            return (
              <div key={student.id} className="group bg-surface-container-lowest p-6 rounded-xl transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_24px_48px_-12px_rgba(5,26,62,0.08)] relative overflow-hidden flex flex-col justify-between">
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-[100px] transition-all ${isPresent ? 'bg-primary/5 group-hover:bg-primary/10' : 'bg-tertiary/5 group-hover:bg-tertiary/10'}`}></div>
                <div className="flex items-start gap-5 relative z-10 mb-4">
                  <div className="w-20 h-20 rounded-xl bg-surface-container-high flex items-center justify-center font-headline font-black text-3xl text-primary ring-4 ring-surface-container-low shrink-0">
                    {student.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    {isPresent ? (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[0.625rem] font-bold tracking-widest uppercase mb-2">Present</span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-rose-100 text-tertiary text-[0.625rem] font-bold tracking-widest uppercase mb-2">Absent</span>
                    )}
                    <h3 className="text-xl font-bold font-headline text-on-surface leading-tight mb-1">{student.full_name}</h3>
                    <p className="text-sm text-outline font-body mb-4" title={student.email}>ID: {student.id.substring(0, 8)}</p>
                    <div className="flex items-center gap-2 text-xs font-semibold text-on-secondary-container bg-secondary-container/30 px-3 py-1.5 rounded-lg w-fit">
                      <span className="material-symbols-outlined text-[1rem]">hub</span>
                      {student.department || 'Undeclared'}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center gap-3 pt-6 border-t border-surface-container relative z-10">
                  <Link href={`/students/${student.id}`} className="flex-1 bg-surface-container-highest text-primary font-bold py-2.5 rounded-lg text-sm text-center hover:bg-primary hover:text-white transition-all">
                    View Profile
                  </Link>
                  <DeleteStudentButton profileId={student.id} studentName={student.full_name} />
                </div>
              </div>
            );
          })}
          
          {(!students || students.length === 0) && (
            <div className="col-span-full py-12 text-center text-outline font-body">
              No personnel registered in the system yet.
            </div>
          )}
        </div>
      </div>
    </SentinelLayout>
  );
}
