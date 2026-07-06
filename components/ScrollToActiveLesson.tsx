'use client'

import { useEffect } from 'react'

// Scroll ke lesson yang sedang dikerjakan (#active-lesson) sekali saat halaman
// Journey dibuka, supaya user langsung melihat "posisiku di sini" tanpa harus
// scroll melewati level-level sebelumnya. Tidak me-render apa pun.
export default function ScrollToActiveLesson() {
  useEffect(() => {
    const target = document.getElementById('active-lesson')
    if (!target) return

    // Hormati preferensi hemat gerak: langsung lompat tanpa animasi.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'center',
    })
  }, [])

  return null
}
