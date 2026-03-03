import { getPrizes } from '@/actions/prizes'
import PrizeForm from '@/components/admin/prize-form'
import PrizeTable from './prize-table'
import ProbabilityCalculator from '@/components/admin/probability-calculator'

export default async function PrizesPage() {
  const prizes = await getPrizes()

  const totalProb = prizes.reduce((s, p) => s + Number(p.probability), 0)
  const probClass = totalProb > 100 ? 'prob-over' : totalProb > 80 ? 'prob-warn' : 'prob-ok'

  // 计算轮空风险
  const totalDraws = 150
  const riskWarnings = prizes.map((prize) => {
    const singleProb = Number(prize.probability) / 100
    const noWinProb = Math.pow(1 - singleProb, totalDraws)
    const atLeastOneWinProb = 1 - noWinProb

    return {
      level: prize.level,
      name: prize.name,
      probability: atLeastOneWinProb * 100,
      isRisk: atLeastOneWinProb < 0.95,
      isCritical: atLeastOneWinProb < 0.7,
    }
  })

  const hasRisks = riskWarnings.some((w) => w.isRisk)

  return (
    <>
      <h1 className="admin-page-title">奖品设置</h1>
      <PrizeForm />

      <ProbabilityCalculator />

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

        {/* 轮空风险提示 */}
        {hasRisks && (
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#fef3c7',
              borderLeft: '4px solid #f59e0b',
              borderRadius: '4px',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#92400e' }}>
              ⚠️ 轮空风险警告（基于 {totalDraws} 次抽奖）
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#78350f' }}>
              {riskWarnings
                .filter((w) => w.isRisk)
                .map((w) => (
                  <li key={w.level} style={{ color: w.isCritical ? '#dc2626' : '#f59e0b' }}>
                    {w.name} ({w.level})：至少 1 人中奖概率仅 {w.probability.toFixed(1)}%
                    {w.isCritical && ' (严重风险)'}
                  </li>
                ))}
            </ul>
          </div>
        )}

        <PrizeTable prizes={prizes} />
      </div>
    </>
  )
}
