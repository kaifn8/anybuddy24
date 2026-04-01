import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useAppStore } from '@/store/useAppStore';
import { getLevelForXP } from '@/types/gamification';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { cn } from '@/lib/utils';
import { AppIcon } from '@/components/icons/AppIcon';

const FAKE_NAMES = ['Priya M.', 'Arjun S.', 'Maya K.', 'Rohan V.', 'Zara Q.', 'Aditya P.', 'Neha R.', 'Vikram D.', 'Kabir T.', 'Riya N.'];
const FAKE_XP_BASE = [420, 380, 310, 290, 260, 240, 215, 185, 160, 130];
const MEDAL_EMOJI = ['🥇', '🥈', '🥉'];

function generateLeaderboard(userXp: number, userName: string, userStreak: number) {
  const week = Math.floor(Date.now() / (7 * 86400000));
  const entries = FAKE_NAMES.map((name, i) => {
    const seed = (week * 1000 + i * 37) % 100;
    const xp = Math.max(10, FAKE_XP_BASE[i] + (seed % 80) - 40);
    return { userId: `fake_${i}`, name, xp, weeklyXp: xp, level: getLevelForXP(xp * 8).level, streak: Math.floor(seed % 15) + 1 };
  });
  const realUser = {
    userId: 'me', name: userName || 'You', xp: userXp, weeklyXp: userXp,
    level: getLevelForXP(userXp * 8).level, streak: userStreak,
  };
  return [...entries, realUser].sort((a, b) => b.weeklyXp - a.weeklyXp);
}

export default function LeaderboardPage() {
  const { xp, weeklyXp, streak } = useGamificationStore();
  const user = useAppStore((s) => s.user);
  const board = useMemo(
    () => generateLeaderboard(weeklyXp, user?.firstName || 'You', streak.count),
    [weeklyXp, user?.firstName, streak.count]
  );
  const myRank = board.findIndex(e => e.userId === 'me') + 1;

  const now = new Date();
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + ((7 - now.getDay() + 1) % 7 || 7));
  nextMonday.setHours(0, 0, 0, 0);
  const daysLeft = Math.ceil((nextMonday.getTime() - now.getTime()) / 86400000);

  return (
    <>
      <div className="mobile-container min-h-screen bg-background pb-28">
        <TopBar title="Leaderboard" showBack hideChat />

        <div className="px-4 pt-4 space-y-3">

          {/* Header card */}
          <div className="liquid-glass-heavy p-4 text-center">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5">
              📍 Mumbai · Weekly XP
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[13px] text-muted-foreground">
              <AppIcon name="fc:clock" size={14} />
              <span>Resets in <span className="text-foreground font-bold">{daysLeft} day{daysLeft !== 1 ? 's' : ''}</span></span>
            </div>
            {myRank > 0 && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/8 text-primary">
                <span className="text-[12px] font-bold">
                  {myRank <= 3 ? `${MEDAL_EMOJI[myRank - 1]} ` : `#${myRank} `}
                  You're #{myRank} this week
                </span>
              </div>
            )}
          </div>

          {/* Podium (top 3) */}
          <div className="flex items-end gap-3 px-2">
            {[1, 0, 2].map((idx) => {
              const entry = board[idx];
              if (!entry) return null;
              const isMe = entry.userId === 'me';
              const podiumIdx = idx === 0 ? 1 : idx === 1 ? 0 : 2;
              const heights = ['h-24', 'h-28', 'h-20'];
              return (
                <div key={entry.userId} className={cn('flex-1 flex flex-col items-center gap-2', idx === 1 && 'scale-105')}>
                  <div className="relative">
                    <GradientAvatar name={entry.name} size={idx === 1 ? 52 : 42}
                      className={cn(isMe && 'ring-2 ring-primary ring-offset-1 ring-offset-background')} />
                    <span className="absolute -top-2 -right-2 text-base leading-none">{MEDAL_EMOJI[podiumIdx]}</span>
                  </div>
                  <div className={cn(
                    'w-full rounded-t-[0.875rem] flex flex-col items-center justify-end pb-3 pt-2',
                    heights[podiumIdx],
                    podiumIdx === 0 ? 'bg-accent/10 border border-accent/20' : 'liquid-glass'
                  )}>
                    <p className="text-[11px] font-bold text-foreground truncate px-2 text-center">
                      {entry.name.split(' ')[0]}
                    </p>
                    <p className="text-[10px] font-bold text-primary tabular-nums">{entry.weeklyXp} XP</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full list */}
          <div className="liquid-glass-heavy overflow-hidden">
            <div className="px-3 pt-3 pb-1">
              <p className="section-label">All rankings</p>
            </div>
            <div className="divide-y divide-border/10">
              {board.map((entry, i) => {
                const isMe = entry.userId === 'me';
                const rank = i + 1;
                const level = getLevelForXP(entry.weeklyXp * 8);
                return (
                  <div key={entry.userId}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 transition-all',
                      isMe ? 'bg-primary/5' : 'hover:bg-muted/10'
                    )}>
                    <div className="w-7 text-center shrink-0">
                      {rank <= 3
                        ? <span className="text-base leading-none">{MEDAL_EMOJI[rank - 1]}</span>
                        : <span className={cn('text-[12px] font-bold tabular-nums', isMe ? 'text-primary' : 'text-muted-foreground/50')}>
                            #{rank}
                          </span>
                      }
                    </div>
                    <GradientAvatar name={entry.name} size={34}
                      className={cn(isMe && 'ring-[1.5px] ring-primary ring-offset-1 ring-offset-background')} />
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-[13px] font-semibold truncate', isMe ? 'text-primary' : 'text-foreground')}>
                        {isMe ? `${entry.name} (you)` : entry.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{level.emoji} {level.title}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 mr-2">
                      <AppIcon name="se:fire" size={13} className={entry.streak > 0 ? '' : 'grayscale opacity-40'} />
                      <span className="text-[10px] text-muted-foreground tabular-nums">{entry.streak}</span>
                    </div>
                    <div className="shrink-0 text-right min-w-[42px]">
                      <p className={cn('text-[13px] font-bold tabular-nums', isMe ? 'text-primary' : 'text-foreground')}>
                        {entry.weeklyXp}
                      </p>
                      <p className="text-[9px] text-muted-foreground">XP</p>
                    </div>
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
