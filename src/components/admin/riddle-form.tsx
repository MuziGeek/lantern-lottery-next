'use client'

import { useState } from 'react'
import { createRiddle } from '@/actions/riddles'

export default function RiddleForm() {
  const [riddle, setRiddle] = useState('')
  const [category, setCategory] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const result = await createRiddle(riddle, category, answer)

    if (result.success) {
      setMessage('创建成功')
      setRiddle('')
      setCategory('')
      setAnswer('')
    } else {
      setMessage(result.error ?? '创建失败')
    }

    setLoading(false)
  }

  return (
    <div className="panel">
      <div className="panel-title">添加灯谜</div>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label>谜面</label>
            <input
              type="text"
              placeholder="请输入谜面"
              value={riddle}
              onChange={(e) => setRiddle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>类别</label>
            <input
              type="text"
              placeholder="如: 字谜、成语"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>谜底</label>
            <input
              type="text"
              placeholder="请输入谜底"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
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
