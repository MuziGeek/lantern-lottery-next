'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionResponse, Participant, CsvParticipantRow } from '@/types'

/** 获取所有参与者 */
export async function getParticipants(): Promise<Participant[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

/** 获取当前登录用户对应的参与者信息 */
export async function getCurrentParticipant(): Promise<Participant | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('participants')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  return data
}

/** 创建单个参与者（含 Auth 账号） */
export async function createParticipant(
  name: string,
  totalChances: number,
  email: string,
  password: string,
): Promise<ActionResponse<Participant>> {
  try {
    const adminClient = createAdminClient()

    // 1. 创建 Auth 用户
    const { data: authUser, error: authError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'participant' },
      })

    if (authError) {
      return { success: false, error: `创建账号失败: ${authError.message}` }
    }

    // 2. 写入 participants 表
    const { data, error } = await adminClient
      .from('participants')
      .insert({
        auth_user_id: authUser.user.id,
        name,
        total_chances: totalChances,
      })
      .select()
      .single()

    if (error) {
      // 回滚：删除已创建的 Auth 用户
      await adminClient.auth.admin.deleteUser(authUser.user.id)
      return { success: false, error: `写入参与者数据失败: ${error.message}` }
    }

    revalidatePath('/admin/participants')
    return { success: true, data }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : '未知错误',
    }
  }
}

/** 批量创建参与者（CSV 导入） */
export async function batchCreateParticipants(
  rows: CsvParticipantRow[],
): Promise<ActionResponse<{ created: number; errors: string[] }>> {
  const adminClient = createAdminClient()
  let created = 0
  const errors: string[] = []

  for (const row of rows) {
    const { data: authUser, error: authError } =
      await adminClient.auth.admin.createUser({
        email: row.email,
        password: row.password,
        email_confirm: true,
        user_metadata: { role: 'participant' },
      })

    if (authError) {
      errors.push(`${row.name}(${row.email}): ${authError.message}`)
      continue
    }

    const { error } = await adminClient.from('participants').insert({
      auth_user_id: authUser.user.id,
      name: row.name,
      total_chances: row.totalChances,
    })

    if (error) {
      await adminClient.auth.admin.deleteUser(authUser.user.id)
      errors.push(`${row.name}: ${error.message}`)
      continue
    }

    created++
  }

  revalidatePath('/admin/participants')
  return { success: true, data: { created, errors } }
}

/** 删除参与者（同时删除 Auth 账号） */
export async function deleteParticipant(
  id: string,
  authUserId: string,
): Promise<ActionResponse> {
  try {
    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from('participants')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    // 删除 Auth 用户（cascade 会自动清理，但显式删除更安全）
    await adminClient.auth.admin.deleteUser(authUserId)

    revalidatePath('/admin/participants')
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : '未知错误',
    }
  }
}
