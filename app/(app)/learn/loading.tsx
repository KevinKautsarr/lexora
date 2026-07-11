import { SkeletonBox, SkeletonLine } from '@/components/Skeleton'

// Skeleton instan saat navigasi ke Journey (learn). Kerangka dua kolom muncul
// segera; JourneyPath + kartu sidebar di-stream setelahnya. Sidebar hanya
// tampil di lg+ (sama seperti layout asli) → responsif.
export default function LearnLoading() {
  return (
    <div className="flex items-start gap-6 lg:gap-8">
      {/* Main: journey path */}
      <div className="flex min-w-0 flex-1 flex-col gap-10">
        <div className="flex flex-col gap-2">
          <SkeletonLine className="h-8 w-48" />
          <SkeletonLine className="h-4 w-72 max-w-full" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-4">
            <SkeletonBox className="h-14 w-full rounded-2xl" />
            <SkeletonBox className="h-16 w-16 rounded-full" />
            <SkeletonBox className="h-16 w-16 rounded-full" />
          </div>
        ))}
      </div>

      {/* Sidebar kanan — hanya desktop */}
      <aside className="hidden w-72 flex-shrink-0 flex-col gap-4 lg:flex">
        <SkeletonBox className="h-40 rounded-xl" />
        <SkeletonBox className="h-28 rounded-xl" />
        <SkeletonBox className="h-32 rounded-xl" />
        <SkeletonBox className="h-40 rounded-xl" />
      </aside>
    </div>
  )
}
