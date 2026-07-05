import Sidebar from '@/components/Sidebar'
import UserStats from '@/components/UserStats'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      {/* Offset selebar sidebar: w-16 di layar kecil, w-56 di lg+ */}
      <div className="flex flex-1 flex-col pl-16 lg:pl-56">
        <header className="flex h-16 items-center justify-end border-b border-zinc-800 px-4 sm:px-8">
          <UserStats />
        </header>
        <main className="flex-1 px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  )
}
