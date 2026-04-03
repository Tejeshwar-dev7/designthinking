'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type AttendanceEvent = {
  id: string;
  profile_id: string | null;
  marked_at: string | null;
  confidence_score: number | null;
  status: string | null;
  profiles: {
    id: string;
    full_name: string;
    department: string | null;
    avatar_url: string | null;
  } | null;
};

interface Props {
  sessionId: string;
  classId: string;
  active: boolean;
  onAttendanceMarked?: (studentName: string) => void;
}

export function ESP32AttendanceTerminal({ sessionId, active, onAttendanceMarked }: Props) {
  const [events, setEvents] = useState<AttendanceEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const seenIdsRef = useRef(new Set<string>());
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamUrl = process.env.NEXT_PUBLIC_ESP32_STREAM_URL;

  useEffect(() => {
    if (!active) {
      if (pollRef.current) clearTimeout(pollRef.current);
      return;
    }

    let cancelled = false;

    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/esp32/attendance?sessionId=${encodeURIComponent(sessionId)}&limit=12`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error ?? 'Unable to fetch ESP32 attendance feed.');
        }

        const payload = await response.json();
        if (cancelled) return;

        const nextEvents: AttendanceEvent[] = payload.events ?? [];
        nextEvents.forEach((event) => {
          if (!seenIdsRef.current.has(event.id) && event.profiles?.full_name) {
            seenIdsRef.current.add(event.id);
            onAttendanceMarked?.(event.profiles.full_name);
          }
        });

        setEvents(nextEvents);
        setError(null);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (fetchError) {
        if (cancelled) return;
        const message =
          fetchError instanceof Error ? fetchError.message : 'Failed to connect to the ESP32-CAM attendance endpoint.';
        setError(message);
      } finally {
        if (!cancelled) {
          pollRef.current = setTimeout(fetchEvents, 2500);
        }
      }
    };

    fetchEvents();

    return () => {
      cancelled = true;
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [active, sessionId, onAttendanceMarked]);

  const latestEvent = useMemo(() => events[0] ?? null, [events]);
  const latestName = latestEvent?.profiles?.full_name ?? 'Waiting for recognition';
  const latestDepartment = latestEvent?.profiles?.department ?? 'No attendance posted yet';
  const latestConfidence = latestEvent?.confidence_score
    ? `${Math.round(latestEvent.confidence_score * 100)}% confidence`
    : 'No confidence data yet';

  return (
    <div className="flex h-full flex-col gap-6 p-8">
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-3xl border border-white/10 bg-[#06111f] p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="font-label text-[0.6875rem] uppercase tracking-[0.18rem] text-cyan-300">ESP32-CAM Station</p>
              <h2 className="mt-2 font-headline text-3xl font-black tracking-tight">Live Attendance Feed</h2>
              <p className="mt-3 max-w-2xl text-sm text-slate-300">
                This terminal no longer uses the laptop webcam. It listens for attendance events posted by your ESP32-CAM
                recognition device and updates the dashboard automatically.
              </p>
            </div>
            <div className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2rem] ${
              active ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-700/50 text-slate-300'
            }`}>
              {active ? 'Station Listening' : 'Station Paused'}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-4">
              <div className="text-[0.65rem] font-bold uppercase tracking-[0.18rem] text-cyan-200">Session</div>
              <div className="mt-2 font-mono text-sm text-white">{sessionId}</div>
            </div>
            <div className="rounded-2xl border border-amber-400/10 bg-amber-400/5 p-4">
              <div className="text-[0.65rem] font-bold uppercase tracking-[0.18rem] text-amber-200">Duplicate Guard</div>
              <div className="mt-2 text-sm text-white">Same student is marked only once per session.</div>
            </div>
            <div className="rounded-2xl border border-violet-400/10 bg-violet-400/5 p-4">
              <div className="text-[0.65rem] font-bold uppercase tracking-[0.18rem] text-violet-200">Last Refresh</div>
              <div className="mt-2 text-sm text-white">{lastUpdated ?? 'Waiting for first sync...'}</div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-slate-950">
            {streamUrl ? (
              <img
                src={streamUrl}
                alt="ESP32-CAM stream"
                className="h-[420px] w-full object-cover"
              />
            ) : (
              <div className="flex h-[420px] flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_top,#0f2d46,transparent_60%)] p-8 text-center">
                <span className="material-symbols-outlined text-6xl text-cyan-300">videocam</span>
                <div>
                  <h3 className="font-headline text-2xl font-bold text-white">Stream Ready for ESP32-CAM</h3>
                  <p className="mt-3 max-w-xl text-sm text-slate-300">
                    Set <code className="rounded bg-black/30 px-2 py-1">NEXT_PUBLIC_ESP32_STREAM_URL</code> if you want to embed the
                    camera stream here. Attendance marking already works through the ESP32 post endpoint even without a stream preview.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="font-label text-[0.6875rem] uppercase tracking-[0.18rem] text-primary">Latest Recognition</p>
          <div className="mt-4 rounded-3xl bg-slate-950 p-6 text-white">
            <div className="text-sm uppercase tracking-[0.18rem] text-slate-400">Last Matched Student</div>
            <div className="mt-3 text-3xl font-black tracking-tight">{latestName}</div>
            <div className="mt-2 text-sm text-slate-300">{latestDepartment}</div>
            <div className="mt-4 inline-flex rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.18rem] text-emerald-300">
              {latestConfidence}
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[0.65rem] font-bold uppercase tracking-[0.18rem] text-slate-500">ESP32 Post Endpoint</div>
            <code className="mt-2 block break-all rounded-xl bg-white px-3 py-2 text-xs text-slate-700 shadow-inner">
              POST /api/esp32/attendance
            </code>
            <p className="mt-3 text-xs leading-6 text-slate-500">
              Payload fields: <code>sessionId</code>, <code>profileId</code> or <code>recognizedName</code>, optional{' '}
              <code>confidenceScore</code>, optional <code>classId</code>.
            </p>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          ) : (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {active
                ? 'Listening for ESP32-CAM attendance posts.'
                : 'Station polling is paused. Start scanning to listen again.'}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {events.length > 0 ? (
          events.map((event) => (
            <div
              key={event.id}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-headline text-lg font-bold text-slate-900">
                    {event.profiles?.full_name ?? 'Unknown Student'}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">{event.profiles?.department ?? 'No department set'}</div>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18rem] text-emerald-700">
                  {event.status ?? 'present'}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                <span>{event.marked_at ? new Date(event.marked_at).toLocaleTimeString() : 'Pending time'}</span>
                <span>{event.confidence_score ? `${Math.round(event.confidence_score * 100)}%` : '--'}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 xl:col-span-3">
            No attendance events received yet. Once your ESP32-CAM posts a recognized face to the API, the student will appear here
            instantly.
          </div>
        )}
      </div>
    </div>
  );
}
