import { Award, ShieldAlert, BadgeCheck } from 'lucide-react'
import Mascot from '@/components/Mascot'

export default function CertificateMock() {
  return (
    <div className="relative mx-auto w-full max-w-[340px] rounded-3xl border-2 border-amber-500 bg-zinc-950 p-6 text-center shadow-2xl shadow-amber-500/10 ring-4 ring-amber-500/20">
      {/* Decorative corners */}
      <div className="absolute top-3 left-3 h-4 w-4 border-t-2 border-l-2 border-amber-500/40"></div>
      <div className="absolute top-3 right-3 h-4 w-4 border-t-2 border-r-2 border-amber-500/40"></div>
      <div className="absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-amber-500/40"></div>
      <div className="absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-amber-500/40"></div>

      {/* Header crest */}
      <div className="mb-4 flex justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
          <Award size={28} strokeWidth={1.5} />
        </div>
      </div>

      <h3 className="font-serif text-lg font-black text-amber-400 tracking-wide uppercase">
        SERTIFIKAT KELULUSAN
      </h3>
      <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
        Lexora English Academy
      </p>

      <div className="my-5 border-t border-b border-zinc-800 py-3.5">
        <p className="text-[10px] text-zinc-400">Dengan bangga mempersembahkan kepada:</p>
        <h4 className="my-1.5 text-base font-black text-zinc-100 tracking-tight">
          Siswa Berprestasi Lexora
        </h4>
        <p className="text-[9px] leading-relaxed text-zinc-400 max-w-[240px] mx-auto">
          Telah berhasil menyelesaikan seluruh rangkaian materi pembelajaran kosakata Bahasa Inggris
          tingkat <span className="font-extrabold text-amber-400">Pemula (Level 1)</span> dengan hasil memuaskan.
        </p>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="text-left">
          <p className="text-[8px] text-zinc-500 uppercase font-bold tracking-wider">Tanggal Kelulusan</p>
          <p className="text-[10px] font-bold text-zinc-300">07 Juli 2026</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center text-amber-500">
          <Mascot pose="graduation" size={44} />
        </div>
      </div>

      {/* Floating Verification Badge */}
      <div className="absolute -top-3 -right-3 flex items-center gap-1 rounded-xl bg-brand-600 px-2.5 py-1 shadow-md shadow-brand-900/20">
        <BadgeCheck size={12} className="text-white" />
        <span className="text-[9px] font-black text-white uppercase tracking-wider">VERIFIED</span>
      </div>
    </div>
  )
}
