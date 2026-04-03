'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SentinelSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Live Monitor', icon: 'videocam', href: '/dashboard' },
    { name: 'Personnel', icon: 'groups', href: '/admin' },
    { name: 'Analytics', icon: 'analytics', href: '/admin/reports' },
    { name: 'Registration', icon: 'person_add', href: '/admin/add-student' },
  ];

  return (
    <aside className="w-64 bg-[#f1f3ff] dark:bg-slate-900 flex flex-col h-full py-8 gap-y-4 shrink-0 fixed left-0 top-[73px] bottom-0 z-40 hidden md:flex border-r border-outline-variant/20">
      <div className="px-6 mb-4">
        <h2 className="font-headline font-bold text-primary text-xl">System Lens</h2>
        <p className="font-body text-xs text-slate-500 uppercase tracking-tighter">Vigilance Active</p>
      </div>
      
      <nav className="flex flex-col gap-1 w-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          
          if (isActive) {
            return (
              <Link 
                key={item.name}
                href={item.href}
                className="bg-[#d8e2ff] dark:bg-blue-900/40 text-[#003d9b] dark:text-blue-100 rounded-r-full font-bold px-6 py-3 ml-0 flex items-center gap-3 transition-colors"
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-headline">{item.name}</span>
              </Link>
            );
          }

          return (
            <Link 
              key={item.name}
              href={item.href}
              className="text-slate-600 dark:text-slate-400 px-6 py-3 hover:translate-x-1 transition-transform flex items-center gap-3 hover:text-[#003d9b] dark:hover:text-blue-300"
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-headline font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-6">
        <button className="w-full bg-gradient-to-r from-primary to-primary-container text-white py-3 px-4 rounded-xl font-headline font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
          Export Reports
        </button>
      </div>
    </aside>
  );
}
