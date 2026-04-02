import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { Request } from '@/types/anybuddy';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
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

function getUrgencyChip(request: Request) {
  const minsToStart = (new Date(request.when).getTime() - Date.now()) / 60000;
  if (minsToStart <= 0) return { label: 'Now', color: 'text-warning bg-warning/10 border-warning/20', icon: '⚡' };
  if (minsToStart <= 15) return { label: `${Math.round(minsToStart)}m`, color: 'text-destructive bg-destructive/8 border-destructive/15', icon: '🔴' };
  if (minsToStart <= 30) return { label: `${Math.round(minsToStart)}m`, color: 'text-warning bg-warning/8 border-warning/15', icon: '🟡' };
  if (minsToStart <= 60) return { label: `${Math.round(minsToStart)}m`, color: 'text-primary bg-primary/8 border-primary/15', icon: '🔵' };
  return null;
}

function formatStartTime(date: Date) {
  const now = new Date();
  const mins = (date.getTime() - now.getTime()) / 60000;
  if (mins <= 0) return 'Now';
  if (mins < 60) return `In ${Math.round(mins)} min`;
  if (mins < 1440) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
}

function formatWalkTime(distanceKm: number) {
  const mins = Math.round(distanceKm * 12); // ~5 km/h
  if (mins <= 1) return '1 min walk';
  if (mins < 60) return `${mins} min walk`;
  return `${Math.round(mins / 60)}h walk`;
}

export function RequestCard({ request, onJoin, onView, isJoined, className }: RequestCardProps) {
  const navigate = useNavigate();
  const [showShare, setShowShare] = useState(false);
  const { user, savePlan, unsavePlan } = useAppStore();

  const seatsLeft = request.seatsTotal - request.seatsTaken;
  const urgencyChip = getUrgencyChip(request);
  const isSaved = user?.savedPlans?.includes(request.id);
  const startTime = formatStartTime(new Date(request.when));
  const walkTime = formatWalkTime(request.location.distance);

  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onJoin?.();
  };

  const handleHostClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/host/${request.userId}`);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) unsavePlan(request.id);
    else savePlan(request.id);
  };

  const attendeeNames = [request.userName, ...request.participants.map(p => p.name)];

  // CTA state per PRD
  const ctaLabel = isJoined ? '✓ Joined'
    : seatsLeft === 0 ? 'Full'
    : request.joinMode === 'approval' ? '🔒 Request' : '⚡ Join';

  const ctaVariant = isJoined ? 'secondary' as const
    : seatsLeft === 0 ? 'outline' as const
    : 'default' as const;

  return (
    <>
      <div className={cn('liquid-glass-card p-4 tap-scale', className)} onClick={onView}>
        {/* Row 1: Urgency + time + approval badge */}
        <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
          {urgencyChip && (
            <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border', urgencyChip.color)}>
              {urgencyChip.icon} {urgencyChip.label}
            </span>
          )}
          <span className="text-[11px] text-muted-foreground font-medium">
            {startTime}
          </span>
          {seatsLeft <= 2 && seatsLeft > 0 && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-destructive bg-destructive/8 ml-auto">
              {seatsLeft} spot{seatsLeft !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Row 2: Category icon + title + location/travel */}
        <div className="flex items-start gap-3 mb-3">
          <CategoryIcon category={request.category} size="md" className="shrink-0 liquid-glass" />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[15px] text-foreground leading-snug line-clamp-2 tracking-tight">{request.title}</h3>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5 flex items-center gap-1 truncate">
              📍 {request.location.name} · {walkTime}
            </p>
          </div>
        </div>

        {/* Row 3: Participants + CTA */}
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
              {request.seatsTaken}/{request.seatsTotal} going
            </span>
          </div>

          <Button
            variant={ctaVariant}
            size="sm"
            className={cn(
              "tap-scale h-8 px-4 text-[12px] font-bold shrink-0 rounded-full",
              !isJoined && seatsLeft > 0 && "shadow-[0_2px_12px_hsl(var(--primary)/0.25)]"
            )}
            onClick={handleJoinClick}
            disabled={seatsLeft === 0 && !isJoined}
          >
            {ctaLabel}
          </Button>
        </div>

        {/* Row 4: Host trust summary */}
        <div className="flex items-center justify-between pt-2.5" style={{ borderTop: '0.5px solid hsla(var(--glass-border))' }}>
          <button onClick={handleHostClick} className="flex items-center gap-2 tap-scale min-w-0">
            <GradientAvatar name={request.userName} size={20} showInitials={false} />
            <span className="text-[11px] text-muted-foreground font-medium hover:text-foreground transition-colors flex items-center gap-1 truncate">
              {request.userName}
              {(request.userTrust === 'trusted' || request.userTrust === 'anchor') && (
                <BlueTick size={12} />
              )}
            </span>
            {request.userReliability && (
              <span className="text-[10px] text-muted-foreground/50 shrink-0">✅ {request.userReliability}%</span>
            )}
            {request.userHostRating && request.userHostRating > 0 && (
              <span className="text-[10px] text-muted-foreground/50 shrink-0">⭐ {request.userHostRating.toFixed(1)}</span>
            )}
          </button>

          <div className="flex items-center gap-0.5 shrink-0">
            <button onClick={handleSaveClick} className="tap-scale p-1.5 rounded-full hover:bg-muted/50 transition-colors">
              <AppIcon name="fc:like" size={14} className={cn('transition-colors', isSaved ? '' : 'grayscale opacity-50')} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setShowShare(true); }} className="tap-scale p-1.5 rounded-full hover:bg-muted/50 transition-colors">
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
