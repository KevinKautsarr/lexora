import { SkeletonBox, SkeletonLine } from '@/components/Skeleton'

// Skeleton instan saat navigasi ke Pengaturan: header + deretan kartu seksi.
export default function SettingsLoading() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <SkeletonBox className="h-9 w-9 rounded-xl" />
        <div className="flex flex-col gap-1.5">
          <SkeletonLine className="h-7 w-40" />
          <SkeletonLine className="h-3 w-48" />
        </div>
      </div>

      {/* Kartu seksi (tema, nama, password, pengingat, sesi) */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-4 rounded-3xl border border-zinc-700/60 bg-zinc-800/40 p-6"
        >
          <SkeletonLine className="h-4 w-36" />
          <SkeletonBox className="h-11 w-full rounded-2xl" />
          {i === 4 && <SkeletonBox className="h-11 w-full rounded-2xl" />}
        </div>
      ))}
    </div>
  )
}
