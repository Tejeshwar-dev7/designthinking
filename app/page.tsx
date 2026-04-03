import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22rem] text-cyan-200 w-fit">
          ESP32-CAM Attendance System
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-10 shadow-2xl">
            <h1 className="text-5xl font-black leading-tight tracking-tight md:text-6xl">
              Live attendance from your ESP32-CAM, synced straight into the dashboard.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              This project no longer depends on the laptop webcam for live marking. The device station recognizes faces,
              posts them to the app, and the dashboard shows every accepted attendance event in real time.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="rounded-2xl bg-cyan-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                Open Portal
              </Link>
              <Link
                href="/register"
                className="rounded-2xl border border-white/15 px-6 py-3 font-bold text-white transition hover:bg-white/5"
              >
                Register User
              </Link>
            </div>
          </section>

          <section className="grid gap-4">
            <div className="rounded-3xl border border-emerald-400/10 bg-emerald-400/5 p-6">
              <div className="text-xs font-bold uppercase tracking-[0.18rem] text-emerald-200">Recognition Flow</div>
              <div className="mt-3 text-2xl font-black">ESP32-CAM to API to Dashboard</div>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                The ESP32-CAM sends the session, student identity, and confidence score to the server. The dashboard then
                picks up the event and displays it live.
              </p>
            </div>

            <div className="rounded-3xl border border-amber-400/10 bg-amber-400/5 p-6">
              <div className="text-xs font-bold uppercase tracking-[0.18rem] text-amber-200">Duplicate Protection</div>
              <div className="mt-3 text-2xl font-black">One mark per student per session</div>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                If the same face is recognized again in the same session, the server responds with
                <span className="mx-1 rounded bg-black/20 px-2 py-1 font-mono text-xs">already_marked</span>
                instead of inserting a duplicate attendance log.
              </p>
            </div>

            <div className="rounded-3xl border border-violet-400/10 bg-violet-400/5 p-6">
              <div className="text-xs font-bold uppercase tracking-[0.18rem] text-violet-200">Setup</div>
              <div className="mt-3 text-2xl font-black">Supabase-backed attendance records</div>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Students, embeddings, and attendance logs are stored in your Supabase project. The Vercel app reads and
                writes against your own environment variables.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
