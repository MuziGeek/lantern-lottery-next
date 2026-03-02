'use client'

import { forwardRef } from 'react'
import type { CardPhase } from '@/types'

interface LanternCardProps {
  index: number
  phase: CardPhase
  riddle?: { id: number; riddle: string; category: string }
  style?: React.CSSProperties
  onClick?: () => void
  children?: React.ReactNode
  onTransitionEnd?: (e: React.TransitionEvent) => void
}

function getPhaseClass(phase: CardPhase): string {
  switch (phase) {
    case 'flying':
      return 'lantern-card flying'
    case 'focused':
      return 'lantern-card focused flipped'
    case 'flying-back':
      return 'lantern-card flying-back'
    case 'used':
      return 'lantern-card used'
    default:
      return 'lantern-card'
  }
}

const LanternCard = forwardRef<HTMLDivElement, LanternCardProps>(
  function LanternCard({ index, phase, riddle, style, onClick, children, onTransitionEnd }, ref) {
    return (
      <div
        ref={ref}
        className={getPhaseClass(phase)}
        style={{
          animationDelay: `${(index + 1) * 0.05}s`,
          ...style,
        }}
        onClick={phase === 'idle' ? onClick : undefined}
        onTransitionEnd={onTransitionEnd}
      >
        <div className="lantern-inner">
          {/* 正面：灯笼 */}
          <div className="lantern-front">
            <div className="lantern-ribs" />
            <div className="lantern-glow" />
            <div className="lantern-text">猜灯谜</div>
          </div>

          {/* 背面：灯谜 */}
          <div className="lantern-back">
            {phase === 'focused' && riddle && children}
          </div>
        </div>
      </div>
    )
  },
)

export default LanternCard
