import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import Mascot from '@/components/Mascot'
import DictionaryClient, {
  type DictionaryUnit,
} from '@/components/dictionary/DictionaryClient'

// Kamus kosakata per tingkat CEFR — alat referensi, terpisah dari alur
// Journey. Hero: Lexi membaca + deskripsi tingkat; tab level dengan jumlah
// kata; pencarian sticky + tombol pengucapan (TTS) di client.

export const metadata = { title: 'Kamus' }

export default async function DictionaryPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>
}) {
  const sessionUser = await getSessionUser()
  if (!sessionUser) redirect('/login')

  const [levels, me] = await Promise.all([
    prisma.level.findMany({
      orderBy: { order: 'asc' },
      select: { id: true, code: true, name: true, order: true, description: true },
    }),
    prisma.user.findUniqueOrThrow({
      where: { id: sessionUser.id },
      select: { startLevelOrder: true },
    }),
  ])
  if (levels.length === 0) redirect('/learn')

  const sp = await searchParams
  // Default: level awal user (tempat dia belajar sekarang), bukan selalu A1.
  const selected =
    levels.find((l) => l.code.toLowerCase() === sp.level?.toLowerCase()) ??
    levels.find((l) => l.order === me.startLevelOrder) ??
    levels[0]

  // Jumlah kata per level — dipakai tab sebagai information scent
  // ("B1 punya 240 kata") sebelum user pindah tab.
  const [units, ...wordCounts] = await Promise.all([
    prisma.unit.findMany({
      where: { levelId: selected.id },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        lessons: {
          orderBy: { order: 'asc' },
          select: {
            words: {
              orderBy: { term: 'asc' },
              select: { id: true, term: true, translation: true },
            },
          },
        },
      },
    }),
    ...levels.map((l) =>
      prisma.word.count({ where: { lesson: { unit: { levelId: l.id } } } }),
    ),
  ])

  // Ratakan lesson → satu daftar kata per unit, urut alfabet.
  const dictUnits: DictionaryUnit[] = units.map((u) => ({
    id: u.id,
    title: u.title,
    words: u.lessons
      .flatMap((l) => l.words)
      .sort((a, b) => a.term.localeCompare(b.term)),
  }))

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      {/* ── Hero: Lexi membaca + identitas tingkat terpilih ─────── */}
      <header className="relative flex items-center gap-4 overflow-hidden rounded-3xl border border-zinc-700/60 bg-gradient-to-br from-brand-100 to-brand-50 px-5 py-4">
        {/* Glow lembut di belakang Lexi */}
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              'radial-gradient(circle at 12% 60%, color-mix(in srgb, var(--color-brand-400) 30%, transparent), transparent 55%)',
          }}
          aria-hidden
        />
        <Mascot pose="reading" size={84} className="relative shrink-0 select-none" />
        <div className="relative min-w-0 flex-1">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-zinc-100">
            Kamus
          </h1>
          <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">
            Semua kosakata tingkat{' '}
            <span className="font-black text-brand-600">
              {selected.code} · {selected.name}
            </span>
            . Ketuk speaker untuk dengar pengucapannya.
          </p>
        </div>
      </header>

      {/* ── Tab level + jumlah kata ─────────────────────────────── */}
      <nav
        aria-label="Pilih tingkat"
        className="flex gap-1.5 overflow-x-auto rounded-2xl bg-zinc-900 p-1.5 border border-zinc-800"
      >
        {levels.map((level, i) => {
          const isActive = level.id === selected.id
          return (
            <Link
              key={level.id}
              href={`/dictionary?level=${level.code.toLowerCase()}`}
              aria-current={isActive ? 'page' : undefined}
              className={`flex shrink-0 flex-col items-center rounded-xl border px-4 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 ${
                isActive
                  ? 'border-brand-600/60 bg-brand-500 shadow-sm'
                  : 'border-transparent hover:bg-zinc-800/40'
              }`}
            >
              {/* Solid brand + putih: kontras terjamin di light MAUPUN dark
                  (brand-100/brand-800 sama-sama gelap di dark mode). */}
              <span
                className={`text-xs font-black tracking-tight ${
                  isActive ? 'text-white' : 'text-zinc-300'
                }`}
              >
                {level.code}
              </span>
              <span
                className={`text-[9px] font-bold tabular-nums ${
                  isActive ? 'text-white/85' : 'text-zinc-500'
                }`}
              >
                {wordCounts[i].toLocaleString('id-ID')} kata
              </span>
            </Link>
          )
        })}
      </nav>

      <DictionaryClient units={dictUnits} />
    </div>
  )
}
