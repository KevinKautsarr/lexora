'use client'

import { useState, useTransition } from 'react'
import { Monitor, Smartphone, LogOut } from 'lucide-react'
import { revokeOtherSessions, type ActiveSession } from './actions'

// Ubah user-agent mentah jadi label ramah — pengguna mengenali "Chrome di
// Windows", bukan string UA panjang.
function describeDevice(ua: string | null): { label: string; mobile: boolean } {
  if (!ua) return { label: 'Perangkat tidak dikenal', mobile: false }
  const mobile = /Mobile|Android|iPhone|iPad/i.test(ua)
  // CriOS/FxiOS = Chrome/Firefox versi iOS (UA-nya tidak memuat "Chrome/").
  const browser =
    /Edg\//.test(ua) ? 'Edge'
    : /CriOS\//.test(ua) ? 'Chrome'
    : /FxiOS\//.test(ua) ? 'Firefox'
    : /Chrome\//.test(ua) ? 'Chrome'
    : /Firefox\//.test(ua) ? 'Firefox'
    : /Safari\//.test(ua) ? 'Safari'
    : 'Browser'
  // iPhone/iPad DULUAN sebelum Mac OS — UA iPhone memuat "like Mac OS X",
  // jadi cek /Mac OS/ lebih dulu salah-label iPhone sebagai macOS.
  const os =
    /iPhone|iPad|iPod/.test(ua) ? 'iOS'
    : /Android/.test(ua) ? 'Android'
    : /Windows/.test(ua) ? 'Windows'
    : /Mac OS|Macintosh/.test(ua) ? 'macOS'
    : /Linux/.test(ua) ? 'Linux'
    : 'perangkat'
  return { label: `${browser} di ${os}`, mobile }
}

function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(iso),
  )
}

// IP hanya ditampilkan bila informatif. Alamat lokal/kosong (::, ::1,
// 0000:…:0000, 127.x) muncul dari sesi dev/proxy dan cuma membingungkan.
function displayIp(ip: string | null): string | null {
  if (!ip) return null
  if (/^(::1?$|0{1,4}(:0{1,4}){7}$|127\.)/.test(ip)) return null
  return ip
}

export default function SessionsList({ sessions }: { sessions: ActiveSession[] }) {
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null)
  const [pending, startTransition] = useTransition()

  const otherCount = sessions.filter((s) => !s.isCurrent).length

  function handleRevoke() {
    setFeedback(null)
    startTransition(async () => {
      const res = await revokeOtherSessions()
      setFeedback(res)
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2" aria-label="Daftar sesi aktif">
        {sessions.map((s) => {
          const { label, mobile } = describeDevice(s.userAgent)
          const Icon = mobile ? Smartphone : Monitor
          return (
            <li
              key={s.id}
              className="flex items-center gap-3 rounded-2xl border border-zinc-700/60 bg-zinc-900/40 px-4 py-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
                <Icon size={18} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-bold text-zinc-100">
                  <span className="truncate">{label}</span>
                  {s.isCurrent && (
                    <span className="shrink-0 rounded-full bg-brand-500/15 border border-brand-500/30 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-brand-600">
                      Perangkat ini
                    </span>
                  )}
                </p>
                <p className="truncate text-[11px] text-zinc-500">
                  {displayIp(s.ipAddress) ? `${displayIp(s.ipAddress)} · ` : ''}Masuk{' '}
                  {formatWhen(s.createdAt)}
                </p>
              </div>
            </li>
          )
        })}
      </ul>

      {feedback && (
        <p
          role="status"
          className={`rounded-lg px-3 py-2 text-sm ${
            feedback.ok ? 'bg-brand-100 text-brand-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {feedback.message}
        </p>
      )}

      {otherCount > 0 && (
        <button
          type="button"
          onClick={handleRevoke}
          disabled={pending}
          className="flex items-center justify-center gap-2 self-start rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-2.5 text-sm font-bold text-zinc-300 transition-colors hover:border-rose-500/40 hover:bg-rose-500/8 hover:text-rose-400 disabled:opacity-50 cursor-pointer"
        >
          <LogOut size={16} aria-hidden />
          {pending ? 'Mengeluarkan…' : `Keluar dari ${otherCount} perangkat lain`}
        </button>
      )}
    </div>
  )
}
