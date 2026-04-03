'use client';

import { useActionState } from 'react';
import { addStudentProfile } from '@/app/admin/actions';
import Link from 'next/link';
import { SentinelLayout } from '@/components/SentinelLayout';

export default function AddStudentPage() {
  const [state, formAction, pending] = useActionState(async (prevState: any, formData: FormData) => {
     return await addStudentProfile(formData);
  }, null);

  return (
    <SentinelLayout showSidebar={false}>
      <div className="w-full max-w-5xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-16 relative">
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-surface-container-high -z-10"></div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold ring-8 ring-background">1</div>
            <span className="font-label text-[0.6875rem] font-semibold tracking-widest uppercase text-primary">Identity</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest text-primary flex items-center justify-center font-bold ring-8 ring-background">2</div>
            <span className="font-label text-[0.6875rem] font-semibold tracking-widest uppercase text-slate-400">Biometrics</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest text-primary flex items-center justify-center font-bold ring-8 ring-background">3</div>
            <span className="font-label text-[0.6875rem] font-semibold tracking-widest uppercase text-slate-400">Authorization</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-8">
            <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm">
              <h1 className="font-headline text-3xl font-bold tracking-tight text-on-background mb-2">Personnel Enrollment</h1>
              <p className="text-slate-500 mb-8 font-body">Step 1: Core credentials and physical data collection.</p>
              
              <form action={formAction} className="space-y-6" id="enroll-form">
                {state?.error && (
                  <div className="p-4 rounded-xl bg-error-container text-error text-sm font-medium border border-error/20">
                    {state.error}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="full_name" className="font-label text-[0.6875rem] font-semibold uppercase tracking-widest text-on-surface-variant flex items-center justify-between">
                      Full Name
                      <span className="text-error text-[10px]">*</span>
                    </label>
                    <input id="full_name" name="full_name" required className="w-full bg-surface-container-highest border-none rounded-lg p-3 outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary transition-all text-on-surface placeholder:text-slate-400" placeholder="e.g. John Doe" type="text"/>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="font-label text-[0.6875rem] font-semibold uppercase tracking-widest text-on-surface-variant">Email</label>
                    <input id="email" name="email" className="w-full bg-surface-container-highest border-none rounded-lg p-3 outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary transition-all text-on-surface placeholder:text-slate-400" placeholder="Optional" type="email"/>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="department" className="font-label text-[0.6875rem] font-semibold uppercase tracking-widest text-on-surface-variant">Department</label>
                  <select id="department" name="department" className="w-full bg-surface-container-highest border-none rounded-lg p-3 outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary transition-all text-on-surface appearance-none">
                    <option value="High-Security Logistics">High-Security Logistics</option>
                    <option value="Central Intelligence">Central Intelligence</option>
                    <option value="Infrastructure Tech">Infrastructure Tech</option>
                    <option value="Engineering">Engineering</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="font-label text-[0.6875rem] font-semibold uppercase tracking-widest text-on-surface-variant">Access Level</label>
                  <div className="flex gap-4">
                    <button className="flex-1 py-3 px-4 rounded-lg bg-primary text-on-primary font-bold text-sm" type="button">Level 4</button>
                    <button className="flex-1 py-3 px-4 rounded-lg bg-surface-container-high text-on-surface-variant font-bold text-sm hover:bg-surface-container-highest transition-colors" type="button">Level 3</button>
                    <button className="flex-1 py-3 px-4 rounded-lg bg-surface-container-high text-on-surface-variant font-bold text-sm hover:bg-surface-container-highest transition-colors" type="button">Level 2</button>
                  </div>
                </div>
              </form>
            </section>
            
            <div className="bg-surface-container-low p-6 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined" data-icon="shield">shield</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm">Security Policy Alignment</h3>
                  <p className="text-xs text-slate-500">Data is encrypted and stored in local secure vault.</p>
                </div>
              </div>
              <button className="bg-surface-container-highest text-primary font-bold text-xs py-2 px-4 rounded-full uppercase tracking-widest hover:bg-surface-container-high transition-colors">Review Policy</button>
            </div>
          </div>
          
          <div className="lg:col-span-5 space-y-8">
            <div className="relative bg-on-background rounded-xl aspect-[4/5] overflow-hidden shadow-2xl group border border-outline/20">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-outline z-10 bg-on-background/80">
                 <span className="material-symbols-outlined text-6xl opacity-50">photo_camera</span>
                 <p className="font-label text-xs uppercase tracking-widest">Awaiting Biometric Capture</p>
              </div>
              <div className="absolute inset-0 border-[16px] border-surface-container-high/5 p-6 flex flex-col justify-between z-20 pointer-events-none">
                <div className="flex justify-between items-start">
                  <div className="glass-panel px-3 py-1 rounded text-[10px] font-bold text-primary flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    LIVE SENSOR FEED
                  </div>
                  <div className="text-white/40 text-[10px] font-mono">REC: 00:00:00:00</div>
                </div>
                <div className="self-center w-64 h-80 border-2 border-primary/50 rounded-full flex items-center justify-center relative">
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
                  <span className="material-symbols-outlined text-primary/30 text-6xl">face</span>
                </div>
                <div className="space-y-3 pointer-events-auto">
                  <div className="glass-panel p-4 rounded-lg hidden"></div>
                  <button className="w-full bg-surface-container-high text-on-surface-variant py-4 rounded-lg font-bold flex items-center justify-center gap-2 cursor-not-allowed opacity-50">
                    <span className="material-symbols-outlined">photo_camera</span>
                    CAPTURE BIOMETRICS (LOCKED)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col-reverse md:flex-row justify-between items-center border-t border-surface-container-high pt-8 gap-4">
          <Link href="/admin" className="px-8 py-3 text-slate-500 font-bold text-sm flex items-center gap-2 hover:bg-surface-container-low rounded-lg transition-all w-full md:w-auto justify-center">
            <span className="material-symbols-outlined">arrow_back</span>
            CANCEL ENROLLMENT
          </Link>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <button className="px-10 py-4 bg-surface-container-highest text-primary font-bold rounded-lg hover:bg-surface-container-high transition-all">
              SAVE DRAFT
            </button>
            <button
              type="submit"
              form="enroll-form"
              disabled={pending}
              className="px-10 py-4 bg-primary text-on-primary font-bold rounded-lg shadow-xl shadow-primary/10 hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:transform-none"
            >
              {pending ? 'REGISTERING...' : 'CONTINUE TO STEP 2'}
              {!pending && <span className="material-symbols-outlined">arrow_forward</span>}
            </button>
          </div>
        </div>
      </div>
    </SentinelLayout>
  );
}
