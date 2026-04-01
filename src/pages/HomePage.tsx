import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageTransition } from '@/components/layout/PageTransition';
import { RequestCard } from '@/components/cards/RequestCard';
import { JoinConfirmDialog } from '@/components/JoinConfirmDialog';
import { useAppStore } from '@/store/useAppStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { cn } from '@/lib/utils';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import { AppIcon } from '@/components/icons/AppIcon';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import type { Category, Request, Gender } from '@/types/anybuddy';

const FILTERS: { id: Category | 'all'; label: string }[] = [
  { id: 'all',     label: 'All'     },
  { id: 'chai',    label: 'Coffee'  },
  { id: 'sports',  label: 'Sports'  },
  { id: 'food',    label: 'Food'    },
  { id: 'explore', label: 'Explore' },
  { id: 'work',    label: 'Cowork'  },
  { id: 'walk',    label: 'Walk'    },
  { id: 'help',    label: 'Help'    },
  { id: 'casual',  label: 'Chill'   },
];

const QUICK_CREATE: { title: string; category: Category }[] = [
  { title: 'Coffee',  category: 'chai'    },
  { title: 'Walk',    category: 'walk'    },
  { title: 'Food',    category: 'food'    },
  { title: 'Sports',  category: 'sports'  },
];

import type { AppIconName } from '@/components/icons/AppIcon';

const GENDER_FILTERS: { id: 'any' | Gender; label: string; icon: AppIconName }[] = [
  { id: 'any',    label: 'Anyone', icon: 'tw:people' },
  { id: 'male',   label: 'Men',    icon: 'tw:man'    },
  { id: 'female', label: 'Women',  icon: 'tw:woman'  },
];

const RADIUS_OPTIONS = [1, 2, 5, 10];

