import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { StreakWidget } from '@/components/gamification/StreakWidget';
import { XPProgressBar } from '@/components/gamification/XPProgressBar';
import { DailyQuestCard } from '@/components/gamification/DailyQuestCard';
import { useGamificationStore } from '@/store/useGamificationStore';
import { ACHIEVEMENTS } from '@/types/gamification';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { AppIcon } from '@/components/icons/AppIcon';

const RARITY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  common:    { bg: 'bg-primary/6',   text: 'text-primary',   border: 'border-primary/20'   },
  rare:      { bg: 'bg-success/6',   text: 'text-success',   border: 'border-success/20'   },
  epic:      { bg: 'bg-secondary/6', text: 'text-secondary', border: 'border-secondary/20' },
  legendary: { bg: 'bg-accent/10',   text: 'text-accent',    border: 'border-accent/20'    },
};

export default function QuestsPage() {
  const navigate = useNavigate();
  const { unlockedAchievements, streak, xp } = useGamificationStore();
  const unlockedIds = new Set(unlockedAchievements.map(a => a.id));
  const newCount = unlockedAchievements.filter(a => !a.seen).length;

  return (
    <>
      <div className="mobile-container min-h-screen bg-background pb-28">
        <TopBar title="Progress" hideChat />

        <div className="px-4 pt-4 space-y-3">

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="liquid-glass p-3.5 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <AppIcon name="se:fire" size={18} />
                <span className="text-[18px] font-bold tabular-nums text-foreground">{streak.count}</span>
              </div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Streak</p>
            </div>
            <div className="liquid-glass p-3.5 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <AppIcon name="se:sparkles" size={18} />
                <span className="text-[18px] font-bold tabular-nums text-foreground">{xp}</span>
              </div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Total XP</p>
            </div>
            <div className="liquid-glass p-3.5 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <AppIcon name="se:trophy-1" size={18} />
                <span className="text-[18px] font-bold tabular-nums text-foreground">{unlockedIds.size}</span>
              </div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Badges</p>
            </div>
          </div>

          {/* XP progress */}
          <XPProgressBar />

          {/* Streak */}
          <StreakWidget />

          {/* Daily quests */}
          <DailyQuestCard />

          {/* Leaderboard CTA */}
          <Button onClick={() => navigate('/leaderboard')}
            variant="ghost" className="w-full h-auto px-4 py-3.5 justify-start gap-3 rounded-2xl liquid-glass-interactive">
            <div className="w-10 h-10 rounded-[0.875rem] liquid-glass flex items-center justify-center shrink-0">
              <AppIcon name="fc:statistics" size={22} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[13px] font-bold text-foreground tracking-tight">Weekly Leaderboard</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">See who's most active in Mumbai</p>
            </div>
            <span className="text-[12px] text-muted-foreground/40 shrink-0">→</span>
          </Button>

          {/* Achievements grid */}
          <div className="liquid-glass-heavy p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="section-label flex items-center gap-1.5">
                Achievements
                {newCount > 0 && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[8px] font-bold">
                    {newCount}
                  </span>
                )}
              </h3>
              <span className="text-[11px] text-muted-foreground font-medium">{unlockedIds.size}/{ACHIEVEMENTS.length}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {ACHIEVEMENTS.map((achievement) => {
                const isUnlocked = unlockedIds.has(achievement.id);
                const styles = RARITY_STYLES[achievement.rarity];
                return (
                  <div key={achievement.id}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-3 rounded-[0.875rem] border text-center transition-all',
                      isUnlocked
                        ? `${styles.bg} ${styles.border}`
                        : 'bg-muted/10 border-border/10 opacity-35 grayscale'
                    )}>
                    <span className="text-2xl">{achievement.emoji}</span>
                    <p className={cn('text-[9px] font-bold leading-tight text-center',
                      isUnlocked ? styles.text : 'text-muted-foreground')}>
                      {achievement.title}
                    </p>
                    {isUnlocked && (
                      <span className={cn('text-[7px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide', styles.bg, styles.text)}>
                        {achievement.rarity}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
