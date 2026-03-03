'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionResponse, Participant } from '@/types'

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

/** 更新参与者信息 */
export async function updateParticipant(
  id: string,
  updates: { name?: string; total_chances?: number },
): Promise<ActionResponse<Participant>> {
  try {
    const adminClient = createAdminClient()

    // 查询当前参与者，校验 total_chances 不能小于 used_chances
    if (updates.total_chances !== undefined) {
      const { data: current, error: fetchError } = await adminClient
        .from('participants')
        .select('used_chances')
        .eq('id', id)
        .single()

      if (fetchError) {
        return { success: false, error: `查询参与者失败: ${fetchError.message}` }
      }

      if (updates.total_chances < current.used_chances) {
        return {
          success: false,
          error: `总次数不能小于已用次数(${current.used_chances})`,
        }
      }
    }

    const { data, error } = await adminClient
      .from('participants')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { success: false, error: `更新失败: ${error.message}` }
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
