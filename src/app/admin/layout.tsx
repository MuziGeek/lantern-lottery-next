import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarNav from '@/components/admin/sidebar-nav'
import LanternDeco from '@/components/layout/lantern-deco'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const role = (user.user_metadata as { role?: string })?.role
  if (role !== 'admin') redirect('/')

  return (
    <>
      <LanternDeco />
      <div className="admin-layout">
        <SidebarNav />
        <main className="admin-main">{children}</main>
      </div>
    </>
  )
}
