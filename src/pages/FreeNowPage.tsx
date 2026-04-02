import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { PageTransition } from '@/components/layout/PageTransition';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { AppIcon } from '@/components/icons/AppIcon';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { Category, Request } from '@/types/anybuddy';

const MOODS: { emoji: string; label: string; category: Category }[] = [
  { emoji: '☕', label: 'Coffee',     category: 'chai' },
  { emoji: '🚶', label: 'Walk',       category: 'walk' },
  { emoji: '🍕', label: 'Food',       category: 'food' },
  { emoji: '🧭', label: 'Explore',    category: 'explore' },
  { emoji: '🏃', label: 'Sports',     category: 'sports' },
  { emoji: '😎', label: 'Chill',      category: 'casual' },
];

type Phase = 'pick' | 'searching' | 'results';

const FreeNowPage = () => {
  const navigate = useNavigate();
  const { requests } = useAppStore();
  const [selected, setSelected] = useState<Category[]>([]);
  const [phase, setPhase] = useState<Phase>('pick');
  const [matches, setMatches] = useState<Request[]>([]);
  const resultsRef = useRef<HTMLDivElement>(null);

  const toggleCategory = (cat: Category) => {
    setSelected(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const handleFind = () => {
    setPhase('searching');
    // Simulate matching — find plans starting within 90 min, close, non-full
    setTimeout(() => {
      const now = Date.now();
      const matched = requests
        .filter(r => r.status === 'active')
        .filter(r => new Date(r.expiresAt).getTime() > now)
        .filter(r => {
          const minsToStart = (new Date(r.when).getTime() - now) / 60000;
          return minsToStart <= 90;
        })
        .filter(r => r.seatsTotal - r.seatsTaken > 0)
        .filter(r => selected.length === 0 || selected.includes(r.category))
        .sort((a, b) => a.location.distance - b.location.distance)
        .slice(0, 5);
      setMatches(matched);
      setPhase('results');
    }, 1500);
  };

  useEffect(() => {
    if (phase === 'results' && resultsRef.current) {
      gsap.fromTo(Array.from(resultsRef.current.children),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: 'power3.out' }
      );
    }
  }, [phase]);

  return (
    <PageTransition>
      <div className="mobile-container min-h-screen bg-background flex flex-col pb-28">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-4 pb-2">
          <button onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full flex items-center justify-center tap-scale hover:bg-muted/50">
            <span className="text-lg font-medium">←</span>
          </button>
          <h1 className="text-lg font-bold">I'm Free Now</h1>
        </div>

        {/* ── Pick mood ── */}
        {phase === 'pick' && (
          <div className="flex-1 flex flex-col px-5 pt-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h2 className="text-xl font-bold mb-1">What are you in the mood for?</h2>
              <p className="text-sm text-muted-foreground">Pick one or more, or skip to see everything nearby</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {MOODS.map(mood => (
                <button
                  key={mood.category}
                  onClick={() => toggleCategory(mood.category)}
                  className={cn(
                    'flex flex-col items-center gap-2 py-5 px-3 rounded-2xl tap-scale transition-all',
                    selected.includes(mood.category)
                      ? 'bg-primary/10 ring-2 ring-primary shadow-md'
                      : 'liquid-glass hover:shadow-md'
                  )}>
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-[12px] font-semibold">{mood.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-3 mt-auto pb-4">
              <Button className="w-full h-12" size="lg" onClick={handleFind}>
                ⚡ Find Plans Nearby
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => { setSelected([]); handleFind(); }}>
                Skip — show me everything
              </Button>
            </div>
          </div>
        )}

        {/* ── Searching animation ── */}
        {phase === 'searching' && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
              <div className="absolute inset-2 rounded-full border-4 border-primary/30 animate-ping" style={{ animationDelay: '0.3s' }} />
              <div className="absolute inset-4 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-3xl">🔍</span>
              </div>
            </div>
            <h2 className="text-lg font-bold mb-1">Finding plans nearby...</h2>
            <p className="text-sm text-muted-foreground">Looking for matches within 90 minutes</p>
          </div>
        )}

        {/* ── Results ── */}
        {phase === 'results' && (
          <div className="flex-1 px-5 pt-4 overflow-y-auto">
            {matches.length > 0 ? (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">🎉</span>
                  <h2 className="text-base font-bold">{matches.length} plan{matches.length !== 1 ? 's' : ''} found nearby!</h2>
                </div>
                <div ref={resultsRef} className="space-y-3">
                  {matches.map(req => {
                    const seatsLeft = req.seatsTotal - req.seatsTaken;
                    const minsToStart = Math.max(0, Math.round((new Date(req.when).getTime() - Date.now()) / 60000));
                    return (
                      <button key={req.id} onClick={() => navigate(`/request/${req.id}`)}
                        className="w-full liquid-glass-interactive p-4 text-left flex items-start gap-3 tap-scale">
                        <CategoryIcon category={req.category} size="md" className="shrink-0 liquid-glass" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[14px] font-bold text-foreground tracking-tight mb-1">{req.title}</h3>
                          <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground mb-2">
                            <span>📍 {req.location.name} · {req.location.distance}km</span>
                            <span>⏰ {minsToStart <= 0 ? 'Now' : `In ${minsToStart} min`}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-1.5">
                                {[req.userName, ...req.participants.map(p => p.name)].slice(0, 3).map((name, i) => (
                                  <GradientAvatar key={i} name={name} size={20} className="border-[1.5px] border-background" showInitials={false} />
                                ))}
                              </div>
                              <span className="text-[11px] text-muted-foreground">{seatsLeft} spot{seatsLeft !== 1 ? 's' : ''} left</span>
                            </div>
                            <span className="text-[11px] font-bold text-primary">Join →</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center pt-16">
                <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🤷</span>
                </div>
                <h2 className="text-lg font-bold mb-1">No matches right now</h2>
                <p className="text-sm text-muted-foreground mb-6">Why not start one? Someone might join in minutes.</p>
              </div>
            )}

            {/* Quick create fallback */}
            <div className="mt-6 pt-4" style={{ borderTop: '0.5px solid hsla(var(--glass-border))' }}>
              <h3 className="text-[13px] font-bold mb-3">Or start your own</h3>
              <Button className="w-full h-11 gap-2" onClick={() => navigate('/create')}>
                ✨ Create a Quick Plan
              </Button>
            </div>

            <div className="mt-4 mb-4">
              <Button variant="ghost" className="w-full text-sm" onClick={() => { setPhase('pick'); setSelected([]); }}>
                ← Try different preferences
              </Button>
            </div>
          </div>
        )}

        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default FreeNowPage;
