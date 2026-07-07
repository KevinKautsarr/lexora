'use client'

import { useState, startTransition } from 'react'
import { X, Trophy, ArrowUp, ArrowDown, Zap } from 'lucide-react'
import Mascot from '../Mascot'
import { clearPreviousDivision } from '@/app/(app)/learn/actions'

interface ResetNotificationProps {
  previousDivision: string
  currentDivision: string
}

export default function ResetNotification({
  previousDivision,
  currentDivision,
}: ResetNotificationProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isClosing, setIsClosing] = useState(false)

  if (!isOpen) return null

  // Map division names to Indonesian
  const getDivisionName = (div: string) => {
    switch (div) {
      case 'BRONZE':
        return 'Perunggu'
      case 'SILVER':
        return 'Perak'
      case 'GOLD':
        return 'Emas'
      default:
        return div
    }
  }

  // Determine the notification type
  let type: 'promoted' | 'demoted' | 'stayed' | 'champion' = 'stayed'
  if (previousDivision === 'BRONZE' && currentDivision === 'SILVER') type = 'promoted'
  else if (previousDivision === 'SILVER' && currentDivision === 'GOLD') type = 'promoted'
  else if (previousDivision === 'GOLD' && currentDivision === 'SILVER') type = 'demoted'
  else if (previousDivision === 'SILVER' && currentDivision === 'BRONZE') type = 'demoted'
  else if (previousDivision === 'GOLD' && currentDivision === 'GOLD') type = 'champion'
  else if (previousDivision === currentDivision) type = 'stayed'

  const handleClose = () => {
    setIsClosing(true)
    startTransition(async () => {
      await clearPreviousDivision()
      setIsOpen(false)
    })
  }

  // Visual assets configuration based on type
  const config = {
    promoted: {
      title: 'Selamat! Kamu Naik Kelas! 🚀',
      desc: `Hebat banget! Berkat konsistensi belajarmu minggu lalu, kamu naik ke Divisi ${getDivisionName(currentDivision)}. Terus pertahankan prestasimu!`,
      mascot: 'graduation' as const,
      gradient: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: <ArrowUp className="text-emerald-400" size={16} />,
      buttonColor: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/20',
    },
    demoted: {
      title: 'Yah, Kamu Turun Divisi 😢',
      desc: `Minggu lalu kamu kurang aktif sehingga turun ke Divisi ${getDivisionName(currentDivision)}. Jangan berkecil hati, ayo lebih giat belajar minggu ini untuk naik kembali!`,
      mascot: 'confused' as const,
      gradient: 'from-rose-500/20 to-zinc-900/10 border-rose-500/30',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      icon: <ArrowDown className="text-rose-400" size={16} />,
      buttonColor: 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/20',
    },
    champion: {
      title: 'Juara Divisi Emas! 🏆',
      desc: 'Luar biasa! Kamu berhasil menjuarai dan mempertahankan posisi puncak di Divisi Emas. Kamu adalah pembelajar legendaris Lexora!',
      mascot: 'trophy' as const,
      gradient: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/30 shadow-yellow-500/5',
      badgeColor: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      icon: <Trophy className="text-yellow-400 animate-bounce" size={16} />,
      buttonColor: 'bg-yellow-600 hover:bg-yellow-500 shadow-yellow-950/20',
    },
    stayed: {
      title: 'Kamu Bertahan di Divisi! ⚡',
      desc: `Kerja bagus! Kamu berhasil mempertahankan posisi di Divisi ${getDivisionName(currentDivision)}. Ayo tingkatkan belajarmu agar bisa naik ke tingkat berikutnya!`,
      mascot: 'wave' as const,
      gradient: 'from-brand-500/20 to-zinc-900/10 border-brand-500/30',
      badgeColor: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
      icon: <Zap className="text-brand-400" size={16} />,
      buttonColor: 'bg-brand-600 hover:bg-brand-500 shadow-brand-950/20',
    },
  }[type]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md transition-opacity duration-300">
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-3xl border bg-zinc-900/90 p-6 shadow-2xl transition-all duration-300 transform scale-100 ${
          isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        } bg-gradient-to-b ${config.gradient}`}
      >
        <button
          onClick={handleClose}
          disabled={isClosing}
          className="absolute right-4 top-4 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center mt-4">
          <div className="relative mb-6 select-none animate-bounce-slow">
            <div className="absolute -inset-2 rounded-full bg-zinc-800/50 blur-xl opacity-60"></div>
            <Mascot pose={config.mascot} size={110} className="relative z-10" />
          </div>

          <div className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[10px] font-black uppercase tracking-wider border mb-4 ${config.badgeColor}`}>
            {config.icon}
            <span>Divisi {getDivisionName(currentDivision)}</span>
          </div>

          <h2 className="text-xl md:text-2xl font-black text-zinc-100 tracking-tight leading-tight">
            {config.title}
          </h2>

          <p className="mt-3 text-xs md:text-sm text-zinc-300 leading-relaxed max-w-xs">
            {config.desc}
          </p>

          <button
            onClick={handleClose}
            disabled={isClosing}
            className={`mt-6 w-full rounded-2xl py-3.5 text-sm font-black text-white transition-all transform hover:scale-[1.02] active:scale-98 cursor-pointer ${config.buttonColor} shadow-lg disabled:opacity-50`}
          >
            {isClosing ? 'Memproses...' : 'Lanjutkan Belajar'}
          </button>
        </div>
      </div>
    </div>
  )
}
