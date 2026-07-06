import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
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
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-emerald-600 focus:px-4 focus:py-2 focus:font-semibold focus:text-white"
      >
        Lompat ke konten
      </a>
      <Sidebar />
      {/* Offset selebar sidebar: w-16 di layar kecil, w-56 di lg+ */}
      <div className="flex flex-1 flex-col pl-16 lg:pl-56">
        <header className="flex h-16 items-center justify-end border-b border-zinc-800 px-4 sm:px-8">
          <UserStats />
        </header>
        <main id="main-content" className="flex-1 px-4 py-8 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
