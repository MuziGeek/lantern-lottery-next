'use client'

import { useState } from 'react'
import { deleteRiddle, updateRiddle } from '@/actions/riddles'
import type { Riddle } from '@/types'

interface RiddleTableProps {
  riddles: Riddle[]
}

export default function RiddleTable({ riddles }: RiddleTableProps) {
  const [editing, setEditing] = useState<number | null>(null)
  const [editData, setEditData] = useState<Partial<Riddle>>({})
  const [deleting, setDeleting] = useState<number | null>(null)

  function startEdit(r: Riddle) {
    setEditing(r.id)
    setEditData({
      riddle: r.riddle,
      category: r.category,
      answer: r.answer,
    })
  }

  async function handleSave(id: number) {
    await updateRiddle(id, editData)
    setEditing(null)
    setEditData({})
  }

  async function handleDelete(r: Riddle) {
    if (!confirm(`确定删除灯谜 "${r.riddle}"？`)) return
    setDeleting(r.id)
    await deleteRiddle(r.id)
    setDeleting(null)
  }

  if (riddles.length === 0) {
    return <div className="empty-msg">暂无灯谜</div>
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>序号</th>
            <th>谜面</th>
            <th>类别</th>
            <th>谜底</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {riddles.map((r, i) => (
            <tr key={r.id}>
              <td>{i + 1}</td>
              <td>
                {editing === r.id ? (
                  <input
                    type="text"
                    value={editData.riddle ?? ''}
                    onChange={(e) =>
                      setEditData({ ...editData, riddle: e.target.value })
                    }
                    style={{ width: 200 }}
                  />
                ) : (
                  r.riddle
                )}
              </td>
              <td>
                {editing === r.id ? (
                  <input
                    type="text"
                    value={editData.category ?? ''}
                    onChange={(e) =>
                      setEditData({ ...editData, category: e.target.value })
                    }
                    style={{ width: 80 }}
                  />
                ) : (
                  r.category
                )}
              </td>
              <td>
                {editing === r.id ? (
                  <input
                    type="text"
                    value={editData.answer ?? ''}
                    onChange={(e) =>
                      setEditData({ ...editData, answer: e.target.value })
                    }
                    style={{ width: 100 }}
                  />
                ) : (
                  r.answer
                )}
              </td>
              <td>
                {editing === r.id ? (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleSave(r.id)}
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
                      onClick={() => startEdit(r)}
                    >
                      编辑
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(r)}
                      disabled={deleting === r.id}
                    >
                      {deleting === r.id ? '...' : '删除'}
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
