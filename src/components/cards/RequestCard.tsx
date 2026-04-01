import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import type { Request } from '@/types/anybuddy';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import { UrgencyBadge } from '@/components/ui/UrgencyBadge';
import { ShareSheet } from '@/components/ShareSheet';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { BlueTick } from '@/components/ui/BlueTick';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { AppIcon } from '@/components/icons/AppIcon';

interface RequestCardProps {
  request: Request;
  onJoin?: () => void;
  onView?: () => void;
  isJoined?: boolean;
  className?: string;
}

function getTimeIndicator(request: Request) {
  const minutesLeft = (new Date(request.expiresAt).getTime() - Date.now()) / 60000;
  
  if (minutesLeft <= 5 && minutesLeft > 0) {
    return { label: 'Happening now', color: 'text-warning bg-warning/8', emoji: '⏰' };
  }
  if (minutesLeft <= 15 && minutesLeft > 0) {
    const mins = Math.round(minutesLeft);
    return { label: `${mins} min left`, color: 'text-destructive bg-destructive/8', emoji: '⏰' };
  }
  if (minutesLeft <= 30 && minutesLeft > 0) {
    const mins = Math.round(minutesLeft);
    return { label: `In ${mins} min`, color: 'text-warning bg-warning/8', emoji: '⏰' };
  }
  return null;
}

function getHotIndicator(request: Request) {
  const seatsLeft = request.seatsTotal - request.seatsTaken;
  const fillPercentage = (request.seatsTaken / request.seatsTotal) * 100;
  
  if (seatsLeft === 1) {
    return { label: '1 spot left', color: 'text-destructive bg-destructive/8', emoji: '👥' };
  }
  if (seatsLeft === 2) {
    return { label: '2 spots left', color: 'text-destructive bg-destructive/8', emoji: '👥' };
  }
  if (fillPercentage >= 70) {
    return { label: `${request.seatsTaken} joined`, color: 'text-primary bg-primary/8', emoji: '👥' };
  }
  return null;
}

export function RequestCard({ request, onJoin, onView, isJoined, className }: RequestCardProps) {
  const navigate = useNavigate();
  const [showShare, setShowShare] = useState(false);
  const { user, savePlan, unsavePlan } = useAppStore();
  
  const seatsLeft = request.seatsTotal - request.seatsTaken;
  const timeIndicator = getTimeIndicator(request);
  const hotIndicator = getHotIndicator(request);
  const isSaved = user?.savedPlans?.includes(request.id);
  
  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    target.classList.add('join-pulse');
    setTimeout(() => target.classList.remove('join-pulse'), 500);
    onJoin?.();
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShare(true);
  };

  const handleHostClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/host/${request.userId}`);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) unsavePlan(request.id);
    else savePlan(request.id);
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('heart-pop');
    void target.offsetWidth;
    target.classList.add('heart-pop');
  };

  const attendeeNames = [
    request.userName,
    ...request.participants.map(p => p.name),
  ];
  
  return (
    <>
      <div
        className={cn('liquid-glass-card p-4', className)}
        onClick={onView}
      >
        {/* Status badges */}
        {(timeIndicator || hotIndicator) && (
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {timeIndicator && (
              <div className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap', timeIndicator.color)}>
                <span className="text-[10px]">{timeIndicator.emoji}</span> {timeIndicator.label}
              </div>
            )}
            {hotIndicator && (
              <div className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap', hotIndicator.color)}>
                <span className="text-[10px]">{hotIndicator.emoji}</span> {hotIndicator.label}
              </div>
            )}
          </div>
        )}

        <div className="flex items-start gap-3 mb-3">
          {/* Category icon */}
          <CategoryIcon category={request.category} size="md" className="shrink-0 liquid-glass" />
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[15px] text-foreground leading-snug line-clamp-2 mb-1.5 tracking-tight">{request.title}</h3>
            <p className="text-[12px] text-muted-foreground font-medium truncate flex items-center gap-1">
              <span className="text-[11px]">📍</span> {request.location.name} · {request.location.distance} km
            </p>
          </div>
        </div>

        {/* Participant info + Join */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex -space-x-1.5 shrink-0">
              {attendeeNames.slice(0, 3).map((name, i) => (
                <GradientAvatar key={i} name={name} size={20} className="border-[1.5px] border-background" showInitials={false} />
              ))}
              {attendeeNames.length > 3 && (
                <div className="w-5 h-5 rounded-full bg-muted border-[1.5px] border-background flex items-center justify-center">
                  <span className="text-[8px] font-bold text-muted-foreground">+{attendeeNames.length - 3}</span>
                </div>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground font-medium truncate">
              {seatsLeft === 0 ? 'Full' : seatsLeft === 1 ? '1 spot left' : `${request.seatsTaken} joined · ${seatsLeft} left`}
            </span>
          </div>

          <Button
            variant={isJoined ? 'secondary' : 'default'}
            size="sm"
            className={cn(
              "tap-scale h-9 px-4 text-[12px] font-bold shrink-0 gap-1.5",
              !isJoined && "shadow-[0_2px_12px_hsl(var(--primary)/0.25)]"
            )}
            onClick={handleJoinClick}
            disabled={seatsLeft === 0 && !isJoined}
          >
            {isJoined ? '✓ Joined' : seatsLeft === 0 ? 'Full' : <>Join →</>}
          </Button>
        </div>

        {/* Host info */}
        <div className="flex items-center justify-between pt-3" style={{ borderTop: '0.5px solid hsla(var(--glass-border))' }}>
          <button onClick={handleHostClick} className="flex items-center gap-2 tap-scale">
            <GradientAvatar name={request.userName} size={20} showInitials={false} />
            <span className="text-[11px] text-muted-foreground font-medium hover:text-foreground transition-colors flex items-center gap-1">
              {request.userName}
              {(request.userTrust === 'trusted' || request.userTrust === 'anchor') && (
                <BlueTick size={12} className="ml-0.5" />
              )}
              {request.userReliability && (
                <span className="ml-0.5 flex items-center gap-0.5 opacity-60">· ⭐ {request.userReliability}%</span>
              )}
            </span>
          </button>
          
          <div className="flex items-center gap-1">
            <button onClick={handleSaveClick} className="tap-scale p-1.5 rounded-full hover:bg-muted/50 transition-colors">
              <AppIcon name="fc:like" size={14} className={cn('transition-colors', isSaved ? '' : 'grayscale opacity-50')} />
            </button>
            <button onClick={handleShareClick} className="tap-scale p-1.5 rounded-full hover:bg-muted/50 transition-colors">
              <AppIcon name="fc:share" size={14} />
            </button>
          </div>
        </div>
      </div>

      <ShareSheet open={showShare} onClose={() => setShowShare(false)} title={request.title}
        text={`${request.title}\n📍 ${request.location.name}\nJoin here`} />
    </>
  );
}
