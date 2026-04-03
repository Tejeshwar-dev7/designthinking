require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function test() {
  const { data, error } = await supabase.from('attendance_logs').select('*, profiles(*)').limit(1);
  console.log("Without alias:", error || data);
  const { data: d2, error: e2 } = await supabase.from('attendance_logs').select('*, profile:profiles(*)').limit(1);
  console.log("With alias:", e2 || d2);
}
test();
