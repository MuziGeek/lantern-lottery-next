'use client'

import type { Participant, Record as LotteryRecord } from '@/types'
import { logout } from '@/actions/auth'

interface UserInfoBarProps {
  participant: Participant
  records: LotteryRecord[]
}

function getLevelBadgeClass(level: string): string {
  const map: Record<string, string> = {
    '特等奖': 'badge-special',
    '一等奖': 'badge-first',
    '二等奖': 'badge-second',
    '三等奖': 'badge-third',
    '参与奖': 'badge-participation',
  }
  return map[level] ?? 'badge-participation'
}

export default function UserInfoBar({ participant, records }: UserInfoBarProps) {
  const remaining = participant.total_chances - participant.used_chances

  return (
    <div className="user-info-bar">
      <span className="user-name">{participant.name}</span>
      {participant.dept && <span className="user-dept">{participant.dept}</span>}
      <span className="user-chances">
        剩余 {remaining} 次
      </span>
      {records.length > 0 && (
        <div className="user-prizes">
          {records.map((r) => (
            <span key={r.id} className={`badge ${getLevelBadgeClass(r.prize_level)}`}>
              {r.prize_name}
            </span>
          ))}
        </div>
      )}
      <span className="spacer" />
      <form action={logout}>
        <button type="submit" className="btn btn-outline btn-sm">
          登出
        </button>
      </form>
    </div>
  )
}
