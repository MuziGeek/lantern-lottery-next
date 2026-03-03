'use client'

import { useState } from 'react'
import { deleteParticipant, updateParticipant } from '@/actions/participants'
import type { Participant } from '@/types'

interface ParticipantTableProps {
  participants: Participant[]
}

interface EditState {
  name: string
  total_chances: number
}

export default function ParticipantTable({ participants }: ParticipantTableProps) {
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editState, setEditState] = useState<EditState>({ name: '', total_chances: 0 })
  const [saving, setSaving] = useState(false)

  async function handleDelete(p: Participant) {
    if (!confirm(`确定删除 ${p.name}？此操作将同时删除其登录账号。`)) return

    setDeleting(p.id)
    await deleteParticipant(p.id, p.auth_user_id)
    setDeleting(null)
  }

  function handleEdit(p: Participant) {
    setEditingId(p.id)
    setEditState({ name: p.name, total_chances: p.total_chances })
  }

  function handleCancel() {
    setEditingId(null)
  }

  async function handleSave(p: Participant) {
    setSaving(true)
    const result = await updateParticipant(p.id, {
      name: editState.name,
      total_chances: editState.total_chances,
    })
    setSaving(false)

    if (!result.success) {
      alert(result.error ?? '保存失败')
      return
    }

    setEditingId(null)
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
            <th>总次数</th>
            <th>已用</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((p, i) => {
            const isEditing = editingId === p.id

            return (
              <tr key={p.id}>
                <td>{i + 1}</td>
                <td>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editState.name}
                      onChange={(e) =>
                        setEditState({ ...editState, name: e.target.value })
                      }
                      className="edit-input"
                    />
                  ) : (
                    p.name
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editState.total_chances}
                      min={p.used_chances}
                      onChange={(e) =>
                        setEditState({
                          ...editState,
                          total_chances: Number(e.target.value),
                        })
                      }
                      className="edit-input"
                    />
                  ) : (
                    p.total_chances
                  )}
                </td>
                <td>{p.used_chances}</td>
                <td>
                  <div className="action-btns">
                    {isEditing ? (
                      <>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleSave(p)}
                          disabled={saving}
                        >
                          {saving ? '保存中...' : '保存'}
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={handleCancel}
                          disabled={saving}
                        >
                          取消
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleEdit(p)}
                        >
                          编辑
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(p)}
                          disabled={deleting === p.id}
                        >
                          {deleting === p.id ? '删除中...' : '删除'}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
