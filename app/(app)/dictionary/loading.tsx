import { SkeletonBox, SkeletonLine } from '@/components/Skeleton'

// Skeleton instan saat navigasi ke Kamus: hero Lexi + tab level + kotak cari
// + daftar baris kata (speaker + dua baris teks).
export default function DictionaryLoading() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      {/* Hero */}
      <div className="flex items-center gap-4 rounded-3xl border border-zinc-700/60 bg-zinc-800/40 px-5 py-4">
        <SkeletonBox className="h-20 w-20 shrink-0 rounded-2xl" />
        <div className="flex flex-1 flex-col gap-2">
          <SkeletonLine className="h-7 w-28" />
          <SkeletonLine className="h-3 w-full max-w-xs" />
        </div>
      </div>

      {/* Tab level */}
      <div className="flex gap-1.5 rounded-2xl border border-zinc-800 bg-zinc-900 p-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBox key={i} className="h-11 w-16 rounded-xl" />
        ))}
      </div>

      {/* Kotak cari */}
      <SkeletonBox className="h-12 w-full rounded-2xl" />

      {/* Baris kata */}
      <div className="flex flex-col gap-1.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl border border-zinc-700/50 bg-zinc-800/40 px-3 py-2"
          >
            <SkeletonBox className="h-11 w-11 shrink-0 rounded-xl" />
            <div className="flex flex-1 flex-col gap-1.5">
              <SkeletonLine className="h-4 w-32" />
              <SkeletonLine className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
