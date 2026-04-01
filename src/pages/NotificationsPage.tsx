import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, isAfter, subHours, isToday, isYesterday } from 'date-fns';
import gsap from 'gsap';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAppStore } from '@/store/useAppStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import { AppIcon } from '@/components/icons/AppIcon';
import type { Notification } from '@/types/anybuddy';

import type { AppIconName } from '@/components/icons/AppIcon';

const NOTIF_CONFIG: Record<string, {
  icon: AppIconName; color: string; bg: string; label: string; gradient: string;
}> = {
  nearby:     { icon: 'tw:pin',       color: 'text-primary',          bg: 'bg-primary/10',     label: 'Nearby',   gradient: 'from-primary/20 to-primary/5'      },
  urgent:     { icon: 'tw:lightning', color: 'text-warning',          bg: 'bg-warning/10',     label: 'Now',      gradient: 'from-warning/20 to-warning/5'       },
  join:       { icon: 'tw:party',     color: 'text-success',          bg: 'bg-success/10',     label: 'Joined',   gradient: 'from-success/20 to-success/5'       },
  message:    { icon: 'tw:chat',      color: 'text-secondary',        bg: 'bg-secondary/10',   label: 'Message',  gradient: 'from-secondary/20 to-secondary/5'   },
  credit:     { icon: 'fc:money-transfer', color: 'text-accent',      bg: 'bg-accent/10',      label: 'Credits',  gradient: 'from-accent/20 to-accent/5'         },
  trust:      { icon: 'fc:vip',       color: 'text-primary',          bg: 'bg-primary/10',     label: 'Trust',    gradient: 'from-primary/20 to-primary/5'       },
  reminder:   { icon: 'tw:clock',     color: 'text-muted-foreground', bg: 'bg-muted/20',       label: 'Reminder', gradient: 'from-muted/20 to-muted/5'           },
  completion: { icon: 'tw:check',     color: 'text-success',          bg: 'bg-success/10',     label: 'Done',     gradient: 'from-success/20 to-success/5'       },
  streak:     { icon: 'tw:fire',      color: 'text-accent',           bg: 'bg-accent/10',      label: 'Streak',   gradient: 'from-accent/20 to-accent/5'         },
  badge:      { icon: 'tw:medal',     color: 'text-secondary',        bg: 'bg-secondary/10',   label: 'Badge',    gradient: 'from-secondary/20 to-secondary/5'  },
};

const FILTER_TABS = [
  { id: 'all',     label: 'All',     icon: 'tw:bell'      as AppIconName },
  { id: 'nearby',  label: 'Nearby',  icon: 'tw:pin'       as AppIconName },
  { id: 'join',    label: 'Joins',   icon: 'tw:party'     as AppIconName },
  { id: 'message', label: 'Chats',   icon: 'tw:chat'      as AppIconName },
  { id: 'urgent',  label: 'Urgent',  icon: 'tw:lightning' as AppIconName },
];

function getGroupLabel(timestamp: Date) {
  if (isToday(timestamp)) return 'Today';
  if (isYesterday(timestamp)) return 'Yesterday';
  return 'Earlier';
}

