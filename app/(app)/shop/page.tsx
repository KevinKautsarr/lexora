import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Snowflake, ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import BoosterCountdown from '@/components/BoosterCountdown'
import { buyStreakFreeze, buyXpBooster } from './actions'
import {
  FREEZE_PRICE,
  MAX_FREEZES,
  BOOSTER_PRICE,
  BOOSTER_MULTIPLIER,
  BOOSTER_DURATION_MINUTES,
} from './config'
import BuyButton from './BuyButton'

export default async function ShopPage() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) redirect('/login')

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: sessionUser.id },
    select: { gems: true, streakFreezes: true, boosterMultiplier: true, boosterExpiry: true },
  })

  const boosterActive =
    user.boosterExpiry !== null && new Date(user.boosterExpiry) > new Date()
  const freezeFull = user.streakFreezes >= MAX_FREEZES

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      {/* Float pelan untuk gem art — dimatikan saat reduced-motion. */}
      <style>{`
        @keyframes shop-gem-float {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          50% { transform: translateY(-7px) rotate(3deg); }
        }
        .shop-gem-float { animation: shop-gem-float 3.5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .shop-gem-float { animation: none; }
        }
      `}</style>

      {/* ── Hero: dompet gems ───────────────────────────────────── */}
      <section
        aria-label="Saldo gems"
        className="relative overflow-hidden rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-brand-100 to-brand-50 px-5 py-5"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(circle at 85% 30%, color-mix(in srgb, #10b981 22%, transparent), transparent 60%)',
          }}
          aria-hidden
        />
        <div className="relative flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-zinc-100">
              Toko
            </h1>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Saldo kamu
            </p>
            <p className="text-4xl font-black leading-tight tabular-nums text-emerald-500">
              {user.gems.toLocaleString('id-ID')}
              <span className="ml-1.5 text-sm font-black text-emerald-600/70">gems</span>
            </p>
            {/* Sumber gems = ajakan bertindak, bukan catatan kaki */}
            <Link
              href="/goals"
              className="mt-2 inline-flex items-center gap-1 rounded-lg text-xs font-bold text-brand-600 transition-colors hover:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
            >
              Dapat hingga 80 gems/hari dari Goals
              <ArrowRight size={12} aria-hidden />
            </Link>
          </div>
          <div className="shop-gem-float relative h-20 w-20 shrink-0 select-none drop-shadow-[0_10px_24px_rgba(16,185,129,0.35)]">
            <Image
              src="/icons-flat/256/gem-emerald.png"
              alt=""
              fill
              sizes="80px"
              className="object-contain"
              priority
            />
          </div>
        </div>
      </section>

      {/* ── Dua produk sejajar ──────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Streak Freeze — premium & langka */}
        <section
          aria-labelledby="freeze-heading"
          className="flex flex-col rounded-3xl border border-zinc-700/60 bg-zinc-800/40 p-5"
        >
          <div className="relative mb-4 flex h-28 items-center justify-center rounded-2xl border border-sky-500/20 bg-gradient-to-b from-sky-500/15 to-sky-500/5">
            <Snowflake size={52} className="text-sky-400 drop-shadow-[0_6px_16px_rgba(56,189,248,0.4)]" aria-hidden />
            <span className="absolute left-2.5 top-2.5 rounded-full border border-sky-500/30 bg-sky-500/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-sky-400">
              Langka
            </span>
            <span className="absolute right-2.5 top-2.5 rounded-full border border-zinc-600/60 bg-zinc-900/70 px-2 py-0.5 text-[10px] font-black tabular-nums text-zinc-300">
              {user.streakFreezes}/{MAX_FREEZES}
            </span>
          </div>

          <h2 id="freeze-heading" className="text-base font-black text-zinc-100">
            Streak Freeze
          </h2>
          <p className="mt-1 flex-1 text-xs leading-relaxed text-zinc-400">
            Menambal satu hari bolong otomatis — streak tetap lanjut walau sehari
            absen. Kesempatan drop gratis hanya 10% saat semua goal harian selesai.
          </p>

          <div className="mt-4">
            <BuyButton
              action={buyStreakFreeze}
              price={FREEZE_PRICE}
              disabled={freezeFull}
              disabledLabel={`Penuh (${MAX_FREEZES}/${MAX_FREEZES})`}
            />
          </div>
        </section>

        {/* XP Booster — pembelian rutin */}
        <section
          aria-labelledby="booster-heading"
          className="flex flex-col rounded-3xl border border-zinc-700/60 bg-zinc-800/40 p-5"
        >
          <div className="relative mb-4 flex h-28 items-center justify-center rounded-2xl border border-purple-500/20 bg-gradient-to-b from-purple-500/15 to-purple-500/5">
            <div className="relative h-16 w-16 select-none drop-shadow-[0_6px_16px_rgba(139,92,246,0.4)]">
              <Image
                src="/icons-flat/128/booster-potion-2x.png"
                alt=""
                fill
                sizes="64px"
                className="object-contain"
              />
            </div>
            <span className="absolute left-2.5 top-2.5 rounded-full border border-purple-500/30 bg-purple-500/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-purple-400">
              {BOOSTER_DURATION_MINUTES} menit
            </span>
          </div>

          <h2 id="booster-heading" className="text-base font-black text-zinc-100">
            XP Booster {BOOSTER_MULTIPLIER}×
          </h2>
          <p className="mt-1 flex-1 text-xs leading-relaxed text-zinc-400">
            Gandakan semua XP selama {BOOSTER_DURATION_MINUTES} menit. Paling untung
            dipakai tepat sebelum sesi belajar panjang.
          </p>

          {boosterActive && user.boosterExpiry && (
            <div className="mt-3">
              <BoosterCountdown
                expiryAt={new Date(user.boosterExpiry).toISOString()}
                multiplier={user.boosterMultiplier}
              />
            </div>
          )}

          <div className="mt-4">
            <BuyButton
              action={buyXpBooster}
              price={BOOSTER_PRICE}
              disabled={boosterActive}
              disabledLabel="Booster sedang aktif"
            />
          </div>
        </section>
      </div>
    </div>
  )
}
