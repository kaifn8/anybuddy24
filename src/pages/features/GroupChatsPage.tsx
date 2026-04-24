import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FeatureShell, PrototypeBanner } from './_FeatureShell';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { AppIcon } from '@/components/icons/AppIcon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const SEED_GROUPS = [
  { id: 'g1', name: 'Bandra Coffee Club',     members: 12, last: 'Maya: Same time tomorrow?',     unread: 2, emoji: '☕' },
  { id: 'g2', name: 'Powai Footy',            members: 8,  last: 'Arjun: Booked the turf for 7pm', unread: 0, emoji: '⚽' },
  { id: 'g3', name: 'Marine Drive Walkers',   members: 24, last: 'Priya: Sunset golden today 🌅',  unread: 5, emoji: '🚶' },
  { id: 'g4', name: 'Versova Brunch Squad',   members: 6,  last: 'Zara: Sun-out cafe is back!',    unread: 0, emoji: '🥞' },
];

export default function GroupChatsPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState(SEED_GROUPS);

  const create = () => {
    const name = prompt('Group name?');
    if (!name) return;
    setGroups(prev => [{ id: `g_${Date.now()}`, name, members: 1, last: 'You created this group', unread: 0, emoji: '✨' }, ...prev]);
    toast.success(`"${name}" created`);
  };

  const open = (g: typeof SEED_GROUPS[0]) => {
    toast(`Opening ${g.name} — full chat in v2`);
  };

  return (
    <FeatureShell
      title="Group Chats"
      hero={{ icon: 'fc:conference-call', label: 'Standalone groups', sub: 'Crews that exist beyond a single plan', tone: 'primary' }}
    >
      <PrototypeBanner />

      <Button className="w-full" onClick={create}>
        <AppIcon name="fc:plus" size={14} /> <span className="ml-2">Create new group</span>
      </Button>

      <div className="space-y-2">
        {groups.map((g) => (
          <button key={g.id} onClick={() => open(g)}
            className="w-full liquid-glass-interactive flex items-center gap-3 p-3.5 text-left">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0 text-2xl">
              {g.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-bold truncate">{g.name}</p>
                <span className="text-[10px] text-muted-foreground/50 shrink-0">{g.members} members</span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">{g.last}</p>
            </div>
            {g.unread > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                {g.unread}
              </span>
            )}
          </button>
        ))}
      </div>
    </FeatureShell>
  );
}