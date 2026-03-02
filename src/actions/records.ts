'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResponse, Record } from '@/types'

/** 获取所有中奖记录 */
export async function getRecords(level?: string): Promise<Record[]> {
  const supabase = await createClient()
  let query = supabase
    .from('records')
    .select('*')
    .order('created_at', { ascending: false })

  if (level && level !== 'all') {
    query = query.eq('prize_level', level)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return data ?? []
}

/** 获取当前用户的中奖记录 */
export async function getMyRecords(participantId: string): Promise<Record[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('records')
    .select('*')
    .eq('participant_id', participantId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

/** 清空所有中奖记录（admin） */
export async function clearRecords(): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('records')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // 删除所有行

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/records')
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : '未知错误',
    }
  }
}

/** 获取仪表盘统计数据 */
export async function getDashboardStats(): Promise<{
  totalParticipants: number
  totalPrizes: number
  totalRecords: number
  usedChances: number
}> {
  const supabase = await createClient()

  const [participants, prizes, records] = await Promise.all([
    supabase.from('participants').select('used_chances'),
    supabase.from('prizes').select('total, remaining'),
    supabase.from('records').select('id'),
  ])

  const pList = participants.data ?? []
  const prList = prizes.data ?? []

  return {
    totalParticipants: pList.length,
    totalPrizes: prList.reduce((s, p) => s + (p.total ?? 0), 0),
    totalRecords: (records.data ?? []).length,
    usedChances: pList.reduce((s, p) => s + (p.used_chances ?? 0), 0),
  }
}
