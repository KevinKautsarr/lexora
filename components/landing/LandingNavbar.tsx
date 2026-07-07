'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ArrowRight } from 'lucide-react'

interface LandingNavbarProps {
  isLoggedIn: boolean
}

export default function LandingNavbar({ isLoggedIn }: LandingNavbarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { name: 'Metodologi', href: '#metodologi' },
    { name: 'Fitur', href: '#fitur' },
    { name: 'FAQ', href: '#faq' },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-700/60 bg-zinc-900/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-brand-500 bg-zinc-950">
                <Image
                  src="/favicon-192.png"
                  alt="LEXORA"
                  fill
                  sizes="36px"
                  className="object-contain p-1"
                />
              </div>
              <span className="text-xl font-black tracking-wider text-zinc-100 uppercase">
                LEXORA
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-semibold text-zinc-300 transition-colors hover:text-brand-500"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/learn"
                className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-brand-500 active:scale-95 shadow-md shadow-brand-900/10"
              >
                Ke Dashboard
                <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-bold text-zinc-300 transition-colors hover:text-zinc-100"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-brand-500 active:scale-95 shadow-md shadow-brand-900/10"
                >
                  Mulai Belajar
                  <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-xl p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 focus:outline-none"
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t border-zinc-800 bg-zinc-900/95 md:hidden px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block rounded-xl px-3 py-2 text-base font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-brand-500"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-4 border-t border-zinc-800 flex flex-col gap-3">
            {isLoggedIn ? (
              <Link
                href="/learn"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-base font-bold text-white transition-all hover:bg-brand-500"
              >
                Ke Dashboard
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center rounded-xl border border-zinc-700 px-4 py-2.5 text-base font-bold text-zinc-300 hover:bg-zinc-800"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-base font-bold text-white transition-all hover:bg-brand-500"
                >
                  Mulai Belajar
                  <ArrowRight size={18} />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
