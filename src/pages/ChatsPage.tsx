import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { TopBar } from '@/components/layout/TopBar';
import { useAppStore } from '@/store/useAppStore';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow, format } from 'date-fns';
import { AppIcon } from '@/components/icons/AppIcon';
import { cn } from '@/lib/utils';
import type { Request } from '@/types/anybuddy';

// ── Circle helpers (same logic as CirclePage) ──────────────────────────────
function usePeopleMet() {
  const { requests, joinedRequests, user } = useAppStore();
  const metPeople: {
    id: string; name: string;
    sharedPlans: { title: string; category: string; date: Date }[];
    isActive: boolean; city: string;
  }[] = [];
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

// ── Chats tab ─────────────────────────────────────────────────────────────
function ChatsTab() {
  const navigate = useNavigate();
  const { requests, joinedRequests, chatMessages } = useAppStore();

  const chats: {
    request: Request;
    lastMessage?: { senderName: string; message: string; timestamp: Date };
    unread: number;
  }[] = joinedRequests
    .map((id) => requests.find((r) => r.id === id))
    .filter((r): r is Request => !!r)
    .map((request) => {
      const msgs = chatMessages[request.id] || [];
      const last = msgs.length > 0 ? msgs[msgs.length - 1] : undefined;
      const unread = msgs.filter(m => m.senderId !== 'me').length > 0 ? Math.floor(Math.random() * 3) : 0;
      return { request, lastMessage: last, unread };
    })
    .sort((a, b) => {
      const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0;
      const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0;
      return bTime - aTime;
    });

  const activeChats = chats.filter(c => c.request.status === 'active');
  const pastChats   = chats.filter(c => c.request.status !== 'active');

  if (chats.length === 0) {
    return (
      <div className="text-center pt-20 px-6">
        <div className="w-20 h-20 rounded-[1.5rem] liquid-glass flex items-center justify-center mx-auto mb-5">
          <AppIcon name="fc:comments" size={36} className="opacity-40" />
        </div>
        <h3 className="text-[18px] font-bold text-foreground mb-2 tracking-tight">No chats yet</h3>
        <p className="text-[13px] text-muted-foreground mb-8 leading-relaxed max-w-[240px] mx-auto">
          Join a plan to start chatting with people nearby
        </p>
        <Button onClick={() => navigate('/home')} className="w-full gap-2 max-w-[220px]">
          Browse plans →
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {activeChats.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <h3 className="section-label">Active plans</h3>
            <span className="ml-auto text-[10px] font-semibold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
              {activeChats.length}
            </span>
          </div>
          <div className="space-y-2">
            {activeChats.map(({ request, lastMessage, unread }) => (
              <button key={request.id} onClick={() => navigate(`/request/${request.id}`)}
                className="w-full liquid-glass-interactive flex items-center gap-3.5 p-4 text-left">
                <div className="relative shrink-0">
                  <CategoryIcon category={request.category} size="md" className="liquid-glass" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-[1.5px] border-background" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="text-[14px] font-bold text-foreground truncate tracking-tight">{request.title}</p>
                    {lastMessage && (
                      <span className="text-[10px] text-muted-foreground/50 shrink-0 font-medium">
                        {formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: false })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[12px] text-muted-foreground truncate">
                      {lastMessage
                        ? `${lastMessage.senderName}: ${lastMessage.message}`
                        : <span className="flex items-center gap-1">📍 {request.location.name}</span>}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex -space-x-1">
                        {[request.userName, ...request.participants.map(p => p.name)].slice(0, 2).map((name, i) => (
                          <GradientAvatar key={i} name={name} size={14} showInitials={false} className="border border-background" />
                        ))}
                      </div>
                      {unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-[9px] font-bold text-primary-foreground">{unread}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {pastChats.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="section-label">Past plans</h3>
            <span className="ml-auto text-[10px] font-semibold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
              {pastChats.length}
            </span>
          </div>
          <div className="space-y-2">
            {pastChats.map(({ request, lastMessage }) => (
              <button key={request.id} onClick={() => navigate(`/request/${request.id}`)}
                className="w-full liquid-glass flex items-center gap-3.5 p-3.5 text-left opacity-55 tap-scale">
                <CategoryIcon category={request.category} size="sm" className="liquid-glass shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate tracking-tight">{request.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {lastMessage ? lastMessage.message : request.location.name}
                  </p>
                </div>
                <span className="text-muted-foreground/30 shrink-0">›</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <button onClick={() => navigate('/home')}
        className="w-full liquid-glass-interactive flex items-center gap-3 px-4 py-3 text-left">
        <span className="text-lg">🔍</span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-foreground tracking-tight">Find more plans</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Browse what's happening nearby</p>
        </div>
        <span className="text-muted-foreground/30 shrink-0">›</span>
      </button>
    </div>
  );
}

// ── Circle tab ────────────────────────────────────────────────────────────
function CircleTab() {
  const navigate = useNavigate();
  const peopleMet = usePeopleMet();
  const [search, setSearch] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current?.children) {
      gsap.fromTo(Array.from(listRef.current.children),
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: 'power3.out' }
      );
    }
  }, []);

  const filtered = peopleMet.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const activeNow = peopleMet.filter(p => p.isActive);

  return (
    <div className="space-y-3">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="liquid-glass p-3 text-center rounded-[0.875rem]">
          <p className="text-[18px] font-bold tabular-nums text-foreground">{peopleMet.length}</p>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">Met</p>
        </div>
        <div className="liquid-glass p-3 text-center rounded-[0.875rem]">
          <p className="text-[18px] font-bold tabular-nums text-foreground">{activeNow.length}</p>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">Active now</p>
        </div>
        <div className="liquid-glass p-3 text-center rounded-[0.875rem]">
          <p className="text-[18px] font-bold tabular-nums text-foreground">
            {peopleMet.reduce((n, p) => n + p.sharedPlans.length, 0)}
          </p>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">Plans shared</p>
        </div>
      </div>

      {/* Active now strip */}
      {activeNow.length > 0 && (
        <div className="liquid-glass-heavy p-4 rounded-[1rem]">
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
          <AppIcon name="fc:search" size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" style={{ transform: 'translateY(-50%)' }} />
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
              <div key={person.id} className="liquid-glass-heavy p-3.5 flex items-center gap-3 rounded-[1rem]">
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
                    <AppIcon name="fc:globe" size={9} className="shrink-0 opacity-40" />
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
            <AppIcon name="fc:conference-call" size={28} className="opacity-40" />
          </div>
          <p className="text-[15px] font-bold text-foreground mb-1.5 tracking-tight">No one yet</p>
          <p className="text-[13px] text-muted-foreground mb-6">Join a plan to start meeting people</p>
          <Button onClick={() => navigate('/home')} size="sm">Browse plans</Button>
        </div>
      )}

      {peopleMet.length > 0 && (
        <button onClick={() => navigate('/invite')}
          className="w-full liquid-glass-interactive flex items-center gap-3 px-4 py-3.5 text-left rounded-[1rem]">
          <AppIcon name="fc:invite" size={18} className="shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-foreground tracking-tight">Invite real friends</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Earn credits for each referral</p>
          </div>
          <span className="text-muted-foreground/30">›</span>
        </button>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function ChatsPage() {
  const [tab, setTab] = useState<'chats' | 'circle'>('chats');
  const indicatorRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Animate tab switch
  useEffect(() => {
    if (!indicatorRef.current) return;
    gsap.to(indicatorRef.current, {
      x: tab === 'chats' ? 0 : '100%',
      duration: 0.28,
      ease: 'power3.out',
    });
  }, [tab]);

  const handleTabChange = (next: 'chats' | 'circle') => {
    if (next === tab) return;
    if (contentRef.current) {
      gsap.fromTo(contentRef.current,
        { opacity: 0, x: next === 'circle' ? 18 : -18 },
        { opacity: 1, x: 0, duration: 0.3, ease: 'power3.out' }
      );
    }
    setTab(next);
  };

  return (
    <div className="mobile-container min-h-screen bg-background pb-24">
      <TopBar title={tab === 'chats' ? 'Chats' : 'My Circle'} hideChat />

      {/* ── Segmented slider ── */}
      <div className="px-4 pt-3.5 pb-2">
        <div className="relative flex rounded-[1rem] p-[3px]" style={{
          background: 'hsla(var(--glass-bg) / 0.25)',
          backdropFilter: 'blur(var(--glass-blur-heavy)) saturate(220%)',
          border: '0.5px solid hsla(var(--glass-border) / 0.6)',
          boxShadow: 'inset 0 0.5px 0 hsla(var(--glass-highlight))',
        }}>
          {/* sliding highlight */}
          <div ref={indicatorRef} className="absolute top-[3px] left-[3px] w-[calc(50%-3px)] h-[calc(100%-6px)] rounded-[0.75rem] pointer-events-none"
            style={{
              background: 'hsla(var(--glass-bg) / 0.9)',
              boxShadow: '0 1px 8px hsla(var(--glass-shadow) / 0.4), inset 0 0.5px 0 hsla(0 0% 100% / 0.15)',
            }} />
          <button
            onClick={() => handleTabChange('chats')}
            className={cn(
              'relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[0.75rem] text-[13px] font-semibold transition-colors duration-200',
              tab === 'chats' ? 'text-foreground' : 'text-muted-foreground'
            )}>
            <AppIcon name="fc:comments" size={15} />
            Chats
          </button>
          <button
            onClick={() => handleTabChange('circle')}
            className={cn(
              'relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[0.75rem] text-[13px] font-semibold transition-colors duration-200',
              tab === 'circle' ? 'text-foreground' : 'text-muted-foreground'
            )}>
            <AppIcon name="fc:conference-call" size={15} />
            My Circle
          </button>
        </div>
      </div>

      {/* ── Tab content ── */}
      <div ref={contentRef} className="px-4 pt-2">
        {tab === 'chats' ? <ChatsTab /> : <CircleTab />}
      </div>

      <BottomNav />
    </div>
  );
}
