'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { createAdminSupabase } from '@/lib/attendance-station'

export async function login(formData: FormData) {
  const supabase = await createServerSupabase()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/admin')
}

export async function signup(formData: FormData) {
  const supabase = await createServerSupabase()
  const adminSupabase = createAdminSupabase()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  })

  if (error) {
    redirect('/register?error=' + encodeURIComponent(error.message))
  }

  const authUserId = data.user?.id

  if (authUserId) {
    await adminSupabase
      .from('profiles')
      .upsert(
        {
          auth_user_id: authUserId,
          email,
          full_name: fullName,
          role: 'admin',
        },
        {
          onConflict: 'email',
        }
      )
  }

  if (!data.session) {
    redirect('/login?error=' + encodeURIComponent('Account created. Confirm your email, then sign in.'))
  }

  revalidatePath('/', 'layout')
  redirect('/admin')
}

export async function logout() {
  const supabase = await createServerSupabase()
  await supabase.auth.signOut()
  redirect('/login')
}
