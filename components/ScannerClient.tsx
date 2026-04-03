'use client';

import { useState } from 'react';
import { WebcamAttendance } from '@/components/WebcamAttendance';
import Link from 'next/link';

export function ScannerClient({ profile }: { profile: any }) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [recentScans, setRecentScans] = useState<{name: string, time: string}[]>([]);

  const classId = "class-123-demo";
  const sessionId = `session-${selectedDate}`;

  const handleAttendanceMarked = (name: string) => {
    setRecentScans(prev => [{name, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}, ...prev]);
  };

  return (
    <div className="flex-1 flex overflow-hidden p-8 gap-8 h-[calc(100vh-73px)]">
      <div className="flex-1 flex flex-col gap-8">
        <div className="flex justify-between items-end">
          <div>
            <span className="font-label text-[0.6875rem] uppercase tracking-[0.05rem] text-primary font-bold">
              Active Station
            </span>
            <h1 className="font-headline text-3xl font-extrabold text-on-surface">Main Terminal Feed</h1>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex flex-col bg-surface-container px-3 py-1.5 rounded-xl border border-surface-container-high transition-all focus-within:ring-2 focus-within:ring-primary/20">
              <label className="text-[0.625rem] font-bold text-outline uppercase tracking-widest leading-tight">Target Date</label>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                disabled={isScanning}
                className="bg-transparent border-none p-0 text-sm font-semibold text-on-surface outline-none focus:ring-0 disabled:opacity-50"
              />
            </div>
            <Link href={`/dashboard/session/${sessionId}`} className="bg-surface-container-highest text-on-secondary-container px-6 py-2.5 rounded-xl font-headline font-bold flex items-center gap-2 hover:bg-surface-dim transition-colors h-[42px]">
              <span className="material-symbols-outlined text-lg">analytics</span>
              View Results
            </Link>
            <button 
              onClick={() => setIsScanning(!isScanning)}
              className={`text-white px-8 py-2.5 rounded-xl font-headline font-bold flex items-center gap-2 shadow-xl hover:opacity-90 transition-opacity h-[42px] ${isScanning ? 'bg-error' : 'bg-gradient-to-r from-primary to-primary-container shadow-primary/20'}`}
            >
              <span className="material-symbols-outlined text-lg">{isScanning ? 'stop' : 'play_arrow'}</span>
              {isScanning ? 'Stop Scanning' : 'Start Scanning'}
            </button>
          </div>
        </div>
        
        <div className="relative flex-1 bg-surface-container-low rounded-xl overflow-hidden shadow-inner group flex items-center justify-center">
          {isScanning ? (
            <div className="absolute inset-0 w-full h-full flex flex-col">
              <WebcamAttendance classId={classId} sessionId={sessionId} onAttendanceMarked={handleAttendanceMarked} />
              
              <div className="absolute inset-0 border-[24px] border-surface-container-low/20 pointer-events-none z-10"></div>
              <div className="absolute top-6 right-6 glass-panel p-4 rounded-xl flex items-center gap-3 z-10">
                <div className="relative">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75"></div>
                </div>
                <span className="font-label text-xs font-bold uppercase tracking-widest text-primary">Live Detection Active</span>
              </div>
              <div className="absolute bottom-6 left-6 right-6 flex gap-4 z-10 pointer-events-none">
                <div className="glass-panel p-4 rounded-xl flex-1 flex flex-col pointer-events-auto">
                  <span className="font-label text-[0.625rem] uppercase tracking-widest text-on-surface-variant">Frame Latency</span>
                  <span className="font-headline font-bold text-primary">12ms</span>
                </div>
                <div className="glass-panel p-4 rounded-xl flex-1 flex flex-col pointer-events-auto">
                  <span className="font-label text-[0.625rem] uppercase tracking-widest text-on-surface-variant">Recognition Depth</span>
                  <span className="font-headline font-bold text-primary">99.4%</span>
                </div>
                <div className="glass-panel p-4 rounded-xl flex-1 flex flex-col pointer-events-auto">
                  <span className="font-label text-[0.625rem] uppercase tracking-widest text-on-surface-variant">Stream Status</span>
                  <span className="font-headline font-bold text-primary">Secure</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-slate-500 gap-4">
              <span className="material-symbols-outlined text-6xl text-slate-300">videocam_off</span>
              <p className="font-body text-lg">Camera Offline</p>
              <p className="font-body text-sm text-slate-400">Click &apos;Start Scanning&apos; to initialize terminal.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="w-96 flex flex-col gap-8 h-full shrink-0 hidden xl:flex">
        <div className="bg-surface-container-high rounded-xl p-6 flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px]"></div>
          <span className="font-label text-[0.6875rem] uppercase tracking-widest text-primary font-bold relative z-10">Target Date Summary</span>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="font-headline text-5xl font-black text-on-surface tracking-tighter">{recentScans.length}</span>
            <span className="font-body text-sm text-slate-500 font-medium tracking-wide">new attendees</span>
          </div>
        </div>
        
        <div className="flex-1 bg-surface-container-low rounded-xl flex flex-col overflow-hidden">
          <div className="p-6 pb-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low sticky top-0 z-10">
            <h3 className="font-headline font-bold text-lg text-on-surface">Recent Scans</h3>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md">{recentScans.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {recentScans.length > 0 ? (
              recentScans.map((scan, i) => (
                <div key={i} className="bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-right-4 duration-300 border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-200 shadow-inner">
                      <span className="material-symbols-outlined text-[1.25rem]">check_circle</span>
                    </div>
                    <div>
                      <p className="font-headline font-bold text-on-surface leading-tight">{scan.name}</p>
                      <p className="text-xs font-label uppercase tracking-widest text-primary mt-1">Matched</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-outline uppercase font-mono bg-surface-container-high px-2 py-1 rounded">{scan.time}</span>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                <span className="material-symbols-outlined text-4xl text-outline/50 animate-pulse">history</span>
                <p className="font-body text-sm text-outline">No recent scans detected</p>
                <p className="font-body text-xs text-outline/60 text-center max-w-[200px]">Faces matched during this session will stream here live.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
