import { useGamificationStore, QuestProgress } from '@/store/useGamificationStore';
import { getDailyQuests, DailyQuest } from '@/types/gamification';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { AppIcon } from '@/components/icons/AppIcon';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export function DailyQuestCard() {
  const navigate = useNavigate();
  const quests = getDailyQuests();
  const { dailyQuestProgress, claimQuestReward, refreshDailyQuests } = useGamificationStore();
  const updateCredits = useAppStore((s) => s.updateCredits);

  refreshDailyQuests();

  const getProgress = (questId: string): QuestProgress => {
    return dailyQuestProgress.find(p => p.questId === questId) || {
      questId: questId as DailyQuest['id'],
      progress: 0,
      completed: false,
    };
  };

  const handleClaim = (quest: DailyQuest) => {
    const reward = claimQuestReward(quest.id);
    if (!reward) return;
    if (reward.credits > 0) {
      // Credits from quests are partial refunds for real-world activity — not XP-as-currency
      updateCredits(reward.credits, `Activity refund: ${quest.title}`);
    }
    toast({
      title: `🎉 Quest Complete!`,
      description: `+${quest.xpReward} XP${reward.credits > 0 ? ` · +${reward.credits} credit refund` : ''}`,
    });
  };

  const completedCount = quests.filter(q => {
    const p = getProgress(q.id);
    return p.completed && p.claimedAt;
  }).length;

  return (
    <div className="liquid-glass-heavy p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-bold text-foreground tracking-tight flex items-center gap-1.5">
          ⚡ Daily Quests
        </h3>
        <span className="text-[11px] font-semibold text-muted-foreground">{completedCount}/{quests.length} done</span>
      </div>

      <div className="space-y-2">
        {quests.map((quest) => {
          const prog = getProgress(quest.id);
          const isClaimed = !!prog.claimedAt;
          const pct = Math.min(100, (prog.progress / quest.target) * 100);

          return (
            <div
              key={quest.id}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-[0.875rem] transition-all',
                isClaimed
                  ? 'bg-success/6 border border-success/20'
                  : prog.completed
                  ? 'bg-primary/6 border border-primary/20 liquid-glass-interactive cursor-pointer'
                  : 'liquid-glass'
              )}
              onClick={() => prog.completed && !isClaimed && handleClaim(quest)}
            >
              {/* Icon */}
              <div className={cn(
                'w-9 h-9 rounded-[0.75rem] flex items-center justify-center shrink-0 text-lg',
                isClaimed ? 'bg-success/10' : 'bg-muted/30'
              )}>
                {isClaimed ? <AppIcon name="fc:checkmark" size={18} /> : quest.emoji}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-[12px] font-semibold truncate',
                  isClaimed ? 'text-muted-foreground line-through' : 'text-foreground'
                )}>
                  {quest.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {/* Progress bar */}
                  <div className="flex-1 h-[3px] rounded-full bg-muted/40 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: isClaimed
                          ? 'hsl(var(--success))'
                          : 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))',
                      }}
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground font-medium tabular-nums shrink-0">
                    {prog.progress}/{quest.target}
                  </span>
                </div>
              </div>

              {/* Reward */}
              <div className="shrink-0 text-right">
                {prog.completed && !isClaimed ? (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary text-primary-foreground">
                    <AppIcon name="se:sparkles" size={10} />
                    <span className="text-[10px] font-bold">Claim</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-end gap-0.5">
                    <p className="text-[11px] font-bold text-primary">+{quest.xpReward} XP</p>
                    {quest.creditReward ? (
                      <p className="text-[9px] font-semibold text-success">+{quest.creditReward} refund</p>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
