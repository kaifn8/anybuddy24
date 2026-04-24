import { useState } from 'react';
import { FeatureShell, PrototypeBanner } from './_FeatureShell';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ITEMS = [
  { id: 't1', label: 'Sunset theme',      desc: 'Warm orange/pink palette',     cost: 5,  category: 'Theme', preview: 'from-orange-300 to-pink-300' },
  { id: 't2', label: 'Midnight theme',    desc: 'Deep blue dark mode',          cost: 5,  category: 'Theme', preview: 'from-indigo-700 to-slate-900' },
  { id: 't3', label: 'Forest theme',      desc: 'Green nature vibes',           cost: 5,  category: 'Theme', preview: 'from-emerald-400 to-teal-600' },
  { id: 'b1', label: 'Profile boost 24h', desc: 'Featured at top of search',    cost: 8,  category: 'Boost', preview: 'from-amber-300 to-yellow-400' },
  { id: 'b2', label: 'Plan boost',        desc: 'Pin your plan in feed for 1h', cost: 3,  category: 'Boost', preview: 'from-rose-400 to-pink-500'    },
  { id: 'f1', label: 'Gold avatar frame', desc: 'Stand out in chats & feeds',   cost: 12, category: 'Frame', preview: 'from-yellow-300 to-amber-500' },
  { id: 'f2', label: 'Neon avatar frame', desc: 'Cyberpunk-style glow ring',    cost: 12, category: 'Frame', preview: 'from-fuchsia-400 to-cyan-400' },
];

export default function CreditShopPage() {
  const { user, updateCredits } = useAppStore();
  const [owned, setOwned] = useState<string[]>([]);
  const credits = user?.credits ?? 0;

  const buy = (item: typeof ITEMS[0]) => {
    if (owned.includes(item.id)) {
      toast(`${item.label} already owned`);
      return;
    }
    if (credits < item.cost) {
      toast.error('Not enough credits');
      return;
    }
    updateCredits(-item.cost, `Shop: ${item.label}`);
    setOwned(prev => [...prev, item.id]);
    toast.success(`Unlocked ${item.label}!`);
  };

  const categories = ['Theme', 'Boost', 'Frame'] as const;

  return (
    <FeatureShell
      title="Credit Shop"
      hero={{ icon: 'fc:shop', label: `${credits} credits to spend`, sub: 'Themes, boosts and avatar frames', tone: 'accent' }}
    >
      <PrototypeBanner />

      {categories.map((cat) => (
        <div key={cat}>
          <p className="section-label mb-2 px-1">{cat}s</p>
          <div className="grid grid-cols-2 gap-2">
            {ITEMS.filter(i => i.category === cat).map((item) => {
              const isOwned = owned.includes(item.id);
              return (
                <div key={item.id} className="liquid-glass rounded-[1rem] p-3 flex flex-col gap-2">
                  <div className={cn('h-16 w-full rounded-lg bg-gradient-to-br', item.preview)} />
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold truncate">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{item.desc}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={isOwned ? 'outline' : 'default'}
                    disabled={isOwned}
                    onClick={() => buy(item)}
                    className="h-8 text-[11px] w-full"
                  >
                    {isOwned ? '✓ Owned' : `${item.cost} ⊕`}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </FeatureShell>
  );
}