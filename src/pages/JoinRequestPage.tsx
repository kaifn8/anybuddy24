import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { useAppStore } from '@/store/useAppStore';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import { UrgencyBadge } from '@/components/ui/UrgencyBadge';
import { TrustBadge } from '@/components/ui/TrustBadge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AppIcon } from '@/components/icons/AppIcon';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { cn } from '@/lib/utils';
import { formatWalkTime } from '@/components/LocationMap';

export default function JoinRequestPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { requests, joinRequest, requestToJoin, updateCredits, user, joinedRequests } = useAppStore();

  const [note, setNote] = useState('');
  const [state, setState] = useState<'idle' | 'joining' | 'joined' | 'requested'>('idle');
  const containerRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const request = requests.find(r => r.id === id);
  const alreadyJoined = joinedRequests.includes(id || '');
  const isHost = request?.userId === user?.id;

  useEffect(() => {
    if (containerRef.current?.children) {
      gsap.fromTo(containerRef.current.children, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: 'power2.out' });
    }
  }, []);

  useEffect(() => {
    if ((state === 'joined' || state === 'requested') && successRef.current) {
      gsap.fromTo(successRef.current, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' });
    }
  }, [state]);

  // Redirect if already joined or is host
  useEffect(() => {
    if (alreadyJoined || isHost) {
      toast('You're already in this plan');
      navigate(`/request/${id}`, { replace: true });
    }
  }, [alreadyJoined, isHost, id, navigate]);

  if (!request) {
    return (
      <div className="mobile-container min-h-screen bg-ambient flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl block mb-3">🤷</span>
          <p className="text-sm text-muted-foreground mb-4">Plan not found</p>
          <Button onClick={() => navigate('/home')} className="h-10 px-6">Go Home</Button>
        </div>
      </div>
    );
  }

  const isApprovalMode = request.joinMode === 'approval';
  const seatsLeft = request.seatsTotal - request.seatsTaken;
  const isFull = seatsLeft <= 0;

  // Similar plans for full-plan fallback
  const similarPlans = isFull
    ? requests
        .filter(r => r.id !== id && r.status === 'active' && r.seatsTotal - r.seatsTaken > 0)
        .filter(r => r.category === request.category || r.location.distance <= 3)
        .slice(0, 3)
    : [];

  const handleJoin = () => {
    if (!user || !id || !request || isFull) return;
    setState('joining');

    setTimeout(() => {
      if (isApprovalMode) {
        requestToJoin(id, note.trim() || undefined);
        setState('requested');
      } else {
        joinRequest(id, note.trim() || undefined);
        updateCredits(0.5, 'Joined a plan');
        setState('joined');
        toast.success('You're in! 🎉');
        setTimeout(() => navigate(`/request/${request.id}`), 1800);
      }
    }, 600);
  };

  // ── Success: Joined ──
  if (state === 'joined') {
    return (
      <div className="mobile-container min-h-screen bg-ambient flex items-center justify-center">
        <div ref={successRef} className="flex flex-col items-center px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mb-5">
            <span className="text-4xl">🎉</span>
          </div>
          <h2 className="text-xl font-bold mb-1">You're in!</h2>
          <p className="text-sm text-muted-foreground mb-2">
            Opening chat with {request.userName}...
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-4 h-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
            <span className="text-xs text-muted-foreground">Connecting...</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Success: Approval requested ──
  if (state === 'requested') {
    return (
      <div className="mobile-container min-h-screen bg-ambient flex items-center justify-center">
        <div ref={successRef} className="flex flex-col items-center px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-warning/15 flex items-center justify-center mb-5">
            <span className="text-4xl">✋</span>
          </div>
          <h2 className="text-xl font-bold mb-1">Request sent!</h2>
          <p className="text-sm text-muted-foreground mb-1">
            {request.userName} will review your request.
          </p>
          <p className="text-xs text-muted-foreground/60 mb-6">
            Most hosts respond within 5 minutes
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate('/home')}>Browse more</Button>
            <Button variant="outline" onClick={() => navigate('/notifications')}>
              🔔 Notifications
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Full plan ──
  if (isFull) {
    return (
      <div className="mobile-container min-h-screen bg-ambient">
        <header className="sticky top-0 z-40 liquid-glass-nav">
          <div className="flex items-center gap-3 px-4 h-12 max-w-md mx-auto">
            <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl tap-scale text-sm hover:bg-muted transition-colors">←</button>
            <h1 className="text-[13px] font-semibold flex-1">Plan Full</h1>
          </div>
        </header>

        <div className="px-5 pt-6 space-y-5">
          <div className="text-center py-6">
            <span className="text-5xl block mb-3">😔</span>
            <h2 className="text-lg font-bold mb-1">This plan is full</h2>
            <p className="text-sm text-muted-foreground">All {request.seatsTotal} spots are taken</p>
          </div>

          {similarPlans.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Similar plans nearby
              </h3>
              <div className="space-y-2.5">
                {similarPlans.map(plan => {
                  const planSeatsLeft = plan.seatsTotal - plan.seatsTaken;
                  return (
                    <button
                      key={plan.id}
                      onClick={() => navigate(`/request/${plan.id}`)}
                      className="w-full liquid-glass p-3.5 rounded-2xl flex items-center gap-3 text-left tap-scale"
                    >
                      <CategoryIcon category={plan.category} size="md" className="shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold truncate">{plan.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">
                            📍 {plan.location.name} · {formatWalkTime(plan.location.distance)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[11px] font-bold text-primary">{planSeatsLeft} spot{planSeatsLeft > 1 ? 's' : ''}</p>
                        <UrgencyBadge urgency={plan.urgency} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <Button className="w-full h-11" onClick={() => navigate('/home')}>
            Browse all plans
          </Button>
        </div>
      </div>
    );
  }

  // ── Main join form ──
  return (
    <div className="mobile-container min-h-screen bg-ambient flex flex-col">
      <header className="sticky top-0 z-40 liquid-glass-nav">
        <div className="flex items-center gap-3 px-4 h-12 max-w-md mx-auto">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl tap-scale text-sm hover:bg-muted transition-colors">←</button>
          <h1 className="text-[13px] font-semibold flex-1">
            {isApprovalMode ? 'Request to Join' : 'Join Plan'}
          </h1>
        </div>
      </header>

      <div ref={containerRef} className="flex-1 px-5 pt-3 pb-32 space-y-3.5">
        {/* Plan summary */}
        <div className="liquid-glass-heavy p-4 rounded-2xl">
          <div className="flex items-start gap-3">
            <CategoryIcon category={request.category} size="md" className="shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <UrgencyBadge urgency={request.urgency} />
                {isApprovalMode && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-warning/12 text-warning border border-warning/20">
                    ✋ Approval
                  </span>
                )}
              </div>
              <h2 className="text-[15px] font-bold leading-tight">{request.title}</h2>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-border/15">
            {[
              { emoji: '👥', value: `${seatsLeft}`, label: `of ${request.seatsTotal} left` },
              { emoji: '📍', value: formatWalkTime(request.location.distance), label: request.location.name },
              { emoji: '⏰', value: new Date(request.when).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), label: 'start time' },
            ].map((s, i) => (
              <div key={i} className="text-center py-1.5">
                <span className="text-sm block">{s.emoji}</span>
                <p className="text-[13px] font-bold mt-0.5 tabular-nums">{s.value}</p>
                <p className="text-2xs text-muted-foreground truncate">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Host block */}
        <button
          onClick={() => navigate(`/host/${request.userId}`)}
          className="w-full liquid-glass p-3.5 rounded-2xl flex items-center gap-3 text-left tap-scale"
        >
          <GradientAvatar name={request.userName} size={40} />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold flex items-center gap-1.5">
              {request.userName}
              {(request.userTrust === 'trusted' || request.userTrust === 'anchor') && <AppIcon name="fc:vip" size={14} />}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <TrustBadge level={request.userTrust} size="sm" />
              {request.userReliability && (
                <span className="text-[10px] text-muted-foreground">✅ {request.userReliability}%</span>
              )}
              {request.userHostRating && (
                <span className="text-[10px] text-muted-foreground">⭐ {request.userHostRating.toFixed(1)}</span>
              )}
            </div>
          </div>
          <span className="text-muted-foreground/30 text-sm">›</span>
        </button>

        {/* Participant preview */}
        {request.participants.length > 0 && (
          <div className="liquid-glass p-3 rounded-2xl">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {request.participants.slice(0, 5).map(p => (
                  <GradientAvatar key={p.id} name={p.name} size={26} showInitials={false} className="border-2 border-background" />
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {request.participants.map(p => p.name).slice(0, 2).join(', ')}
                {request.participants.length > 2 && ` +${request.participants.length - 2}`} going
              </p>
            </div>
          </div>
        )}

        {/* Optional note */}
        <div className="liquid-glass p-3.5 rounded-2xl">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
            {isApprovalMode ? 'Note to host' : 'Quick note'} <span className="text-muted-foreground/40 normal-case lowercase">optional</span>
          </label>
          <input
            placeholder={isApprovalMode ? 'Tell the host why you want to join...' : 'e.g., On my way! ETA 10 mins'}
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 80))}
            className="w-full h-10 px-3 rounded-xl bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40"
          />
          {note.length > 50 && (
            <p className="text-2xs text-muted-foreground mt-1 text-right">{note.length}/80</p>
          )}
        </div>

        {/* What happens */}
        <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-primary/5 border border-primary/10">
          <span className="text-sm mt-0.5">💡</span>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {isApprovalMode
              ? 'The host will review your request. You'll be notified when they respond.'
              : 'You'll be added instantly and can start chatting with the group right away.'}
          </p>
        </div>

        {/* Scarcity warning */}
        {seatsLeft <= 2 && (
          <div className="flex items-center justify-center gap-1.5 py-1.5">
            <span className="text-xs">⚡</span>
            <p className="text-[11px] text-warning font-semibold">
              Only {seatsLeft} spot{seatsLeft > 1 ? 's' : ''} left
            </p>
          </div>
        )}
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 liquid-glass-nav z-30">
        <div className="max-w-md mx-auto">
          <Button
            className="w-full h-12 tap-scale text-[15px]"
            onClick={handleJoin}
            disabled={state === 'joining'}
          >
            {state === 'joining' ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isApprovalMode ? 'Sending request...' : 'Joining...'}
              </span>
            ) : isApprovalMode ? (
              '✋ Request to Join'
            ) : (
              '⚡ Join Instantly'
            )}
          </Button>
          <p className="text-center text-[10px] text-muted-foreground/50 mt-1.5">
            {isApprovalMode ? 'Host typically responds in ~5 min' : 'Chat & location unlock immediately'}
          </p>
        </div>
      </div>
    </div>
  );
}
