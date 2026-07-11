import Image from 'next/image'

export type Division = 'BRONZE' | 'SILVER' | 'GOLD'

// Lencana liga sebagai aset PNG (ilustrasi 3D-glossy) — lebih kaya dari SVG
// buatan tangan sebelumnya. Rasio tinggi tiap rank berbeda (Emas lebih tinggi
// karena ada mahkota), jadi tinggi kontainer diskalakan per-divisi agar tidak
// gepeng. `size` = lebar dasar dalam px.
const RANK: Record<Division, { src: string; ratio: number; label: string }> = {
  BRONZE: { src: '/assets/rank-bronze.png', ratio: 873 / 749, label: 'Perunggu' },
  SILVER: { src: '/assets/rank-silver.png', ratio: 869 / 742, label: 'Perak' },
  GOLD: { src: '/assets/rank-gold.png', ratio: 996 / 746, label: 'Emas' },
}

export default function LeagueBadge({
  division,
  size = 48,
  className,
  priority = false,
}: {
  division: Division
  size?: number
  className?: string
  /** Set true saat badge ini kemungkinan jadi LCP (mis. hero leaderboard). */
  priority?: boolean
}) {
  const r = RANK[division]
  const height = Math.round(size * r.ratio)
  return (
    <span
      className={`relative inline-block shrink-0 select-none ${className ?? ''}`}
      style={{ width: size, height }}
      aria-hidden="true"
    >
      <Image
        src={r.src}
        alt=""
        fill
        sizes={`${size}px`}
        priority={priority}
        className="object-contain drop-shadow-sm"
      />
    </span>
  )
}
