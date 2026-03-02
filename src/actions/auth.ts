'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ActionResponse } from '@/types'

export async function login(
  email: string,
  password: string,
): Promise<ActionResponse> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { success: false, error: '邮箱或密码错误' }
  }

  const role = (data.user?.user_metadata as { role?: string })?.role

  revalidatePath('/', 'layout')
  redirect(role === 'admin' ? '/admin' : '/')
}

export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
