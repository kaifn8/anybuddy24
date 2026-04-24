import { useState } from 'react';
import { FeatureShell, PrototypeBanner } from './_FeatureShell';
import { useGamificationStore } from '@/store/useGamificationStore';
import { ACHIEVEMENTS } from '@/types/gamification';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const RARITY: Record<string, { bg: string; text: string; border: string }> = {
  common:    { bg: 'bg-primary/8',   text: 'text-primary',   border: 'border-primary/25'   },
  rare:      { bg: 'bg-success/8',   text: 'text-success',   border: 'border-success/25'   },
  epic:      { bg: 'bg-secondary/8', text: 'text-secondary', border: 'border-secondary/25' },
  legendary: { bg: 'bg-accent/12',   text: 'text-accent',    border: 'border-accent/30'    },
};

export default function AchievementsShowcasePage() {
  const { unlockedAchievements } = useGamificationStore();
  const unlockedIds = new Set(unlockedAchievements.map(a => a.id));
  const unlockedList = ACHIEVEMENTS.filter(a => unlockedIds.has(a.id));

  const [pinned, setPinned] = useState<string[]>(() => unlockedList.slice(0, 3).map(a => a.id));

  const togglePin = (id: string) => {
    setPinned(prev => {
      if (prev.includes(id)) return prev.filter(p => p !== id);
      if (prev.length >= 3) {
        toast('You can pin up to 3 achievements');
        return prev;
      }
      return [...prev, id];
    });
  };

  return (
    <FeatureShell
      title="Achievements Showcase"
      hero={{ icon: 'fc:trophy', label: 'Pin your favourites', sub: 'Up to 3 badges show at the top of your profile', tone: 'accent' }}
    >
      <PrototypeBanner />

      {/* Pinned preview */}
      <div className="liquid-glass-heavy p-4 rounded-[1.25rem]">
        <p className="section-label mb-3">Profile preview</p>
        {pinned.length === 0 ? (
          <p className="text-[12px] text-muted-foreground text-center py-6">Tap below to pin badges</p>
        ) : (
          <div className="flex gap-2 justify-center">
            {pinned.map((id) => {
              const a = ACHIEVEMENTS.find(x => x.id === id);
              if (!a) return null;
              const styles = RARITY[a.rarity];
              return (
                <div key={id} className={cn('flex flex-col items-center gap-1 p-3 rounded-2xl border min-w-[80px]', styles.bg, styles.border)}>
                  <span className="text-3xl">{a.emoji}</span>
                  <p className={cn('text-[9px] font-bold text-center leading-tight', styles.text)}>{a.title}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {unlockedList.length === 0 ? (
        <div className="text-center py-12 liquid-glass rounded-[1.25rem] p-6">
          <p className="text-3xl mb-3">🏆</p>
          <p className="text-[14px] font-bold mb-1">No achievements yet</p>
          <p className="text-[12px] text-muted-foreground">Complete plans to unlock badges</p>
        </div>
      ) : (
        <div>
          <p className="section-label mb-3 px-1">Your collection · tap to pin</p>
          <div className="grid grid-cols-3 gap-2">
            {unlockedList.map((a) => {
              const styles = RARITY[a.rarity];
              const isPinned = pinned.includes(a.id);
              return (
                <button key={a.id} onClick={() => togglePin(a.id)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-[0.875rem] border text-center tap-scale relative',
                    styles.bg, styles.border,
                    isPinned && 'ring-2 ring-primary'
                  )}>
                  {isPinned && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">📌</span>
                  )}
                  <span className="text-2xl">{a.emoji}</span>
                  <p className={cn('text-[9px] font-bold leading-tight', styles.text)}>{a.title}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Button className="w-full mt-2" onClick={() => toast.success('Showcase saved!')}>Save showcase</Button>
    </FeatureShell>
  );
}