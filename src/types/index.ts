// ============================================================
// 数据库类型定义
// ============================================================

export type PrizeLevel = '特等奖' | '一等奖' | '二等奖' | '三等奖' | '参与奖'

export interface Participant {
  id: string
  auth_user_id: string
  name: string
  total_chances: number
  used_chances: number
  created_at: string
}

export interface Prize {
  id: string
  name: string
  level: PrizeLevel
  total: number
  remaining: number
  probability: number
  created_at: string
}

export interface Riddle {
  id: number
  riddle: string
  category: string
  answer: string
}

export interface Record {
  id: string
  participant_id: string
  participant_name: string
  prize_id: string
  prize_name: string
  prize_level: PrizeLevel
  riddle_correct: boolean
  riddle_attempts: number
  created_at: string
}

// ============================================================
// 抽奖引擎类型
// ============================================================

export interface DrawResult {
  prize: Prize | null
  noPrize: boolean
  reason?: string
}

// ============================================================
// 卡牌动画状态
// ============================================================

export type CardPhase = 'idle' | 'flying' | 'focused' | 'flying-back' | 'used'

// ============================================================
// Server Action 响应
// ============================================================

export interface ActionResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// ============================================================
// 用户角色
// ============================================================

export type UserRole = 'admin' | 'participant'

// ============================================================
// 抽奖错误类型
// ============================================================

export enum DrawErrorType {
  NO_CHANCES = 'no_chances_left',
  PRIZE_EXHAUSTED = 'prize_exhausted',
  HIGHER_PRIZE_EXISTS = 'already_have_higher_prize',
  PARTICIPANT_NOT_FOUND = 'participant_not_found',
  PRIZE_NOT_FOUND = 'prize_not_found',
}
