import type { CsvParticipantRow } from '@/types'

/**
 * CSV 解析/导出工具
 */

/** 解析参与者 CSV（姓名, 部门, 次数, 邮箱, 初始密码） */
export function parseCsvParticipants(text: string): CsvParticipantRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  // 跳过表头行（如果第一行包含"姓名"）
  const startIdx = lines[0]?.includes('姓名') ? 1 : 0
  const rows: CsvParticipantRow[] = []

  for (let i = startIdx; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i])
    if (cols.length < 5) continue

    const totalChances = parseInt(cols[2], 10)
    if (isNaN(totalChances) || totalChances < 1) continue

    rows.push({
      name: cols[0].trim(),
      dept: cols[1].trim(),
      totalChances,
      email: cols[3].trim(),
      password: cols[4].trim(),
    })
  }

  return rows
}

/** 解析单行 CSV（处理引号包裹的逗号） */
function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

/** 转义 CSV 字段 */
function escapeCsv(str: string): string {
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/** 格式化时间 */
function formatTime(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/** 生成中奖记录 CSV 内容（含 BOM 头） */
export function generateRecordsCsv(
  records: Array<{
    participant_name: string
    dept: string
    prize_name: string
    prize_level: string
    riddle_correct: boolean
    riddle_attempts: number
    created_at: string
  }>,
): string {
  const header = '序号,姓名,部门,奖品名称,奖品等级,答题情况,答题次数,抽奖时间'
  const rows = records.map((r, i) =>
    [
      i + 1,
      escapeCsv(r.participant_name),
      escapeCsv(r.dept),
      escapeCsv(r.prize_name),
      r.prize_level,
      r.riddle_correct ? '正确' : '错误',
      r.riddle_attempts,
      formatTime(r.created_at),
    ].join(','),
  )

  // BOM 头确保 Excel 正确识别 UTF-8 中文
  return '\uFEFF' + [header, ...rows].join('\n')
}
