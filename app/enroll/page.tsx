import { createServerSupabase } from '@/lib/supabase/server';
import { FaceEnrollment } from '@/components/FaceEnrollment';
import { redirect } from 'next/navigation';

export default async function EnrollPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch the profile id
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-6 rounded-xl shadow border border-red-200 text-center text-red-600">
           Profile not found! Please ensure your database triggers are set up correctly.
        </div>
      </div>
    );
  }

  // Check if they already have an embedding 
  const { data: existingEmbedding } = await supabase
    .from('face_embeddings')
    .select('id')
    .eq('profile_id', profile.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Face Enrollment</h1>
        <p className="text-gray-500 mt-2">Welcome, {profile.full_name}! Let's set up your biometric profile.</p>
      </div>
      
      <div className="w-full max-w-3xl">
         <FaceEnrollment profileId={profile.id} hasExisting={!!existingEmbedding} />
      </div>
    </div>
  );
}
