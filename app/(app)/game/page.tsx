import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/session'
import MatchMadness, { type WordPair } from './MatchMadness'

// Mode latihan dengan data dummy — tanpa lessonId, skor tidak disimpan.
const DUMMY_PAIRS: WordPair[] = [
  { id: 'dummy-1', english: 'house', indonesian: 'rumah' },
  { id: 'dummy-2', english: 'water', indonesian: 'air' },
  { id: 'dummy-3', english: 'friend', indonesian: 'teman' },
  { id: 'dummy-4', english: 'morning', indonesian: 'pagi' },
  { id: 'dummy-5', english: 'book', indonesian: 'buku' },
]

export default async function GamePage() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) redirect('/login')

  return (
    <div className="flex justify-center py-8">
      <MatchMadness pairs={DUMMY_PAIRS} />
    </div>
  )
}
