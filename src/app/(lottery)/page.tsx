import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentParticipant } from '@/actions/participants'
import { getMyRecords } from '@/actions/records'
import UserInfoBar from '@/components/lottery/user-info-bar'
import LanternGrid from '@/components/lottery/lantern-grid'

export default async function LotteryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // admin 用户也可以访问抽奖大厅，但如果没有参与者记录则提示
  const participant = await getCurrentParticipant()

  if (!participant) {
    const role = (user.user_metadata as { role?: string })?.role
    if (role === 'admin') {
      return (
        <div className="panel">
          <div className="empty-msg">
            管理员账号无抽奖资格，请前往{' '}
            <a
              href="/admin"
              style={{ color: 'var(--gold-leaf)', textDecoration: 'underline' }}
            >
              管理后台
            </a>
          </div>
        </div>
      )
    }
    return (
      <div className="panel">
        <div className="empty-msg">未找到参与者信息，请联系管理员</div>
      </div>
    )
  }

  const records = await getMyRecords(participant.id)

  return (
    <>
      <UserInfoBar participant={participant} records={records} />
      <LanternGrid participant={participant} />
    </>
  )
}
