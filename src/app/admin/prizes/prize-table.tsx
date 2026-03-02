'use client'

import { useState } from 'react'
import { deletePrize, updatePrize } from '@/actions/prizes'
import type { Prize, PrizeLevel } from '@/types'

const LEVELS: PrizeLevel[] = ['特等奖', '一等奖', '二等奖', '三等奖', '参与奖']

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

interface PrizeTableProps {
  prizes: Prize[]
}

export default function PrizeTable({ prizes }: PrizeTableProps) {
  const [editing, setEditing] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Prize>>({})
  const [deleting, setDeleting] = useState<string | null>(null)

  function startEdit(prize: Prize) {
    setEditing(prize.id)
    setEditData({
      name: prize.name,
      level: prize.level,
      total: prize.total,
      remaining: prize.remaining,
      probability: prize.probability,
    })
  }

  async function handleSave(id: string) {
    await updatePrize(id, editData)
    setEditing(null)
    setEditData({})
  }

  async function handleDelete(prize: Prize) {
    if (!confirm(`确定删除奖品 "${prize.name}"？`)) return
    setDeleting(prize.id)
    await deletePrize(prize.id)
    setDeleting(null)
  }

  if (prizes.length === 0) {
    return <div className="empty-msg">暂无奖品</div>
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>序号</th>
            <th>名称</th>
            <th>等级</th>
            <th>剩余/总数</th>
            <th>概率(%)</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {prizes.map((p, i) => (
            <tr key={p.id}>
              <td>{i + 1}</td>
              <td>
                {editing === p.id ? (
                  <input
                    type="text"
                    value={editData.name ?? ''}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                    style={{ width: 100 }}
                  />
                ) : (
                  p.name
                )}
              </td>
              <td>
                {editing === p.id ? (
                  <select
                    value={editData.level ?? ''}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        level: e.target.value as PrizeLevel,
                      })
                    }
                  >
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className={`badge ${getLevelBadgeClass(p.level)}`}>
                    {p.level}
                  </span>
                )}
              </td>
              <td>
                {editing === p.id ? (
                  <>
                    <input
                      type="number"
                      min="0"
                      value={editData.remaining ?? 0}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          remaining: parseInt(e.target.value, 10),
                        })
                      }
                      style={{ width: 50 }}
                    />
                    /
                    <input
                      type="number"
                      min="1"
                      value={editData.total ?? 1}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          total: parseInt(e.target.value, 10),
                        })
                      }
                      style={{ width: 50 }}
                    />
                  </>
                ) : (
                  `${p.remaining} / ${p.total}`
                )}
              </td>
              <td>
                {editing === p.id ? (
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={editData.probability ?? 0}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        probability: parseFloat(e.target.value),
                      })
                    }
                    style={{ width: 60 }}
                  />
                ) : (
                  `${p.probability}%`
                )}
              </td>
              <td>
                {editing === p.id ? (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleSave(p.id)}
                    >
                      保存
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setEditing(null)}
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => startEdit(p)}
                    >
                      编辑
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(p)}
                      disabled={deleting === p.id}
                    >
                      {deleting === p.id ? '...' : '删除'}
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
