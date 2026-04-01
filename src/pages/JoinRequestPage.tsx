import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import gsap from 'gsap';
import { useAppStore } from '@/store/useAppStore';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import { UrgencyBadge } from '@/components/ui/UrgencyBadge';
import { TrustBadge } from '@/components/ui/TrustBadge';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { AppIcon } from '@/components/icons/AppIcon';
import { GradientAvatar } from '@/components/ui/GradientAvatar';

const RESERVATION_SECONDS = 45;

export default function JoinRequestPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { requests, joinRequest, requestToJoin, updateCredits, user, reserveSeat, releaseReservation } = useAppStore();
  
  const [note, setNote] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [isRequested, setIsRequested] = useState(false);
  const [isReserved, setIsReserved] = useState(false);
  const [countdown, setCountdown] = useState(RESERVATION_SECONDS);
  const [isConfirming, setIsConfirming] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reservedRef = useRef(false); // track across renders to cleanup
  const request = requests.find(r => r.id === id);
  
  useEffect(() => {
    if (containerRef.current?.children) {
      gsap.fromTo(containerRef.current.children, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: 'power2.out' });
    }
  }, []);
  
  useEffect(() => {
    if ((isJoined || isRequested) && successRef.current) {
      gsap.fromTo(successRef.current, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' });
    }
  }, [isJoined, isRequested]);

  // Cleanup reservation on unmount
  useEffect(() => {
    return () => {
      if (reservedRef.current && id) {
        releaseReservation(id);
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id, releaseReservation]);

  const startReservation = useCallback(() => {
    if (!id || !user) return;
    reserveSeat(id);
    reservedRef.current = true;
    setIsReserved(true);
    setCountdown(RESERVATION_SECONDS);

    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Time's up — release
          if (timerRef.current) clearInterval(timerRef.current);
          releaseReservation(id);
          reservedRef.current = false;
          setIsReserved(false);
          toast.error('⏰ Reservation expired, seat released');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [id, user, reserveSeat, releaseReservation]);

  const handleConfirmJoin = () => {
    if (!user || !id || !request) return;
    setIsConfirming(true);

    // Stop countdown
    if (timerRef.current) clearInterval(timerRef.current);

    const isApprovalMode = request.joinMode === 'approval';

    setTimeout(() => {
      if (isApprovalMode) {
        // Release the temp seat, send request instead
        releaseReservation(id);
        reservedRef.current = false;
        requestToJoin(id, note.trim() || undefined);
        setIsReserved(false);
        setIsRequested(true);
      } else {
        // Seat was already reserved (counted), now finalize
        // We need to "undo" the temp seat bump and do the real join which re-adds it
        releaseReservation(id);
        reservedRef.current = false;
        joinRequest(id, note.trim() || undefined);
        updateCredits(0.5, 'Joined a request');
        setIsReserved(false);
        setIsJoined(true);
        setTimeout(() => navigate(`/request/${request.id}`), 1500);
      }
    }, 400);
  };

  const handleCancelReservation = () => {
    if (!id) return;
    if (timerRef.current) clearInterval(timerRef.current);
    releaseReservation(id);
    reservedRef.current = false;
    setIsReserved(false);
    setCountdown(RESERVATION_SECONDS);
  };
  
  if (!request) {
    return (
      <div className="mobile-container min-h-screen bg-ambient flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl block mb-3">🤷</span>
          <p className="text-sm text-muted-foreground mb-4">Request not found</p>
          <Button onClick={() => navigate('/home')} className="h-10 px-6">Go Home</Button>
        </div>
      </div>
    );
  }

  const isApprovalMode = request.joinMode === 'approval';
  const seatsLeft = request.seatsTotal - request.seatsTaken;
  const timeLeft = formatDistanceToNow(new Date(request.expiresAt), { addSuffix: true });
  const countdownPercent = (countdown / RESERVATION_SECONDS) * 100;
  
  return (
    <div className="mobile-container min-h-screen bg-ambient">
      <TopBar showBack title={isApprovalMode ? 'Request to Join' : 'Join Request'} />
      
      {isJoined ? (
        <div ref={successRef} className="flex flex-col items-center justify-center min-h-[70vh] px-8">
          <AppIcon name="tw:party" size={72} className="mb-4" />
          <h2 className="text-title font-bold mb-1">You're in!</h2>
          <p className="text-sm text-muted-foreground">Opening chat with {request.userName}...</p>
        </div>
      ) : isRequested ? (
        <div ref={successRef} className="flex flex-col items-center justify-center min-h-[70vh] px-8">
          <span className="text-6xl mb-4">✋</span>
          <h2 className="text-title font-bold mb-1">Request sent!</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {request.userName} will review your request. You'll get notified when they respond.
          </p>
          <Button variant="secondary" onClick={() => navigate('/home')}>Back to Home</Button>
        </div>
      ) : (
        <div ref={containerRef} className="px-5 pt-3 space-y-4">
          {/* Request info */}
          <div className="liquid-glass-heavy p-4">
            <div className="flex items-start gap-3">
              <CategoryIcon category={request.category} size="md" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <UrgencyBadge urgency={request.urgency} />
                  {isApprovalMode && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-secondary/15 text-secondary">✋ Approval required</span>
                  )}
                </div>
                <h2 className="text-body font-bold mt-1.5 mb-2.5">{request.title}</h2>
                <div className="flex items-center gap-2.5">
                  <GradientAvatar name={request.userName} size={28} showInitials={false} />
                  <div>
                    <p className="text-sm font-semibold">{request.userName}</p>
                    <TrustBadge level={request.userTrust} size="sm" />
                  </div>
                  {request.userReliability && (
                    <span className="text-[10px] text-muted-foreground ml-auto">⭐ {request.userReliability}% reliable</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border/20">
              {[
                { emoji: '👥', value: `${seatsLeft}/${request.seatsTotal}`, label: isReserved ? '🔒 held' : 'spots' },
                { emoji: '📍', value: `${request.location.distance}km`, label: 'away' },
                { emoji: '⏰', value: timeLeft.replace('in ', ''), label: 'expires' },
              ].map((s, i) => (
                <div key={i} className="text-center py-1">
                  <span className="text-sm">{s.emoji}</span>
                  <p className="text-xs font-bold mt-0.5">{s.value}</p>
                  <p className="text-2xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Note */}
          <div className="liquid-glass p-3.5" style={{ borderRadius: '1rem' }}>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Quick note {isApprovalMode ? '(helps the host decide)' : '(optional)'}
            </label>
            <input placeholder="e.g., On my way! ETA 10 mins" value={note} onChange={(e) => setNote(e.target.value.slice(0, 50))}
              className="w-full h-10 px-3 rounded-lg liquid-glass text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-2xs text-muted-foreground mt-1 text-right">{note.length}/50</p>
          </div>
          
          {/* What happens next */}
          <div className="liquid-glass p-3.5" style={{ borderRadius: '1rem' }}>
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">HOW IT WORKS</h3>
            <ul className="space-y-2">
              {[
                { emoji: '⏳', text: 'Tap to reserve your seat for 45 seconds' },
                { emoji: '✅', text: 'Confirm to lock your spot permanently' },
                { emoji: '💬', text: isApprovalMode ? 'Chat unlocks once host approves' : 'Chat + location unlock instantly' },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{item.emoji}</span><span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Reserve / Join CTA */}
          {!isReserved ? (
            <Button className="w-full h-12"
              onClick={startReservation} disabled={seatsLeft === 0}>
              {seatsLeft === 0 ? 'Request is full' : `Reserve seat with ${request.userName}`}
            </Button>
          ) : (
            <div className="space-y-3">
              {/* Countdown bar */}
              <div className="relative rounded-full h-2 bg-muted overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-linear"
                  style={{
                    width: `${countdownPercent}%`,
                    background: countdown <= 10
                      ? 'hsl(var(--destructive))'
                      : countdown <= 20
                      ? 'hsl(var(--warning))'
                      : 'hsl(var(--primary))',
                  }}
                />
              </div>
              <p className="text-center text-xs text-muted-foreground">
                🔒 Seat reserved · <span className={countdown <= 10 ? 'text-destructive font-bold' : 'font-semibold'}>{countdown}s</span> to confirm
              </p>

              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1 h-12 text-sm" onClick={handleCancelReservation}>
                  Release seat
                </Button>
                <Button className="flex-1 h-12 text-sm" onClick={handleConfirmJoin} disabled={isConfirming}>
                  {isConfirming ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Confirming...
                    </span>
                  ) : "Confirm, I'm in ✓"}
                </Button>
              </div>
            </div>
          )}

          {seatsLeft <= 2 && seatsLeft > 0 && !isReserved && (
            <p className="text-center text-warning text-2xs font-semibold">Only {seatsLeft} spot{seatsLeft > 1 ? 's' : ''} left</p>
          )}
        </div>
      )}
    </div>
  );
}
