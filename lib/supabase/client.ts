import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';
import { getSupabasePublicEnv } from '@/lib/supabase/env';

export function createClient() {
  const { url, anonKey } = getSupabasePublicEnv();

  if (!url || !anonKey) {
    throw new Error('Supabase public environment variables are missing.');
  }

  return createBrowserClient<Database>(
    url,
    anonKey
  );
}
