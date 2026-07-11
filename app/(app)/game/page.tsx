import { BookOpen, Dumbbell, Sparkles, Target, Zap } from 'lucide-react'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import { levelForXp } from '@/lib/level'
import MatchMadness, { type WordPair } from './MatchMadness'

const PRACTICE_PAIRS = 8

function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// Mode Practice: review kata acak dari lesson yang sudah completed.
// Tanpa lessonId → MatchMadness tidak menyimpan skor/XP, murni latihan.
export default async function PracticePage() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) redirect('/login')

  const [user, completedLessons] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: sessionUser.id },
      select: { xp: true },
    }),
    prisma.lessonProgress.findMany({
      where: { userId: sessionUser.id, completed: true },
      select: { lessonId: true },
    }),
  ])

  if (completedLessons.length === 0) {
    redirect('/learn?notice=practice-empty')
  }

  const words = await prisma.word.findMany({
    where: { lessonId: { in: completedLessons.map((p) => p.lessonId) } },
    select: { id: true, term: true, translation: true },
  })

  const pairs: WordPair[] = shuffle(words)
    .slice(0, PRACTICE_PAIRS)
    .map((word) => ({
      id: word.id,
      english: word.term,
      indonesian: word.translation,
    }))

  const currentLevel = levelForXp(user.xp)

  return (
    <main className="mx-auto w-full max-w-6xl">
      {/* ── Header baris atas ── */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight text-zinc-100 sm:text-3xl">
            <Sparkles size={26} className="text-brand-500" aria-hidden />
            Latihan Personal
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Review acak &bull; tidak menambah XP
          </p>
        </div>
      </div>





      {/* ── Desktop: dua kolom; Mobile: satu kolom ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">

        {/* ── Kolom kiri (Sidebar info) ── */}
        <aside className="flex flex-col gap-4">
          {/* Stat card */}
          <section className="rounded-3xl border border-zinc-700 bg-zinc-800/50 p-5 shadow-sm">
            <h2 className="mb-4 text-xs font-black uppercase tracking-widest text-zinc-500">Statistik Sesi</h2>
            <dl className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center gap-1 rounded-2xl bg-zinc-900/50 p-3 text-center">
                <BookOpen size={16} className="text-brand-500" aria-hidden />
                <dd className="text-xl font-black tabular-nums text-zinc-100">{completedLessons.length}</dd>
                <dt className="text-[10px] font-bold text-zinc-500">Lesson Selesai</dt>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-2xl bg-zinc-900/50 p-3 text-center">
                <Dumbbell size={16} className="text-brand-500" aria-hidden />
                <dd className="text-xl font-black tabular-nums text-zinc-100">{PRACTICE_PAIRS}</dd>
                <dt className="text-[10px] font-bold text-zinc-500">Pasangan Kata</dt>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-2xl bg-zinc-900/50 p-3 text-center">
                <Zap size={16} className="text-xp-400" aria-hidden />
                <dd className="text-xl font-black tabular-nums text-zinc-100">{user.xp.toLocaleString('id-ID')}</dd>
                <dt className="text-[10px] font-bold text-zinc-500">Total XP</dt>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-2xl bg-zinc-900/50 p-3 text-center">
                <Target size={16} className="text-brand-500" aria-hidden />
                <dd className="text-xl font-black tabular-nums text-zinc-100">{currentLevel}</dd>
                <dt className="text-[10px] font-bold text-zinc-500">Level Lexi</dt>
              </div>

            </dl>
          </section>

          {/* Dekoratif ikon besar — tersembunyi di mobile */}
          <div className="hidden lg:flex items-center justify-center rounded-3xl border border-zinc-700/50 bg-zinc-800/20 p-8 opacity-60">
            <Dumbbell size={100} strokeWidth={0.8} className="text-zinc-600" aria-hidden />
          </div>
        </aside>

        {/* ── Kolom kanan (Game board) ── */}
        <section className="rounded-3xl border border-zinc-700 bg-zinc-800/50 p-5 shadow-lg sm:p-8">
          <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Target size={14} className="text-brand-500" aria-hidden />
            Cocokkan pasangan kata secepat mungkin
          </div>
          <MatchMadness pairs={pairs} userXp={user.xp} />
        </section>
      </div>
    </main>
  )
}
