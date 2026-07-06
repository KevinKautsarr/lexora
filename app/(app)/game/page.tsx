import { Dumbbell, Sparkles, Target } from 'lucide-react'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
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

  const completedLessons = await prisma.lessonProgress.findMany({
    where: { userId: sessionUser.id, completed: true },
    select: { lessonId: true },
  })

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

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      {/* Hero — pola kartu besar Coddy, warna sage LEXORA */}
      <section className="relative overflow-hidden rounded-3xl border border-brand-300 bg-gradient-to-br from-brand-100 to-brand-50 p-6 sm:p-8">
        <div className="relative z-10 max-w-md">
          <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight text-brand-700">
            <Sparkles size={24} className="text-brand-600" aria-hidden />
            Latihan Personal
          </h1>
          <p className="mt-2 text-sm text-zinc-300">
            Review acak dari{' '}
            <span className="font-bold text-brand-700">{completedLessons.length}</span>{' '}
            lesson yang sudah kamu selesaikan. Asah ingatan tanpa tekanan — tidak
            menambah XP.
          </p>
        </div>
        {/* Dumbbell dekoratif di sudut, meniru hero Coddy */}
        <Dumbbell
          size={140}
          strokeWidth={1.25}
          className="pointer-events-none absolute -bottom-6 -right-4 text-brand-300/50"
          aria-hidden
        />
      </section>

      {/* Panel game */}
      <section className="rounded-3xl border border-zinc-700 bg-zinc-800/50 p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-400">
          <Target size={16} className="text-brand-600" aria-hidden />
          Cocokkan pasangan kata secepat mungkin
        </div>
        <MatchMadness pairs={pairs} />
      </section>
    </div>
  )
}
