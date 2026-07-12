import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Layers, Target } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import { isLessonUnlockedForUser } from '@/lib/unlock'
import { createGameToken } from '@/lib/game-token'
import Mascot from '@/components/Mascot'
import MatchMadness from '../MatchMadness'

export default async function LessonGamePage({
  params,
}: {
  params: Promise<{ lessonId: string }>
}) {
  const sessionUser = await getSessionUser()
  if (!sessionUser) redirect('/login')

  const { lessonId } = await params

  const [user, lesson] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: sessionUser.id },
      select: { xp: true },
    }),
    prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { words: true, unit: { include: { level: true } } },
    }),
  ])

  if (!lesson || lesson.words.length === 0) notFound()

  const unlocked = await isLessonUnlockedForUser(sessionUser.id, lesson.id)
  if (!unlocked) redirect('/learn')

  const pairs = lesson.words.map((word) => ({
    id: word.id,
    english: word.term,
    indonesian: word.translation,
  }))

  // Bukti-mulai untuk submitScore — lihat lib/game-token.ts.
  const startToken = createGameToken(sessionUser.id, lesson.id)

  return (
    <main className="mx-auto w-full max-w-6xl">
      {/* ── Navigation header ── */}
      <div className="mb-6 flex items-center justify-between border-b border-zinc-700/60 pb-4">
        <Link
          href="/learn"
          className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 px-3.5 py-2 text-xs font-black uppercase tracking-wider text-zinc-300 transition-all hover:bg-zinc-700 hover:text-zinc-100 active:scale-95 shadow-sm"
        >
          <ArrowLeft size={16} className="text-brand-500" />
          Journey
        </Link>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-500">
            {lesson.unit.level.code} · {lesson.unit.level.name}
          </p>
          <p className="text-xs font-semibold text-zinc-400">{lesson.unit.title}</p>
        </div>
      </div>

      {/* ── Desktop: dua kolom; Mobile: satu kolom ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">

        {/* ── Kolom kiri: Ringkasan Lesson ── */}
        <aside className="flex flex-col gap-4">
          {/* Lesson identity card */}
          <section className="rounded-3xl border border-zinc-700 bg-zinc-800/50 p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-500">
              <Layers size={12} aria-hidden />
              {lesson.unit.level.code}
            </div>
            <h1 className="text-xl font-black leading-tight text-zinc-100">{lesson.title}</h1>
            <p className="mt-1 text-xs text-zinc-400">{lesson.unit.title}</p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center gap-1 rounded-2xl bg-zinc-900/50 p-3 text-center">
                <BookOpen size={15} className="text-brand-500" aria-hidden />
                <span className="text-lg font-black tabular-nums text-zinc-100">{lesson.words.length}</span>
                <span className="text-[10px] font-bold text-zinc-500">Kata</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-2xl bg-zinc-900/50 p-3 text-center">
                <Target size={15} className="text-brand-500" aria-hidden />
                <span className="text-lg font-black tabular-nums text-zinc-100">{lesson.words.length * 2}</span>
                <span className="text-[10px] font-bold text-zinc-500">Pasangan</span>
              </div>
            </div>
          </section>

          {/* Decorative Mascot Card */}
          <section className="hidden lg:flex flex-col items-center justify-center rounded-3xl border border-zinc-700 bg-zinc-800/50 p-6 shadow-sm min-h-[180px] gap-2 select-none">
            <Mascot pose="flexible" size={120} />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Flexible Learner</span>
          </section>
        </aside>

        {/* ── Kolom kanan: Game board ── */}
        <section className="rounded-3xl border border-zinc-700 bg-zinc-800/50 p-6 shadow-xl sm:p-8">
          <MatchMadness pairs={pairs} lessonId={lesson.id} userXp={user.xp} startToken={startToken} />
        </section>
      </div>
    </main>
  )
}
