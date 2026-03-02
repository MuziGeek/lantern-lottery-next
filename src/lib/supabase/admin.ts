import { createClient } from '@supabase/supabase-js'

// service_role 客户端，仅在服务端使用
// 用于 admin 操作（如创建用户账号）
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
