// Peti hadiah untuk Daily Goals — abu & terkunci sebelum goal tercapai,
// emas & terbuka saat tercapai. Menggantikan ikon Gift lucide agar lebih kaya.

export default function RewardChest({
  unlocked,
  size = 28,
}: {
  unlocked: boolean
  size?: number
}) {
  // Warna: terkunci = netral sand; terbuka = emas (token xp).
  const body = unlocked ? '#e0b04a' : '#b6c3a6'
  const bodyDark = unlocked ? '#b07f28' : '#8a9482'
  const band = unlocked ? '#8c6420' : '#6b7a5e'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label={unlocked ? 'Hadiah terbuka' : 'Hadiah terkunci'}
    >
      {unlocked && (
        // Cahaya saat terbuka
        <circle cx="16" cy="15" r="14" fill="#e0b04a" opacity="0.2" />
      )}
      {/* Tutup */}
      <path
        d="M5 13c0-4 5-7 11-7s11 3 11 7v2H5v-2Z"
        fill={body}
        transform={unlocked ? 'rotate(-14 16 15)' : undefined}
      />
      {/* Badan */}
      <rect x="5" y="15" width="22" height="11" rx="2" fill={bodyDark} />
      {/* Pita tengah */}
      <rect x="14" y="15" width="4" height="11" fill={band} />
      {/* Kunci / gembok */}
      <circle cx="16" cy="20" r="2.4" fill={band} />
      {unlocked && (
        // Percik bintang
        <>
          <path d="M25 8l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z" fill="#f6ecc7" />
          <path d="M7 6l0.7 1.4L9 8l-1.3 0.6L7 10l-0.7-1.4L5 8l1.3-0.6L7 6Z" fill="#f6ecc7" />
        </>
      )}
    </svg>
  )
}
