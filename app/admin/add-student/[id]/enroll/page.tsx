import { createServerSupabase } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { FaceEnrollment } from '@/components/FaceEnrollment';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminEnrollPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { id: studentId } = await params;

  // Use Service Role Key to bypass Postgres RLS for reading orphan profiles!
  
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profile, error } = await adminSupabase
    .from('profiles')
    .select('id, full_name')
    .eq('id', studentId)
    .single();
    
  if (error) console.error("Database fetch error for profile:", error, "ID:", studentId);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-6 rounded-xl shadow border border-red-200 text-center text-red-600">
           Student Profile not found! Please restart the registration.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-3xl mb-4">
         <Link href="/admin" className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold">&larr; Cancel & Back to Admin</Link>
      </div>

      <div className="text-center mb-8">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 font-bold rounded-full text-xs uppercase tracking-widest mb-4">
           Administrator Mode
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Biometric Capture</h1>
        <p className="text-gray-500 mt-2">
           Instruct <span className="font-bold text-gray-900">{profile.full_name}</span> to look at the camera.
        </p>
      </div>
      
      <div className="w-full max-w-3xl border-4 border-amber-200 rounded-3xl p-2 bg-white shadow-xl">
         {/* We reuse the FaceEnrollment component blindly, passing the student's ID */}
         <FaceEnrollment profileId={profile.id} hasExisting={false} returnUrl="/admin" />
      </div>
    </div>
  );
}
