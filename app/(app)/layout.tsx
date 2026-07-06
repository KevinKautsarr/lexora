import Link from 'next/link'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import BottomNav from '@/components/BottomNav'
import UserStats from '@/components/UserStats'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // User login yang belum onboarding diarahkan memilih tingkat dulu.
  // (Tanpa session: biarkan — tiap halaman sudah redirect ke /login sendiri.)
  const sessionUser = await getSessionUser()
  if (sessionUser) {
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { onboarded: true },
    })
    if (user && !user.onboarded) redirect('/onboarding')
  }

  return (
    <div className="flex min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:font-semibold focus:text-white"
      >
        Lompat ke konten
      </a>
      <Sidebar />
      {/* Mobile: tanpa offset kiri, BottomNav di bawah. Desktop: offset sidebar. */}
      <div className="flex flex-1 flex-col lg:pl-56">
        <header className="flex h-16 items-center justify-between border-b border-zinc-800 px-4 sm:px-8">
          {/* Logo hanya di mobile — di desktop sudah ada di sidebar. */}
          <Link
            href="/learn"
            aria-label="LEXORA — beranda"
            translate="no"
            className="text-xl font-black tracking-wide text-brand-600 lg:hidden"
          >
            LEXORA
          </Link>
          <div className="ml-auto">
            <UserStats />
          </div>
        </header>
        {/* pb ekstra di mobile agar konten tidak tertutup BottomNav (56px + safe-area). */}
        <main
          id="main-content"
          className="flex-1 px-4 py-8 pb-24 sm:px-8 lg:pb-8"
        >
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
