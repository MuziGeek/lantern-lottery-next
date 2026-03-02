'use client'

import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const remaining = participant.total_chances - participant.used_chances

  async function handleLogout() {
    const result = await logout()
    if (result.success && result.data?.redirectTo) {
      router.push(result.data.redirectTo)
    }
  }

  return (
    <div className="user-info-bar">
      <span className="user-name">{participant.name}</span>
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
      <button type="button" className="btn btn-outline btn-sm" onClick={handleLogout}>
        登出
      </button>
    </div>
  )
}
