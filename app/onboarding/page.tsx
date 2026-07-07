import { ArrowRight, Rocket } from 'lucide-react'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import Mascot from '@/components/Mascot'
import { chooseLevel } from './actions'

export default async function OnboardingPage() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) redirect('/login')

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: sessionUser.id },
    select: { onboarded: true, name: true },
  })
  if (user.onboarded) redirect('/learn')

  const levels = await prisma.level.findMany({ orderBy: { order: 'asc' } })
  const lowestOrder = levels[0]?.order

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-xl flex-col gap-6">
        <header className="text-center">
          <Mascot pose="wave" size={100} className="mx-auto mb-3" />
          <h1 className="text-2xl font-black tracking-tight text-zinc-100">
            Selamat datang{user.name ? `, ${user.name}` : ''}! 👋
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Dari tingkat mana kamu mau mulai belajar? Tingkat di bawah pilihanmu
            tetap terbuka bebas untuk review.
          </p>
        </header>

        <div className="flex flex-col gap-3">
          {levels.map((level) => {
            const isBeginner = level.order === lowestOrder
            return (
              <form key={level.id} action={chooseLevel.bind(null, level.order)}>
                <button
                  type="submit"
                  className="group flex w-full items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-800/50 px-5 py-4 text-left transition-colors hover:border-brand-500 hover:bg-zinc-800"
                >
                  <span className="rounded-lg bg-zinc-700 px-2.5 py-1 font-mono text-sm font-black text-zinc-200 group-hover:bg-brand-500 group-hover:text-brand-950">
                    {level.code}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-zinc-100">{level.name}</span>
                    <span className="block text-sm text-zinc-400">{level.description}</span>
                    <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-brand-600">
                      {isBeginner ? (
                        <>
                          <Rocket size={12} aria-hidden /> Langsung mulai — tanpa tes
                        </>
                      ) : (
                        <>
                          <ArrowRight size={12} aria-hidden /> Tes penempatan singkat
                        </>
                      )}
                    </span>
                  </span>
                </button>
              </form>
            )
          })}
        </div>
      </div>
    </main>
  )
}
