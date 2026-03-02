'use client'

import { useState } from 'react'
import { getRecords, clearRecords } from '@/actions/records'
import type { Record as LotteryRecord, PrizeLevel } from '@/types'

const LEVELS: Array<{ value: string; label: string }> = [
  { value: 'all', label: '全部' },
  { value: '特等奖', label: '特等奖' },
  { value: '一等奖', label: '一等奖' },
  { value: '二等奖', label: '二等奖' },
  { value: '三等奖', label: '三等奖' },
  { value: '参与奖', label: '参与奖' },
]

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

function formatTime(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

interface RecordsViewProps {
  initialRecords: LotteryRecord[]
}

export default function RecordsView({ initialRecords }: RecordsViewProps) {
  const [records, setRecords] = useState(initialRecords)
  const [filter, setFilter] = useState('all')
  const [clearing, setClearing] = useState(false)

  async function handleFilter(level: string) {
    setFilter(level)
    const data = await getRecords(level)
    setRecords(data)
  }

  async function handleClear() {
    if (!confirm('确定清空所有中奖记录？此操作不可恢复。')) return
    setClearing(true)
    await clearRecords()
    setRecords([])
    setClearing(false)
  }

  function handleExport() {
    window.open('/api/export', '_blank')
  }

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div className="panel-title" style={{ margin: 0, padding: 0, border: 'none' }}>
          记录列表 ({records.length})
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-gold btn-sm" onClick={handleExport}>
            导出 CSV
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={handleClear}
            disabled={clearing || records.length === 0}
          >
            {clearing ? '清空中...' : '清空记录'}
          </button>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="filter-bar">
        <label>筛选等级:</label>
        {LEVELS.map((l) => (
          <button
            key={l.value}
            className={`btn btn-sm ${filter === l.value ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => handleFilter(l.value)}
          >
            {l.label}
          </button>
        ))}
      </div>

      {records.length === 0 ? (
        <div className="empty-msg">暂无中奖记录</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>序号</th>
                <th>姓名</th>
                <th>部门</th>
                <th>奖品</th>
                <th>等级</th>
                <th>答题</th>
                <th>时间</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={r.id}>
                  <td>{i + 1}</td>
                  <td>{r.participant_name}</td>
                  <td>{r.dept || '-'}</td>
                  <td>{r.prize_name}</td>
                  <td>
                    <span className={`badge ${getLevelBadgeClass(r.prize_level)}`}>
                      {r.prize_level}
                    </span>
                  </td>
                  <td>
                    {r.riddle_correct ? '正确' : '错误'} ({r.riddle_attempts}次)
                  </td>
                  <td>{formatTime(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
