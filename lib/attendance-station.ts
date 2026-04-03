import { createClient } from '@supabase/supabase-js';
import type { Database, Tables } from '@/types/database';

export type AttendanceStatus = 'marked' | 'already_marked' | 'unknown_profile';

export interface AttendanceResult {
  status: AttendanceStatus;
  message: string;
  profile: Pick<Tables<'profiles'>, 'id' | 'full_name' | 'department'> | null;
  log: Tables<'attendance_logs'> | null;
}

export interface Esp32AttendancePayload {
  profileId?: string | null;
  recognizedName?: string | null;
  sessionId: string;
  classId?: string | null;
  confidenceScore?: number | null;
}

export function createAdminSupabase() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export async function resolveProfileFromPayload(
  adminSupabase: ReturnType<typeof createAdminSupabase>,
  payload: Esp32AttendancePayload
) {
  if (payload.profileId) {
    const { data } = await adminSupabase
      .from('profiles')
      .select('id, full_name, department')
      .eq('id', payload.profileId)
      .maybeSingle();
    return data;
  }

  if (payload.recognizedName) {
    const { data } = await adminSupabase
      .from('profiles')
      .select('id, full_name, department')
      .ilike('full_name', payload.recognizedName.trim())
      .maybeSingle();
    return data;
  }

  return null;
}

export async function markAttendanceOnce(
  payload: Esp32AttendancePayload
): Promise<AttendanceResult> {
  const adminSupabase = createAdminSupabase();
  const profile = await resolveProfileFromPayload(adminSupabase, payload);

  if (!profile) {
    return {
      status: 'unknown_profile',
      message: 'Profile not found for this ESP32-CAM match.',
      profile: null,
      log: null,
    };
  }

  const { data: existingLog } = await adminSupabase
    .from('attendance_logs')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('session_id', payload.sessionId)
    .maybeSingle();

  if (existingLog) {
    return {
      status: 'already_marked',
      message: `${profile.full_name} is already marked for this session.`,
      profile,
      log: existingLog,
    };
  }

  const insertPayload = {
    profile_id: profile.id,
    class_id: payload.classId ?? null,
    session_id: payload.sessionId,
    confidence_score: payload.confidenceScore ?? null,
    status: 'present',
  };

  const { data: insertedLog, error } = await adminSupabase
    .from('attendance_logs')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    status: 'marked',
    message: `${profile.full_name} marked present from ESP32-CAM.`,
    profile,
    log: insertedLog,
  };
}

export async function getRecentSessionAttendance(sessionId: string, limit = 12) {
  const adminSupabase = createAdminSupabase();
  const { data, error } = await adminSupabase
    .from('attendance_logs')
    .select('*, profiles(id, full_name, department, avatar_url)')
    .eq('session_id', sessionId)
    .order('marked_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
