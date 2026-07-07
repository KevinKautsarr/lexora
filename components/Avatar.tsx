import Image from 'next/image'

// Sage/earth-friendly gradient combinations that match the theme.
const GRADIENTS = [
  ['from-green-600 to-emerald-800', 'border-green-500/30'],
  ['from-emerald-500 to-teal-700', 'border-emerald-400/30'],
  ['from-teal-600 to-cyan-800', 'border-teal-500/30'],
  ['from-lime-500 to-green-700', 'border-lime-400/30'],
  ['from-green-500 to-teal-800', 'border-green-400/30'],
] as const

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

export default function Avatar({
  name,
  size = 80,
  className,
}: {
  name: string
  size?: number
  className?: string
}) {
  const idx = hashString(name) % GRADIENTS.length
  const [gradientClasses, borderClass] = GRADIENTS[idx]

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradientClasses} border-2 ${borderClass} shadow-md flex items-center justify-center ${className || ''}`}
    >
      <div className="relative w-[85%] h-[85%]">
        <Image
          src="/images/01_favicon_avatar.png"
          alt={`Avatar ${name}`}
          fill
          sizes={`${size}px`}
          className="object-contain"
          priority
        />
      </div>
    </div>
  )
}

