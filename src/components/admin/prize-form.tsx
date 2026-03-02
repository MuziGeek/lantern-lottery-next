'use client'

import { useState } from 'react'
import { createPrize } from '@/actions/prizes'
import type { PrizeLevel } from '@/types'

const LEVELS: PrizeLevel[] = ['特等奖', '一等奖', '二等奖', '三等奖', '参与奖']

export default function PrizeForm() {
  const [name, setName] = useState('')
  const [level, setLevel] = useState<PrizeLevel>('参与奖')
  const [total, setTotal] = useState('1')
  const [probability, setProbability] = useState('0')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const result = await createPrize(
      name,
      level,
      parseInt(total, 10),
      parseFloat(probability),
    )

    if (result.success) {
      setMessage('创建成功')
      setName('')
      setLevel('参与奖')
      setTotal('1')
      setProbability('0')
    } else {
      setMessage(result.error ?? '创建失败')
    }

    setLoading(false)
  }

  return (
    <div className="panel">
      <div className="panel-title">添加奖品</div>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>奖品名称</label>
            <input
              type="text"
              placeholder="奖品名称"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>等级</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as PrizeLevel)}
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>数量</label>
            <input
              type="number"
              min="1"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>概率 (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={probability}
              onChange={(e) => setProbability(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? '创建中...' : '添加'}
            </button>
          </div>
        </div>
      </form>
      {message && (
        <div
          style={{
            marginTop: 12,
            fontFamily: 'var(--font-heading)',
            fontSize: '0.85rem',
            color: message.includes('成功')
              ? 'var(--jade)'
              : 'var(--vermilion-glow)',
          }}
        >
          {message}
        </div>
      )}
    </div>
  )
}
