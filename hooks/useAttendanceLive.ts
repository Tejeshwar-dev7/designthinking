import { useEffect, useState, useMemo, useRef } from 'react';
import { getStudentDirectory, getSessionLogs } from '@/app/admin/actions';

export type AttendanceLog = any;

export function useAttendanceLive(sessionId: string) {
  const [logs, setLogs] = useState<any[]>([]);
  const [directory, setDirectory] = useState<any[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    // 1. Fetch student directory once
    getStudentDirectory().then(setDirectory);

    // 2. Fetch logs immediately, then poll every 3s
    async function fetchLogs() {
      const data = await getSessionLogs(sessionId);
      setLogs(data);
    }

    fetchLogs();
    intervalRef.current = setInterval(fetchLogs, 3000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [sessionId]);

  // 3. Diff Engine: inject absent rows for enrolled students not yet present
  const mergedLogs = useMemo(() => {
    if (!directory.length) return logs;

    const presentMap = new Map(logs.map(l => [l.profile_id, l]));

    return directory.map(student => {
      const presentLog = presentMap.get(student.id);
      if (presentLog) return presentLog;

      return {
        id: `mock-absent-${student.id}`,
        profile_id: student.id,
        status: 'absent',
        confidence_score: null,
        marked_at: null,
        profiles: {
          full_name: student.full_name,
          department: student.department || '-',
          avatar_url: null
        }
      };
    });
  }, [logs, directory]);

  // 4. Sort: Present first, Absent below
  const sorted = useMemo(() => {
    return [...mergedLogs].sort((a, b) => {
      if (a.status === 'present' && b.status !== 'present') return -1;
      if (a.status !== 'present' && b.status === 'present') return 1;
      return 0;
    });
  }, [mergedLogs]);

  return sorted;
}
