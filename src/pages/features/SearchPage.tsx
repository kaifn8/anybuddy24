import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FeatureShell, PrototypeBanner } from './_FeatureShell';
import { useAppStore } from '@/store/useAppStore';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import { AppIcon } from '@/components/icons/AppIcon';
import { cn } from '@/lib/utils';

const SUGGESTIONS = ['chai', 'walk', 'food', 'sports', 'work', 'explore', 'casual'];
const RECENT_SEED = ['Bandra coffee', 'Marine Drive walk', 'Powai badminton'];
const TRENDING = ['#brunch', '#footy', '#studybuddies', '#trek', '#coffee'];

export default function SearchPage() {
  const navigate = useNavigate();
  const { requests } = useAppStore();
  const [q, setQ] = useState('');
  const [recent, setRecent] = useState<string[]>(RECENT_SEED);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const s = q.toLowerCase();
    return requests.filter(r =>
      r.title.toLowerCase().includes(s) ||
      r.location.name.toLowerCase().includes(s) ||
      r.category.toLowerCase().includes(s)
    ).slice(0, 20);
  }, [q, requests]);

  const submit = (term: string) => {
    setQ(term);
    if (term && !recent.includes(term)) {
      setRecent([term, ...recent].slice(0, 5));
    }
  };

  return (
    <FeatureShell title="Search" hero={undefined}>
      <PrototypeBanner />

      <div className="relative">
        <AppIcon name="fc:search" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-60" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit(q)}
          placeholder="Search by mood, vibe, or hashtag…"
          className="w-full h-12 liquid-glass rounded-[0.875rem] pl-11 pr-12 text-[14px] outline-none border-none bg-transparent"
        />
        {q && (
          <button onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full liquid-glass flex items-center justify-center">
            <AppIcon name="fc:cancel" size={12} />
          </button>
        )}
      </div>

      {!q.trim() ? (
        <>
          <div>
            <p className="section-label mb-2 px-1">Trending hashtags</p>
            <div className="flex flex-wrap gap-1.5">
              {TRENDING.map((h) => (
                <button key={h} onClick={() => submit(h)}
                  className="px-3 py-1.5 rounded-full liquid-glass text-[12px] font-semibold text-primary tap-scale">
                  {h}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="section-label mb-2 px-1">Quick filters</p>
            <div className="grid grid-cols-4 gap-2">
              {SUGGESTIONS.map((c) => (
                <button key={c} onClick={() => submit(c)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-[0.875rem] liquid-glass tap-scale">
                  <CategoryIcon category={c as any} size="md" className="!w-8 !h-8" />
                  <span className="text-[10px] font-semibold capitalize">{c}</span>
                </button>
              ))}
            </div>
          </div>

          {recent.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="section-label">Recent</p>
                <button onClick={() => setRecent([])} className="text-[11px] text-destructive font-semibold">Clear</button>
              </div>
              <div className="space-y-1">
                {recent.map((r) => (
                  <button key={r} onClick={() => submit(r)}
                    className="w-full flex items-center gap-2.5 p-3 rounded-[0.875rem] liquid-glass tap-scale text-left">
                    <AppIcon name="fc:clock" size={14} className="opacity-60" />
                    <span className="text-[12px] flex-1">{r}</span>
                    <span className="text-muted-foreground/40">↗</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div>
          <p className="text-[11px] text-muted-foreground px-1 mb-2">
            {results.length} {results.length === 1 ? 'result' : 'results'} for “{q}”
          </p>
          <div className="space-y-2">
            {results.length === 0 ? (
              <div className="text-center py-12 liquid-glass rounded-[1rem]">
                <p className="text-[14px] font-bold mb-1">No matches</p>
                <p className="text-[12px] text-muted-foreground">Try a different word or hashtag</p>
              </div>
            ) : results.map((r) => (
              <button key={r.id} onClick={() => navigate(`/request/${r.id}`)}
                className="w-full liquid-glass-interactive flex items-center gap-3 p-3.5 text-left">
                <CategoryIcon category={r.category} size="sm" className="liquid-glass shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold truncate">{r.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">📍 {r.location.name} · {r.location.distance}km</p>
                </div>
                <span className="text-muted-foreground/40">›</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </FeatureShell>
  );
}