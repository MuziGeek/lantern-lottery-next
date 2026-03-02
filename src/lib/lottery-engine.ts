import type { Prize, DrawResult } from '@/types'

/**
 * 抽奖引擎 — 纯函数，在 Server Action 中调用
 *
 * 算法：两段式随机
 * 1. 过滤库存 > 0 的奖品池
 * 2. roll = Math.random() * 100，若 roll >= totalProb → 未中奖
 * 3. 在概率范围内二次加权随机选奖品
 */

/** 从可用奖品池中执行一次抽奖 */
export function draw(availablePrizes: Prize[]): DrawResult {
  // 过滤库存 > 0
  const pool = availablePrizes.filter((p) => p.remaining > 0)

  if (pool.length === 0) {
    return { prize: null, noPrize: true, reason: '已无可抽取的奖品' }
  }

  const totalProb = pool.reduce((sum, p) => sum + Number(p.probability), 0)

  // 第一段：判断是否中奖
  const roll = Math.random() * 100
  if (roll >= totalProb) {
    return { prize: null, noPrize: true, reason: '未中奖' }
  }

  // 第二段：加权随机选奖品
  const normalizedRoll = Math.random() * totalProb
  let cumulative = 0

  for (const prize of pool) {
    cumulative += Number(prize.probability)
    if (normalizedRoll < cumulative) {
      return { prize, noPrize: false }
    }
  }

  // 兜底：返回最后一个奖品
  return { prize: pool[pool.length - 1], noPrize: false }
}
