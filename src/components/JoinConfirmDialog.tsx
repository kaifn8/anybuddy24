import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { UrgencyBadge } from '@/components/ui/UrgencyBadge';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import { formatDistanceToNow } from 'date-fns';
import type { Request } from '@/types/anybuddy';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';
import { GradientAvatar } from '@/components/ui/GradientAvatar';

const RESERVATION_SECONDS = 45;

interface JoinConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  request: Request;
}

export function JoinConfirmDialog({ open, onClose, onConfirm, request }: JoinConfirmDialogProps) {
  const { reserveSeat, releaseReservation } = useAppStore();
  const [isReserved, setIsReserved] = useState(false);
  const [countdown, setCountdown] = useState(RESERVATION_SECONDS);
  const [isConfirming, setIsConfirming] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reservedRef = useRef(false);

  const seatsLeft = request.seatsTotal - request.seatsTaken;
  const timeLeft = formatDistanceToNow(new Date(request.expiresAt), { addSuffix: false });

  const cleanup = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (reservedRef.current) { releaseReservation(request.id); reservedRef.current = false; }
    setIsReserved(false);
    setCountdown(RESERVATION_SECONDS);
    setIsConfirming(false);
  }, [request.id, releaseReservation]);

  useEffect(() => { if (!open) cleanup(); }, [open, cleanup]);
  useEffect(() => () => cleanup(), [cleanup]);

  const handleReserve = () => {
    reserveSeat(request.id);
    reservedRef.current = true;
    setIsReserved(true);
    setCountdown(RESERVATION_SECONDS);

    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          cleanup();
          toast.error('Reservation expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleConfirm = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setIsConfirming(true);
    releaseReservation(request.id);
    reservedRef.current = false;
    setTimeout(() => {
      onConfirm();
      setIsReserved(false);
      setIsConfirming(false);
    }, 300);
  };

  const handleClose = () => {
    cleanup();
    onClose();
  };

  const attendeeNames = [
    request.userName,
    ...request.participants.map(p => p.name),
  ];

  const countdownPercent = (countdown / RESERVATION_SECONDS) * 100;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="liquid-glass-heavy border-border/20 max-w-[340px] rounded-2xl p-5">
        <DialogHeader>
        <DialogTitle className="text-sm font-bold flex items-center gap-2">
            <CategoryIcon category={request.category} size="sm" />
            {isReserved ? (
              <span className="flex items-center gap-1.5">🔒 Your spot is held</span>
            ) : (
              <span>{seatsLeft <= 2 ? 'Going fast! ' : ''}You in?</span>
            )}
          </DialogTitle>
          <DialogDescription className="sr-only">Confirm joining this plan</DialogDescription>
        </DialogHeader>

        <div className="liquid-glass p-3.5 rounded-xl mt-1">
          <div className="flex items-center gap-1.5 mb-1.5">
            <UrgencyBadge urgency={request.urgency} />
          </div>
          <h3 className="text-sm font-semibold leading-snug">{request.title}</h3>
          
          <p className="text-2xs text-muted-foreground mt-1.5 flex items-center gap-1">
            📍 {request.location.name} · {request.location.distance}km away
          </p>
          
          <div className="flex items-center gap-3 mt-2 text-2xs text-muted-foreground">
            <span className="flex items-center gap-1">⏰ {timeLeft} left to join</span>
            <span className={`flex items-center gap-1 ${seatsLeft <= 2 ? 'text-destructive font-semibold' : ''}`}>
              👥 {seatsLeft === 0 ? 'Full!' : seatsLeft === 1 ? 'Last spot!' : `${seatsLeft} spots`}
            </span>
          </div>

          {/* Attendees */}
          <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-border/15">
            <div className="flex -space-x-1.5">
              {attendeeNames.slice(0, 4).map((name, i) => (
                <GradientAvatar key={i} name={name} size={20} showInitials={false} className="border-2 border-background" />
              ))}
            </div>
            <span className="text-2xs text-muted-foreground">{request.seatsTaken} {request.seatsTaken === 1 ? 'person' : 'people'} going</span>
          </div>

          {/* Host */}
          <div className="flex items-center gap-2 mt-2.5">
            <GradientAvatar name={request.userName} size={20} showInitials={false} />
            <span className="text-xs font-medium">{request.userName}</span>
            {request.userReliability && (
              <span className="text-2xs text-success font-semibold">{request.userReliability}% reliable</span>
            )}
          </div>

          {/* Safety + social proof */}
          <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground/60">
            <span className="flex items-center gap-0.5">🛡️ Public meetup</span>
            {(request.userTrust === 'trusted' || request.userTrust === 'anchor') && (
              <span className="flex items-center gap-0.5">· ✅ Verified host</span>
            )}
          </div>
          {request.seatsTaken >= 2 && (
            <p className="text-[10px] text-success font-medium mt-1.5 flex items-center gap-1">
              ✅ {request.seatsTaken} people already going
            </p>
          )}
        </div>

        {/* Reservation countdown */}
        {isReserved && (
          <div className="space-y-1.5">
            <div className="relative rounded-full h-1.5 bg-muted overflow-hidden">
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
            <p className="text-center text-[10px] text-muted-foreground">
              Confirm within <span className={countdown <= 10 ? 'text-destructive font-bold' : 'font-semibold'}>{countdown}s</span>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-1">
          {!isReserved ? (
            <>
              <Button variant="secondary" onClick={handleClose} className="flex-1 h-10 text-xs">
                Maybe later
              </Button>
              <Button onClick={handleReserve} className="flex-1 h-10 text-xs gap-1" disabled={seatsLeft === 0}>
                {seatsLeft === 0 ? 'Full' : seatsLeft === 1 ? 'Take the last spot' : 'Reserve my spot'} →
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={handleClose} className="flex-1 h-10 text-xs">
                Nah, skip
              </Button>
              <Button onClick={handleConfirm} className="flex-1 h-10 text-xs gap-1" disabled={isConfirming}>
                {isConfirming ? 'Joining...' : "I'm in"} ✅
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
