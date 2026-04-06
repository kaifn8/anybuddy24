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
import type { AppIconName } from '@/components/icons/AppIcon';

const FILTERS: { id: Category | 'all'; label: string }[] = [
  { id: 'all',     label: 'All'     },
  { id: 'chai',    label: 'Coffee'  },
  { id: 'sports',  label: 'Sports'  },
  { id: 'food',    label: 'Food'    },
  { id: 'explore', label: 'Explore' },
  { id: 'work',    label: 'Cowork'  },
  { id: 'walk',    label: 'Walk'    },
  { id: 'casual',  label: 'Chill'   },
];

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
  const filterPanelRef = useRef<HTMLDivElement>(null);

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
    if (filterPanelRef.current && showFilters) {
      gsap.fromTo(filterPanelRef.current,
        { opacity: 0, y: -8, scaleY: 0.95 },
        { opacity: 1, y: 0, scaleY: 1, duration: 0.22, ease: 'power2.out' }
      );
    }
  }, [showFilters]);

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

  const activeRequests = requests.filter(r => {
    if (r.status !== 'active') return false;
    if (new Date(r.expiresAt) < new Date()) return false;
    return true;
  });

  const filtered = [...activeRequests]
    .filter(r => activeFilter === 'all' || r.category === activeFilter)
    .filter(r => r.location.distance <= radiusKm)
    .filter(r => genderFilter === 'any' || r.userGender === genderFilter)
    .sort((a, b) => {
      const order = { now: 0, today: 1, week: 2 };
      return order[a.urgency] !== order[b.urgency]
        ? order[a.urgency] - order[b.urgency]
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const hasActiveFilters = genderFilter !== 'any' || radiusKm !== 5 || activeFilter !== 'all';

  // PRD sections
  const heroFeatured = filtered[0];
  const startingSoon = filtered.filter(r => r.urgency === 'now').slice(0, 5);
  const nearbyPlans = filtered.filter(r => r !== heroFeatured);

  return (
    <>
      <PageTransition className="mobile-container min-h-screen bg-background pb-nav lg:pb-8">
        <div className="lg:hidden">
          <TopBar
            leftContent={
              <div className="flex items-center gap-1.5">
                <span className="relative flex items-center justify-center">
                  <span className="w-[5px] h-[5px] rounded-full bg-success" />
                  <span className="absolute w-[5px] h-[5px] rounded-full bg-success animate-ping opacity-50" />
                </span>
                <span className="text-[10px] font-bold text-success tracking-wide">
                  {requests.filter(r => r.status === 'active').length} live
                </span>
              </div>
            }
            rightAction={
              <button onClick={() => navigate('/chats')} className="relative tap-scale w-10 h-10 rounded-full flex items-center justify-center" style={{
                background: 'hsla(var(--glass-bg) / 0.5)',
                backdropFilter: 'blur(16px)',
                border: '0.5px solid hsla(var(--glass-border) / 0.4)',
              }}>
                <AppIcon name="tw:chat" size={18} />
              </button>
            }
          />
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

        {/* ── Hero Featured Plan ── */}
        {heroFeatured && (
          <div className="px-4 pt-4 pb-2">
            <button onClick={() => navigate(`/request/${heroFeatured.id}`)}
              className="w-full relative overflow-hidden rounded-3xl tap-scale text-left"
              style={{
                background: 'linear-gradient(145deg, hsl(var(--primary) / 0.12), hsl(var(--accent) / 0.08))',
                border: '0.5px solid hsl(var(--primary) / 0.2)',
              }}>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 text-primary">
                    <span className="w-[5px] h-[5px] rounded-full bg-primary animate-pulse" /> Featured
                  </span>
                  {heroFeatured.urgency === 'now' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-warning/10 text-warning">
                      ⚡ Starting soon
                    </span>
                  )}
                </div>
                <div className="flex items-start gap-3 mb-4">
                  <CategoryIcon category={heroFeatured.category} size="lg" className="shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-[17px] font-bold text-foreground leading-snug mb-1 tracking-tight">{heroFeatured.title}</h2>
                    <p className="text-[12px] text-muted-foreground flex items-center gap-1">
                      📍 {heroFeatured.location.name} · {heroFeatured.location.distance} km
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      {[heroFeatured.userName, ...heroFeatured.participants.map(p => p.name)].slice(0, 4).map((name, i) => (
                        <GradientAvatar key={i} name={name} size={24} className="border-[1.5px] border-background" showInitials={false} />
                      ))}
                    </div>
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {heroFeatured.seatsTaken} joined · {heroFeatured.seatsTotal - heroFeatured.seatsTaken} left
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <GradientAvatar name={heroFeatured.userName} size={18} showInitials={false} />
                    <span className="text-[11px] text-muted-foreground font-medium">{heroFeatured.userName}</span>
                    {heroFeatured.userReliability && (
                      <span className="text-[10px] text-muted-foreground/60">⭐ {heroFeatured.userReliability}%</span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* ── Starting Soon ── */}
        {startingSoon.length > 0 && (
          <div className="pt-3 pb-1">
            <div className="px-4 mb-2.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
              <h3 className="text-[13px] font-bold text-foreground tracking-tight">Starting Soon</h3>
              <span className="ml-auto text-[10px] font-semibold text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">{startingSoon.length}</span>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-3 snap-x snap-mandatory">
              {startingSoon.map((req) => {
                const seatsLeft = req.seatsTotal - req.seatsTaken;
                return (
                  <button key={req.id} onClick={() => navigate(`/request/${req.id}`)}
                    className="shrink-0 liquid-glass-trending tap-scale min-w-[196px] max-w-[220px] text-left relative overflow-hidden snap-start">
                    <div className="absolute inset-0 opacity-[0.04]"
                      style={{ background: `radial-gradient(ellipse at 20% 10%, hsl(var(--primary)), transparent 70%)` }} />
                    <div className="relative z-10 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <CategoryIcon category={req.category} size="sm" className="liquid-glass" />
                        <span className="text-[9px] font-bold text-warning bg-warning/10 px-2 py-0.5 rounded-full">⚡ Now</span>
                      </div>
                      <h4 className="text-[13px] font-bold text-foreground leading-snug truncate mb-1 tracking-tight">{req.title}</h4>
                      <p className="text-[11px] text-muted-foreground mb-3 truncate">📍 {req.location.name} · {req.location.distance}km</p>
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

        {/* ── Category filters ── */}
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
                    : <CategoryIcon category={cat.id as Category} size="sm" className="!w-4 !h-4 !rounded-md bg-transparent" />
                  }
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
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
            {hasActiveFilters && (
              <Button onClick={() => { setGenderFilter('any'); setRadiusKm(5); setActiveFilter('all'); setShowFilters(false); }}
                variant="link" className="w-full text-[11px] text-destructive h-auto py-0.5">
                Reset filters
              </Button>
            )}
          </div>
        )}

        {/* ── Nearby Plans header ── */}
        <div className="px-4 pt-2 pb-1.5 flex items-center justify-between">
          <h3 className="section-label">
            Nearby Plans
            <span className="ml-1.5 normal-case font-normal text-[10px] text-muted-foreground/50">
              · within {radiusKm} km
            </span>
          </h3>
          {nearbyPlans.length > 0 && (
            <span className="text-[10px] font-semibold text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">
              {nearbyPlans.length}
            </span>
          )}
        </div>

        {/* ── Feed grid ── */}
        <div ref={cardsRef} className="px-4 space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 xl:grid-cols-3">
          {nearbyPlans.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              isJoined={joinedRequests.includes(request.id)}
              onJoin={() => handleJoin(request)}
              onView={() => navigate(`/request/${request.id}`)}
            />
          ))}

          {nearbyPlans.length === 0 && (
            <div className="col-span-full pt-10 text-center px-4">
              <div className="w-14 h-14 rounded-[1.25rem] liquid-glass flex items-center justify-center mx-auto mb-4">
                <AppIcon name="se:casual" size={28} />
              </div>
              <p className="text-[15px] font-semibold text-foreground mb-1.5 tracking-tight">Nothing nearby yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                {hasActiveFilters ? 'Try adjusting your filters' : 'Be the first — tap "I\'m Free" to get started!'}
              </p>
              {hasActiveFilters ? (
                <Button onClick={() => { setGenderFilter('any'); setRadiusKm(5); setActiveFilter('all'); }}
                  variant="link" className="text-[12px] h-auto mb-4">
                  Clear filters →
                </Button>
              ) : (
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => navigate('/free-now')} className="gap-1.5">
                    ⚡ I'm Free Now
                  </Button>
                  <Button onClick={() => navigate('/create')} variant="outline">
                    Create Plan
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {confirmRequest && (
          <JoinConfirmDialog open={!!confirmRequest} onClose={() => setConfirmRequest(null)} onConfirm={handleConfirmJoin} request={confirmRequest} />
        )}
      </PageTransition>

      {/* Floating "I'm Free Now" FAB (mobile only) */}
      <button
        onClick={() => navigate('/free-now')}
        className="lg:hidden fixed bottom-24 right-4 z-40 tap-scale group"
      >
        <div className="h-12 px-5 rounded-full flex items-center gap-2 shadow-lg transition-transform group-active:scale-90"
          style={{
            background: 'linear-gradient(145deg, hsl(var(--primary)) 0%, hsl(211 100% 40%) 100%)',
            boxShadow: '0 4px 20px hsl(var(--primary) / 0.35), inset 0 1px 0 hsla(0 0% 100% / 0.2)',
          }}>
          <span className="text-base">⚡</span>
          <span className="text-[13px] font-bold text-white">I'm Free</span>
        </div>
      </button>

      <BottomNav />
    </>
  );
}
