'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResponse, Prize, PrizeLevel } from '@/types'

/** 获取所有奖品 */
export async function getPrizes(): Promise<Prize[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('prizes')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

/** 创建奖品 */
export async function createPrize(
  name: string,
  level: PrizeLevel,
  total: number,
  probability: number,
): Promise<ActionResponse<Prize>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('prizes')
      .insert({
        name,
        level,
        total,
        remaining: total,
        probability,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/prizes')
    return { success: true, data }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : '未知错误',
    }
  }
}

/** 更新奖品 */
export async function updatePrize(
  id: string,
  updates: Partial<Pick<Prize, 'name' | 'level' | 'total' | 'remaining' | 'probability'>>,
): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('prizes')
      .update(updates)
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/prizes')
    revalidatePath('/')
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : '未知错误',
    }
  }
}

/** 删除奖品 */
export async function deletePrize(id: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('prizes').delete().eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/prizes')
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : '未知错误',
    }
  }
}
