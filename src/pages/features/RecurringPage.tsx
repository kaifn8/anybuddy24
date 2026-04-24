import { useState } from 'react';
import { FeatureShell, PrototypeBanner } from './_FeatureShell';
import { Button } from '@/components/ui/button';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const SEED = [
  { id: 'r1', title: 'Sunday brunch crew',     day: 'Sunday',    time: '11:00',  cat: 'food'   as const, members: 6,  active: true  },
  { id: 'r2', title: 'Tuesday badminton',      day: 'Tuesday',   time: '19:30',  cat: 'sports' as const, members: 8,  active: true  },
  { id: 'r3', title: 'Friday after-work chai', day: 'Friday',    time: '18:00',  cat: 'chai'   as const, members: 12, active: false },
  { id: 'r4', title: 'Saturday morning walk',  day: 'Saturday',  time: '07:00',  cat: 'walk'   as const, members: 5,  active: true  },
];

export default function RecurringPage() {
  const [items, setItems] = useState(SEED);

  const toggle = (id: string) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, active: !i.active } : i));

  const create = () => {
    toast.success('New recurring plan template — coming in v2');
  };

  return (
    <FeatureShell
      title="Recurring Meetups"
      hero={{ icon: 'fc:calendar', label: 'Same crew, every week', sub: 'Auto-create plans on a fixed schedule', tone: 'success' }}
    >
      <PrototypeBanner />

      <Button className="w-full" onClick={create}>+ New recurring plan</Button>

      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.id} className="liquid-glass rounded-[1rem] p-3.5 flex items-center gap-3">
            <CategoryIcon category={it.cat} size="md" className="shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold truncate">{it.title}</p>
              <p className="text-[11px] text-muted-foreground">Every {it.day} · {it.time} · {it.members} members</p>
            </div>
            <button onClick={() => toggle(it.id)}
              className={cn(
                'w-11 h-6 rounded-full transition-all relative shrink-0',
                it.active ? 'bg-primary' : 'bg-muted'
              )}>
              <span className={cn(
                'absolute top-0.5 w-5 h-5 rounded-full bg-background shadow transition-all',
                it.active ? 'left-[22px]' : 'left-0.5'
              )} />
            </button>
          </div>
        ))}
      </div>
    </FeatureShell>
  );
}