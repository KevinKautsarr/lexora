import { SkeletonBox, SkeletonLine } from '@/components/Skeleton'

// Skeleton instan saat navigasi ke Toko: hero dompet + dua kartu produk.
export default function ShopLoading() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      {/* Hero dompet */}
      <div className="flex items-center gap-4 rounded-3xl border border-zinc-700/60 bg-zinc-800/40 px-5 py-5">
        <div className="flex flex-1 flex-col gap-2">
          <SkeletonLine className="h-8 w-24" />
          <SkeletonLine className="h-3 w-20" />
          <SkeletonLine className="h-9 w-36" />
          <SkeletonLine className="h-3 w-48" />
        </div>
        <SkeletonBox className="h-20 w-20 shrink-0 rounded-2xl" />
      </div>

      {/* Dua kartu produk */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-3xl border border-zinc-700/60 bg-zinc-800/40 p-5"
          >
            <SkeletonBox className="h-28 w-full rounded-2xl" />
            <SkeletonLine className="h-5 w-32" />
            <SkeletonLine className="h-3 w-full" />
            <SkeletonLine className="h-3 w-3/4" />
            <SkeletonBox className="h-11 w-full rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  )
}
