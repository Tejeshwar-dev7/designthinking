'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useAttendanceLive } from '@/hooks/useAttendanceLive';
import { DashboardAnalytics } from '@/components/DashboardAnalytics';

export default function SessionDashboardPage() {
  const params = useParams();
  const sessionId = Array.isArray(params.id) ? params.id[0] : (params.id as string);
  const logs = useAttendanceLive(sessionId);
  
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent'>('all');

  const filtered = logs.filter(l => {
    const matchesName = l.profiles?.full_name?.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesName && matchesStatus;
  });

  const handleExportCSV = () => {
    if (!logs.length) return;
    
    // Convert JSON to CSV manually
    const headers = ['Name', 'Department', 'Status', 'Confidence Score', 'Time'];
    const rows = logs.map(l => [
      l.profiles?.full_name || 'Unknown',
      l.profiles?.department || 'N/A',
      l.status || 'N/A',
      l.confidence_score ? `${(l.confidence_score * 100).toFixed(1)}%` : 'N/A',
      l.marked_at ? new Date(l.marked_at).toLocaleTimeString() : 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `session_attendance_${sessionId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex flex-col gap-4 bg-white px-8 py-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Session Attendance Report</h1>
              <p className="text-gray-400 mt-1 uppercase text-xs font-mono tracking-widest bg-gray-100 inline-block px-2 py-1 rounded">
                Session ID: {sessionId}
              </p>
            </div>
            <button 
               onClick={handleExportCSV}
               className="px-6 py-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-100 transition-colors shadow-sm"
            >
              Export to CSV
            </button>
          </div>
          {/* Summary counters */}
          <div className="flex gap-4">
            <div className="flex-1 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center">
              <div className="text-2xl font-black text-green-700">{logs.filter(l => l.status === 'present').length}</div>
              <div className="text-xs font-semibold text-green-600 uppercase tracking-widest mt-1">Present</div>
            </div>
            <div className="flex-1 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center">
              <div className="text-2xl font-black text-red-600">{logs.filter(l => l.status === 'absent').length}</div>
              <div className="text-xs font-semibold text-red-500 uppercase tracking-widest mt-1">Absent</div>
            </div>
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center">
              <div className="text-2xl font-black text-gray-700">{logs.length}</div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">Total</div>
            </div>
          </div>
        </header>

        {/* Real-time Analytics Visualizations */}
        <DashboardAnalytics logs={logs} />

        {/* Real-time Data Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-center gap-4">
            <input 
              type="text" 
              placeholder="Search students..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none font-medium text-gray-700 min-w-[140px]"
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                  <th className="font-semibold px-6 py-4">Student</th>
                  <th className="font-semibold px-6 py-4">Department</th>
                  <th className="font-semibold px-6 py-4">Status</th>
                  <th className="font-semibold px-6 py-4">Confidence</th>
                  <th className="font-semibold px-6 py-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <a href={`/students/${log.profile_id}`} className="font-medium text-gray-900 hover:text-indigo-600 transition-colors">
                        {log.profiles?.full_name || 'Unknown'}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{log.profiles?.department || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        log.status === 'present' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {log.status === 'present' ? 'Present' : 'Absent'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm font-mono tracking-tighter">
                      {log.confidence_score ? `${(log.confidence_score * 100).toFixed(1)}%` : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {log.marked_at ? new Date(log.marked_at).toLocaleTimeString() : '-'}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      No logs matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
