import { getPrizes } from '@/actions/prizes'
import PrizeForm from '@/components/admin/prize-form'
import PrizeTable from './prize-table'

export default async function PrizesPage() {
  const prizes = await getPrizes()

  const totalProb = prizes.reduce((s, p) => s + Number(p.probability), 0)
  const probClass = totalProb > 100 ? 'prob-over' : totalProb > 80 ? 'prob-warn' : 'prob-ok'

  return (
    <>
      <h1 className="admin-page-title">奖品设置</h1>
      <PrizeForm />

      <div className="panel">
        <div className="panel-title">奖品列表 ({prizes.length})</div>

        {/* 概率总和 */}
        <div className="prob-bar">
          <div
            className={`prob-bar-fill ${probClass}`}
            style={{ width: `${Math.min(totalProb, 100)}%` }}
          />
        </div>
        <div className="prob-info">
          概率总和: {totalProb.toFixed(2)}%
          {totalProb > 100 && ' (超出 100%!)'}
        </div>

        <PrizeTable prizes={prizes} />
      </div>
    </>
  )
}
