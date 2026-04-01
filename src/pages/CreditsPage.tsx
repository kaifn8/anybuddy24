import { useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import gsap from 'gsap';
import { BottomNav } from '@/components/layout/BottomNav';
import { TrustBadge } from '@/components/ui/TrustBadge';
import { ProgressBar } from '@/components/ui/ProgressIndicator';
import { useAppStore } from '@/store/useAppStore';
import { useNavigate } from 'react-router-dom';
import type { TrustLevel } from '@/types/anybuddy';
import { AppIcon } from '@/components/icons/AppIcon';

const trustProgression: TrustLevel[] = ['seed', 'solid', 'trusted', 'anchor'];
const trustRequirements = {
  seed:    { joins: 0  },
  solid:   { joins: 5  },
  trusted: { joins: 15 },
  anchor:  { joins: 50 },
};

const TRUST_PERKS: Record<TrustLevel, string[]> = {
  seed:    ['Join public plans', 'Post up to 2 plans/day'],
  solid:   ['Reduced posting cost', 'Priority in search', 'Badge on profile'],
  trusted: ['Blue tick', 'Verified Host access', 'Discount on credits'],
  anchor:  ['Max discounts', 'Legend status', 'Early feature access'],
};

export default function CreditsPage() {
  const navigate = useNavigate();
  const { user, creditHistory } = useAppStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const creditsRef = useRef<HTMLParagraphElement>(null);

  const currentTrustIndex = trustProgression.indexOf(user?.trustLevel || 'seed');
  const nextTrust = trustProgression[currentTrustIndex + 1];
  const nextReq = nextTrust ? trustRequirements[nextTrust].joins : null;

  useEffect(() => {
    if (contentRef.current?.children) {
      gsap.fromTo(Array.from(contentRef.current.children),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: 'power3.out' }
      );
    }
    if (creditsRef.current && user?.credits) {
      const obj = { value: 0 };
      gsap.to(obj, {
        value: user.credits, duration: 0.9, ease: 'power2.out',
        onUpdate: () => { if (creditsRef.current) creditsRef.current.textContent = Math.round(obj.value).toString(); }
      });
    }
  }, [user?.credits]);

  return (
    <div className="mobile-container min-h-screen bg-background pb-28">
      {/* Custom top bar */}
      <header className="sticky top-0 z-40"
        style={{
          background: 'hsla(var(--glass-bg) / 0.35)',
          backdropFilter: 'blur(var(--glass-blur-heavy)) saturate(220%)',
          WebkitBackdropFilter: 'blur(var(--glass-blur-heavy)) saturate(220%)',
          borderBottom: '0.5px solid hsla(var(--glass-border) / 0.4)',
        }}>
        <div className="flex items-center h-[48px] px-4 gap-3">
          <button onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center tap-scale shrink-0">
            <span className="text-sm font-medium">←</span>
          </button>
          <span className="text-[17px] font-bold text-foreground tracking-tight">Credits & Trust</span>
        </div>
      </header>

      <div ref={contentRef} className="px-4 pt-4 space-y-3">

        {/* Balance card */}
        <div className="rounded-[1.5rem] p-5 text-white overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(240 75% 55%), hsl(var(--secondary)))' }}>
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full blur-2xl" style={{ background: 'rgba(255,255,255,0.12)' }} />
          <div className="absolute -left-4 bottom-0 w-20 h-20 rounded-full blur-xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider mb-1.5">Available to spend</p>
          <div className="flex items-end gap-1.5">
            <p ref={creditsRef} className="text-[48px] font-bold leading-none tracking-tight">0</p>
            <p className="text-white/50 text-sm mb-2 font-medium">credits</p>
          </div>
          <p className="text-white/40 text-[11px] mt-2 font-medium">Show up · earn more · spend on posts</p>
        </div>

        {/* Trust level */}
        <div className="liquid-glass-heavy p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-[0.875rem] liquid-glass flex items-center justify-center">
              <AppIcon name="fc:vip" size={26} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground font-medium mb-1 uppercase tracking-wide">Trust Level</p>
              <TrustBadge level={user?.trustLevel || 'seed'} size="md" />
            </div>
          </div>

          {/* Perks */}
          <div className="space-y-1 mb-3">
            {TRUST_PERKS[user?.trustLevel || 'seed'].map((perk, i) => (
              <p key={i} className="text-[11px] text-muted-foreground flex items-center gap-2">
                <AppIcon name="fc:checkmark" size={13} className="shrink-0" /> {perk}
              </p>
            ))}
          </div>

          {nextTrust && (
            <div className="pt-3 border-t border-border/15">
              <div className="flex justify-between text-[11px] mb-2">
                <span className="text-muted-foreground">
                  {nextReq! - (user?.completedJoins || 0)} more join{nextReq! - (user?.completedJoins || 0) !== 1 ? 's' : ''} to unlock <span className="font-semibold text-foreground">{nextTrust}</span>
                </span>
                <span className="font-bold text-foreground tabular-nums">{user?.completedJoins || 0}/{nextReq}</span>
              </div>
              <ProgressBar value={user?.completedJoins || 0} max={nextReq || 1} size="md" />
            </div>
          )}

          {!nextTrust && (
            <p className="text-[12px] text-success font-bold mt-2 flex items-center gap-1.5">
              <AppIcon name="se:trophy-1" size={14} /> Maximum trust — you're a legend.
            </p>
          )}
        </div>

        {/* How to earn */}
        <div className="liquid-glass-heavy p-4">
          <h3 className="section-label mb-0.5">How to earn credits</h3>
          <p className="text-[10px] text-muted-foreground mb-3">Credits are the economy — spend to post, earn by showing up.</p>
          <div className="space-y-3">
            {[
              { icon: 'fc:collaboration' as const,   amount: '+0.5', action: 'Join a plan',       detail: 'Per accepted join'    },
              { icon: 'fc:checkmark' as const,        amount: '+1',   action: 'Actually show up',  detail: 'Attendance confirmed' },
              { icon: 'fc:rating' as const,           amount: '+2',   action: 'Get rated 5 stars', detail: 'After meetup review'  },
              { icon: 'se:fire' as const,             amount: '+1',   action: '7-day streak',      detail: 'Stay active daily'    },
              { icon: 'fc:invite' as const,           amount: '+3',   action: 'Invite a friend',   detail: 'When they join a plan'},
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[0.75rem] liquid-glass flex items-center justify-center shrink-0">
                  <AppIcon name={item.icon} size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-foreground">{item.action}</p>
                  <p className="text-[10px] text-muted-foreground">{item.detail}</p>
                </div>
                <span className="text-[13px] font-bold text-success shrink-0 tabular-nums">{item.amount}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border/15">
            <p className="text-[10px] text-muted-foreground/60 flex items-start gap-1.5">
              <AppIcon name="fc:info" size={12} className="shrink-0 mt-px" />
              XP is separate — it tracks your reputation, level, and leaderboard rank. XP is never currency.
            </p>
          </div>
        </div>

        {/* History */}
        <div className="liquid-glass-heavy p-4">
          <h3 className="section-label mb-3">Recent activity</h3>
          {creditHistory.length > 0 ? (
            <div className="space-y-2">
              {creditHistory.slice(0, 12).map((txn) => (
                <div key={txn.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[0.625rem] liquid-glass flex items-center justify-center shrink-0">
                      <AppIcon name={txn.type === 'earn' ? 'fc:positive-dynamic' as any : 'fc:negative-dynamic' as any} size={16} />
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-foreground">{txn.reason}</p>
                      <p className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(txn.timestamp), { addSuffix: true })}</p>
                    </div>
                  </div>
                  <span className={`text-[13px] font-bold tabular-nums ${txn.type === 'earn' ? 'text-success' : 'text-warning'}`}>
                    {txn.type === 'earn' ? '+' : '-'}{txn.amount}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-2xl liquid-glass flex items-center justify-center mx-auto mb-3">
                <AppIcon name="fc:statistics" size={24} />
              </div>
              <p className="text-[12px] text-muted-foreground">Join a plan to start earning credits</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
