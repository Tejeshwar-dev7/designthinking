import Link from 'next/link';
import { WebGLShader } from "@/components/ui/web-gl-shader";
import { LiquidButton } from '@/components/ui/liquid-glass-button';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] overflow-hidden font-sans text-white">
      {/* Background WebGL Shader */}
      <WebGLShader />

      {/* Navbar Minimal */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <span>FaceAuth<span className="text-indigo-500">.io</span></span>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link href="/login" className="text-gray-300 hover:text-white transition-colors">Sign In</Link>
          <Link href="/register" className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all">Sign Up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-4 mt-20 max-w-5xl mx-auto bg-black/40 backdrop-blur-[2px] p-12 rounded-3xl border border-white/10 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-8 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping absolute"></span>
          <span className="w-2 h-2 rounded-full bg-indigo-500 relative"></span>
          Live Beta v1.0
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[1.1]">
          ESP32-CAM Attendance via <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
             Facial Recognition.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-12 leading-relaxed">
          Eliminate manual roll calls and laptop webcam dependency. Securely log attendance from an ESP32-CAM station that posts recognized faces straight to your live dashboard.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
          <Link href="/login">
            <LiquidButton className="text-white border border-white/10 rounded-full bg-indigo-600/80 hover:bg-indigo-500/80" size="xl">
              Access Portal
            </LiquidButton>
          </Link>
          <Link href="/register">
            <LiquidButton className="text-white border border-white/20 rounded-full" size="xl">
              Student Enrollment
            </LiquidButton>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full text-left">
           <div className="p-6 bg-black/60 border border-white/10 rounded-2xl backdrop-blur-md">
              <svg className="w-8 h-8 text-indigo-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
              </svg>
              <h3 className="font-bold text-lg mb-2">ESP32-CAM Match</h3>
              <p className="text-gray-400 text-sm">Recognized faces are posted from the ESP32-CAM station directly into the attendance session feed.</p>
           </div>
           <div className="p-6 bg-black/60 border border-white/10 rounded-2xl backdrop-blur-md">
              <svg className="w-8 h-8 text-amber-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              <h3 className="font-bold text-lg mb-2">Instant Sync</h3>
              <p className="text-gray-400 text-sm">Each ESP32-CAM match lands in the administrator dashboard within seconds.</p>
           </div>
           <div className="p-6 bg-black/60 border border-white/10 rounded-2xl backdrop-blur-md">
              <svg className="w-8 h-8 text-emerald-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              <h3 className="font-bold text-lg mb-2">Duplicate Guard</h3>
              <p className="text-gray-400 text-sm">Once a student is marked for a session, repeated matches return already-marked instead of creating duplicates.</p>
           </div>
        </div>
      </main>
    </div>
  );
}
