'use client'

import { useState } from 'react'
import { deleteParticipant } from '@/actions/participants'
import type { Participant } from '@/types'

interface ParticipantTableProps {
  participants: Participant[]
}

export default function ParticipantTable({ participants }: ParticipantTableProps) {
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(p: Participant) {
    if (!confirm(`确定删除 ${p.name}？此操作将同时删除其登录账号。`)) return

    setDeleting(p.id)
    await deleteParticipant(p.id, p.auth_user_id)
    setDeleting(null)
  }

  if (participants.length === 0) {
    return <div className="empty-msg">暂无参与者</div>
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>序号</th>
            <th>姓名</th>
            <th>部门</th>
            <th>总次数</th>
            <th>已用</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((p, i) => (
            <tr key={p.id}>
              <td>{i + 1}</td>
              <td>{p.name}</td>
              <td>{p.dept || '-'}</td>
              <td>{p.total_chances}</td>
              <td>{p.used_chances}</td>
              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(p)}
                  disabled={deleting === p.id}
                >
                  {deleting === p.id ? '删除中...' : '删除'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
