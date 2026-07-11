'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface BoosterCountdownProps {
  expiryAt: string
  multiplier: number
}

export default function BoosterCountdown({ expiryAt, multiplier }: BoosterCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [active, setActive] = useState<boolean>(true)

  useEffect(() => {
    const expiryTime = new Date(expiryAt).getTime()

    const updateTimer = () => {
      const now = new Date().getTime()
      const diff = expiryTime - now

      if (diff <= 0) {
        setActive(false)
        return
      }

      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)

      if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`)
      } else {
        setTimeLeft(`${seconds}s`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [expiryAt])

  if (!active) return null

  return (
    <div className="flex items-center justify-center gap-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 transition-all duration-300">
      <div className="relative h-5 w-5 shrink-0">
        <Image
          src="/icons-flat/128/booster-potion-2x.png"
          alt="EXP Booster aktif"
          fill
          sizes="20px"
          className="object-contain"
        />
      </div>
      <span className="text-[10px] font-black text-purple-300 tabular-nums">
        {multiplier}x · {timeLeft} tersisa
      </span>
    </div>
  )
}
