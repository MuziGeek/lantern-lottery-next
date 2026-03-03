'use server'

import { createClient } from '@/lib/supabase/server'
import { draw } from '@/lib/lottery-engine'
import { checkAnswer } from '@/lib/riddle-checker'
import { revalidatePath } from 'next/cache'
import type { ActionResponse, DrawResult, Riddle } from '@/types'

/** 获取随机灯谜（不返回答案） */
export async function getRandomRiddles(
  count: number,
): Promise<Omit<Riddle, 'answer'>[]> {
  const supabase = await createClient()

  // 获取全部灯谜 ID，随机选取 count 个
  const { data: allRiddles, error } = await supabase
    .from('riddles')
    .select('id, riddle, category')

  if (error || !allRiddles) return []

  // Fisher-Yates 洗牌
  const shuffled = [...allRiddles]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled.slice(0, count)
}

/** 校验灯谜答案（服务端校验，不暴露答案） */
export async function checkRiddleAnswer(
  riddleId: number,
  userAnswer: string,
): Promise<ActionResponse<{ correct: boolean }>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('riddles')
    .select('answer')
    .eq('id', riddleId)
    .single()

  if (error || !data) {
    return { success: false, error: '灯谜不存在' }
  }

  const correct = checkAnswer(data.answer, userAnswer)
  return { success: true, data: { correct } }
}

/** 执行抽奖（服务端执行，调用存储过程原子操作） */
export async function executeDraw(
  participantId: string,
  riddleCorrect: boolean,
  riddleAttempts: number,
): Promise<ActionResponse<DrawResult>> {
  try {
    const supabase = await createClient()

    // 1. 获取可用奖品池
    const { data: prizes, error: prizesError } = await supabase
      .from('prizes')
      .select('*')
      .gt('remaining', 0)

    if (prizesError) {
      return { success: false, error: prizesError.message }
    }

    // 2. 特等奖去重：查询该用户是否已中过特等奖
    const { data: existingSpecial } = await supabase
      .from('records')
      .select('id')
      .eq('participant_id', participantId)
      .eq('prize_level', '特等奖')
      .limit(1)

    // 若已中过特等奖，从奖品池中排除特等奖
    const filteredPrizes = existingSpecial && existingSpecial.length > 0
      ? (prizes ?? []).filter((p) => p.level !== '特等奖')
      : (prizes ?? [])

    // 3. 执行抽奖算法
    const result = draw(filteredPrizes)

    if (result.noPrize || !result.prize) {
      // 未中奖：仅扣次数
      const { error } = await supabase.rpc('execute_no_prize', {
        p_participant_id: participantId,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      revalidatePath('/')
      return { success: true, data: { prize: null, noPrize: true, reason: result.reason } }
    }

    // 3. 中奖：调用存储过程原子扣减
    const { data: recordId, error: drawError } = await supabase.rpc(
      'execute_draw',
      {
        p_participant_id: participantId,
        p_prize_id: result.prize.id,
        p_riddle_correct: riddleCorrect,
        p_riddle_attempts: riddleAttempts,
      },
    )

    if (drawError) {
      // 库存竞争失败，降级为未中奖
      if (drawError.message.includes('prize_exhausted')) {
        const { error } = await supabase.rpc('execute_no_prize', {
          p_participant_id: participantId,
        })
        if (error) {
          return { success: false, error: error.message }
        }
        revalidatePath('/')
        return {
          success: true,
          data: { prize: null, noPrize: true, reason: '奖品已被抢完' },
        }
      }
      return { success: false, error: drawError.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/records')
    return { success: true, data: result }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : '抽奖失败',
    }
  }
}
