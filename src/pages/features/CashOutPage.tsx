import { useState } from 'react';
import { FeatureShell, PrototypeBanner } from './_FeatureShell';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { AppIcon } from '@/components/icons/AppIcon';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const REWARDS = [
  { id: 'cafe',   label: 'Café voucher',         cost: 10, perk: '₹100 at partner cafés',   emoji: '☕' },
  { id: 'movie',  label: 'Movie ticket',         cost: 25, perk: '1 free PVR ticket',       emoji: '🎬' },
  { id: 'food',   label: 'Food delivery credit', cost: 15, perk: '₹150 Swiggy credit',      emoji: '🍱' },
  { id: 'donate', label: 'Donate to charity',    cost: 5,  perk: 'Plant a tree in your name', emoji: '🌳' },
];

export default function CashOutPage() {
  const { user, updateCredits } = useAppStore();
  const credits = user?.credits ?? 0;

  const redeem = (r: typeof REWARDS[0]) => {
    if (credits < r.cost) {
      toast.error('Not enough credits');
      return;
    }
    updateCredits(-r.cost, `Redeemed: ${r.label}`);
    toast.success(`🎁 ${r.label} redeemed!`);
  };

  return (
    <FeatureShell
      title="Cash Out"
      hero={{ icon: 'fc:money-transfer', label: `${credits} credits available`, sub: 'Convert credits into real-world perks', tone: 'success' }}
    >
      <PrototypeBanner />

      <div className="space-y-2">
        {REWARDS.map((r) => {
          const can = credits >= r.cost;
          return (
            <div key={r.id} className="liquid-glass rounded-[1rem] p-3.5 flex items-center gap-3">
              <span className="text-3xl shrink-0">{r.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold truncate">{r.label}</p>
                <p className="text-[11px] text-muted-foreground truncate">{r.perk}</p>
              </div>
              <Button
                size="sm"
                disabled={!can}
                onClick={() => redeem(r)}
                className={cn('h-8 px-3 text-[11px] shrink-0', !can && 'opacity-50')}
              >
                {r.cost} ⊕
              </Button>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl px-4 py-3 bg-muted/20 border border-border/30">
        <p className="text-[11px] text-muted-foreground flex items-start gap-2">
          <AppIcon name="fc:info" size={12} />
          Real partner integrations coming in production. Credits earned by attending plans, hosting and inviting friends.
        </p>
      </div>
    </FeatureShell>
  );
}