export default function HomePage() {
  const navigate = useNavigate();
  const { requests, joinedRequests, joinRequest, updateCredits, refreshFeed, user, isOnboarded } = useAppStore();
  const { addXP, recordActivity, progressQuest } = useGamificationStore();
  const [activeFilter, setActiveFilter] = useState<Category | 'all'>('all');
  const [genderFilter, setGenderFilter] = useState<'any' | Gender>('any');
  const [radiusKm, setRadiusKm] = useState(5);
  const [showFilters, setShowFilters] = useState(false);
  const [confirmRequest, setConfirmRequest] = useState<Request | null>(null);

  const cardsRef = useRef<HTMLDivElement>(null);
  const trendingRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userInteractedRef = useRef(false);
  const filterPanelRef = useRef<HTMLDivElement>(null);

  // Guard: redirect to onboarding if not onboarded
  useEffect(() => {
    if (!isOnboarded) navigate('/onboarding', { replace: true });
  }, [isOnboarded, navigate]);

  useEffect(() => {
    const el = cardsRef.current;
    if (!el) return;
    const children = Array.from(el.children);
    if (children.length === 0) return;
    gsap.fromTo(children,
      { opacity: 0, y: 20, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out', stagger: 0.07, clearProps: 'transform' }
    );
  }, [activeFilter, genderFilter, radiusKm]);

  useEffect(() => {
    if (filterPanelRef.current) {
      if (showFilters) {
        gsap.fromTo(filterPanelRef.current,
          { opacity: 0, y: -8, scaleY: 0.95 },
          { opacity: 1, y: 0, scaleY: 1, duration: 0.22, ease: 'power2.out' }
        );
      }
    }
  }, [showFilters]);

  useEffect(() => {
    const container = trendingRef.current;
    if (!container) return;
    let resumeTimeout: ReturnType<typeof setTimeout>;
    const startAutoScroll = () => {
      autoScrollRef.current = setInterval(() => {
        if (userInteractedRef.current) return;
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (maxScroll <= 0) return;
        const nextScroll = container.scrollLeft + 140;
        container.scrollTo({ left: nextScroll >= maxScroll ? 0 : nextScroll, behavior: 'smooth' });
      }, 9000);
    };
    const handleInteraction = () => {
      userInteractedRef.current = true;
      clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(() => { userInteractedRef.current = false; }, 15000);
    };
    container.addEventListener('touchstart', handleInteraction, { passive: true });
    container.addEventListener('mousedown', handleInteraction);
    container.addEventListener('scroll', handleInteraction, { passive: true });
    startAutoScroll();
    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
      clearTimeout(resumeTimeout);
      container.removeEventListener('touchstart', handleInteraction);
      container.removeEventListener('mousedown', handleInteraction);
      container.removeEventListener('scroll', handleInteraction);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => refreshFeed(), 20000);
    return () => clearInterval(interval);
  }, [refreshFeed]);

  const handleJoin = (request: Request) => {
    if (!user) { navigate('/signup'); return; }
    if (joinedRequests.includes(request.id)) { navigate(`/request/${request.id}`); return; }
    setConfirmRequest(request);
  };

  const handleConfirmJoin = () => {
    if (!confirmRequest) return;
    joinRequest(confirmRequest.id);
    updateCredits(0.5, 'Joined a request');
    addXP('join_hangout', 'Joined a hangout');
    recordActivity();
    progressQuest('join_1_activity');
    setConfirmRequest(null);
    navigate(`/request/${confirmRequest.id}`);
  };

  // Auto-expire plans past their expiry time in the UI
  const activeRequests = requests.filter(r => {
    if (r.status !== 'active') return false;
    if (new Date(r.expiresAt) < new Date()) return false;
    return true;
  });

  const filtered = [...activeRequests]
    .filter(r => activeFilter === 'all' || r.category === activeFilter)
    .filter(r => r.location.distance <= radiusKm)
    .filter(r => {
      if (genderFilter === 'any') return true;
      return r.userGender === genderFilter;
    })
    .sort((a, b) => {
      const order = { now: 0, today: 1, week: 2 };
      return order[a.urgency] !== order[b.urgency]
        ? order[a.urgency] - order[b.urgency]
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const hasActiveFilters = genderFilter !== 'any' || radiusKm !== 5 || activeFilter !== 'all';

  const trending = [...activeRequests]
    .sort((a, b) => b.seatsTaken - a.seatsTaken)
    .slice(0, 5);

  const livePlans = filtered.filter(r => r.urgency === 'now').slice(0, 3);
  const recentlyHappened = [...requests].filter(r => r.status === 'completed').slice(0, 4);

  return (
    <>
      <PageTransition className="mobile-container min-h-screen bg-background pb-28 lg:pb-8">
        <div className="lg:hidden">
          <TopBar />
        </div>

        <div className="hidden lg:flex items-center justify-between px-6 pt-5 pb-3">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              {user ? `Hey ${user.firstName} 👋` : 'Discover plans nearby'}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">What are you up to today?</p>
          </div>
          <Button onClick={() => navigate('/create')}
            className="hidden lg:flex items-center gap-2 px-5 text-sm rounded-[1rem]">
            ✨ Post a plan
          </Button>
        </div>

        {/* Trending */}
        {trending.length > 0 && (
          <div className="pt-4 mb-1">
            <div className="px-4 mb-2.5">
              <h3 className="text-[13px] font-bold text-foreground tracking-tight">🚀 Filling up fast</h3>
            </div>
            <div ref={trendingRef} className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-3 snap-x snap-mandatory lg:flex-wrap">
              {trending.map((req) => {
                const seatsLeft = req.seatsTotal - req.seatsTaken;
                return (
                  <button key={req.id} onClick={() => navigate(`/request/${req.id}`)}
                    className="shrink-0 liquid-glass-trending tap-scale min-w-[196px] max-w-[220px] text-left relative overflow-hidden snap-start">
                    <div className="absolute inset-0 opacity-[0.04]"
                      style={{ background: `radial-gradient(ellipse at 20% 10%, hsl(var(--primary)), transparent 70%)` }} />
                    <div className="relative z-10 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <CategoryIcon category={req.category} size="sm" className="liquid-glass" />
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full liquid-glass">
                          <span className="w-[5px] h-[5px] rounded-full bg-success animate-pulse" />
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.08em]">Live</span>
                        </div>
                      </div>
                      <h4 className="text-[13px] font-bold text-foreground leading-snug truncate mb-1 tracking-tight">{req.title}</h4>
                      <p className="text-[11px] text-muted-foreground mb-4 truncate">📍 {req.location.name}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {[req.userName, ...req.participants.map(p => p.name)].slice(0, 3).map((name, j) => (
                            <GradientAvatar key={j} name={name} size={22} className="border-[1.5px] border-background" showInitials={false} />
                          ))}
                        </div>
                        <span className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded-full',
                          seatsLeft <= 1 ? 'text-destructive bg-destructive/10' : 'text-muted-foreground liquid-glass'
                        )}>
                          {seatsLeft === 0 ? 'Full' : `${seatsLeft} left`}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Category filters + filter toggle */}
        <div className="px-4 pb-1">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-hide">
              {FILTERS.map((cat) => (
                  <button key={cat.id} onClick={() => setActiveFilter(cat.id)}
                    className={cn('shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold tap-scale transition-all flex items-center gap-1.5',
                      activeFilter === cat.id ? 'glass-pill-active' : 'glass-pill-inactive'
                    )}>
                    {cat.id === 'all'
                      ? <AppIcon name="se:fire" size={13} />
                      : <CategoryIcon category={cat.id as import('@/types/anybuddy').Category} size="sm" className="!w-4 !h-4 !rounded-md bg-transparent" />
                    }
                    <span>{cat.label}</span>
                  </button>
              ))}
            </div>
            {/* Filter toggle button */}
            <button
              onClick={() => setShowFilters(v => !v)}
              className={cn(
                'shrink-0 w-8 h-8 rounded-full flex items-center justify-center tap-scale transition-all',
                showFilters || hasActiveFilters
                  ? 'bg-primary text-primary-foreground'
                  : 'liquid-glass text-muted-foreground'
              )}>
              {showFilters ? <AppIcon name="fc:cancel" size={13} /> : <AppIcon name="fc:settings" size={13} />}
            </button>
          </div>
        </div>

        {/* Expandable filter panel */}
        {showFilters && (
          <div ref={filterPanelRef} className="mx-4 mb-2 liquid-glass rounded-[1rem] p-3.5 space-y-3">
            {/* Gender filter */}
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Host gender</p>
              <div className="flex gap-1.5">
                {GENDER_FILTERS.map((g) => (
                  <button key={g.id} onClick={() => setGenderFilter(g.id)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-[11px] font-semibold tap-scale transition-all',
                      genderFilter === g.id ? 'glass-pill-active' : 'glass-pill-inactive'
                    )}>
                    <AppIcon name={g.icon} size={13} />
                    <span>{g.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Radius filter */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Radius</p>
                <p className="text-[11px] font-bold text-primary">{radiusKm} km</p>
              </div>
              <div className="flex gap-1.5">
                {RADIUS_OPTIONS.map((r) => (
                  <button key={r} onClick={() => setRadiusKm(r)}
                    className={cn(
                      'flex-1 py-1.5 rounded-full text-[11px] font-semibold tap-scale transition-all',
                      radiusKm === r ? 'glass-pill-active' : 'glass-pill-inactive'
                    )}>
                    {r} km
                  </button>
                ))}
              </div>
            </div>
            {/* Reset */}
            {hasActiveFilters && (
              <Button onClick={() => { setGenderFilter('any'); setRadiusKm(5); setActiveFilter('all'); setShowFilters(false); }}
                variant="link" className="w-full text-[11px] text-destructive h-auto py-0.5">
                Reset filters
              </Button>
            )}
          </div>
        )}

        {/* Live right now strip */}
        {livePlans.length > 0 && (
          <div className="px-4 pt-1 pb-2">
            <h3 className="section-label mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
              Live right now
            </h3>
            <div className="space-y-1.5">
              {livePlans.map((req) => (
                <button key={req.id} onClick={() => navigate(`/request/${req.id}`)}
                  className="w-full liquid-glass-interactive flex items-center gap-3 p-3 text-left" style={{ borderRadius: '0.875rem' }}>
                  <CategoryIcon category={req.category} size="sm" className="liquid-glass shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-foreground truncate tracking-tight">{req.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">📍 {req.location.name} · {req.location.distance}km</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] font-bold text-destructive">Now</p>
                    <p className="text-[10px] text-muted-foreground">{req.seatsTotal - req.seatsTaken} left</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Feed header */}
        <div className="px-4 pt-2 pb-1.5 flex items-center justify-between">
          <h3 className="section-label">
            {activeFilter === 'all' ? 'All plans' : FILTERS.find(f => f.id === activeFilter)?.label}
            <span className="ml-1.5 normal-case font-normal text-[10px] text-muted-foreground/50">
              · within {radiusKm} km
            </span>
          </h3>
          {filtered.length > 0 && (
            <span className="text-[10px] font-semibold text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">
              {filtered.length}
            </span>
          )}
        </div>

        {/* Feed grid */}
        <div ref={cardsRef} className="px-4 space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 xl:grid-cols-3">
          {filtered.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              isJoined={joinedRequests.includes(request.id)}
              onJoin={() => handleJoin(request)}
              onView={() => navigate(`/request/${request.id}`)}
            />
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full pt-10 text-center px-4">
              <div className="w-14 h-14 rounded-[1.25rem] liquid-glass flex items-center justify-center mx-auto mb-4">
                <AppIcon name="se:casual" size={28} />
              </div>
              <p className="text-[15px] font-semibold text-foreground mb-1.5 tracking-tight">Nothing here yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                {hasActiveFilters ? 'Try adjusting your filters' : 'Be the first to post — someone\'s probably free.'}
              </p>
              {hasActiveFilters && (
                <Button onClick={() => { setGenderFilter('any'); setRadiusKm(5); setActiveFilter('all'); }}
                  variant="link" className="text-[12px] h-auto mb-4">
                  Clear filters →
                </Button>
              )}
              <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                {QUICK_CREATE.map((s, i) => (
                  <button key={i} onClick={() => navigate('/create')}
                    className="liquid-glass-interactive p-3.5 text-left flex items-center gap-2.5">
                    <CategoryIcon category={s.category} size="sm" className="liquid-glass shrink-0" />
                    <span className="text-[12px] font-semibold tracking-tight">{s.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recently happened */}
        {filtered.length > 0 && recentlyHappened.length > 0 && (
          <div className="px-4 mt-6">
            <h3 className="section-label mb-2.5">🕐 Recently happened</h3>
            <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
              {recentlyHappened.map((req) => (
                <button key={req.id} onClick={() => navigate(`/request/${req.id}`)}
                  className="shrink-0 liquid-glass px-3.5 py-2.5 flex items-center gap-2 opacity-55 tap-scale"
                  style={{ borderRadius: '0.875rem', minWidth: '180px' }}>
                  <CategoryIcon category={req.category} size="sm" />
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-foreground truncate">{req.title}</p>
                    <p className="text-[10px] text-muted-foreground">📍 {req.location.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Start something strip */}
        {filtered.length > 0 && (
          <div className="px-4 mt-4 mb-2">
            <h3 className="section-label mb-2.5">Start something</h3>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
              {QUICK_CREATE.map((s, i) => (
                <button key={i} onClick={() => navigate('/create')}
                  className="shrink-0 liquid-glass-interactive px-3.5 py-2.5 flex items-center gap-2" style={{ borderRadius: '0.875rem' }}>
                  <CategoryIcon category={s.category} size="sm" className="!w-6 !h-6 !rounded-lg bg-transparent" />
                  <span className="text-[12px] font-semibold tracking-tight">{s.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {confirmRequest && (
          <JoinConfirmDialog open={!!confirmRequest} onClose={() => setConfirmRequest(null)} onConfirm={handleConfirmJoin} request={confirmRequest} />
        )}
      </PageTransition>
      <BottomNav />
    </>
  );
}
