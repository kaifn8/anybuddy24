import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAppStore } from '@/store/useAppStore';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

import type { Category } from '@/types/anybuddy';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import { AppIcon } from '@/components/icons/AppIcon';

const INTEREST_OPTIONS: Category[] = ['chai', 'sports', 'food', 'explore', 'work', 'walk', 'help', 'casual'];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, reset, updateUser } = useAppStore();
  const { isDark, toggleTheme } = useTheme();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);

  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editZone, setEditZone] = useState(user?.zone || '');
  const [editInterests, setEditInterests] = useState<Category[]>(user?.interests || []);

  const handleSaveProfile = () => {
    updateUser({ bio: editBio.trim(), zone: editZone.trim(), interests: editInterests });
    setEditingProfile(false);
  };

  const toggleInterest = (i: Category) => {
    setEditInterests(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );
  };

  const handleLogout = () => { reset(); navigate('/'); };

  if (!user) {
    return (
      <div className="mobile-container min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-40" style={{
          background: 'hsla(var(--glass-bg) / 0.3)',
          backdropFilter: 'blur(var(--glass-blur-ultra)) saturate(240%)',
          WebkitBackdropFilter: 'blur(var(--glass-blur-ultra)) saturate(240%)',
          borderBottom: '0.5px solid hsla(var(--glass-border) / 0.5)',
          boxShadow: '0 0.5px 8px hsla(var(--glass-shadow)), inset 0 0.5px 0 hsla(var(--glass-highlight))',
        }}>
          <div className="flex items-center h-[48px] px-4 gap-3">
            <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center tap-scale shrink-0">
              <span className="text-sm font-medium">←</span>
            </button>
            <span className="text-[17px] font-bold text-foreground tracking-tight">Settings</span>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center px-8 pt-32 text-center">
          <Button onClick={() => navigate('/signup')} className="h-11 px-8">Sign In</Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="mobile-container min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-40" style={{
          background: 'hsla(var(--glass-bg) / 0.3)',
          backdropFilter: 'blur(var(--glass-blur-ultra)) saturate(240%)',
          WebkitBackdropFilter: 'blur(var(--glass-blur-ultra)) saturate(240%)',
          borderBottom: '0.5px solid hsla(var(--glass-border) / 0.5)',
          boxShadow: '0 0.5px 8px hsla(var(--glass-shadow)), inset 0 0.5px 0 hsla(var(--glass-highlight))',
      }}>
        <div className="flex items-center h-[48px] px-4 gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center tap-scale shrink-0">
            <span className="text-sm font-medium">←</span>
          </button>
          <span className="text-[17px] font-bold text-foreground tracking-tight flex-1">Settings</span>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-3">

        {/* Profile card */}
        {!editingProfile ? (
          <button onClick={() => { setEditBio(user.bio || ''); setEditZone(user.zone || ''); setEditInterests(user.interests || []); setEditingProfile(true); }}
            className="w-full liquid-glass-heavy tap-scale text-left p-4">
            <div className="flex items-center gap-3.5">
              <GradientAvatar name={user.firstName} size={52} className="shrink-0" />
              <div className="flex-1 min-w-0">
                <h2 className="text-[16px] font-bold tracking-tight truncate">{user.firstName}</h2>
                <p className="text-[12px] text-muted-foreground truncate mt-0.5">{user.phone}</p>
                {user.bio && <p className="text-[11px] text-muted-foreground/60 truncate mt-0.5">{user.bio}</p>}
                <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-primary/8 text-primary text-[10px] font-bold">
                  ⚡ {user.credits} credits
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <AppIcon name="fc:bookmark" size={13} className="opacity-50" />
                <span className="text-muted-foreground/30 text-sm">›</span>
              </div>
            </div>
          </button>
        ) : (
          <div className="liquid-glass-heavy p-4 space-y-3.5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[14px] font-bold text-foreground">Edit Profile</p>
              <div className="flex gap-2">
                <Button onClick={() => setEditingProfile(false)} variant="ghost" size="sm" className="h-7 px-3 text-[11px] rounded-full">
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} size="sm" className="h-7 px-3 text-[11px] rounded-full gap-1">
                  <AppIcon name="fc:checkmark" size={11} /> Save
                </Button>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Bio</label>
              <textarea
                value={editBio}
                onChange={e => setEditBio(e.target.value.slice(0, 120))}
                placeholder="Short bio (120 chars)"
                rows={2}
                className="w-full px-3 py-2 rounded-[0.75rem] text-[13px] bg-muted/30 text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              <p className="text-[9px] text-muted-foreground/40 text-right mt-0.5">{editBio.length}/120</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Neighbourhood</label>
              <input
                value={editZone}
                onChange={e => setEditZone(e.target.value)}
                placeholder="e.g. Bandra West"
                className="w-full h-9 px-3 rounded-[0.75rem] text-[13px] bg-muted/30 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">Interests</label>
              <div className="flex flex-wrap gap-1.5">
                {INTEREST_OPTIONS.map((i) => (
                  <button key={i} onClick={() => toggleInterest(i)}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tap-scale transition-all',
                      editInterests.includes(i) ? 'glass-pill-active' : 'glass-pill-inactive'
                    )}>
                    <CategoryIcon category={i} size="sm" className="!w-4 !h-4 !rounded-md bg-transparent" />
                    <span className="capitalize">{i}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-2">
          <QuickAction icon="fc:money-transfer" label="Credits" sublabel={`${user.credits} pts`} onClick={() => navigate('/credits')} />
          <QuickAction icon="fc:invite" label="Invite" sublabel="Earn credits" onClick={() => navigate('/invite')} />
        </div>

        {/* Appearance */}
        <SettingsSection title="Appearance">
          <SettingsToggle icon="fc:idea" label="Dark Mode" checked={isDark} onCheckedChange={toggleTheme} />
          <Divider />
          <SettingsLink icon="fc:globe" label="Language" value="English" soon />
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications">
          <SettingsToggle icon="se:bell" label="Push Notifications" checked={pushNotifications} onCheckedChange={setPushNotifications} />
        </SettingsSection>

        {/* Privacy */}
        <SettingsSection title="Privacy">
          <SettingsToggle icon="fc:globe" label="Location Sharing" checked={locationSharing} onCheckedChange={setLocationSharing} />
          <Divider />
          <SettingsLink icon="fc:cancel" label="Blocked Users" soon />
        </SettingsSection>

        {/* Support */}
        <SettingsSection title="Support">
          <SettingsLink icon="fc:info" label="Help Center" soon />
          <Divider />
          <SettingsLink icon="fc:feedback" label="Report a Bug" soon />
        </SettingsSection>

        <Button onClick={handleLogout} variant="destructive" className="w-full gap-2">
          <AppIcon name="fc:cancel" size={18} />
          Log Out
        </Button>

        <p className="text-center text-[10px] text-muted-foreground/30 pb-2 pt-1">AnyBuddy v1.0 · Made in Mumbai 🇮🇳</p>
      </div>
      <BottomNav />
    </div>
  );
}

function Divider() { return <div className="mx-4 h-px bg-border/15" />; }

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="liquid-glass-heavy overflow-hidden">
      <p className="section-label px-4 pt-4 pb-2">{title}</p>
      {children}
      <div className="h-1.5" />
    </div>
  );
}

