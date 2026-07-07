import { Check, Play, Lock, Sparkles, Star } from 'lucide-react'

export default function MobilePathMock() {
  return (
    <div className="relative mx-auto w-full max-w-[280px] rounded-[40px] border-[10px] border-zinc-800 bg-zinc-950 p-4 shadow-2xl ring-4 ring-zinc-800/50">
      {/* Phone Notch/Speaker */}
      <div className="absolute top-2 left-1/2 h-4 w-28 -translate-x-1/2 rounded-full bg-zinc-800 flex items-center justify-center">
        <div className="h-1 w-8 rounded-full bg-zinc-700"></div>
      </div>

      {/* Screen Header */}
      <div className="mb-4 mt-3 flex items-center justify-between border-b border-zinc-800/80 pb-2">
        <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">
          UNIT 1
        </span>
        <div className="flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-0.5 font-mono text-[9px] font-bold text-xp-400">
          <Star size={10} className="fill-xp-400 text-xp-400" />
          <span>160 XP</span>
        </div>
      </div>

      {/* Journey Path Mock Nodes */}
      <div className="relative flex flex-col items-center gap-6 py-4">
        {/* Node 1: Completed */}
        <div className="flex flex-col items-center translate-x-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-b-[5px] border-brand-700 bg-brand-500 text-white shadow-lg active:scale-95">
            <Check size={24} strokeWidth={3} />
          </div>
          <span className="mt-1.5 text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider">
            Pengenalan
          </span>
        </div>

        {/* Path Connector 1-2 */}
        <div className="h-5 w-0.5 border-l-2 border-dashed border-zinc-700/80 translate-x-2"></div>

        {/* Node 2: Active */}
        <div className="flex flex-col items-center -translate-x-4">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-b-[5px] border-brand-600 bg-brand-400 text-white shadow-lg shadow-brand-500/20 animate-node-bounce">
            <Play size={22} fill="white" className="translate-x-0.5" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[8px] font-black animate-pulse">
              !
            </span>
          </div>
          <span className="mt-1.5 text-[9px] font-extrabold text-brand-400 uppercase tracking-wider">
            Hobi & Minat
          </span>
        </div>

        {/* Path Connector 2-3 */}
        <div className="h-5 w-0.5 border-l-2 border-dashed border-zinc-800 -translate-x-2"></div>

        {/* Node 3: Locked */}
        <div className="flex flex-col items-center translate-x-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-b-[5px] border-zinc-850 bg-zinc-800 text-zinc-500 shadow-md">
            <Lock size={20} />
          </div>
          <span className="mt-1.5 text-[9px] font-extrabold text-zinc-600 uppercase tracking-wider">
            Pekerjaan
          </span>
        </div>
      </div>

      {/* Floating Sparkle Badge */}
      <div className="absolute bottom-6 -right-6 flex items-center gap-1.5 rounded-2xl border border-zinc-700 bg-zinc-800 p-2 shadow-lg">
        <Sparkles size={14} className="text-xp-400" />
        <span className="text-[9px] font-extrabold text-zinc-200">Responsive UI</span>
      </div>
    </div>
  )
}
