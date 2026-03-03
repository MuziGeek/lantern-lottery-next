import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function generateRecordsCsv(records: any[]): string {
  const BOM = '\uFEFF'
  const headers = ['参与者', '奖品', '奖品等级', '灯谜正确', '尝试次数', '中奖时间']
  const rows = records.map(r => [
    r.participant_name,
    r.prize_name,
    r.prize_level,
    r.riddle_correct ? '是' : '否',
    r.riddle_attempts,
    new Date(r.created_at).toLocaleString('zh-CN'),
  ])

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  return BOM + csvContent
}

export async function GET() {
  try {
    const supabase = await createClient()

    // 检查权限
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const role = (user.user_metadata as { role?: string })?.role
    if (role !== 'admin') {
      return NextResponse.json({ error: '无权限' }, { status: 403 })
    }

    // 获取记录
    const { data: records, error } = await supabase
      .from('records')
      .select('participant_name, prize_name, prize_level, riddle_correct, riddle_attempts, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const csv = generateRecordsCsv(records ?? [])

    // 生成文件名
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
    const filename = `中奖记录_${dateStr}.csv`

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '导出失败' },
      { status: 500 },
    )
  }
}
