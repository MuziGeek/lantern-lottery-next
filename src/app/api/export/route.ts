import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateRecordsCsv } from '@/lib/csv-utils'

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
