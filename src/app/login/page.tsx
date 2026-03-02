'use client'

import { useState } from 'react'
import { login } from '@/actions/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(email, password)
      if (!result.success) {
        setError(result.error ?? '登录失败')
      }
    } catch {
      // redirect 会抛出 NEXT_REDIRECT，属于正常流程
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="lantern-deco">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="hanging-lantern" />
        ))}
      </div>

      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ width: '100%', maxWidth: 400, padding: '0 20px' }}>
          <header className="app-header">
            <h1>
              <span className="lantern-icon">🏮</span> 元宵灯谜抽奖
            </h1>
            <div className="subtitle">花市灯如昼 · 人约黄昏后</div>
          </header>

          <div className="panel" style={{ marginTop: 8 }}>
            <div className="panel-title">登录</div>
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label>邮箱</label>
                <input
                  type="email"
                  placeholder="请输入邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label>密码</label>
                <input
                  type="password"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div
                  style={{
                    color: 'var(--vermilion-glow)',
                    fontSize: '0.85rem',
                    marginBottom: 14,
                    fontFamily: 'var(--font-heading)',
                    textAlign: 'center',
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%' }}
              >
                {loading ? '登录中...' : '登录'}
              </button>
            </form>
          </div>

          <footer className="app-footer">元宵灯谜抽奖大会</footer>
        </div>
      </div>
    </>
  )
}
