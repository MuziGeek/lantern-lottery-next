import { getDashboardStats } from '@/actions/records'

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()

  return (
    <>
      <h1 className="admin-page-title">仪表盘</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalParticipants}</div>
          <div className="stat-label">参与人数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalPrizes}</div>
          <div className="stat-label">奖品总数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalRecords}</div>
          <div className="stat-label">中奖记录</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.usedChances}</div>
          <div className="stat-label">已用次数</div>
        </div>
      </div>
    </>
  )
}
