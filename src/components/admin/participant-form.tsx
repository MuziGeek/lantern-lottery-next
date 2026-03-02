'use client'

import { useState } from 'react'
import { createParticipant } from '@/actions/participants'

export default function ParticipantForm() {
  const [name, setName] = useState('')
  const [dept, setDept] = useState('')
  const [totalChances, setTotalChances] = useState('1')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const result = await createParticipant(
      name,
      dept,
      parseInt(totalChances, 10),
      email,
      password,
    )

    if (result.success) {
      setMessage('创建成功')
      setName('')
      setDept('')
      setTotalChances('1')
      setEmail('')
      setPassword('')
    } else {
      setMessage(result.error ?? '创建失败')
    }

    setLoading(false)
  }

  return (
    <div className="panel">
      <div className="panel-title">添加参与者</div>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>姓名</label>
            <input
              type="text"
              placeholder="姓名"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>部门</label>
            <input
              type="text"
              placeholder="部门"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>抽奖次数</label>
            <input
              type="number"
              min="1"
              value={totalChances}
              onChange={(e) => setTotalChances(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>登录邮箱</label>
            <input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>初始密码</label>
            <input
              type="text"
              placeholder="初始密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
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
