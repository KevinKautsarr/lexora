// Primitif skeleton reusable — satu bahasa visual untuk semua loading.tsx.
// Warna & radius mengikuti token tema (zinc di-remap ke sage light mode).
// Tidak ada tinggi fixed di sini; caller mengatur bentuk agar meniru konten
// asli & mencegah layout shift (CLS) saat data ter-stream masuk.

import type { ReactNode } from 'react'

/** Blok abu berdenyut. `className` menentukan ukuran/bentuk. */
export function SkeletonBox({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-zinc-800/60 ${className}`} aria-hidden />
}

/** Baris teks skeleton (default lebar penuh, tinggi setara 1 baris). */
export function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-zinc-800/50 ${className}`} aria-hidden />
}

/** Kartu ber-border yang membungkus skeleton anak — meniru kartu asli. */
export function SkeletonCard({
  className = '',
  children,
}: {
  className?: string
  children?: ReactNode
}) {
  return (
    <div
      className={`rounded-3xl border border-zinc-700 bg-zinc-800/50 ${className}`}
      aria-hidden
    >
      {children}
    </div>
  )
}
