'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { AttendanceLog } from '@/hooks/useAttendanceLive';

interface DashboardAnalyticsProps {
  logs: AttendanceLog[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function DashboardAnalytics({ logs }: DashboardAnalyticsProps) {
  // 1. Group by department for Pie Chart
  const departmentData = useMemo(() => {
    const counts: Record<string, number> = {};
    logs.forEach(log => {
      const dept = log.profiles?.department || 'Undeclared';
      counts[dept] = (counts[dept] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [logs]);

  // 2. Bar Chart summary for Timeline Output (mocked to just show Present breakdown over time slots in JS)
  // For simplicity we'll group them by minute of arrival.
  const timeSeriesData = useMemo(() => {
    const buckets: Record<string, { time: string; present: number }> = {};
    
    logs.forEach(log => {
      if (!log.marked_at) return;
      // Truncate to hours/minutes (HH:mm)
      const date = new Date(log.marked_at);
      const timeStr = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
      
      if (!buckets[timeStr]) buckets[timeStr] = { time: timeStr, present: 0 };
      if (log.status === 'present') buckets[timeStr].present++;
    });

    // Sort chronologically
    return Object.values(buckets).sort((a, b) => a.time.localeCompare(b.time));
  }, [logs]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Attendance Activity Timeline</h3>
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeSeriesData}>
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
              <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="present" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Department Breakdown</h3>
        <div className="flex-1 min-h-[300px] flex items-center justify-center">
          {departmentData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400">Waiting for class entries...</p>
          )}
        </div>
      </div>

    </div>
  );
}
