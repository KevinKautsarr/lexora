import Image from 'next/image'

export type MascotPose =
  | 'avatar'
  | 'neutral'
  | 'wave'
  | 'greeting'
  | 'streak-keeper'
  | 'flexible'
  | 'trophy'
  | 'success'
  | 'streak-danger'
  | 'graduation'
  | 'thinking'
  | 'confused'
  | 'premium-locked'
  | 'footer-cta-1'
  | 'footer-cta-2'

const POSE_MAP: Record<MascotPose, string> = {
  avatar: '/images/01_favicon_avatar.png',
  neutral: '/images/02_core_pose.png',
  wave: '/images/03_primary_wave.png',
  greeting: '/images/04_hero_greeting.png',
  'streak-keeper': '/images/05_streak_keeper.png',
  flexible: '/images/06_flexible_learner.png',
  trophy: '/images/07_champion_trophy.png',
  success: '/images/08_success_completed.png',
  'streak-danger': '/images/09_streak_danger_sleepy.png',
  graduation: '/images/10_c1_graduation.png',
  thinking: '/images/11_error404_thinking.png',
  confused: '/images/12_confused_state.png',
  'premium-locked': '/images/13_premium_locked.png',
  'footer-cta-1': '/images/14_footer_cta_gamified-1.png',
  'footer-cta-2': '/images/14_footer_cta_gamified-2.png',
}

type MascotMood = 'happy' | 'cheer' | 'sad'

export default function Mascot({
  pose,
  mood = 'happy',
  size = 120,
  className,
}: {
  pose?: MascotPose
  mood?: MascotMood
  size?: number
  className?: string
  [key: string]: any // To swallow props like xp passed by some parents
}) {
  // If mood is provided, resolve it to an appropriate pose if no specific pose is set
  let resolvedPose: MascotPose = pose || 'neutral'
  if (mood && !pose) {
    if (mood === 'cheer') {
      resolvedPose = 'success'
    } else if (mood === 'sad') {
      resolvedPose = 'confused'
    } else {
      resolvedPose = 'wave'
    }
  }

  const src = POSE_MAP[resolvedPose] || POSE_MAP.neutral

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center select-none ${className || ''}`}
    >
      <Image
        src={src}
        alt="Lexi, maskot LEXORA"
        fill
        sizes={`${size}px`}
        className="object-contain"
        priority
      />
    </div>
  )
}

