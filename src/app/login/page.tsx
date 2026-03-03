'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/actions/auth'

function LoginForm() {
  const searchParams = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const registered = searchParams.get('registered') === 'true'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(username, password)
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

            {registered && (
              <div
                style={{
                  color: 'var(--jade-glow)',
                  fontSize: '0.85rem',
                  marginBottom: 14,
                  fontFamily: 'var(--font-heading)',
                  textAlign: 'center',
                  padding: '8px',
                  backgroundColor: 'rgba(52, 211, 153, 0.1)',
                  borderRadius: '4px',
                }}
              >
                注册成功，请登录
              </div>
            )}

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

            <div
              style={{
                marginTop: 16,
                textAlign: 'center',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
              }}
            >
              还没有账号？
              <Link
                href="/register"
                style={{
                  color: 'var(--vermilion-glow)',
                  marginLeft: 4,
                  textDecoration: 'none',
                }}
              >
                立即注册
              </Link>
            </div>
          </div>

          <footer className="app-footer">元宵灯谜抽奖大会</footer>
        </div>
      </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <LoginForm />
    </Suspense>
  )
}
