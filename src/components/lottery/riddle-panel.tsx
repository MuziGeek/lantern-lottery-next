'use client'

import { useState, useRef, useEffect } from 'react'

interface RiddlePanelProps {
  riddle: string
  category: string
  riddleId: number
  onComplete: (correct: boolean, attempts: number) => void
  checkAnswer: (riddleId: number, answer: string) => Promise<{ correct: boolean }>
}

const MAX_ATTEMPTS = 3

export default function RiddlePanel({
  riddle,
  category,
  riddleId,
  onComplete,
  checkAnswer,
}: RiddlePanelProps) {
  const [answer, setAnswer] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [message, setMessage] = useState('')
  const [finished, setFinished] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!answer.trim() || finished) return

    const newAttempts = attempts + 1
    setAttempts(newAttempts)

    try {
      const result = await checkAnswer(riddleId, answer.trim())

      if (result.correct) {
        setMessage('回答正确！')
        setFinished(true)
        setTimeout(() => onComplete(true, newAttempts), 600)
      } else if (newAttempts >= MAX_ATTEMPTS) {
        setMessage('答题次数已用完')
        setFinished(true)
        setTimeout(() => onComplete(false, newAttempts), 1200)
      } else {
        setMessage(`回答错误，还有 ${MAX_ATTEMPTS - newAttempts} 次机会`)
        setAnswer('')
      }
    } catch {
      setMessage('校验失败，请重试')
    }
  }

  return (
    <>
      <div className="riddle-category">{category}</div>
      <div className="riddle-text">{riddle}</div>
      <div className="riddle-input-area">
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            placeholder="输入谜底"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={finished}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!answer.trim() || finished}
          >
            提交答案
          </button>
        </form>
        {message && <div className="riddle-attempts">{message}</div>}
        {!message && (
          <div className="riddle-attempts">
            剩余 {MAX_ATTEMPTS - attempts} 次答题机会
          </div>
        )}
      </div>
    </>
  )
}
