'use client'

import { useRef, useCallback } from 'react'

interface FireworksProps {
  active: boolean
}

const COLORS = [
  ['#FF6B35', '#FF4D3A', '#FFD700'],
  ['#C93A2A', '#FF4D3A', '#F0D060'],
  ['#F0D060', '#D4A843', '#FFE8A0'],
  ['#2D8B72', '#1A5C4A', '#A8E6CF'],
  ['#9B59B6', '#8E44AD', '#D2B4DE'],
]

export default function Fireworks({ active }: FireworksProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const fire = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = ''

    const positions = [0.3, 0.5, 0.7]

    positions.forEach((xPos, groupIdx) => {
      setTimeout(() => {
        const colorSet = COLORS[groupIdx % COLORS.length]
        const cx = window.innerWidth * xPos
        const cy = window.innerHeight * (0.3 + Math.random() * 0.2)

        // 主爆炸粒子
        for (let i = 0; i < 36; i++) {
          const angle = (i / 36) * Math.PI * 2
          const dist = 60 + Math.random() * 100
          const tx = Math.cos(angle) * dist
          const ty = Math.sin(angle) * dist
          const size = 3 + Math.random() * 4
          const color = colorSet[Math.floor(Math.random() * colorSet.length)]

          const particle = document.createElement('div')
          particle.className = 'firework-particle'
          particle.style.cssText = `
            left: ${cx}px;
            top: ${cy}px;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            box-shadow: 0 0 ${size * 2}px ${color};
            --tx: ${tx}px;
            --ty: ${ty}px;
          `
          container.appendChild(particle)
        }

        // 尾迹粒子
        for (let i = 0; i < 20; i++) {
          const angle = Math.random() * Math.PI * 2
          const dist = 20 + Math.random() * 40
          const tx = Math.cos(angle) * dist
          const ty = Math.sin(angle) * dist
          const size = 1.5 + Math.random() * 2
          const color = colorSet[Math.floor(Math.random() * colorSet.length)]

          const trail = document.createElement('div')
          trail.className = 'firework-particle trail'
          trail.style.cssText = `
            left: ${cx}px;
            top: ${cy}px;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            --tx: ${tx}px;
            --ty: ${ty}px;
          `
          container.appendChild(trail)
        }
      }, groupIdx * 250)
    })

    setTimeout(() => {
      if (container) container.innerHTML = ''
    }, 2500)
  }, [])

  // 当 active 变为 true 时触发
  const prevActiveRef = useRef(false)
  if (active && !prevActiveRef.current) {
    // 使用 setTimeout 确保在 DOM 更新后执行
    setTimeout(fire, 50)
  }
  prevActiveRef.current = active

  return <div ref={containerRef} className="fireworks-container" id="fireworks" />
}
