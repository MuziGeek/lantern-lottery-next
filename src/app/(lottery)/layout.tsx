import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LanternDeco from '@/components/layout/lantern-deco'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

export default async function LotteryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <>
      <LanternDeco />
      <div
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '24px 20px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Header />
        {children}
        <Footer />
      </div>
    </>
  )
}