function SettingsToggle({ icon, label, checked, onCheckedChange }: {
  icon: string; label: string; checked: boolean; onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/10 transition-colors">
      <div className="flex items-center gap-3">
        <span className="w-8 h-8 rounded-[0.625rem] bg-muted/60 flex items-center justify-center">
          <AppIcon name={icon as any} size={18} />
        </span>
        <span className="text-[14px] font-medium tracking-tight">{label}</span>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function SettingsLink({ icon, label, value, onClick, soon }: {
  icon: string; label: string; value?: string; onClick?: () => void; soon?: boolean;
}) {
  return (
    <button onClick={soon ? undefined : onClick} disabled={soon}
      className={cn('w-full flex items-center justify-between px-4 py-3 tap-scale hover:bg-muted/10 transition-colors', soon && 'opacity-50 cursor-default')}>
      <div className="flex items-center gap-3">
        <span className="w-8 h-8 rounded-[0.625rem] bg-muted/60 flex items-center justify-center">
          <AppIcon name={icon as any} size={18} />
        </span>
        <span className="text-[14px] font-medium tracking-tight">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-[12px] text-muted-foreground">{value}</span>}
        {soon
          ? <span className="text-[8px] font-bold bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded-full uppercase tracking-wider">Soon</span>
          : <span className="text-muted-foreground/30 text-sm">›</span>}
      </div>
    </button>
  );
}

function QuickAction({ icon, label, sublabel, onClick }: {
  icon: string; label: string; sublabel: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="liquid-glass-heavy p-3.5 tap-scale text-left flex items-center gap-3">
      <span className="w-9 h-9 rounded-[0.75rem] liquid-glass flex items-center justify-center shrink-0">
        <AppIcon name={icon as any} size={22} />
      </span>
      <div>
        <p className="text-[13px] font-bold tracking-tight">{label}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{sublabel}</p>
      </div>
    </button>
  );
}
