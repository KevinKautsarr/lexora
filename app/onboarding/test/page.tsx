import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import PlacementTest from './PlacementTest'

export default async function PlacementTestPage({
  searchParams,
}: {
  searchParams: Promise<{ target?: string }>
}) {
  const sessionUser = await getSessionUser()
  if (!sessionUser) redirect('/login')

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: sessionUser.id },
    select: { onboarded: true },
  })
  if (user.onboarded) redirect('/learn')

  const { target } = await searchParams
  const order = Number(target)
  const [level, lowest] = Number.isInteger(order)
    ? await Promise.all([
        prisma.level.findUnique({ where: { order } }),
        prisma.level.findFirstOrThrow({ orderBy: { order: 'asc' }, select: { order: true } }),
      ])
    : [null, null]
  // Level terendah tidak butuh tes — kembali ke pemilihan tingkat.
  if (!level || !lowest || level.order <= lowest.order) redirect('/onboarding')

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <PlacementTest
        targetLevelOrder={level.order}
        levelLabel={`${level.name} (${level.code})`}
      />
    </main>
  )
}