function NotifItem({
  n, onClick, onDismiss, index,
}: {
  n: Notification;
  onClick: () => void;
  onDismiss: (id: string) => void;
  index: number;
}) {
  const cfg = NOTIF_CONFIG[n.type] || NOTIF_CONFIG.nearby;
  const timeAgo = formatDistanceToNow(new Date(n.timestamp), { addSuffix: true });
  const isRecent = isAfter(new Date(n.timestamp), subHours(new Date(), 3));
  const itemRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isDragging.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    if (dx < -10) isDragging.current = true;
    if (dx < 0 && itemRef.current) {
      gsap.to(itemRef.current, { x: Math.max(dx, -80), duration: 0, ease: 'none' });
    }
  };

  const handleTouchEnd = () => {
    if (!itemRef.current) return;
    const el = itemRef.current;
    const curX = gsap.getProperty(el, 'x') as number;
    if (curX < -55) {
      // dismiss
      gsap.to(el, {
        x: '-110%', opacity: 0, duration: 0.28, ease: 'power3.in',
        onComplete: () => onDismiss(n.id),
      });
    } else {
      gsap.to(el, { x: 0, duration: 0.3, ease: 'elastic.out(1, 0.6)' });
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[1rem] mb-2">
      {/* Swipe-reveal dismiss bg */}
      <div className="absolute inset-0 flex items-center justify-end pr-5 rounded-[1rem]"
        style={{ background: 'hsl(var(--destructive) / 0.12)' }}>
        <span className="text-[11px] font-bold text-destructive">Dismiss</span>
      </div>

      {/* Item */}
      <div
        ref={itemRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button
          onClick={() => { if (!isDragging.current) onClick(); }}
          className={cn(
            'w-full flex items-start gap-3.5 py-3.5 px-4 text-left transition-colors relative overflow-hidden',
            n.read ? 'liquid-glass' : 'liquid-glass-heavy',
          )}
          style={{ borderRadius: '1rem' }}>

          {/* Subtle gradient overlay for unread */}
          {!n.read && (
            <div className={cn('absolute inset-0 opacity-30 bg-gradient-to-r pointer-events-none', cfg.gradient)} />
          )}

          {/* Icon */}
          <div className={cn(
            'relative z-10 w-10 h-10 rounded-[0.875rem] flex items-center justify-center shrink-0 mt-0.5',
            cfg.bg
          )}>
            <AppIcon name={cfg.icon} size={17} />
          </div>

          <div className="relative z-10 flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-0.5">
              <p className={cn(
                'text-[13px] leading-snug tracking-tight flex-1',
                n.read ? 'font-medium text-muted-foreground' : 'font-bold text-foreground'
              )}>
                {n.title}
              </p>
              <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                {!n.read && (
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'hsl(var(--primary))' }} />
                )}
                {isRecent && (
                  <span className={cn(
                    'text-[9px] font-bold px-1.5 py-[3px] rounded-full uppercase tracking-wide',
                    cfg.bg, cfg.color
                  )}>
                    {cfg.label}
                  </span>
                )}
              </div>
            </div>

            <p className="text-[12px] text-muted-foreground line-clamp-2 leading-relaxed">{n.message}</p>

            <div className="flex items-center justify-between mt-1.5">
              <p className="text-[10px] text-muted-foreground/40 font-medium">{timeAgo}</p>
              {n.requestId && (
                <span className={cn('text-[10px] font-semibold flex items-center gap-0.5', cfg.color)}>
                  View →
                </span>
              )}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, markNotificationRead } = useAppStore();
  const streak = useGamificationStore((s) => s.streak);
  const [filter, setFilter] = useState('all');
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const listRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Entrance animation
  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
    }
    if (listRef.current) {
      const children = Array.from(listRef.current.children);
      gsap.fromTo(children,
        { opacity: 0, y: 18, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out', stagger: 0.05, delay: 0.1, clearProps: 'transform' }
      );
    }
  }, [filter]);

  const handleClick = (n: Notification) => {
    markNotificationRead(n.id);
    if (n.requestId) navigate(`/request/${n.requestId}`);
  };

  const handleDismiss = (id: string) => {
    markNotificationRead(id);
    setDismissed(prev => new Set([...prev, id]));
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllRead = () => {
    // Animate then mark
    if (listRef.current) {
      const unreadEls = Array.from(listRef.current.querySelectorAll('[data-unread="true"]'));
      gsap.to(unreadEls, { scale: 0.98, opacity: 0.6, duration: 0.2, stagger: 0.03, yoyo: true, repeat: 1 });
    }
    notifications.forEach(n => { if (!n.read) markNotificationRead(n.id); });
  };

  const visible = useMemo(() => {
    let list = filter === 'all' ? notifications : notifications.filter(n => n.type === filter);
    return list.filter(n => !dismissed.has(n.id));
  }, [notifications, filter, dismissed]);

  // Group by date
  const groups = useMemo(() => {
    const map: Record<string, Notification[]> = {};
    visible.forEach(n => {
      const label = getGroupLabel(new Date(n.timestamp));
      if (!map[label]) map[label] = [];
      map[label].push(n);
    });
    const order = ['Today', 'Yesterday', 'Earlier'];
    return order.filter(k => map[k]).map(k => ({ label: k, items: map[k] }));
  }, [visible]);

  const showStreakWarning = streak.count > 0 && streak.lastActiveDate !== new Date().toISOString().split('T')[0];

  return (
    <>
      <div className="mobile-container min-h-screen bg-background pb-28">

        {/* ── Top bar ── */}
        <header
          ref={headerRef}
          className="sticky top-0 z-40"
          style={{
            background: 'hsla(var(--glass-bg) / 0.3)',
            backdropFilter: 'blur(var(--glass-blur-ultra)) saturate(240%)',
            WebkitBackdropFilter: 'blur(var(--glass-blur-ultra)) saturate(240%)',
            borderBottom: '0.5px solid hsla(var(--glass-border) / 0.5)',
            boxShadow: '0 0.5px 8px hsla(var(--glass-shadow)), inset 0 0.5px 0 hsla(var(--glass-highlight))',
          }}>
          <div className="flex items-center h-[48px] px-4 gap-3">
            <button onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center tap-scale shrink-0">
              <span className="text-sm font-medium">←</span>
            </button>
            <span className="flex-1 text-[17px] font-bold text-foreground tracking-tight">Notifications</span>
            {unreadCount > 0 && (
              <Button onClick={markAllRead} variant="ghost" size="sm" className="h-7 px-3 text-[11px] text-primary font-bold rounded-full gap-1.5">
                <AppIcon name="fc:checkmark" size={12} />
                Mark all read
              </Button>
            )}
          </div>
        </header>

        {/* ── Unread hero banner ── */}
        {unreadCount > 0 && (
          <div className="mx-4 mt-4 px-4 py-3 rounded-[1rem] flex items-center gap-3"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, hsl(var(--primary) / 0.04) 100%)',
              border: '0.5px solid hsl(var(--primary) / 0.2)',
            }}>
            <div className="w-9 h-9 rounded-[0.75rem] flex items-center justify-center shrink-0"
              style={{ background: 'hsl(var(--primary) / 0.12)' }}>
              <AppIcon name="se:bell" size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-foreground tracking-tight">
                {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Swipe left to dismiss any item</p>
            </div>
            <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'hsl(var(--primary))' }}>
              <span className="text-[10px] font-bold text-primary-foreground">{unreadCount > 9 ? '9+' : unreadCount}</span>
            </div>
          </div>
        )}

        {/* ── Streak warning ── */}
        {showStreakWarning && (
          <div className="mx-4 mt-3 flex items-center gap-3 px-4 py-3 rounded-[1rem]"
            style={{ background: 'hsl(var(--accent) / 0.08)', border: '0.5px solid hsl(var(--accent) / 0.25)' }}>
            <AppIcon name="se:fire" size={18} className="shrink-0 animate-pulse" />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-accent">{streak.count}-day streak at risk!</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Do something social today to keep it alive</p>
            </div>
            <Button onClick={() => navigate('/home')} size="sm" className="h-7 px-3 text-[10px] rounded-full shrink-0">
              Go →
            </Button>
          </div>
        )}

        {/* ── Filter chips ── */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide px-4 pt-4 pb-2">
          {FILTER_TABS.map((tab) => (
            <button key={tab.id} onClick={() => setFilter(tab.id)}
              className={cn(
                'shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-semibold tap-scale transition-all',
                filter === tab.id ? 'glass-pill-active' : 'glass-pill-inactive'
              )}>
              <AppIcon name={tab.icon} size={13} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="px-4 pt-1">
          {notifications.length > 0 ? (
            visible.length > 0 ? (
              <div ref={listRef}>
                {groups.map(({ label, items }) => (
                  <div key={label}>
                    {/* Section header */}
                    <div className="flex items-center gap-2 py-2.5">
                      <span className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider">{label}</span>
                      <div className="flex-1 h-px bg-border/30" />
                      <span className="text-[10px] font-semibold text-muted-foreground/40 bg-muted/30 px-2 py-0.5 rounded-full">
                        {items.length}
                      </span>
                    </div>

                    {items.map((n, i) => (
                      <div key={n.id} data-unread={!n.read}>
                        <NotifItem
                          n={n}
                          index={i}
                          onClick={() => handleClick(n)}
                          onDismiss={handleDismiss}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <AppIcon name="se:bell-with-slash" size={28} className="mx-auto opacity-40 mb-3" />
                <p className="text-[14px] font-semibold text-muted-foreground">
                  No {filter === 'all' ? '' : filter} notifications
                </p>
              </div>
            )
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-[1.5rem] liquid-glass flex items-center justify-center mx-auto mb-5">
                <AppIcon name="se:bell" size={28} className="opacity-40" />
              </div>
              <p className="text-[17px] font-bold text-foreground mb-2 tracking-tight">All quiet here</p>
              <p className="text-[13px] text-muted-foreground mb-8 leading-relaxed max-w-[220px] mx-auto">
                Joins, streaks, nearby plans and badges will show up here.
              </p>
              <Button onClick={() => navigate('/home')} size="sm">Browse plans</Button>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </>
  );
}
