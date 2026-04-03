'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SentinelHeader() {
  const pathname = usePathname();
  
  return (
    <header className="fixed top-0 z-50 bg-[#faf9ff] dark:bg-slate-950 flex justify-between items-center w-full px-12 py-4 shadow-sm">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-2xl font-black tracking-tighter text-[#003d9b] dark:text-blue-200">
          SENTINEL
        </Link>
        <div className="h-6 w-px bg-outline-variant/30 hidden md:block"></div>
        <nav className="hidden md:flex gap-8">
          <Link
            href="/dashboard"
            className={`${pathname?.startsWith('/dashboard') ? 'text-[#003d9b] dark:text-blue-300 font-bold' : 'text-slate-500 dark:text-slate-400 font-semibold'} hover:bg-[#d8e2ff] dark:hover:bg-blue-900/30 transition-all duration-300 px-3 py-1.5 rounded-md font-label uppercase tracking-widest text-xs`}
          >
            Live Monitor
          </Link>
          <Link
            href="/admin"
            className={`${pathname === '/admin' || pathname?.startsWith('/admin/add-student') ? 'text-[#003d9b] dark:text-blue-300 font-bold' : 'text-slate-500 dark:text-slate-400 font-semibold'} hover:bg-[#d8e2ff] dark:hover:bg-blue-900/30 transition-all duration-300 px-3 py-1.5 rounded-md font-label uppercase tracking-widest text-xs`}
          >
            Personnel
          </Link>
          <Link
            href="/admin/reports"
            className={`${pathname?.startsWith('/admin/reports') ? 'text-[#003d9b] dark:text-blue-300 font-bold' : 'text-slate-500 dark:text-slate-400 font-semibold'} hover:bg-[#d8e2ff] dark:hover:bg-blue-900/30 transition-all duration-300 px-3 py-1.5 rounded-md font-label uppercase tracking-widest text-xs`}
          >
            Analytics
          </Link>
        </nav>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="bg-surface-container px-4 py-2 rounded-full hidden md:flex items-center gap-3">
          <span className="material-symbols-outlined text-outline text-sm">search</span>
          <input
            className="bg-transparent border-none focus:ring-0 text-sm w-48 font-body outline-none placeholder:text-outline"
            placeholder="Search logs..."
            type="text"
          />
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <button className="material-symbols-outlined hover:bg-[#d8e2ff] p-2 rounded-full transition-all cursor-pointer scale-95 active:opacity-80">
            notifications_active
          </button>
          <button className="material-symbols-outlined hover:bg-[#d8e2ff] p-2 rounded-full transition-all cursor-pointer scale-95 active:opacity-80">
            settings
          </button>
          <button className="material-symbols-outlined hover:bg-[#d8e2ff] p-2 rounded-full transition-all cursor-pointer scale-95 active:opacity-80">
            account_circle
          </button>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 bg-[#f1f3ff] dark:bg-slate-900 h-[1px] w-full"></div>
    </header>
  );
}
