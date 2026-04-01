import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAppStore } from '@/store/useAppStore';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { Button } from '@/components/ui/button';
import { AppIcon } from '@/components/icons/AppIcon';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import { format } from 'date-fns';

function usePeopleMet() {
  const { requests, joinedRequests, user } = useAppStore();
  const metPeople: { id: string; name: string; sharedPlans: { title: string; category: string; date: Date }[]; isActive: boolean; city: string }[] = [];
  const seen = new Set<string>();

  for (const req of requests) {
    const isJoined = joinedRequests.includes(req.id);
    const isHost = req.userId === user?.id;
    if (isJoined || isHost) {
      if (isJoined && req.userId !== user?.id && !seen.has(req.userId)) {
        seen.add(req.userId);
        metPeople.push({ id: req.userId, name: req.userName, sharedPlans: [{ title: req.title, category: req.category, date: new Date(req.createdAt) }], isActive: Math.random() > 0.5, city: req.location.name });
      }
      for (const p of req.participants) {
        if (p.id !== user?.id && !seen.has(p.id)) {
          seen.add(p.id);
          metPeople.push({ id: p.id, name: p.name, sharedPlans: [{ title: req.title, category: req.category, date: new Date(req.createdAt) }], isActive: Math.random() > 0.6, city: req.location.name });
        } else if (seen.has(p.id)) {
          metPeople.find(m => m.id === p.id)?.sharedPlans.push({ title: req.title, category: req.category, date: new Date(req.createdAt) });
        }
      }
    }
  }
  return metPeople;
}

export default function CirclePage() {
  const navigate = useNavigate();
  const peopleMet = usePeopleMet();
  const [search, setSearch] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current?.children) {
      gsap.fromTo(Array.from(listRef.current.children),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power3.out' }
      );
    }
  }, []);

  const filtered = peopleMet.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const activeNow = peopleMet.filter(p => p.isActive);

  return (
    <>
      <div className="mobile-container min-h-screen bg-background pb-28">
        <TopBar title="My Circle" hideChat showBack />

        <div className="px-5 pt-5 space-y-3">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="liquid-glass p-3 text-center">
              <p className="text-[18px] font-bold tabular-nums text-foreground">{peopleMet.length}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">Met</p>
            </div>
            <div className="liquid-glass p-3 text-center">
              <p className="text-[18px] font-bold tabular-nums text-foreground">{activeNow.length}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">Active now</p>
            </div>
            <div className="liquid-glass p-3 text-center">
              <p className="text-[18px] font-bold tabular-nums text-foreground">
                {peopleMet.reduce((n, p) => n + p.sharedPlans.length, 0)}
              </p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">Plans shared</p>
            </div>
          </div>

          {/* Active now strip */}
          {activeNow.length > 0 && (
            <div className="liquid-glass-heavy p-4">
              <h3 className="section-label mb-3">🟢 Active now</h3>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                {activeNow.slice(0, 6).map((person) => (
                  <div key={person.id} className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className="relative">
                      <GradientAvatar name={person.name} size={42} />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success border-2 border-background" />
                    </div>
                    <p className="text-[10px] font-semibold text-foreground max-w-[44px] text-center truncate">
                      {person.name.split(' ')[0]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          {peopleMet.length > 3 && (
            <div className="relative">
              <AppIcon name="fc:search" size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your circle…"
                className="w-full h-10 bg-transparent liquid-glass rounded-[0.875rem] pl-9 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground/40 outline-none border-none" />
            </div>
          )}

          {/* People list */}
          {peopleMet.length > 0 ? (
            <div ref={listRef} className="space-y-2">
              {filtered.map((person) => {
                const lastPlan = person.sharedPlans[person.sharedPlans.length - 1];
                return (
                  <div key={person.id} className="liquid-glass-heavy p-3.5 flex items-center gap-3">
                    <div className="relative shrink-0">
                      <GradientAvatar name={person.name} size={44} />
                      {person.isActive && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success border-2 border-background" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[13px] font-bold text-foreground truncate">{person.name}</p>
                        {person.sharedPlans.length > 1 && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/8 text-primary">
                            ×{person.sharedPlans.length}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <CategoryIcon category={lastPlan.category as any} size="sm" className="!w-4 !h-4 !rounded-md bg-transparent" />
                        <p className="text-[11px] text-muted-foreground truncate">{lastPlan.title}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <AppIcon name="fc:globe" size={9} className="text-muted-foreground/40 shrink-0" />
                        <p className="text-[10px] text-muted-foreground/50">{person.city} · {format(lastPlan.date, 'MMM d')}</p>
                      </div>
                    </div>
                    <button onClick={() => navigate(`/host/${person.id}`)}
                      className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center shrink-0 tap-scale">
                      <AppIcon name="fc:conference-call" size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
          <div className="text-center py-16">
              <div className="w-14 h-14 rounded-[1.25rem] liquid-glass flex items-center justify-center mx-auto mb-4">
                <AppIcon name="fc:conference-call" size={26} className="opacity-40" />
              </div>
              <p className="text-[15px] font-bold text-foreground mb-1.5 tracking-tight">No one yet</p>
              <p className="text-[13px] text-muted-foreground mb-6">Join a plan to start meeting people</p>
              <Button onClick={() => navigate('/home')} size="sm">Browse plans</Button>
            </div>
          )}

          {/* Invite CTA */}
          {peopleMet.length > 0 && (
            <button onClick={() => navigate('/invite')}
              className="w-full liquid-glass-interactive flex items-center gap-3 px-4 py-3.5 text-left">
              <AppIcon name="fc:invite" size={16} className="text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-foreground tracking-tight">Invite real friends</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Earn credits for each referral</p>
              </div>
              <span className="text-muted-foreground/30">›</span>
            </button>
          )}
        </div>
      </div>
      <BottomNav />
    </>
  );
}
