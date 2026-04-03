import { createServerSupabase } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { format, subDays, isSameDay } from 'date-fns';

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: profileId } = await params;

  // Use Service Role Key to bypass Postgres RLS for reading orphan profiles!
  
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Fetch Profile
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single();

  if (!profile) return <div className="p-12 text-center text-gray-500">Student not found</div>;

  // 2. Fetch Attendance History
  const { data: logs } = await adminSupabase
    .from('attendance_logs')
    .select('*')
    .eq('profile_id', profileId)
    .order('marked_at', { ascending: false });

  // 3. Compute Stats
  const totalClasses = logs?.length || 0;
  const presentCount = logs?.filter((l: any) => l.status === 'present').length || 0;
  const attendancePercentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

  // Generate last 30 days for calendar view
  const last30Days = Array.from({ length: 30 }, (_, i) => subDays(new Date(), 29 - i));

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Profile Card */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center md:items-start justify-between">
           <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-3xl font-bold shadow-inner">
                {profile.full_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profile.full_name}</h1>
                <p className="text-gray-500 mt-1">{profile.email} • {profile.department || 'No Dept'}</p>
              </div>
           </div>
           
           <div className="flex gap-4">
             <Link 
               href="/enroll" 
               className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
             >
               Re-Enroll Biometrics
             </Link>
           </div>
        </div>

        {/* Stats & Calendar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-1 bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-2xl shadow-sm text-white flex flex-col justify-center items-center text-center">
             <h3 className="text-indigo-100 font-medium mb-2 uppercase tracking-widest text-sm">Overall Attendance</h3>
             <div className="text-7xl font-black mb-4">{attendancePercentage}%</div>
             <p className="text-indigo-100">Present for {presentCount} out of {totalClasses} classes</p>
          </div>

          <div className="md:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
             <h3 className="text-lg font-bold text-gray-900 mb-6">30-Day Activity Calendar</h3>
             
             <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-400 mb-2">{day}</div>
                ))}
                
                {/* Pad empty days if month doesn't start exactly on Sunday */}
                {Array.from({ length: last30Days[0].getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square bg-transparent rounded-lg"></div>
                ))}

                {last30Days.map(date => {
                  const dayLogs = logs?.filter((l: any) => l.marked_at && isSameDay(new Date(l.marked_at), date));
                  const isPresent = dayLogs?.some((l: any) => l.status === 'present');
                  const isAbsent = dayLogs?.some((l: any) => l.status === 'absent');
                  
                  let bgColor = 'bg-gray-100';
                  if (isPresent) bgColor = 'bg-green-500 cursor-pointer shadow-sm';
                  else if (isAbsent) bgColor = 'bg-red-500 cursor-pointer shadow-sm';

                  return (
                    <div 
                      key={date.toISOString()} 
                      className={`aspect-square rounded-lg flex items-center justify-center text-xs text-white transition-transform hover:scale-110 ${bgColor}`}
                      title={format(date, 'MMM do, yyyy')}
                    >
                      {format(date, 'd')}
                    </div>
                  );
                })}
             </div>
             
             <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> Present</div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Absent</div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-200"></div> No Class</div>
             </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Detailed Log History</h3>
          </div>
          <table className="w-full text-left border-collapse">
             <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                  <th className="font-semibold px-6 py-4">Date</th>
                  <th className="font-semibold px-6 py-4">Session</th>
                  <th className="font-semibold px-6 py-4">Status</th>
                  <th className="font-semibold px-6 py-4">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs?.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {log.marked_at ? format(new Date(log.marked_at), 'PPP p') : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-sm">
                      {log.session_id}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${log.status === 'present' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                       <span className="capitalize text-gray-700">{log.status}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-sm">
                      {log.confidence_score ? `${(log.confidence_score * 100).toFixed(1)}%` : '-'}
                    </td>
                  </tr>
                ))}
                {(!logs || logs.length === 0) && (
                   <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No attendance records found.</td></tr>
                )}
              </tbody>
          </table>
        </div>
        
      </div>
    </div>
  );
}
