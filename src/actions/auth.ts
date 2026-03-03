'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { toEmail } from '@/lib/username-utils'
import type { ActionResponse } from '@/types'

export async function login(
  username: string,
  password: string,
): Promise<ActionResponse> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: toEmail(username),
    password,
  })

  if (error) {
    return { success: false, error: '角色名或密码错误' }
  }

  const role = (data.user?.user_metadata as { role?: string })?.role

  revalidatePath('/', 'layout')
  redirect(role === 'admin' ? '/admin' : '/')
}

export async function register(
  username: string,
  password: string,
): Promise<ActionResponse> {
  try {
    const adminClient = createAdminClient()

    // 1. 创建 Auth 用户
    const { data: authUser, error: authError } =
      await adminClient.auth.admin.createUser({
        email: toEmail(username),
        password,
        email_confirm: true,
        user_metadata: { role: 'participant' },
      })

    if (authError) {
      if (authError.message.toLowerCase().includes('already')) {
        return { success: false, error: '该角色名已被注册' }
      }
      return { success: false, error: `注册失败: ${authError.message}` }
    }

    // 2. 写入 participants 表
    const { error } = await adminClient.from('participants').insert({
      auth_user_id: authUser.user.id,
      name: username,
      total_chances: 0,
    })

    if (error) {
      // 回滚：删除已创建的 Auth 用户
      await adminClient.auth.admin.deleteUser(authUser.user.id)
      return { success: false, error: `写入参与者数据失败: ${error.message}` }
    }

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : '未知错误',
    }
  }
}

export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
