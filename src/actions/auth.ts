'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResponse } from '@/types'

export async function login(
  email: string,
  password: string,
): Promise<ActionResponse<{ redirectTo: string }>> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { success: false, error: '邮箱或密码错误' }
  }

  const role = (data.user?.user_metadata as { role?: string })?.role

  try {
    revalidatePath('/', 'layout')
  } catch {
    // EdgeOne 边缘环境下忽略 revalidation 错误
  }
  return { success: true, data: { redirectTo: role === 'admin' ? '/admin' : '/' } }
}

export async function logout(): Promise<ActionResponse<{ redirectTo: string }>> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  try {
    revalidatePath('/', 'layout')
  } catch {
    // EdgeOne 边缘环境下忽略 revalidation 错误
  }
  return { success: true, data: { redirectTo: '/login' } }
}
