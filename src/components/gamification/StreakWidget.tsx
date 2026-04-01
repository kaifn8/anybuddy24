import { useGamificationStore } from '@/store/useGamificationStore';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { AppIcon } from '@/components/icons/AppIcon';

interface StreakWidgetProps {
  compact?: boolean;
  className?: string;
}

export function StreakWidget({ compact = false, className }: StreakWidgetProps) {
  const { streak, useStreakFreeze } = useGamificationStore();

  const isActive = (() => {
    if (!streak.lastActiveDate) return false;
    return streak.lastActiveDate === new Date().toISOString().split('T')[0];
  })();

  const handleFreeze = () => {
    const success = useStreakFreeze();
    if (success) {
      toast({ title: '🧊 Streak frozen!', description: 'Your streak is safe for today.' });
    } else {
      toast({ title: 'No freeze tokens', description: 'Complete plans to earn more.' });
    }
  };

  if (compact) {
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        <AppIcon
          name="se:fire"
          size={16}
          className={cn('transition-all', !isActive && 'grayscale opacity-40')}
        />
        <span className={cn('text-[12px] font-bold tabular-nums', isActive ? 'text-accent' : 'text-muted-foreground/50')}>
          {streak.count}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('liquid-glass-heavy px-4 py-3 flex items-center gap-3', className)}>
      <div className={cn(
        'w-10 h-10 rounded-[0.875rem] flex items-center justify-center transition-all shrink-0',
        isActive ? 'bg-accent/15' : 'bg-muted/40'
      )}>
        <AppIcon
          name="se:fire"
          size={22}
          className={cn('transition-all', !isActive && 'grayscale opacity-30')}
        />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[14px] font-bold text-foreground tabular-nums">{streak.count}-day streak</span>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {isActive ? 'Active today ✓' : 'Do something social to keep it'}
        </p>
      </div>

      {/* Freeze token button — show if streak is at risk */}
      {!isActive && streak.count > 0 && (
        <Button
          onClick={handleFreeze}
          variant="ghost"
          size="sm"
          disabled={streak.freezeCount === 0}
          className={cn(
            'shrink-0 h-auto px-2.5 py-1.5 rounded-full gap-1',
            streak.freezeCount > 0
              ? 'bg-primary/10 text-primary hover:bg-primary/15'
              : 'bg-muted/30 text-muted-foreground/40'
          )}>
          <AppIcon name="se:snowflake" size={13} className={streak.freezeCount === 0 ? 'grayscale opacity-40' : ''} />
          <span className="text-[10px] font-bold">{streak.freezeCount}</span>
        </Button>
      )}

      {/* Show freeze count when active too */}
      {isActive && streak.freezeCount > 0 && (
        <div className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-full bg-primary/8 text-primary">
          <AppIcon name="se:snowflake" size={12} />
          <span className="text-[10px] font-bold">{streak.freezeCount}</span>
        </div>
      )}
    </div>
  );
}
