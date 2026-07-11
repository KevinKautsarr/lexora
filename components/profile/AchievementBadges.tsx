import Image from 'next/image'
import type { LucideIcon } from 'lucide-react'
import type { AchievementCategory } from '@/lib/achievements'

export type Achievement = {
  id: string
  label: string
  description: string
  icon: LucideIcon
  /** Path medal PNG (mis. '/assets/medal-flame.png'). Kalau ada, dipakai
   *  menggantikan ikon Lucide. */
  medal?: string
  /** Sudah diraih? */
  earned: boolean
  /** Progres menuju milestone (0..1) — untuk yang belum diraih. */
  progress: number
  /** Warna aksen Tailwind (mis. 'orange', 'brand', 'xp'). */
  accent: 'orange' | 'brand' | 'emerald' | 'purple' | 'xp' | 'sky'
}

// Peta kelas warna per aksen — dipisah agar Tailwind bisa mendeteksi kelas
// statis (tak boleh interpolasi dinamis di class string).
const ACCENT: Record<
  Achievement['accent'],
  { ring: string; iconBg: string; icon: string; bar: string }
> = {
  orange: { ring: 'border-orange-500/40', iconBg: 'bg-orange-500/15', icon: 'text-orange-500', bar: 'bg-orange-500' },
  brand: { ring: 'border-brand-500/40', iconBg: 'bg-brand-500/15', icon: 'text-brand-500', bar: 'bg-brand-500' },
  emerald: { ring: 'border-emerald-500/40', iconBg: 'bg-emerald-500/15', icon: 'text-emerald-500', bar: 'bg-emerald-500' },
  purple: { ring: 'border-purple-500/40', iconBg: 'bg-purple-500/15', icon: 'text-purple-500', bar: 'bg-purple-500' },
  xp: { ring: 'border-xp-500/40', iconBg: 'bg-xp-500/15', icon: 'text-xp-600', bar: 'bg-xp-500' },
  sky: { ring: 'border-sky-500/40', iconBg: 'bg-sky-500/15', icon: 'text-sky-500', bar: 'bg-sky-500' },
}

function Badge({ a }: { a: Achievement }) {
  const c = ACCENT[a.accent]
  const Icon = a.icon
  const pct = Math.round(Math.min(1, a.progress) * 100)
  return (
    <li
      className={`relative flex flex-col gap-2 overflow-hidden rounded-2xl border p-4 transition-colors ${
        a.earned ? `${c.ring} bg-zinc-800/50` : 'border-zinc-700/50 bg-zinc-800/25'
      }`}
    >
      <div className="flex items-center gap-3">
        {a.medal ? (
          // Medal PNG — penuh saat diraih; grayscale & redup saat terkunci.
          <div className="relative h-12 w-12 shrink-0 select-none">
            <Image
              src={a.medal}
              alt=""
              fill
              sizes="48px"
              className={`object-contain transition ${
                a.earned ? 'drop-shadow-sm' : 'opacity-40 grayscale'
              }`}
            />
          </div>
        ) : (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
              a.earned ? `${c.iconBg} ${c.ring}` : 'border-zinc-700/60 bg-zinc-800/40'
            }`}
          >
            <Icon
              size={22}
              aria-hidden
              className={a.earned ? c.icon : 'text-zinc-600'}
              strokeWidth={a.earned ? 2.4 : 2}
            />
          </div>
        )}
        <div className="min-w-0">
          <p className={`text-sm font-black leading-tight ${a.earned ? 'text-zinc-100' : 'text-zinc-400'}`}>
            {a.label}
          </p>
          <p className="mt-0.5 text-[11px] leading-tight text-zinc-500">{a.description}</p>
        </div>
      </div>

      {a.earned ? (
        <span className={`self-start rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${c.iconBg} ${c.icon}`}>
          Selesai
        </span>
      ) : (
        <div className="mt-0.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-700/60">
            <div className={`h-full rounded-full ${c.bar} opacity-70`} style={{ width: `${pct}%` }} />
          </div>
          <span className="mt-1 block text-[10px] font-bold tabular-nums text-zinc-500">{pct}%</span>
        </div>
      )}
    </li>
  )
}

export default function AchievementBadges({ categories }: { categories: AchievementCategory[] }) {
  const all = categories.flatMap((c) => c.items)
  const earnedCount = all.filter((a) => a.earned).length

  return (
    <section aria-label="Pencapaian belajar" className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg font-extrabold tracking-tight text-zinc-100">
          Pencapaian
        </h2>
        <span className="text-xs font-bold tabular-nums text-zinc-500">
          {earnedCount}/{all.length} diraih
        </span>
      </div>

      {categories.map((cat) => {
        const catEarned = cat.items.filter((a) => a.earned).length
        return (
          <div key={cat.id}>
            <div className="mb-3 flex items-baseline gap-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">
                {cat.title}
              </h3>
              <span className="text-[10px] font-bold tabular-nums text-zinc-600">
                {catEarned}/{cat.items.length}
              </span>
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {cat.items.map((a) => (
                <Badge key={a.id} a={a} />
              ))}
            </ul>
          </div>
        )
      })}
    </section>
  )
}
