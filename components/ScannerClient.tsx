'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ESP32AttendanceTerminal } from '@/components/ESP32AttendanceTerminal';

export function ScannerClient({ profile }: { profile: any }) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [recentScans, setRecentScans] = useState<{ name: string; time: string }[]>([]);

  const classId = 'class-123-demo';
  const sessionId = `session-${selectedDate}`;

  const handleAttendanceMarked = (name: string) => {
    setRecentScans((prev) => [
      { name, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ...prev,
    ]);
  };

  return (
    <div className="flex h-[calc(100vh-73px)] flex-1 overflow-hidden gap-8 p-8">
      <div className="flex flex-1 flex-col gap-8">
        <div className="flex items-end justify-between">
          <div>
            <span className="font-label text-[0.6875rem] font-bold uppercase tracking-[0.05rem] text-primary">
              Active Station
            </span>
            <h1 className="font-headline text-3xl font-extrabold text-on-surface">ESP32-CAM Attendance Terminal</h1>
            <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
              This station listens for attendance events from your ESP32-CAM. The laptop webcam is no longer used for live
              attendance marking.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col rounded-xl border border-surface-container-high bg-surface-container px-3 py-1.5 transition-all focus-within:ring-2 focus-within:ring-primary/20">
              <label className="text-[0.625rem] font-bold uppercase tracking-widest leading-tight text-outline">Target Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                disabled={isScanning}
                className="bg-transparent border-none p-0 text-sm font-semibold text-on-surface outline-none focus:ring-0 disabled:opacity-50"
              />
            </div>
            <Link
              href={`/dashboard/session/${sessionId}`}
              className="flex h-[42px] items-center gap-2 rounded-xl bg-surface-container-highest px-6 py-2.5 font-headline font-bold text-on-secondary-container transition-colors hover:bg-surface-dim"
            >
              <span className="material-symbols-outlined text-lg">analytics</span>
              View Results
            </Link>
            <button
              onClick={() => setIsScanning(!isScanning)}
              className={`flex h-[42px] items-center gap-2 rounded-xl px-8 py-2.5 font-headline font-bold text-white shadow-xl transition-opacity hover:opacity-90 ${
                isScanning ? 'bg-error' : 'bg-gradient-to-r from-primary to-primary-container shadow-primary/20'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{isScanning ? 'stop' : 'play_arrow'}</span>
              {isScanning ? 'Pause Station' : 'Listen for ESP32'}
            </button>
          </div>
        </div>

        <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-xl bg-surface-container-low shadow-inner group">
          {isScanning ? (
            <div className="absolute inset-0 flex h-full w-full flex-col">
              <ESP32AttendanceTerminal
                classId={classId}
                sessionId={sessionId}
                active={isScanning}
                onAttendanceMarked={handleAttendanceMarked}
              />

              <div className="pointer-events-none absolute inset-0 z-10 border-[24px] border-surface-container-low/20"></div>
              <div className="glass-panel absolute right-6 top-6 z-10 flex items-center gap-3 rounded-xl p-4">
                <div className="relative">
                  <div className="h-3 w-3 rounded-full bg-primary animate-pulse"></div>
                  <div className="absolute inset-0 rounded-full bg-primary opacity-75 animate-ping"></div>
                </div>
                <span className="font-label text-xs font-bold uppercase tracking-widest text-primary">ESP32 Feed Active</span>
              </div>
              <div className="pointer-events-none absolute bottom-6 left-6 right-6 z-10 flex gap-4">
                <div className="glass-panel pointer-events-auto flex flex-1 flex-col rounded-xl p-4">
                  <span className="font-label text-[0.625rem] uppercase tracking-widest text-on-surface-variant">Transport</span>
                  <span className="font-headline font-bold text-primary">HTTP POST</span>
                </div>
                <div className="glass-panel pointer-events-auto flex flex-1 flex-col rounded-xl p-4">
                  <span className="font-label text-[0.625rem] uppercase tracking-widest text-on-surface-variant">Duplicate Policy</span>
                  <span className="font-headline font-bold text-primary">One Per Session</span>
                </div>
                <div className="glass-panel pointer-events-auto flex flex-1 flex-col rounded-xl p-4">
                  <span className="font-label text-[0.625rem] uppercase tracking-widest text-on-surface-variant">Device Mode</span>
                  <span className="font-headline font-bold text-primary">ESP32-CAM</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-slate-500">
              <span className="material-symbols-outlined text-6xl text-slate-300">sensors_off</span>
              <p className="font-body text-lg">ESP32 Station Offline</p>
              <p className="font-body text-sm text-slate-400">Click &apos;Listen for ESP32&apos; to start receiving attendance events.</p>
            </div>
          )}
        </div>
      </div>

      <div className="hidden h-full w-96 shrink-0 flex-col gap-8 xl:flex">
        <div className="relative flex flex-col gap-2 overflow-hidden rounded-xl bg-surface-container-high p-6">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-[100px] bg-primary/5"></div>
          <span className="font-label relative z-10 text-[0.6875rem] font-bold uppercase tracking-widest text-primary">
            Target Date Summary
          </span>
          <div className="relative z-10 flex items-baseline gap-2">
            <span className="font-headline text-5xl font-black tracking-tighter text-on-surface">{recentScans.length}</span>
            <span className="font-body text-sm font-medium tracking-wide text-slate-500">new attendees</span>
          </div>
          <div className="relative z-10 mt-3 rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-xs text-on-surface-variant">
            Attendance is now marked only when the ESP32-CAM posts a recognized profile for the active session.
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden rounded-xl bg-surface-container-low">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-outline-variant/10 bg-surface-container-low p-6 pb-4">
            <h3 className="font-headline text-lg font-bold text-on-surface">Recent ESP32 Marks</h3>
            <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">{recentScans.length}</span>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {recentScans.length > 0 ? (
              recentScans.map((scan, i) => (
                <div
                  key={`${scan.name}-${scan.time}-${i}`}
                  className="animate-in fade-in slide-in-from-right-4 flex items-center justify-between rounded-xl border border-transparent bg-surface-container-lowest p-4 shadow-sm transition-all duration-300 hover:border-primary/20 hover:bg-primary/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 bg-emerald-100 text-emerald-600 shadow-inner">
                      <span className="material-symbols-outlined text-[1.25rem]">check_circle</span>
                    </div>
                    <div>
                      <p className="font-headline font-bold leading-tight text-on-surface">{scan.name}</p>
                      <p className="mt-1 text-xs font-label uppercase tracking-widest text-primary">ESP32 Match</p>
                    </div>
                  </div>
                  <span className="rounded bg-surface-container-high px-2 py-1 font-mono text-xs font-bold uppercase text-outline">
                    {scan.time}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-400">
                <span className="material-symbols-outlined text-4xl text-outline/50 animate-pulse">history</span>
                <p className="font-body text-sm text-outline">No ESP32 marks yet</p>
                <p className="max-w-[220px] text-center font-body text-xs text-outline/60">
                  Recognized faces posted by your ESP32-CAM during this session will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
