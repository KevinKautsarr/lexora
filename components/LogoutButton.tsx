'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter()

  async function handleLogout() {
    await authClient.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      aria-label="Logout"
      className={
        className ??
        'flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:border-red-500/60 hover:bg-red-100 hover:text-red-600'
      }
    >
      <LogOut size={18} aria-hidden />
      Logout
    </button>
  )
}
