import { createServerSupabase } from '@/lib/supabase/server';
import Link from 'next/link';
import { logout } from '@/app/(auth)/actions';

export async function NavBar() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, id')
    .eq('auth_user_id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                VisionSync
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              {isAdmin ? (
                <>
                  <Link href="/admin" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Admin Portal
                  </Link>
                  <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Live Scanner
                  </Link>
                </>
              ) : (
                <>
                  <Link href={`/students/${profile?.id}`} className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    My Profile
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 font-medium hidden sm:block">
              {profile?.full_name} <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full ml-2 uppercase tracking-wide">{profile?.role}</span>
            </div>
            <form action={logout}>
              <button type="submit" className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-transparent hover:border-red-100">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
}
