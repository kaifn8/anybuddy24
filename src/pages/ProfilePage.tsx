import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { BottomNav } from '@/components/layout/BottomNav';
import { CategoryIcon, getCategoryLabel } from '@/components/icons/CategoryIcon';
import { useAppStore } from '@/store/useAppStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { Button } from '@/components/ui/button';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { TrustBadge } from '@/components/ui/TrustBadge';
import { BlueTick } from '@/components/ui/BlueTick';
import { VerificationCard } from '@/components/profile/VerificationCard';
import { getLevelForXP, getNextLevel, getXPProgress } from '@/types/gamification';
import { cn } from '@/lib/utils';
import { AppIcon } from '@/components/icons/AppIcon';
import type { Badge, Category } from '@/types/anybuddy';

// ── Badge config with AppIcon instead of emoji ────────────────
const badgeConfig: Record<Badge, { icon: React.ReactNode; label: string; color: string }> = {
  verified_host:  { icon: <AppIcon name="tw:check"    size={13} />, label: 'Verified Host',  color: 'hsl(var(--primary))'   },
  top_host:       { icon: <AppIcon name="tw:trophy"   size={13} />, label: 'Top Host',       color: 'hsl(36 80% 48%)'       },
  trusted_member: { icon: <AppIcon name="tw:shield"   size={13} />, label: 'Trusted',        color: 'hsl(var(--success))'   },
  early_adopter:  { icon: <AppIcon name="tw:star"     size={13} />, label: 'Early Adopter',  color: 'hsl(var(--accent))'    },
  streak_7:       { icon: <AppIcon name="tw:fire"     size={13} />, label: '7-Day Streak',   color: 'hsl(var(--accent))'    },
};

// ── Level icon map (replaces emoji from gamification data) ────
const LEVEL_ICONS: Record<number, React.ReactNode> = {
  1: <AppIcon name="tw:seedling"  size={18} />,
  2: <AppIcon name="se:explore"   size={18} />,
  3: <AppIcon name="tw:handshake" size={18} />,
  4: <AppIcon name="tw:lightning" size={18} />,
  5: <AppIcon name="tw:world"     size={18} />,
  6: <AppIcon name="tw:star"      size={18} />,
  7: <AppIcon name="tw:fire"      size={18} />,
};

