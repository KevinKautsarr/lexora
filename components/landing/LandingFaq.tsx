'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FaqItem {
  question: string
  answer: string
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Apakah Lexora sepenuhnya gratis?',
    answer: 'Ya! Lexora 100% gratis untuk digunakan. Kamu dapat mengakses semua tingkat pelajaran, kategori kosakata, papan peringkat, dan fitur latihan tanpa biaya tersembunyi apa pun.',
  },
  {
    question: 'Bagaimana cara kerja sistem streak?',
    answer: 'Sistem streak menghitung hari berturut-turut kamu menyelesaikan setidaknya satu pelajaran. Jika kamu melewatkan satu hari saja tanpa belajar, streak-mu akan kembali ke nol. Pertahankan streak untuk membangun kebiasaan belajar harian yang sehat!',
  },
  {
    question: 'Apa itu mode Match Madness?',
    answer: 'Match Madness adalah latihan kilat mencocokkan kata Bahasa Inggris dengan terjemahan Bahasa Indonesianya dalam batas waktu tertentu. Mode ini melatih kecepatan pengenalan kosakata di bawah tekanan waktu, sangat efektif untuk melatih memori cepat.',
  },
  {
    question: 'Apakah ada sistem pencapaian di Lexora?',
    answer: 'Ada! Lexora punya 38 badge pencapaian di 7 kategori (Streak, Lesson, XP, Gems, Liga, Level CEFR, dan lainnya) yang terekam otomatis dari aktivitas belajarmu. Cek progresnya kapan saja di halaman profil.',
  },
  {
    question: 'Apakah saya bisa belajar di handphone?',
    answer: 'Sangat bisa! Website Lexora dirancang sepenuhnya responsif (mobile-first), sehingga kamu akan mendapatkan pengalaman belajar yang sama nyamannya di HP, tablet, maupun laptop saat bepergian.',
  },
]

export default function LandingFaq() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const toggleIndex = (index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index))
  }

  return (
    <div className="mx-auto max-w-3xl space-y-3.5">
      {FAQ_ITEMS.map((item, index) => {
        const isOpen = activeIndex === index

        return (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-zinc-700/60 bg-zinc-800/60 transition-all duration-300 hover:border-zinc-500"
          >
            <button
              onClick={() => toggleIndex(index)}
              className="flex w-full items-center justify-between px-6 py-4.5 text-left font-bold text-zinc-100 transition-colors duration-200 cursor-pointer"
              aria-expanded={isOpen}
            >
              <span className="text-sm md:text-base">{item.question}</span>
              <ChevronDown
                size={18}
                className={`text-zinc-400 transition-transform duration-300 ${
                  isOpen ? 'rotate-180 text-brand-500' : ''
                }`}
              />
            </button>
            <div
              className={`transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-48 border-t border-zinc-750 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <p className="px-6 py-4 text-xs md:text-sm leading-relaxed text-zinc-300">
                {item.answer}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
