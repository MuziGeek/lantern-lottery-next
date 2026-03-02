'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import LanternCard from './lantern-card'
import RiddlePanel from './riddle-panel'
import ResultModal from './result-modal'
import Fireworks from './fireworks'
import type { CardPhase, DrawResult, Participant } from '@/types'
import { checkRiddleAnswer, executeDraw, getRandomRiddles } from '@/actions/lottery'
import { useRouter } from 'next/navigation'

const CARD_COUNT = 10

interface RiddleData {
  id: number
  riddle: string
  category: string
}

interface LanternGridProps {
  participant: Participant
}

export default function LanternGrid({ participant }: LanternGridProps) {
  const router = useRouter()
  const [riddles, setRiddles] = useState<RiddleData[]>([])
  const [phases, setPhases] = useState<CardPhase[]>(
    Array(CARD_COUNT).fill('idle'),
  )
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const [showBackdrop, setShowBackdrop] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [drawResult, setDrawResult] = useState<DrawResult | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [riddleCorrect, setRiddleCorrect] = useState(false)
  const [riddleAttempts, setRiddleAttempts] = useState(0)
  const [showFireworks, setShowFireworks] = useState(false)

  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const originalRects = useRef<(DOMRect | null)[]>([])
  const placeholderRef = useRef<HTMLDivElement | null>(null)

  const remaining = participant.total_chances - participant.used_chances
  const hasChances = remaining > 0

  // 加载灯谜
  useEffect(() => {
    loadRiddles()
  }, [])

  async function loadRiddles() {
    const data = await getRandomRiddles(CARD_COUNT)
    setRiddles(data)
    setPhases(Array(CARD_COUNT).fill('idle'))
    setFocusedIndex(null)
    setShowBackdrop(false)
    setIsAnimating(false)
  }

  function handleCardClick(index: number) {
    if (isAnimating || phases[index] !== 'idle' || !hasChances) return

    setIsAnimating(true)
    const card = cardRefs.current[index]
    if (!card) return

    // 记录原始位置
    const rect = card.getBoundingClientRect()
    originalRects.current[index] = rect

    // 插入占位符保持布局
    const placeholder = document.createElement('div')
    placeholder.style.width = `${rect.width}px`
    placeholder.style.height = `${rect.height}px`
    placeholder.style.visibility = 'hidden'
    card.parentNode?.insertBefore(placeholder, card)
    placeholderRef.current = placeholder

    // 卡牌脱离文档流
    document.body.appendChild(card)

    // 设置初始位置
    card.style.left = `${rect.left}px`
    card.style.top = `${rect.top}px`
    card.style.width = `${rect.width}px`
    card.style.height = `${rect.height}px`

    setShowBackdrop(true)
    setPhases((prev) => {
      const next = [...prev]
      next[index] = 'flying'
      return next
    })

    // 计算居中位置和缩放
    const vw = window.innerWidth
    const vh = window.innerHeight
    const scale = Math.min(2.5, vw / rect.width * 0.4, vh / rect.height * 0.5)
    const cx = (vw - rect.width) / 2
    const cy = (vh - rect.height) / 2
    const tx = cx - rect.left
    const ty = cy - rect.top

    requestAnimationFrame(() => {
      card.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`
    })

    setFocusedIndex(index)
  }

  const handleTransitionEnd = useCallback(
    (e: React.TransitionEvent, index: number) => {
      if (e.propertyName !== 'transform') return

      const currentPhase = phases[index]

      if (currentPhase === 'flying') {
        // flying → focused（翻转）
        setPhases((prev) => {
          const next = [...prev]
          next[index] = 'focused'
          return next
        })
        setIsAnimating(false)
      } else if (currentPhase === 'flying-back') {
        // flying-back → used（回到原位）
        const card = cardRefs.current[index]
        const placeholder = placeholderRef.current

        if (card && placeholder?.parentNode) {
          // 清除 inline styles
          card.style.left = ''
          card.style.top = ''
          card.style.width = ''
          card.style.height = ''
          card.style.transform = ''

          placeholder.parentNode.insertBefore(card, placeholder)
          placeholder.remove()
          placeholderRef.current = null
        }

        setPhases((prev) => {
          const next = [...prev]
          next[index] = 'used'
          return next
        })
        setShowBackdrop(false)
        setIsAnimating(false)
        setFocusedIndex(null)
      }
    },
    [phases],
  )

  function handleRiddleComplete(correct: boolean, attempts: number) {
    setRiddleCorrect(correct)
    setRiddleAttempts(attempts)

    if (focusedIndex === null) return

    const card = cardRefs.current[focusedIndex]
    if (!card) return

    // 飞回原位
    setIsAnimating(true)

    setTimeout(() => {
      setPhases((prev) => {
        const next = [...prev]
        if (focusedIndex !== null) {
          next[focusedIndex] = 'flying-back'
        }
        return next
      })

      // 回到原始位置
      card.style.transform = 'translate(0, 0) scale(1)'
    }, 450)

    // 执行抽奖
    setTimeout(async () => {
      try {
        const result = await executeDraw(participant.id, correct, attempts)
        if (result.success && result.data) {
          setDrawResult(result.data)
          setShowResult(true)
          if (!result.data.noPrize) {
            setShowFireworks(true)
            setTimeout(() => setShowFireworks(false), 3000)
          }
          router.refresh()
        }
      } catch (err) {
        console.error('抽奖失败:', err)
      }
    }, 1200)
  }

  async function handleCheckAnswer(
    riddleId: number,
    answer: string,
  ): Promise<{ correct: boolean }> {
    const result = await checkRiddleAnswer(riddleId, answer)
    if (result.success && result.data) {
      return result.data
    }
    return { correct: false }
  }

  function handleCloseResult() {
    setShowResult(false)
    setDrawResult(null)
  }

  function handleRefresh() {
    loadRiddles()
  }

  return (
    <>
      {/* 遮罩层 */}
      <div className={`card-backdrop ${showBackdrop ? 'active' : ''}`} />

      {/* 控制栏 */}
      <div className="panel">
        <div className="lottery-controls">
          <span className="chances-display">
            {hasChances
              ? `剩余 ${remaining} 次抽奖机会`
              : '抽奖次数已用完'}
          </span>
          <button className="btn btn-outline btn-sm" onClick={handleRefresh}>
            刷新卡牌
          </button>
        </div>
      </div>

      {/* 灯笼卡片网格 */}
      <div className="lantern-grid">
        {Array.from({ length: CARD_COUNT }).map((_, i) => (
          <LanternCard
            key={i}
            ref={(el) => { cardRefs.current[i] = el }}
            index={i}
            phase={hasChances ? phases[i] : 'used'}
            riddle={riddles[i]}
            onClick={() => handleCardClick(i)}
            onTransitionEnd={(e) => handleTransitionEnd(e, i)}
          >
            {focusedIndex === i && riddles[i] && (
              <RiddlePanel
                riddle={riddles[i].riddle}
                category={riddles[i].category}
                riddleId={riddles[i].id}
                onComplete={handleRiddleComplete}
                checkAnswer={handleCheckAnswer}
              />
            )}
          </LanternCard>
        ))}
      </div>

      {/* 中奖弹窗 */}
      {showResult && (
        <ResultModal
          result={drawResult}
          riddleCorrect={riddleCorrect}
          riddleAttempts={riddleAttempts}
          onClose={handleCloseResult}
        />
      )}

      {/* 烟花 */}
      <Fireworks active={showFireworks} />
    </>
  )
}