const INTEREST_OPTIONS: Category[] = ['chai', 'sports', 'food', 'explore', 'work', 'walk', 'help', 'casual', 'shopping'];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user: rawUser, myRequests, requests, updateUser } = useAppStore();
  const { xp, streak, unlockedAchievements } = useGamificationStore();

  const pageRef  = useRef<HTMLDivElement>(null);
  const xpBarRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Edit profile state
  const [editOpen, setEditOpen] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editZone, setEditZone] = useState('');
  const [editInterests, setEditInterests] = useState<Category[]>([]);

  const user = rawUser ? {
    ...rawUser,
    badges:     rawUser.badges     || [],
    interests:  rawUser.interests  || [],
    savedPlans: rawUser.savedPlans || [],
  } : null;

  const level       = user ? getLevelForXP(xp) : null;
  const nextLevel   = user ? getNextLevel(xp) : null;
  const xpPct       = user ? getXPProgress(xp) : 0;
  const xpIntoLevel = (nextLevel && level) ? xp - level.xpRequired : 0;
  const xpNeeded    = (nextLevel && level) ? nextLevel.xpRequired - level.xpRequired : 1;

  // Entrance animation
  useEffect(() => {
    if (!user || !pageRef.current) return;
    gsap.fromTo(Array.from(pageRef.current.children),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power3.out', clearProps: 'transform' }
    );
    if (xpBarRef.current) {
      gsap.fromTo(xpBarRef.current,
        { width: '0%' },
        { width: `${xpPct}%`, duration: 1.1, ease: 'power2.out', delay: 0.45 }
      );
    }
  }, [user]);

  // Edit sheet animation
  useEffect(() => {
    if (!sheetRef.current) return;
    if (editOpen) {
      gsap.fromTo(sheetRef.current,
        { y: '100%' },
        { y: '0%', duration: 0.32, ease: 'power3.out' }
      );
    }
  }, [editOpen]);

  const openEdit = () => {
    if (!user) return;
    setEditBio(user.bio || '');
    setEditZone(user.zone || '');
    setEditInterests(user.interests || []);
    setEditOpen(true);
  };

  const closeEdit = () => {
    if (sheetRef.current) {
      gsap.to(sheetRef.current, {
        y: '100%', duration: 0.25, ease: 'power2.in',
        onComplete: () => setEditOpen(false),
      });
    } else {
      setEditOpen(false);
    }
  };

  const saveEdit = () => {
    updateUser({ bio: editBio.trim(), zone: editZone.trim(), interests: editInterests });
    closeEdit();
  };

  const toggleInterest = (i: Category) =>
    setEditInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  // ── No user ────────────────────────────────────────────────
  if (!user) {
    return (
      <>
        <div className="mobile-container min-h-screen bg-background flex items-center justify-center">
          <div className="text-center px-8">
            <div className="w-16 h-16 rounded-[1.25rem] liquid-glass flex items-center justify-center mx-auto mb-5">
              <AppIcon name="fc:businessman" size={32} className="opacity-50" />
            </div>
            <p className="text-[16px] font-bold text-foreground mb-1.5 tracking-tight">Sign in to view your profile</p>
            <p className="text-sm text-muted-foreground mb-6">Your plans, badges, and stats</p>
            <Button onClick={() => navigate('/signup')} className="h-11 px-8">Sign In</Button>
          </div>
        </div>
        <BottomNav />
      </>
    );
  }

  const totalPlans     = user.meetupsAttended + user.completedJoins;
  const newAchievements = unlockedAchievements.filter(a => !a.seen).length;
  const pastMeetups    = requests.filter(r => r.status === 'completed' && r.participants.some(p => p.id === user.id));
  const verifiedStatus = user.verificationStatus || 'unverified';
  const streakAlive    = streak.lastActiveDate === new Date().toISOString().split('T')[0];
  const recentActivity = [
    ...myRequests.slice(0, 2).map(r => ({ req: r, tag: 'Hosted' as const })),
    ...pastMeetups.slice(0, 2).map(r => ({ req: r, tag: 'Attended' as const })),
  ];

  return (
    <>
      <div className="mobile-container min-h-screen bg-background pb-28">

        {/* ── Sticky top bar ── */}
        <header className="sticky top-0 z-40" style={{
          background: 'hsla(var(--glass-bg) / 0.3)',
          backdropFilter: 'blur(var(--glass-blur-ultra)) saturate(240%)',
          WebkitBackdropFilter: 'blur(var(--glass-blur-ultra)) saturate(240%)',
          borderBottom: '0.5px solid hsla(var(--glass-border) / 0.5)',
          boxShadow: '0 0.5px 8px hsla(var(--glass-shadow)), inset 0 0.5px 0 hsla(var(--glass-highlight))',
        }}>
          <div className="flex items-center justify-between h-[48px] px-4">
            <span className="text-[17px] font-bold text-foreground tracking-tight">Profile</span>
            <div className="flex items-center gap-1.5">
              <Button onClick={openEdit} variant="ghost" size="sm" className="h-8 px-3 rounded-full gap-1.5">
                <AppIcon name="tw:edit" size={13} />
                <span className="text-[11px] font-semibold">Edit</span>
              </Button>
              <Button onClick={() => navigate('/settings')} variant="ghost" size="icon" className="w-8 h-8 rounded-full">
                <AppIcon name="tw:settings" size={17} />
              </Button>
            </div>
          </div>
        </header>

        {/* ── Content ── */}
        <div ref={pageRef} className="px-4 pt-5 space-y-3 pb-2">

          {/* 1. Instagram-style hero: avatar+stats row, then name+bio */}
          <div className="liquid-glass rounded-[1.25rem] p-4">
            {/* Row: avatar left, stats right */}
            <div className="flex items-center gap-4 mb-3">
              <div className="relative shrink-0">
                <GradientAvatar name={user.firstName} size={76} />
                {verifiedStatus === 'verified' && (
                  <BlueTick size={20} className="absolute -bottom-0.5 -right-0.5" />
                )}
              </div>
              {/* Stats row: show-up / plans / hosted */}
              <div className="flex-1 grid grid-cols-3 gap-1 text-center">
                {[
                  { value: `${user.reliabilityScore}%`, label: 'Show-up', color: 'text-success' },
                  { value: totalPlans,                   label: 'Plans',   color: 'text-foreground' },
                  { value: user.meetupsHosted,            label: 'Hosted',  color: 'text-foreground' },
                ].map((s, i) => (
                  <div key={i}>
                    <p className={cn('text-[18px] font-bold tabular-nums leading-tight', s.color)}>{s.value}</p>
                    <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-medium mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Name + trust + location */}
            <div className="mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[18px] font-bold tracking-tight text-foreground leading-tight">{user.firstName}</h2>
                <TrustBadge level={user.trustLevel} size="sm" />
              </div>
              {(user.zone || user.city) && (
                <p className="text-[11px] text-muted-foreground/50 mt-0.5 flex items-center gap-1">
                  <AppIcon name="tw:pin" size={10} />
                  {user.zone || user.city}
                </p>
              )}
            </div>

            {/* Bio */}
            {user.bio ? (
              <p className="text-[12px] text-muted-foreground leading-relaxed">{user.bio}</p>
            ) : (
              <Button onClick={openEdit} variant="link" size="sm" className="h-auto p-0 text-[11px] text-primary/60 gap-1 mt-0.5">
                <AppIcon name="tw:edit" size={11} />
                Add a bio
              </Button>
            )}

            {/* Host rating */}
            {user.hostRating > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <AppIcon name="tw:star" size={12} />
                <span className="text-[11px] font-bold text-foreground">{user.hostRating.toFixed(1)}</span>
                <span className="text-[10px] text-muted-foreground/50">host rating</span>
              </div>
            )}
          </div>

          {/* 2. XP + Level */}
          <div className="liquid-glass rounded-[1rem] px-4 py-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[0.75rem] flex items-center justify-center shrink-0"
                  style={{ background: `hsl(${level?.color ?? '220 8% 55%'} / 0.15)` }}>
                  {LEVEL_ICONS[level?.level ?? 1]}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-foreground tracking-tight">{level?.title}</p>
                  <p className="text-[10px] text-muted-foreground/50">Level {level?.level}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-bold text-foreground">{xp} <span className="text-muted-foreground/40 font-normal text-[10px]">XP</span></p>
                {nextLevel && (
                  <p className="text-[10px] text-muted-foreground/40">{xpIntoLevel}/{xpNeeded} to next</p>
                )}
              </div>
            </div>
            <div className="h-[5px] rounded-full overflow-hidden" style={{ background: 'hsla(var(--muted) / 0.4)' }}>
              <div ref={xpBarRef} className="h-full rounded-full" style={{
                width: '0%',
                background: `linear-gradient(90deg, hsl(${level?.color ?? '211 100% 50%'}), hsl(var(--primary)))`,
                boxShadow: '0 0 8px hsl(var(--primary) / 0.35)',
              }} />
            </div>
          </div>

          {/* 3. Streak */}
          {streak.count > 0 && (
            <button onClick={() => navigate('/quests')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-[1rem] tap-scale text-left"
              style={{
                background: streakAlive ? 'hsl(var(--accent) / 0.08)' : 'hsla(var(--muted) / 0.3)',
                border: `0.5px solid ${streakAlive ? 'hsl(var(--accent) / 0.25)' : 'hsla(var(--border) / 0.3)'}`,
              }}>
              <AppIcon name="tw:fire" size={22} className={streakAlive ? '' : 'grayscale opacity-30'} />
              <div className="flex-1">
                <p className="text-[13px] font-bold text-foreground">{streak.count}-day streak</p>
                <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                  {streakAlive ? 'Active today · Keep it up' : 'Complete a plan today to keep it'}
                </p>
              </div>
              {!streakAlive
                ? <span className="text-[10px] font-bold text-destructive shrink-0">At risk</span>
                : <span className="text-muted-foreground/30 text-sm shrink-0">›</span>}
            </button>
          )}

          {/* 4. Quick actions grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: 'tw:quests'         as const, label: 'Quests',       sub: 'Daily challenges', path: '/quests',      badge: newAchievements },
              { icon: 'tw:leaderboard'    as const, label: 'Leaderboard',  sub: 'City rankings',    path: '/leaderboard', badge: 0               },
              { icon: 'fc:money-transfer' as const, label: 'Credits',      sub: `${user.credits} pts`, path: '/credits',  badge: 0               },
              { icon: 'fc:invite'         as const, label: 'Invite & Earn',sub: '+1 credit/friend', path: '/invite',      badge: 0               },
            ].map((item) => (
              <button key={item.path} onClick={() => navigate(item.path)}
                className="liquid-glass-interactive flex items-center gap-3 px-3.5 py-3 text-left relative overflow-hidden">
                {item.badge > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-destructive flex items-center justify-center text-[8px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
                <div className="w-9 h-9 rounded-[0.75rem] liquid-glass flex items-center justify-center shrink-0">
                  <AppIcon name={item.icon} size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-foreground tracking-tight truncate">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground/50 mt-0.5 truncate">{item.sub}</p>
                </div>
              </button>
            ))}
          </div>

          {/* 5. Interests */}
          {user.interests.length > 0 && (
            <div>
              <p className="section-label mb-2.5">Into</p>
              <div className="flex flex-wrap gap-1.5">
                {user.interests.map((i) => (
                  <span key={i}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold liquid-glass rounded-full text-muted-foreground">
                    <CategoryIcon category={i} size="sm" className="!w-4 !h-4 !rounded-md bg-transparent" />
                    <span>{getCategoryLabel(i)}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 6. Badges */}
          {user.badges.length > 0 && (
            <div>
              <p className="section-label mb-2.5">Badges</p>
              <div className="flex flex-wrap gap-1.5">
                {user.badges.map((badge) => {
                  const cfg = badgeConfig[badge];
                  if (!cfg) return null;
                  return (
                    <span key={badge}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-full"
                      style={{ background: `${cfg.color}15`, color: cfg.color }}>
                      {cfg.icon} {cfg.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* 7. Verification */}
          <VerificationCard />

          {/* 8. Recent activity */}
          {recentActivity.length > 0 && (
            <div>
              <p className="section-label mb-2.5">Recent</p>
              <div className="space-y-1.5">
                {recentActivity.map(({ req, tag }) => (
                  <button key={req.id + tag} onClick={() => navigate(`/request/${req.id}`)}
                    className="w-full liquid-glass-interactive flex items-center gap-3 p-3 text-left">
                    <CategoryIcon category={req.category} size="sm" className="shrink-0 !w-7 !h-7 liquid-glass" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate tracking-tight">{req.title}</p>
                      <p className="text-[10px] text-muted-foreground/50 mt-0.5 flex items-center gap-1">
                        <AppIcon name="tw:pin" size={9} /> {req.location.name}
                      </p>
                    </div>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                      style={{
                        background: tag === 'Hosted' ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--success) / 0.1)',
                        color: tag === 'Hosted' ? 'hsl(var(--primary))' : 'hsl(var(--success))',
                      }}>
                      {tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {recentActivity.length === 0 && user.badges.length === 0 && (
            <div className="text-center py-10">
              <AppIcon name="tw:seedling" size={36} className="mx-auto mb-3 opacity-60" />
              <p className="text-[14px] font-semibold text-foreground mb-1 tracking-tight">Nothing yet</p>
              <p className="text-[13px] text-muted-foreground mb-5">Join a plan to fill your profile</p>
              <Button onClick={() => navigate('/home')} variant="secondary" size="sm">Browse plans</Button>
            </div>
          )}

        </div>
      </div>

      {/* ── Edit Profile bottom sheet ── */}
      {editOpen && (
        <div className="fixed inset-0 z-[60]">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={closeEdit} />

          {/* Sheet */}
          <div ref={sheetRef}
            className="absolute bottom-0 left-0 right-0 max-w-md mx-auto rounded-t-[1.5rem] overflow-hidden"
            style={{
              background: 'hsl(var(--background))',
              border: '0.5px solid hsla(var(--glass-border) / 0.4)',
              boxShadow: '0 -8px 40px hsl(var(--foreground) / 0.12)',
              transform: 'translateY(100%)',
              maxHeight: '88vh',
              overflowY: 'auto',
            }}>

            {/* Sheet header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border/10 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
              <Button onClick={closeEdit} variant="ghost" size="sm" className="h-auto p-0 text-[13px]">
                Cancel
              </Button>
              <div>
                <div className="w-10 h-1 rounded-full bg-muted/50 mx-auto mb-1" />
                <p className="text-[15px] font-bold text-foreground tracking-tight">Edit Profile</p>
              </div>
              <Button onClick={saveEdit} variant="link" size="sm" className="h-auto p-0 text-[13px] font-bold">
                Save
              </Button>
            </div>

            <div className="px-5 py-4 space-y-5 pb-10">
              {/* Avatar — decorative, tapping shows camera hint */}
              <div className="flex justify-center">
                <div className="relative">
                  <GradientAvatar name={user.firstName} size={80} />
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/20 opacity-0 hover:opacity-100 transition-opacity">
                    <AppIcon name="tw:camera" size={20} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center border-2 border-background">
                    <AppIcon name="tw:edit" size={12} />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Bio</label>
                <textarea
                  value={editBio}
                  onChange={e => setEditBio(e.target.value.slice(0, 120))}
                  placeholder="Tell people a little about yourself…"
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-[0.875rem] text-[13px] bg-muted/30 text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
                <p className="text-[10px] text-muted-foreground/40 text-right mt-1">{editBio.length}/120</p>
              </div>

              {/* Neighbourhood */}
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <AppIcon name="tw:pin" size={11} /> Neighbourhood
                </label>
                <input
                  value={editZone}
                  onChange={e => setEditZone(e.target.value)}
                  placeholder="e.g. Bandra West"
                  className="w-full h-11 px-3.5 rounded-[0.875rem] text-[13px] bg-muted/30 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>

              {/* Interests */}
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">Interests</label>
                <div className="flex flex-wrap gap-1.5">
                  {INTEREST_OPTIONS.map((i) => (
                    <button key={i} onClick={() => toggleInterest(i)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold tap-scale transition-all',
                        editInterests.includes(i) ? 'glass-pill-active' : 'glass-pill-inactive'
                      )}>
                      <CategoryIcon category={i} size="sm" className="!w-4 !h-4 !rounded-md bg-transparent" />
                      <span>{getCategoryLabel(i)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Save button */}
              <Button onClick={saveEdit} className="w-full h-12">Save changes</Button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </>
  );
}
