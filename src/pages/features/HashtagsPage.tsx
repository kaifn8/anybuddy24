import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FeatureShell, PrototypeBanner } from './_FeatureShell';
import { useAppStore } from '@/store/useAppStore';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const HASHTAGS = [
  { tag: '#brunch',       count: 24, cat: 'food'    as const },
  { tag: '#footy',        count: 18, cat: 'sports'  as const },
  { tag: '#studybuddies', count: 31, cat: 'work'    as const },
  { tag: '#trek',         count: 12, cat: 'explore' as const },
  { tag: '#coffee',       count: 47, cat: 'chai'    as const },
  { tag: '#walk',         count: 22, cat: 'walk'    as const },
  { tag: '#cricket',      count: 9,  cat: 'sports'  as const },
  { tag: '#shopping',     count: 14, cat: 'shopping'as const },
];

export default function HashtagsPage() {
  const navigate = useNavigate();
  const { requests } = useAppStore();
  const [followed, setFollowed] = useState<string[]>(['#coffee', '#brunch']);
  const [selected, setSelected] = useState<string | null>(null);

  const toggle = (tag: string) =>
    setFollowed(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const feed = useMemo(() => {
    if (!selected) return [];
    const meta = HASHTAGS.find(h => h.tag === selected);
    if (!meta) return [];
    return requests.filter(r => r.category === meta.cat).slice(0, 12);
  }, [selected, requests]);

  return (
    <FeatureShell
      title="Hashtag Feeds"
      hero={{ icon: 'tw:megaphone', label: `${followed.length} followed`, sub: 'Curated streams by interest', tone: 'accent' }}
    >
      <PrototypeBanner />

      {selected ? (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-bold">{selected}</h2>
            <Button size="sm" variant="outline" onClick={() => setSelected(null)}>Back</Button>
          </div>
          <div className="space-y-2">
            {feed.length === 0 ? (
              <p className="text-[12px] text-muted-foreground text-center py-8">Nothing in this feed right now</p>
            ) : feed.map((r) => (
              <button key={r.id} onClick={() => navigate(`/request/${r.id}`)}
                className="w-full liquid-glass-interactive flex items-center gap-3 p-3.5 text-left">
                <CategoryIcon category={r.category} size="sm" className="liquid-glass shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold truncate">{r.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">📍 {r.location.name}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {HASHTAGS.map((h) => {
            const isFollowed = followed.includes(h.tag);
            return (
              <div key={h.tag} className="liquid-glass rounded-[1rem] p-3.5 flex flex-col gap-2">
                <button onClick={() => setSelected(h.tag)} className="text-left tap-scale">
                  <div className="flex items-center gap-2 mb-1">
                    <CategoryIcon category={h.cat} size="sm" className="!w-7 !h-7" />
                    <p className="text-[13px] font-bold truncate">{h.tag}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{h.count} active plans</p>
                </button>
                <button onClick={() => toggle(h.tag)}
                  className={cn(
                    'h-7 rounded-full text-[11px] font-bold transition-all',
                    isFollowed ? 'bg-foreground text-background' : 'liquid-glass'
                  )}>
                  {isFollowed ? '✓ Following' : '+ Follow'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </FeatureShell>
  );
}