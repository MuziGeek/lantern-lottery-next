import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '元宵灯谜抽奖大会',
  description: '花市灯如昼 · 人约黄昏后',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏮</text></svg>',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=ZCOOL+XiaoWei&family=Noto+Serif+SC:wght@400;600;700;900&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
