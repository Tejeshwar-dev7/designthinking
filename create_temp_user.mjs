import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gjitqqskjgnlbtxidllb.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqaXRxcXNramdubGJ0eGlkbGxiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTEzNjk4MSwiZXhwIjoyMDkwNzEyOTgxfQ.4j4XjkvUHKFwHKF-dPC0NL2gUS4DPAK8jz9EkR_DX80';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'master@example.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: { full_name: 'Master Tester' }
  });

  if (error) {
    console.error('Error creating user:', error);
  } else {
    console.log('SUCCESS!');
  }
}

main();
