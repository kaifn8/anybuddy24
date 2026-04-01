import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { StreakWidget } from '@/components/gamification/StreakWidget';
import { AppIcon } from '@/components/icons/AppIcon';

// Core 5-tab nav: Home | Map | Post | Notifications | Me
const navItems = [
  { name: 'Home',    path: '/home',          icon: 'tw:home'          },
  { name: 'Map',     path: '/map',           icon: 'tw:map'           },
  { name: 'Post',    path: '/create',        icon: 'tw:plus',  isMain: true },
  { name: 'Alerts',  path: '/notifications', icon: 'tw:bell'          },
  { name: 'Me',      path: '/profile',       icon: null               },
] as const;

// Desktop sidebar — all sections
const desktopItems = [
  { name: 'Home',          path: '/home',          icon: 'tw:home'           },
  { name: 'Map',           path: '/map',           icon: 'tw:map'            },
  { name: 'Chats',         path: '/chats',         icon: 'tw:chat'           },
  { name: 'Notifications', path: '/notifications', icon: 'tw:bell'           },
  { name: 'Quests',        path: '/quests',        icon: 'tw:quests'         },
  { name: 'My Circle',     path: '/circle',        icon: 'tw:circle'         },
  { name: 'Leaderboard',   path: '/leaderboard',   icon: 'tw:leaderboard'    },
] as const;

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const notifications = useAppStore((s) => s.notifications);
  const user = useAppStore((s) => s.user);
  const streak = useGamificationStore((s) => s.streak);
  const unlockedAchievements = useGamificationStore((s) => s.unlockedAchievements);

  const unreadCount = notifications.filter(n => !n.read).length;
  const questsBadge = unlockedAchievements.filter(a => !a.seen).length;

  const { joinedRequests, chatMessages } = useAppStore();
  const chatUnread = joinedRequests.reduce((acc, id) => {
    const msgs = chatMessages[id] || [];
    return acc + (msgs.length > 0 ? 1 : 0);
  }, 0);

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <nav className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 z-50 flex-col" style={{
        background: 'hsla(var(--glass-bg) / 0.3)',
        backdropFilter: 'blur(var(--glass-blur-ultra)) saturate(240%)',
        WebkitBackdropFilter: 'blur(var(--glass-blur-ultra)) saturate(240%)',
        borderRight: '0.5px solid hsla(var(--glass-border) / 0.5)',
        boxShadow: '0.5px 0 8px hsla(var(--glass-shadow)), inset -0.5px 0 0 hsla(var(--glass-highlight))',
      }}>
        {/* Logo */}
        <div className="px-5 h-14 flex items-center">
          <span className="text-[20px]" style={{ fontFamily: "'Pacifico', cursive" }}>
            any<span className="text-primary">buddy</span>
          </span>
        </div>

        {/* Post button */}
        <div className="px-3 pt-1 pb-3">
          <Button onClick={() => navigate('/create')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl">
            <AppIcon name="tw:plus" size={18} />
            <span className="text-[13px]">Post a plan</span>
          </Button>
        </div>

        {/* Nav items */}
        <div className="flex-1 flex flex-col gap-0.5 px-3">
          {desktopItems.map((item) => {
            const isActive = location.pathname === item.path
              || (item.path !== '/home' && location.pathname.startsWith(item.path));
            const badge = item.path === '/notifications' ? unreadCount
              : item.path === '/chats' ? chatUnread
              : item.path === '/quests' ? questsBadge
              : 0;

            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl tap-scale transition-all text-left relative',
                  isActive
                    ? 'bg-primary/8 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                )}>
                <div className="relative">
                  <AppIcon
                    name={item.icon as any}
                    size={20}
                    className={cn('transition-all', !isActive && 'opacity-50 grayscale')}
                  />
                  {badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-destructive text-white text-[8px] rounded-full min-w-[14px] h-[14px] flex items-center justify-center font-bold px-0.5">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </div>
                <span className="text-[13px]">{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Footer: streak + profile + settings */}
        <div className="px-3 pb-4 space-y-1 border-t border-border/10 pt-3">
          <div className="px-3 py-2">
            <StreakWidget compact className="justify-start" />
          </div>
          <button onClick={() => navigate('/profile')}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl tap-scale transition-all w-full text-left',
              location.pathname === '/profile'
                ? 'bg-primary/8 text-primary font-semibold'
                : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
            )}>
            <GradientAvatar name={user?.firstName || 'Me'} size={22}
              className={cn(location.pathname === '/profile'
                ? 'ring-[1.5px] ring-primary ring-offset-1 ring-offset-background'
                : 'opacity-60')}
              showInitials={false} />
            <span className="text-[13px]">{user?.firstName || 'Profile'}</span>
          </button>
          <button onClick={() => navigate('/settings')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl tap-scale text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all w-full text-left">
            <AppIcon name="tw:settings" size={20} className="opacity-60" />
            <span className="text-[13px]">Settings</span>
          </button>
        </div>
      </nav>

      {/* ── Mobile bottom nav dock ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="max-w-md mx-auto px-5 pb-2">
          <div className="relative rounded-full px-2 py-1.5" style={{
            background: 'hsla(var(--glass-bg) / 0.3)',
            backdropFilter: 'blur(var(--glass-blur-ultra)) saturate(280%)',
            WebkitBackdropFilter: 'blur(var(--glass-blur-ultra)) saturate(280%)',
            border: '0.5px solid hsla(var(--glass-border))',
            boxShadow: `0 -2px 8px hsla(var(--glass-shadow)), 0 8px 40px hsla(var(--glass-shadow-lg)), 0 1px 4px hsla(var(--glass-shadow)), inset 0 1px 0 hsla(var(--glass-highlight))`,
          }}>
            <div className="flex items-center justify-between">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const badge = item.path === '/notifications' ? unreadCount : 0;
                const isMain = 'isMain' in item && item.isMain;

                /* ── Center Post pill ── */
                if (isMain) {
                  return (
                    <button key={item.path} onClick={() => navigate(item.path)} className="tap-scale group">
                      <div className="h-[40px] px-5 rounded-full flex items-center justify-center gap-1.5 transition-transform group-active:scale-90" style={{
                        background: `linear-gradient(145deg, hsl(var(--primary)) 0%, hsl(211 100% 40%) 100%)`,
                        boxShadow: `0 4px 16px hsl(var(--primary) / 0.3), inset 0 1px 0 hsla(0 0% 100% / 0.2)`,
                      }}>
                        <span className="text-[11px] font-bold text-white tracking-wide">Post</span>
                      </div>
                    </button>
                  );
                }

                /* ── Regular tab ── */
                return (
                  <button key={item.path} onClick={() => navigate(item.path)}
                    className={cn(
                      'relative flex items-center justify-center w-[44px] h-[40px] rounded-full tap-scale transition-all duration-300',
                      isActive && 'bg-primary/10'
                    )}>
                    <div className="relative">
                      {item.path === '/profile' ? (
                        <GradientAvatar name={user?.firstName || 'Me'} size={isActive ? 24 : 22}
                          className={cn('transition-all duration-300', isActive
                            ? 'ring-[1.5px] ring-primary ring-offset-1 ring-offset-transparent'
                            : 'opacity-40')}
                          showInitials={false} />
                      ) : (
                        <AppIcon
                          name={item.icon as any}
                          size={22}
                          className={cn('block transition-all duration-300',
                            isActive ? 'scale-110' : 'opacity-35 grayscale')}
                          style={isActive ? { transform: 'scale(1.1)' } : undefined}
                        />
                      )}

                      {/* Badge */}
                      {badge > 0 && (
                        <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] rounded-full flex items-center justify-center text-[7px] font-bold px-[2px]"
                          style={{ background: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))', boxShadow: '0 2px 6px hsl(var(--destructive) / 0.4)' }}>
                          {badge > 9 ? '9+' : badge}
                        </span>
                      )}

                      {/* Quest badge on Me tab */}
                      {item.path === '/profile' && questsBadge > 0 && (
                        <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] rounded-full flex items-center justify-center text-[7px] font-bold px-[2px]"
                          style={{ background: 'hsl(var(--accent))', color: '#fff', boxShadow: '0 2px 6px hsl(var(--accent) / 0.5)' }}>
                          {questsBadge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};
