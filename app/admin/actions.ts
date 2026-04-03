'use server'

import { createServerSupabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { markAttendanceOnce } from '@/lib/attendance-station';

export async function addStudentProfile(formData: FormData) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const fullName = formData.get('full_name') as string;
  const department = formData.get('department') as string;
  const email = formData.get('email') as string || `${crypto.randomUUID().slice(0, 8)}@student.local`;
  
  // Use Service Role Key to bypass Postgres RLS for inserting orphan profiles!
  
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await adminSupabase
    .from('profiles')
    .insert({
      role: 'student',
      full_name: fullName,
      department: department,
      email: email,
    })
    .select('id')
    .single();

  if (error || !data) {
    return { error: error?.message || 'Failed to create student' };
  }

  // Redirect instantly to the biometric capture screen for THIS specific student ID
  redirect(`/admin/add-student/${data.id}/enroll`);
}

export async function getStudentDirectory() {
  
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await adminSupabase.from('profiles').select('id, full_name, department').eq('role', 'student');
  return data || [];
}

export async function markStudentAttendance(payload: {
  profile_id: string;
  class_id: string | null;
  session_id: string;
  confidence_score: number;
}) {
  try {
    const result = await markAttendanceOnce({
      profileId: payload.profile_id,
      classId: payload.class_id,
      sessionId: payload.session_id,
      confidenceScore: payload.confidence_score,
    });

    return result.status === 'marked';
  } catch (error) {
    console.error('Failed to mark attendance:', error);
    return false;
  }
}

export async function getFaceEmbeddings() {
  
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data, error } = await adminSupabase
    .from('face_embeddings')
    .select('descriptor, profile_id');
  if (error) console.error("Failed to fetch embeddings:", error);
  return data || [];
}

export async function saveOrUpdateFaceEmbedding(profileId: string, descriptor: number[], snapshotCount: number) {
  
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: existing } = await adminSupabase
    .from('face_embeddings')
    .select('id')
    .eq('profile_id', profileId)
    .maybeSingle();

  if (existing) {
    const { error } = await adminSupabase.from('face_embeddings').update({
      descriptor,
      snapshot_count: snapshotCount,
      updated_at: new Date().toISOString()
    }).eq('id', existing.id);
    return { error: error?.message || null };
  } else {
    const { error } = await adminSupabase.from('face_embeddings').insert({
      profile_id: profileId,
      descriptor,
      snapshot_count: snapshotCount,
    });
    return { error: error?.message || null };
  }
}

export async function getSessionLogs(sessionId: string) {
  
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await adminSupabase
    .from('attendance_logs')
    .select('*, profiles(id, full_name, department, avatar_url)')
    .eq('session_id', sessionId)
    .order('marked_at', { ascending: false });

  if (error) console.error("getSessionLogs error:", error);
  return data || [];
}

export async function deleteStudentProfile(profileId: string) {
  
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Delete in order: attendance_logs → face_embeddings → profile
  const { error: logsErr } = await adminSupabase.from('attendance_logs').delete().eq('profile_id', profileId);
  if (logsErr) console.error('Failed to delete attendance_logs:', logsErr);
  
  const { error: embErr } = await adminSupabase.from('face_embeddings').delete().eq('profile_id', profileId);
  if (embErr) console.error('Failed to delete face_embeddings:', embErr);
  
  const { error } = await adminSupabase.from('profiles').delete().eq('id', profileId);

  if (error) {
    console.error('deleteStudentProfile error:', error);
    return { error: error.message };
  }

  // Bust Next.js cache so analytics & personnel pages show updated data
  revalidatePath('/admin');
  revalidatePath('/admin/reports');
  revalidatePath('/dashboard');

  return { error: null };
}
