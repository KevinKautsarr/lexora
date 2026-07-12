'use client'

// Pemutar efek suara ringan — file WAV pendek di public/sounds/.
// Preferensi mute disimpan di localStorage (per perangkat, tanpa DB).
// Semua error audio ditelan diam-diam: SFX tidak boleh pernah mengganggu UX.

export type SfxName = 'correct' | 'wrong' | 'win' | 'lose' | 'reward'

const MUTE_KEY = 'lexora-sfx-muted'
const VOLUME = 0.45

const cache = new Map<SfxName, HTMLAudioElement>()

export function isSfxMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

export function setSfxMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
  } catch {
    // localStorage bisa gagal (private mode) — abaikan, default tetap bersuara.
  }
}

export function playSfx(name: SfxName): void {
  if (typeof window === 'undefined' || isSfxMuted()) return
  try {
    let audio = cache.get(name)
    if (!audio) {
      audio = new Audio(`/sounds/${name}.wav`)
      audio.volume = VOLUME
      cache.set(name, audio)
    }
    // Rewind agar bisa dipicu beruntun (mis. match cepat berturut-turut).
    audio.currentTime = 0
    void audio.play().catch(() => {})
  } catch {
    // Autoplay policy / decode error — diam saja.
  }
}
