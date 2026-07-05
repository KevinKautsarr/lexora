import { Dumbbell } from 'lucide-react'
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
    <div className="flex flex-col items-center gap-2 py-8">
      <p className="flex items-center gap-2 text-sm text-zinc-400">
        <Dumbbell size={16} className="text-emerald-400" aria-hidden />
        Practice — review acak dari {completedLessons.length} lesson yang sudah kamu
        selesaikan (tidak menambah XP)
      </p>
      <MatchMadness pairs={pairs} />
    </div>
  )
}
