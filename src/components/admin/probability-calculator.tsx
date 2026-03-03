'use client'

import { useState } from 'react'

interface ProbabilityResult {
  level: string
  singleProb: number
  count: number
  totalContribution: number
  noWinProb: number
  atLeastOneWinProb: number
}

export default function ProbabilityCalculator() {
  const [totalDraws, setTotalDraws] = useState(150)
  const [ratio, setRatio] = useState(1.5)
  const [baseProb, setBaseProb] = useState(0.8)

  // 计算各等级概率
  const calculateProbabilities = (): ProbabilityResult[] => {
    const levels = [
      { name: '特等奖', count: 3, multiplier: 1 },
      { name: '一等奖', count: 5, multiplier: ratio },
      { name: '二等奖', count: 7, multiplier: ratio ** 2 },
      { name: '三等奖', count: 10, multiplier: ratio ** 3 },
    ]

    return levels.map((level) => {
      const singleProb = baseProb * level.multiplier
      const totalContribution = singleProb * level.count
      const noWinProb = Math.pow(1 - singleProb / 100, totalDraws)
      const atLeastOneWinProb = 1 - noWinProb

      return {
        level: level.name,
        singleProb,
        count: level.count,
        totalContribution,
        noWinProb,
        atLeastOneWinProb: atLeastOneWinProb * 100,
      }
    })
  }

  const results = calculateProbabilities()
  const totalProb = results.reduce((sum, r) => sum + r.totalContribution, 0)
  const expectedWins = (totalDraws * totalProb) / 100
  const totalPrizes = results.reduce((sum, r) => sum + r.count, 0)

  return (
    <div className="panel">
      <div className="panel-title">概率计算器</div>

      <div className="form-grid">
        <div className="form-field">
          <label>总抽奖次数</label>
          <input
            type="number"
            value={totalDraws}
            onChange={(e) => setTotalDraws(Number(e.target.value))}
            min={1}
          />
        </div>

        <div className="form-field">
          <label>公比 (r)</label>
          <input
            type="number"
            value={ratio}
            onChange={(e) => setRatio(Number(e.target.value))}
            min={1}
            step={0.1}
          />
        </div>

        <div className="form-field">
          <label>基础概率 (%)</label>
          <input
            type="number"
            value={baseProb}
            onChange={(e) => setBaseProb(Number(e.target.value))}
            min={0.1}
            step={0.1}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>等级</th>
              <th style={{ textAlign: 'right' }}>单个概率</th>
              <th style={{ textAlign: 'right' }}>数量</th>
              <th style={{ textAlign: 'right' }}>总贡献概率</th>
              <th style={{ textAlign: 'right' }}>不轮空概率</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => {
              const isRisk = result.atLeastOneWinProb < 95
              const isCritical = result.atLeastOneWinProb < 70

              return (
                <tr key={result.level}>
                  <td>{result.level}</td>
                  <td style={{ textAlign: 'right' }}>{result.singleProb.toFixed(2)}%</td>
                  <td style={{ textAlign: 'right' }}>{result.count}</td>
                  <td style={{ textAlign: 'right' }}>{result.totalContribution.toFixed(2)}%</td>
                  <td
                    style={{
                      textAlign: 'right',
                      color: isCritical ? '#dc2626' : isRisk ? '#f59e0b' : '#16a34a',
                      fontWeight: isRisk ? 'bold' : 'normal',
                    }}
                  >
                    {result.atLeastOneWinProb.toFixed(1)}%
                    {isCritical && ' ⚠️'}
                    {isRisk && !isCritical && ' ⚠️'}
                    {!isRisk && ' ✓'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">概率总和</div>
          <div className="stat-value" style={{ color: totalProb > 100 ? '#dc2626' : '#16a34a' }}>
            {totalProb.toFixed(2)}%
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">期望中奖次数</div>
          <div className="stat-value">{expectedWins.toFixed(1)} 次</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">奖品总数</div>
          <div className="stat-value">{totalPrizes} 个</div>
        </div>
      </div>

      <div className="info-box">
        {expectedWins > totalPrizes ? (
          <span style={{ color: '#16a34a' }}>
            ✓ 期望中奖次数 ({expectedWins.toFixed(1)}) 大于奖品总数 ({totalPrizes})，奖池可消耗完
          </span>
        ) : (
          <span style={{ color: '#dc2626' }}>
            ⚠️ 期望中奖次数 ({expectedWins.toFixed(1)}) 小于奖品总数 ({totalPrizes})，可能有奖品剩余
          </span>
        )}
      </div>
    </div>
  )
}
