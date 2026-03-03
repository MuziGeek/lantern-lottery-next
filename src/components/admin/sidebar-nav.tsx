'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/actions/auth'

const navItems = [
  { href: '/admin', label: '仪表盘', icon: '📊' },
  { href: '/admin/participants', label: '人员管理', icon: '👥' },
  { href: '/admin/prizes', label: '奖品设置', icon: '🎁' },
  { href: '/admin/riddles', label: '灯谜管理', icon: '🏮' },
  { href: '/admin/records', label: '中奖记录', icon: '📋' },
]

export default function SidebarNav() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    await logout()
  }

  function handleNavClick() {
    setMenuOpen(false)
  }

  return (
    <>
      {/* 移动端汉堡按钮 */}
      <button
        type="button"
        className="menu-toggle"
        onClick={() => setMenuOpen(true)}
        aria-label="打开菜单"
      >
        ☰
      </button>

      {/* 遮罩层 */}
      {menuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside className={`admin-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-title">🏮 管理后台</div>
        <nav>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname === item.href ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div style={{ padding: '16px' }}>
          <Link
            href="/"
            className="btn btn-outline btn-sm"
            style={{ width: '100%', marginBottom: 8, textDecoration: 'none' }}
            onClick={handleNavClick}
          >
            抽奖大厅
          </Link>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            style={{ width: '100%' }}
            onClick={handleLogout}
          >
            登出
          </button>
        </div>
      </aside>
    </>
  )
}
