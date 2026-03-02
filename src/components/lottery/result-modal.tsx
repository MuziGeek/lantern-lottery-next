'use client'

import type { DrawResult } from '@/types'

interface ResultModalProps {
  result: DrawResult | null
  riddleCorrect: boolean
  riddleAttempts: number
  onClose: () => void
}

function getLevelIcon(level: string): string {
  const map: Record<string, string> = {
    '特等奖': '🏆',
    '一等奖': '🥇',
    '二等奖': '🥈',
    '三等奖': '🥉',
    '参与奖': '🎁',
  }
  return map[level] ?? '🎁'
}

export default function ResultModal({
  result,
  riddleCorrect,
  riddleAttempts,
  onClose,
}: ResultModalProps) {
  if (!result) return null

  const isWin = !result.noPrize && result.prize

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {isWin ? (
          <>
            <div className="prize-icon">{getLevelIcon(result.prize!.level)}</div>
            <div className="prize-name">{result.prize!.name}</div>
            <div className="prize-level">{result.prize!.level}</div>
            <div className="riddle-result">
              答题：{riddleCorrect ? '正确' : '未答对'} ({riddleAttempts}次)
            </div>
          </>
        ) : (
          <>
            <div className="prize-icon">🎐</div>
            <div className="prize-name" style={{ fontSize: '1.4rem' }}>
              {result.reason ?? '未中奖'}
            </div>
            <div className="riddle-result" style={{ marginTop: 12 }}>
              再接再厉！
            </div>
          </>
        )}
        <button className="btn btn-gold" onClick={onClose}>
          确定
        </button>
      </div>
    </div>
  )
}
