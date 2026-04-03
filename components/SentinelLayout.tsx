'use client';

import { ReactNode } from 'react';
import { SentinelHeader } from './SentinelHeader';
import { SentinelSidebar } from './SentinelSidebar';

interface SentinelLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export function SentinelLayout({ children, showSidebar = true }: SentinelLayoutProps) {
  return (
    <>
      <SentinelHeader />
      <div className="flex pt-[73px] h-screen overflow-hidden bg-surface text-on-surface">
        {showSidebar && <SentinelSidebar />}
        <main className={`flex-1 overflow-y-auto ${showSidebar ? "md:ml-64" : ""} transition-all duration-300 w-full`}>
          {children}
        </main>
      </div>
    </>
  );
}
