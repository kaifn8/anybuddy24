import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FeatureShell, PrototypeBanner } from './_FeatureShell';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { AppIcon } from '@/components/icons/AppIcon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SEED_FRIENDS = [
  { id: 'f1', name: 'Priya M.', city: 'Bandra',     mutual: 4, following: true,  active: true  },
  { id: 'f2', name: 'Arjun S.', city: 'Andheri',    mutual: 2, following: true,  active: false },
  { id: 'f3', name: 'Maya K.',  city: 'Powai',      mutual: 7, following: true,  active: true  },
  { id: 'f4', name: 'Rohan V.', city: 'Lower Parel',mutual: 1, following: false, active: false },
  { id: 'f5', name: 'Zara Q.',  city: 'Juhu',       mutual: 3, following: false, active: true  },
  { id: 'f6', name: 'Aditya P.',city: 'Worli',      mutual: 5, following: true,  active: false },
  { id: 'f7', name: 'Neha R.',  city: 'Versova',    mutual: 2, following: false, active: false },
];

export default function FriendsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'following' | 'discover'>('following');
  const [friends, setFriends] = useState(SEED_FRIENDS);
  const [search, setSearch] = useState('');

  const toggle = (id: string) =>
    setFriends(prev => prev.map(f => f.id === id ? { ...f, following: !f.following } : f));

  const filtered = friends
    .filter(f => tab === 'following' ? f.following : !f.following)
    .filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  const followingCount = friends.filter(f => f.following).length;

  return (
    <FeatureShell
      title="Friends"
      hero={{ icon: 'fc:conference-call', label: `Following ${followingCount}`, sub: 'People you’ve connected with from past plans', tone: 'success' }}
    >
      <PrototypeBanner />

      {/* Tabs */}
      <div className="flex gap-1.5 p-1 rounded-full liquid-glass">
        {(['following', 'discover'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn(
              'flex-1 h-9 rounded-full text-[12px] font-bold capitalize transition-all',
              tab === t ? 'bg-foreground text-background' : 'text-muted-foreground'
            )}>
            {t === 'following' ? `Following · ${followingCount}` : `Discover · ${friends.length - followingCount}`}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <AppIcon name="fc:search" size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder={tab === 'following' ? 'Search friends…' : 'Find new buddies…'}
          className="w-full h-10 liquid-glass rounded-[0.875rem] pl-9 pr-4 text-[13px] outline-none border-none bg-transparent" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-14">
          <AppIcon name="fc:conference-call" size={32} className="mx-auto opacity-40 mb-3" />
          <p className="text-[14px] font-bold text-foreground mb-1">
            {tab === 'following' ? "You're not following anyone yet" : 'No new people right now'}
          </p>
          <p className="text-[12px] text-muted-foreground mb-5">Join a plan to meet people</p>
          <Button variant="outline" size="sm" onClick={() => navigate('/home')}>Browse plans</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((f) => (
            <div key={f.id} className="liquid-glass rounded-[1rem] p-3.5 flex items-center gap-3">
              <button onClick={() => navigate(`/host/${f.id}`)} className="relative shrink-0 tap-scale">
                <GradientAvatar name={f.name} size={44} />
                {f.active && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success border-2 border-background" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-foreground truncate">{f.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">📍 {f.city} · {f.mutual} mutual</p>
              </div>
              <Button
                size="sm"
                variant={f.following ? 'outline' : 'default'}
                className="h-8 px-3 text-[11px] shrink-0"
                onClick={() => toggle(f.id)}
              >
                {f.following ? 'Following' : '+ Follow'}
              </Button>
            </div>
          ))}
        </div>
      )}
    </FeatureShell>
  );
}