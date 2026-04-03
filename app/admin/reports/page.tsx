import { SentinelLayout } from '@/components/SentinelLayout';
import { createServerSupabase } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

export const revalidate = 0; // Disable caching to ensure live data

export default async function ReportsPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('auth_user_id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/dashboard');

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: logs, error } = await adminSupabase
    .from('attendance_logs')
    .select('*, profiles(id, full_name, department)')
    .order('marked_at', { ascending: false });

  if (error) console.error('Reports fetch error:', error);

  // Metrics
  const validLogs = logs || [];
  const totalLogs = validLogs.length;
  const presentCount = validLogs.filter(l => l.status === 'present').length;
  const absentCount = totalLogs - presentCount;
  const presentPercentage = totalLogs > 0 ? Math.round((presentCount / totalLogs) * 100) : 0;
  const dashOffset = 502.65 - (502.65 * presentPercentage / 100);

  // 7-day trends
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const dailyData = last7Days.map(d => {
    const dateStr = d.toISOString().split('T')[0];
    const dayName = daysOfWeek[d.getDay()];
    const dateLogs = validLogs.filter(l => l.marked_at && l.marked_at.startsWith(dateStr));
    const p = dateLogs.filter(l => l.status === 'present').length;
    const a = dateLogs.length - p;
    const t = dateLogs.length || 1; // avoid division by zero
    return { dayName, p, a, t };
  });

  return (
    <SentinelLayout showSidebar={true}>
      <div className="p-8 lg:p-12">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-headline font-extrabold text-on-background tracking-tight">Attendance Reports</h1>
            <p className="text-on-surface-variant font-body mt-2">Detailed analytical insights for the current monitoring period.</p>
          </div>
          <div className="flex gap-4">
            <button className="bg-surface-container-highest text-primary px-6 py-2.5 rounded-xl font-headline font-bold flex items-center gap-2 hover:bg-surface-dim transition-colors">
              <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
              PDF
            </button>
            <button className="bg-surface-container-highest text-primary px-6 py-2.5 rounded-xl font-headline font-bold flex items-center gap-2 hover:bg-surface-dim transition-colors">
               <span className="material-symbols-outlined text-lg">data_table</span>
               CSV
            </button>
          </div>
        </header>

        <section className="bg-surface-container-low rounded-xl p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex flex-col gap-2">
               <label className="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-widest font-label">Date Range</label>
               <select className="bg-surface-container-lowest border-none rounded-lg font-body text-sm py-3 outline-none focus:ring-2 focus:ring-primary-container">
                 <option>Last 30 Days</option>
                 <option>Current Week</option>
                 <option>Previous Quarter</option>
                 <option>Custom Range</option>
               </select>
            </div>
            <div className="flex flex-col gap-2">
               <label className="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-widest font-label">Department</label>
               <select className="bg-surface-container-lowest border-none rounded-lg font-body text-sm py-3 outline-none focus:ring-2 focus:ring-primary-container">
                 <option>All Departments</option>
                 <option>Engineering</option>
                 <option>Operations</option>
                 <option>Security Tech</option>
               </select>
            </div>
            <div className="flex flex-col gap-2">
               <label className="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-widest font-label">Individual</label>
               <div className="relative">
                 <input className="w-full bg-surface-container-lowest border-none rounded-lg font-body text-sm py-3 pl-10 outline-none focus:ring-2 focus:ring-primary-container placeholder:text-outline" placeholder="Search name..." type="text"/>
                 <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
               </div>
            </div>
            <div className="flex items-end">
               <button className="w-full bg-primary text-white py-3 rounded-lg font-headline font-bold text-sm hover:bg-primary-container transition-colors">
                 Apply Filters
               </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
               <h3 className="font-headline font-bold text-xl">Daily Attendance Trends</h3>
               <div className="flex items-center gap-4 text-xs font-label uppercase tracking-widest text-outline">
                 <div className="flex items-center gap-2"><div className="w-3 h-3 bg-primary rounded-sm"></div> Present</div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 bg-surface-variant rounded-sm"></div> Absent</div>
               </div>
            </div>
            <div className="h-64 flex items-end justify-between gap-4 px-2">
               {dailyData.map((day, i) => (
                 <div key={i} className="flex-1 flex flex-col items-center gap-2">
                   <div className="w-full bg-surface-container rounded-t-md h-40 relative group overflow-hidden">
                     {/* Present Bar */}
                     <div 
                       className="absolute bottom-0 w-full bg-primary transition-all duration-500 group-hover:brightness-110"
                       style={{ height: `${(day.p / day.t) * 100}%` }}
                     ></div>
                     {/* Absent Bar */}
                     <div 
                       className="absolute bottom-0 w-full bg-surface-variant transition-all duration-500 opacity-50"
                       style={{ height: `${(day.a / day.t) * 100}%`, marginBottom: `${(day.p / day.t) * 100}%` }}
                     ></div>
                   </div>
                   <span className="text-[10px] font-label text-outline uppercase">{day.dayName}</span>
                 </div>
               ))}
            </div>
          </div>
          
          <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-8 shadow-sm flex flex-col items-center text-center">
            <h3 className="font-headline font-bold text-xl mb-8 self-start">Overall Percentage</h3>
            <div className="relative flex items-center justify-center">
               <svg className="w-48 h-48 -rotate-90">
                 <circle className="text-surface-container transition-all" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeWidth="24"></circle>
                 <circle className="text-primary transition-all duration-1000 ease-out" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeDasharray="502.65" strokeDashoffset={dashOffset} strokeWidth="24"></circle>
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-4xl font-headline font-black text-on-background">{presentPercentage}%</span>
                 <span className="text-[0.6875rem] font-bold text-outline uppercase tracking-widest font-label mt-1">Matched</span>
               </div>
            </div>
            <div className="mt-8 w-full space-y-3 px-4">
               <div className="flex justify-between items-center text-sm font-body bg-surface-container-low px-4 py-2 rounded-lg">
                 <span className="text-on-surface-variant flex items-center gap-2">
                   <span className="w-3 h-3 rounded-md bg-primary"></span> Present
                 </span>
                 <span className="font-bold font-headline">{presentCount}</span>
               </div>
               <div className="flex justify-between items-center text-sm font-body bg-surface-container-low px-4 py-2 rounded-lg">
                 <span className="text-on-surface-variant flex items-center gap-2">
                   <span className="w-3 h-3 rounded-md bg-surface-variant"></span> Absent / Late
                 </span>
                 <span className="font-bold font-headline">{absentCount}</span>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline/10">
          <div className="p-8 flex justify-between items-center border-b border-surface-container">
            <h3 className="font-headline font-bold text-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">format_list_bulleted</span>
              Detailed Attendance Logs
            </h3>
            <span className="text-xs font-label uppercase tracking-widest bg-surface-container px-3 py-1 rounded-full text-on-surface-variant">
              Showing {Math.min(totalLogs, 15)} of {totalLogs} records
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                 <tr className="bg-surface-container-low/50 text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-widest font-label">
                   <th className="px-8 py-4">Employee</th>
                   <th className="px-8 py-4">Department</th>
                   <th className="px-8 py-4">Status</th>
                   <th className="px-8 py-4">Timestamp</th>
                   <th className="px-8 py-4">Camera ID</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-surface-container/50">
                 {validLogs.length === 0 ? (
                   <tr>
                     <td colSpan={5} className="py-12 text-center text-outline font-body">No attendance records found.</td>
                   </tr>
                 ) : (
                   validLogs.slice(0, 15).map((log: any) => {
                     const isPresent = log.status === 'present';
                     const ts = log.marked_at ? new Date(log.marked_at) : new Date();
                     const timeStr = ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                     const dateStr = ts.toLocaleDateString();
                     
                     return (
                       <tr key={log.id} className="hover:bg-surface-container-lowest transition-colors font-body">
                         <td className="px-8 py-5">
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-lg bg-surface-container-highest text-primary font-bold font-headline flex items-center justify-center shrink-0">
                               {log.profiles?.full_name?.charAt(0).toUpperCase() || 'U'}
                             </div>
                             <div>
                               <p className="font-bold text-on-background whitespace-nowrap">{log.profiles?.full_name || 'Unknown User'}</p>
                               <p className="text-xs text-outline">ID: {log.profile_id?.substring(0,8) || 'N/A'}</p>
                             </div>
                           </div>
                         </td>
                         <td className="px-8 py-5 text-sm text-on-surface-variant whitespace-nowrap">
                           {log.profiles?.department || 'Operations'}
                         </td>
                         <td className="px-8 py-5">
                           {isPresent ? (
                             <span className="inline-flex px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full uppercase tracking-widest font-label whitespace-nowrap border border-emerald-200">
                               Present matched
                             </span>
                           ) : (
                             <span className="inline-flex px-3 py-1 bg-rose-100 text-tertiary text-[10px] font-bold rounded-full uppercase tracking-widest font-label whitespace-nowrap border border-rose-200">
                               Absent
                             </span>
                           )}
                         </td>
                         <td className="px-8 py-5 text-sm whitespace-nowrap">
                           <div className="flex flex-col">
                             <span className="font-semibold text-on-surface">{timeStr}</span>
                             <span className="text-[10px] text-outline uppercase tracking-widest">{dateStr}</span>
                           </div>
                         </td>
                         <td className="px-8 py-5">
                           <div className="text-xs font-mono text-outline bg-surface-container px-2 py-1 rounded w-fit">
                             {log.session_id || 'MAIN-TERM'}
                           </div>
                         </td>
                       </tr>
                     );
                   })
                 )}
               </tbody>
            </table>
          </div>
          <div className="p-6 bg-surface-container-low/30 border-t border-surface-container flex justify-between items-center">
            <button className="px-4 py-2 text-sm font-bold text-outline hover:text-primary hover:bg-surface-container rounded-lg transition-colors flex items-center gap-2">
               <span className="material-symbols-outlined">chevron_left</span> Previous
            </button>
            <div className="flex gap-1.5">
               <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white text-sm font-bold shadow-md shadow-primary/20">1</span>
               <span className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container text-on-surface text-sm font-bold cursor-pointer transition-colors">2</span>
               <span className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container text-on-surface text-sm font-bold cursor-pointer transition-colors">3</span>
            </div>
            <button className="px-4 py-2 text-sm font-bold text-outline hover:text-primary hover:bg-surface-container rounded-lg transition-colors flex items-center gap-2">
               Next <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </SentinelLayout>
  );
}
