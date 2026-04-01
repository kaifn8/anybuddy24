import { useEffect, useRef } from 'react';
import { useGamificationStore } from '@/store/useGamificationStore';
import { ACHIEVEMENTS } from '@/types/gamification';
import gsap from 'gsap';

const RARITY_STYLES: Record<string, { bg: string; glow: string; badge: string }> = {
  common:    { bg: 'hsl(211 100% 50% / 0.08)', glow: 'hsl(211 100% 50% / 0.3)',  badge: 'bg-primary/10 text-primary'  },
  rare:      { bg: 'hsl(152 55% 44% / 0.08)', glow: 'hsl(152 55% 44% / 0.3)',   badge: 'bg-success/10 text-success'  },
  epic:      { bg: 'hsl(260 36% 56% / 0.08)', glow: 'hsl(260 36% 56% / 0.3)',   badge: 'bg-secondary/10 text-secondary' },
  legendary: { bg: 'hsl(36 80% 58% / 0.12)',  glow: 'hsl(36 80% 58% / 0.5)',    badge: 'bg-accent/10 text-accent'    },
};

export function AchievementUnlock() {
  const { pendingAchievement, dismissAchievement } = useGamificationStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const achievement = pendingAchievement
    ? ACHIEVEMENTS.find(a => a.id === pendingAchievement)
    : null;

  useEffect(() => {
    if (!achievement || !containerRef.current) return;

    const tl = gsap.timeline();
    tl.fromTo(
      containerRef.current,
      { scale: 0.6, opacity: 0, y: 40 },
      { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.8)' }
    );

    // Auto-dismiss after 4s
    const timer = setTimeout(dismissAchievement, 4000);
    return () => clearTimeout(timer);
  }, [achievement, dismissAchievement]);

  if (!achievement) return null;

  const styles = RARITY_STYLES[achievement.rarity];

  return (
    <div className="fixed inset-0 z-[999] flex items-end justify-center pointer-events-none pb-32 px-5">
      <div
        ref={containerRef}
        className="pointer-events-auto max-w-sm w-full liquid-glass-heavy px-5 py-4 flex items-center gap-4 cursor-pointer"
        style={{
          background: styles.bg,
          boxShadow: `0 0 40px ${styles.glow}, 0 8px 32px hsl(var(--glass-shadow-lg))`,
          borderRadius: '1.25rem',
        }}
        onClick={dismissAchievement}
      >
        {/* Badge icon */}
        <div
          className="w-14 h-14 rounded-[1rem] flex items-center justify-center text-3xl shrink-0"
          style={{
            background: styles.bg,
            boxShadow: `0 0 16px ${styles.glow}`,
          }}
        >
          {achievement.emoji}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground mb-0.5">
            Achievement Unlocked!
          </p>
          <p className="text-[15px] font-bold text-foreground tracking-tight truncate">
            {achievement.title}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
            {achievement.description}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${styles.badge}`}>
              {achievement.rarity}
            </span>
            <span className="text-[10px] text-primary font-bold">+{achievement.xpBonus} XP</span>
          </div>
        </div>
      </div>
    </div>
  );
}
