'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { register } from '@/actions/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('两次密码输入不一致')
      return
    }

    if (password.length < 6) {
      setError('密码至少需要 6 位')
      return
    }

    setLoading(true)

    const result = await register(username, password)
    setLoading(false)

    if (!result.success) {
      setError(result.error ?? '注册失败')
      return
    }

    router.push('/login?registered=true')
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
            <div className="panel-title">注册</div>
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label>游戏角色名</label>
                <input
                  type="text"
                  placeholder="请输入角色名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label>密码</label>
                <input
                  type="password"
                  placeholder="至少 6 位"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label>确认密码</label>
                <input
                  type="password"
                  placeholder="再次输入密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
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
                {loading ? '注册中...' : '注册'}
              </button>
            </form>

            <div
              style={{
                marginTop: 16,
                textAlign: 'center',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
              }}
            >
              已有账号？
              <Link
                href="/login"
                style={{
                  color: 'var(--vermilion-glow)',
                  marginLeft: 4,
                  textDecoration: 'none',
                }}
              >
                去登录
              </Link>
            </div>
          </div>

          <footer className="app-footer">元宵灯谜抽奖大会</footer>
        </div>
      </div>
    </>
  )
}
