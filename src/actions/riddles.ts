'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResponse, Riddle } from '@/types'

/** 获取所有灯谜 */
export async function getRiddles(): Promise<Riddle[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('riddles')
    .select('*')
    .order('id', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

/** 创建灯谜 */
export async function createRiddle(
  riddle: string,
  category: string,
  answer: string,
): Promise<ActionResponse<Riddle>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('riddles')
      .insert({ riddle, category, answer })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/riddles')
    return { success: true, data }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : '未知错误',
    }
  }
}

/** 更新灯谜 */
export async function updateRiddle(
  id: number,
  updates: Partial<Pick<Riddle, 'riddle' | 'category' | 'answer'>>,
): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('riddles')
      .update(updates)
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/riddles')
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : '未知错误',
    }
  }
}

/** 删除灯谜 */
export async function deleteRiddle(id: number): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('riddles').delete().eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/riddles')
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : '未知错误',
    }
  }
}
