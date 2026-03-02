'use client'

import { useState, useRef } from 'react'
import { parseCsvParticipants } from '@/lib/csv-utils'
import { batchCreateParticipants } from '@/actions/participants'

export default function CsvImport() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setLoading(true)
    setMessage('')

    try {
      const text = await file.text()
      const rows = parseCsvParticipants(text)

      if (rows.length === 0) {
        setMessage('CSV 中无有效数据行')
        setLoading(false)
        return
      }

      const result = await batchCreateParticipants(rows)

      if (result.success && result.data) {
        const { created, errors } = result.data
        let msg = `成功创建 ${created} 个参与者`
        if (errors.length > 0) {
          msg += `，${errors.length} 个失败: ${errors.slice(0, 3).join('; ')}`
          if (errors.length > 3) msg += '...'
        }
        setMessage(msg)
      } else {
        setMessage(result.error ?? '导入失败')
      }
    } catch {
      setMessage('文件解析失败')
    }

    setLoading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="panel">
      <div className="panel-title">CSV 批量导入</div>
      <p
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          marginBottom: 8,
        }}
      >
        格式: 姓名, 抽奖次数, 邮箱, 初始密码
      </p>
      <div
        className="file-upload-area"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.txt"
          onChange={handleChange}
        />
        <p>{loading ? '导入中...' : '点击或拖拽 CSV 文件到此处'}</p>
      </div>
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
