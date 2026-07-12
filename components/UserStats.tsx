import { Star, Zap } from 'lucide-react'
import Image from 'next/image'
import { levelForXp } from '@/lib/level'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import BoosterCountdown from '@/components/BoosterCountdown'

// Kartu statistik ringkas untuk sidebar kanan Journey — server component,
// data langsung dari Prisma. Gems, XP, Level tampil sejajar sebagai kotak
// seragam. Streak dipindah ke StreakCard (dengan maskot) di posisi teratas sidebar.
export default async function UserStats() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) return null

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      xp: true,
      gems: true,
      boosterMultiplier: true,
      boosterExpiry: true,
    },
  })
  if (!user) return null

  const now = new Date()
  const boosterActive =
    user.boosterExpiry !== null &&
    user.boosterMultiplier > 1.0 &&
    new Date(user.boosterExpiry) > now

  const tiles = [
    {
      id: 'gems',
      label: 'Gems',
      value: user.gems.toLocaleString('id-ID'),
      icon: (
        <div className="relative h-[18px] w-[18px] shrink-0">
          <Image
            src="/icons-flat/128/gem-emerald.png"
            alt=""
            fill
            sizes="18px"
            className="object-contain"
          />
        </div>
      ),
      color: 'text-emerald-500',
      ariaLabel: `Gems: ${user.gems}`,
    },
    {
      id: 'xp',
      label: 'XP',
      value: user.xp.toLocaleString('id-ID'),
      icon: <Zap size={18} className="text-xp-500" aria-hidden />,
      color: 'text-xp-500',
      ariaLabel: `XP: ${user.xp}`,
    },
    {
      id: 'level',
      label: 'Level',
      value: levelForXp(user.xp),
      icon: <Star size={18} className="text-brand-500" aria-hidden />,
      color: 'text-brand-500',
      ariaLabel: `Level ${levelForXp(user.xp)}`,
    },
  ]

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        {tiles.map(({ id, label, value, icon, color, ariaLabel }) => (
          <div
            key={id}
            aria-label={ariaLabel}
            className="flex flex-col items-center gap-1 rounded-xl border border-zinc-700/60 bg-zinc-800/60 p-3"
          >
            {icon}
            <span className={`text-lg font-black tabular-nums ${color}`}>{value}</span>
            <span className="text-[10px] font-semibold text-zinc-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Indikator booster aktif — tetap terpisah agar tidak merusak bentuk kotak seragam di atas */}
      {boosterActive && user.boosterExpiry && (
        <BoosterCountdown
          expiryAt={user.boosterExpiry.toISOString()}
          multiplier={user.boosterMultiplier}
        />
      )}
    </div>
  )
}
