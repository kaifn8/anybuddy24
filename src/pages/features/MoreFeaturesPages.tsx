/**
 * Bundle of smaller prototype pages (one default export per concept).
 * Each is exported individually so App.tsx can lazy-load them.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FeatureShell, PrototypeBanner } from './_FeatureShell';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { Button } from '@/components/ui/button';
import { AppIcon } from '@/components/icons/AppIcon';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/* ─────────── Gifting ─────────── */
export function GiftCreditsPage() {
  const { user, updateCredits } = useAppStore();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState(1);
  const send = () => {
    if (!recipient.trim()) return toast.error('Pick a recipient');
    if ((user?.credits ?? 0) < amount) return toast.error('Not enough credits');
    updateCredits(-amount, `Gifted to ${recipient}`);
    toast.success(`Sent ${amount} credit${amount > 1 ? 's' : ''} to ${recipient} 🎁`);
    setRecipient(''); setAmount(1);
  };
  const friends = ['Priya M.', 'Arjun S.', 'Maya K.', 'Rohan V.', 'Zara Q.'];
  return (
    <FeatureShell title="Gift Credits" hero={{ icon: 'fc:collaboration', label: 'Send a thank-you', sub: `${user?.credits ?? 0} credits available`, tone: 'success' }}>
      <PrototypeBanner />
      <div>
        <p className="section-label mb-2 px-1">Pick a friend</p>
        <div className="grid grid-cols-3 gap-2">
          {friends.map(n => (
            <button key={n} onClick={() => setRecipient(n)}
              className={cn('flex flex-col items-center gap-1.5 p-3 rounded-2xl liquid-glass tap-scale', recipient === n && 'ring-2 ring-primary')}>
              <GradientAvatar name={n} size={42} />
              <p className="text-[10px] font-semibold truncate w-full text-center">{n.split(' ')[0]}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="liquid-glass-heavy p-4 rounded-2xl">
        <p className="section-label mb-2">Amount</p>
        <div className="flex gap-2">
          {[1, 2, 5, 10].map(n => (
            <button key={n} onClick={() => setAmount(n)}
              className={cn('flex-1 h-11 rounded-xl text-[13px] font-bold', amount === n ? 'bg-primary text-primary-foreground' : 'liquid-glass')}>
              {n} ⊕
            </button>
          ))}
        </div>
      </div>
      <Button className="w-full h-12" onClick={send} disabled={!recipient}>
        🎁 Send {amount} credit{amount > 1 ? 's' : ''}{recipient && ` to ${recipient.split(' ')[0]}`}
      </Button>
    </FeatureShell>
  );
}

/* ─────────── Hall of Fame ─────────── */
export function HallOfFamePage() {
  const HALL = [
    { name: 'Priya M.',  score: 4820, badge: '👑', title: 'Mumbai Anchor 2024' },
    { name: 'Arjun S.',  score: 4210, badge: '🥈', title: 'Top Host · 200 plans' },
    { name: 'Maya K.',   score: 3940, badge: '🥉', title: 'Streak Legend · 180 days' },
    { name: 'Rohan V.',  score: 3550, badge: '⭐', title: 'Coffee Connector' },
    { name: 'Zara Q.',   score: 3200, badge: '⭐', title: 'Trek Champion' },
    { name: 'Aditya P.', score: 2890, badge: '⭐', title: 'Brunch Captain' },
  ];
  return (
    <FeatureShell title="Hall of Fame" hero={{ icon: 'se:trophy-1', label: 'All-time legends', sub: 'The most active hosts since launch', tone: 'accent' }}>
      <PrototypeBanner />
      <div className="space-y-2">
        {HALL.map((h, i) => (
          <div key={h.name} className="liquid-glass-heavy rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl shrink-0">{h.badge}</span>
            <GradientAvatar name={h.name} size={44} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold truncate">{h.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{h.title}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[14px] font-bold tabular-nums">{h.score.toLocaleString()}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">XP</p>
            </div>
          </div>
        ))}
      </div>
    </FeatureShell>
  );
}

/* ─────────── Neighbourhood ranks ─────────── */
export function NeighbourhoodPage() {
  const ZONES = [
    { zone: 'Bandra West',  active: 42, top: 'Priya M.' },
    { zone: 'Andheri West', active: 38, top: 'Arjun S.' },
    { zone: 'Powai',        active: 31, top: 'Maya K.' },
    { zone: 'Lower Parel',  active: 28, top: 'Rohan V.' },
    { zone: 'Juhu',         active: 24, top: 'Zara Q.' },
    { zone: 'Versova',      active: 19, top: 'Neha R.' },
  ];
  return (
    <FeatureShell title="Neighbourhood Ranks" hero={{ icon: 'fc:globe', label: 'Mumbai by zone', sub: 'Top hosts across each neighbourhood', tone: 'primary' }}>
      <PrototypeBanner />
      <div className="space-y-2">
        {ZONES.map((z, i) => (
          <div key={z.zone} className="liquid-glass rounded-2xl p-4 flex items-center gap-3">
            <span className="w-8 text-center text-[14px] font-bold tabular-nums text-muted-foreground/60">#{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold truncate">{z.zone}</p>
              <p className="text-[11px] text-muted-foreground">Top: {z.top}</p>
            </div>
            <span className="text-[11px] font-bold text-success bg-success/10 px-2.5 py-1 rounded-full">{z.active} active</span>
          </div>
        ))}
      </div>
    </FeatureShell>
  );
}

/* ─────────── Friends-only board ─────────── */
export function FriendsBoardPage() {
  const FRIENDS = [
    { name: 'Priya M.', xp: 320 },
    { name: 'Arjun S.', xp: 280 },
    { name: 'You',      xp: 240, isMe: true },
    { name: 'Maya K.',  xp: 195 },
    { name: 'Rohan V.', xp: 140 },
  ];
  return (
    <FeatureShell title="Friends Leaderboard" hero={{ icon: 'fc:conference-call', label: 'Just your circle', sub: 'Compete only with people you follow', tone: 'success' }}>
      <PrototypeBanner />
      <div className="liquid-glass-heavy rounded-2xl divide-y divide-border/10 overflow-hidden">
        {FRIENDS.map((f, i) => (
          <div key={f.name} className={cn('flex items-center gap-3 px-4 py-3', f.isMe && 'bg-primary/5')}>
            <span className="w-7 text-center text-[12px] font-bold tabular-nums text-muted-foreground/60">#{i + 1}</span>
            <GradientAvatar name={f.name} size={36} />
            <p className={cn('flex-1 text-[13px] font-semibold', f.isMe && 'text-primary')}>{f.name}</p>
            <span className="text-[13px] font-bold tabular-nums">{f.xp}</span>
          </div>
        ))}
      </div>
    </FeatureShell>
  );
}

/* ─────────── Quiet hours ─────────── */
export function QuietHoursPage() {
  const [enabled, setEnabled] = useState(true);
  const [from, setFrom] = useState('22:00');
  const [to, setTo] = useState('07:00');
  return (
    <FeatureShell title="Quiet Hours" hero={{ icon: 'se:bell-with-slash', label: 'Pause notifications', sub: 'Silence pings during sleep & focus', tone: 'primary' }}>
      <PrototypeBanner />
      <div className="liquid-glass-heavy p-4 rounded-2xl flex items-center justify-between">
        <div><p className="text-[13px] font-bold">Quiet hours enabled</p><p className="text-[11px] text-muted-foreground">Toggles all non-urgent pings</p></div>
        <button onClick={() => setEnabled(!enabled)}
          className={cn('w-12 h-7 rounded-full relative transition', enabled ? 'bg-primary' : 'bg-muted')}>
          <span className={cn('absolute top-0.5 w-6 h-6 rounded-full bg-background transition', enabled ? 'left-[22px]' : 'left-0.5')} />
        </button>
      </div>
      {enabled && (
        <div className="liquid-glass p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between"><span className="text-[12px]">From</span>
            <input type="time" value={from} onChange={e => setFrom(e.target.value)} className="bg-transparent text-[14px] font-bold tabular-nums" /></div>
          <div className="flex items-center justify-between"><span className="text-[12px]">To</span>
            <input type="time" value={to} onChange={e => setTo(e.target.value)} className="bg-transparent text-[14px] font-bold tabular-nums" /></div>
        </div>
      )}
      <Button className="w-full" onClick={() => toast.success(enabled ? `Quiet ${from}–${to} saved` : 'Quiet hours off')}>Save</Button>
    </FeatureShell>
  );
}

/* ─────────── Smart Digest ─────────── */
export function SmartDigestPage() {
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState('09:00');
  return (
    <FeatureShell title="Smart Digest" hero={{ icon: 'fc:idea', label: 'One daily summary', sub: 'Replace scattered pings with a clean morning brief', tone: 'accent' }}>
      <PrototypeBanner />
      <div className="liquid-glass-heavy p-4 rounded-2xl flex items-center justify-between">
        <p className="text-[13px] font-bold">Daily digest</p>
        <button onClick={() => setEnabled(!enabled)}
          className={cn('w-12 h-7 rounded-full relative', enabled ? 'bg-primary' : 'bg-muted')}>
          <span className={cn('absolute top-0.5 w-6 h-6 rounded-full bg-background transition', enabled ? 'left-[22px]' : 'left-0.5')} />
        </button>
      </div>
      <div className="liquid-glass p-4 rounded-2xl flex items-center justify-between">
        <span className="text-[12px]">Delivery time</span>
        <input type="time" value={time} onChange={e => setTime(e.target.value)} className="bg-transparent text-[14px] font-bold tabular-nums" />
      </div>
      <div className="liquid-glass p-4 rounded-2xl">
        <p className="section-label mb-2">Preview</p>
        <p className="text-[12px] text-muted-foreground leading-relaxed">
          🌞 Good morning! 4 new plans nearby today, your streak is at 7 days, and Priya posted a coffee plan in Bandra at 11am.
        </p>
      </div>
      <Button className="w-full" onClick={() => toast.success('Digest preferences saved')}>Save</Button>
    </FeatureShell>
  );
}

/* ─────────── Nearby alerts ─────────── */
export function NearbyAlertsPage() {
  const [enabled, setEnabled] = useState(false);
  const [radius, setRadius] = useState(500);
  return (
    <FeatureShell title="Nearby Alerts" hero={{ icon: 'fc:advertising', label: 'Proximity pings', sub: 'Get notified when a plan starts close to you', tone: 'success' }}>
      <PrototypeBanner />
      <div className="liquid-glass-heavy p-4 rounded-2xl flex items-center justify-between">
        <p className="text-[13px] font-bold">Enable nearby alerts</p>
        <button onClick={() => setEnabled(!enabled)}
          className={cn('w-12 h-7 rounded-full relative', enabled ? 'bg-primary' : 'bg-muted')}>
          <span className={cn('absolute top-0.5 w-6 h-6 rounded-full bg-background transition', enabled ? 'left-[22px]' : 'left-0.5')} />
        </button>
      </div>
      <div className="liquid-glass p-4 rounded-2xl">
        <div className="flex items-center justify-between mb-3"><span className="text-[12px]">Radius</span><span className="text-[14px] font-bold tabular-nums">{radius}m</span></div>
        <input type="range" min={100} max={2000} step={100} value={radius} onChange={e => setRadius(+e.target.value)} className="w-full accent-primary" />
      </div>
      <Button className="w-full" onClick={() => toast.success('Alert preferences saved')}>Save</Button>
    </FeatureShell>
  );
}

/* ─────────── Heatmap ─────────── */
export function HeatmapPage() {
  const navigate = useNavigate();
  const ZONES = [
    { name: 'Bandra West',  heat: 92, color: 'bg-rose-500' },
    { name: 'Andheri West', heat: 78, color: 'bg-orange-500' },
    { name: 'Powai',        heat: 64, color: 'bg-amber-500' },
    { name: 'Lower Parel',  heat: 52, color: 'bg-yellow-500' },
    { name: 'Juhu',         heat: 41, color: 'bg-lime-500' },
    { name: 'Versova',      heat: 28, color: 'bg-emerald-400' },
  ];
  return (
    <FeatureShell title="Heatmap" hero={{ icon: 'fc:globe', label: 'Where Mumbai is buzzing', sub: 'Live activity intensity by zone', tone: 'accent' }}>
      <PrototypeBanner />
      <div className="space-y-2">
        {ZONES.map(z => (
          <div key={z.name} className="liquid-glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[13px] font-bold">{z.name}</p>
              <span className="text-[12px] font-bold tabular-nums">{z.heat}°</span>
            </div>
            <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
              <div className={cn('h-full rounded-full', z.color)} style={{ width: `${z.heat}%` }} />
            </div>
          </div>
        ))}
      </div>
      <Button className="w-full" variant="outline" onClick={() => navigate('/map')}>Back to map</Button>
    </FeatureShell>
  );
}

/* ─────────── Saved Locations ─────────── */
export function SavedLocationsPage() {
  const [places, setPlaces] = useState([
    { id: 'p1', label: 'Home',   address: 'Bandra West, Mumbai',     emoji: '🏠' },
    { id: 'p2', label: 'Office', address: 'BKC, Bandra East',         emoji: '💼' },
    { id: 'p3', label: 'Gym',    address: 'Linking Road, Bandra',     emoji: '💪' },
  ]);
  const add = () => {
    const label = prompt('Place name?');
    if (!label) return;
    setPlaces(p => [...p, { id: `p_${Date.now()}`, label, address: 'Custom location', emoji: '📍' }]);
    toast.success(`${label} saved`);
  };
  return (
    <FeatureShell title="Saved Locations" hero={{ icon: 'tw:pin', label: 'Your usual spots', sub: 'One-tap when posting plans', tone: 'primary' }}>
      <PrototypeBanner />
      <Button className="w-full" onClick={add}>+ Add new location</Button>
      <div className="space-y-2">
        {places.map(p => (
          <div key={p.id} className="liquid-glass rounded-2xl p-3.5 flex items-center gap-3">
            <span className="text-2xl shrink-0">{p.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold truncate">{p.label}</p>
              <p className="text-[11px] text-muted-foreground truncate">{p.address}</p>
            </div>
            <button onClick={() => setPlaces(prev => prev.filter(x => x.id !== p.id))}
              className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-destructive">×</button>
          </div>
        ))}
      </div>
    </FeatureShell>
  );
}

/* ─────────── Seasonal Quests ─────────── */
export function SeasonalQuestsPage() {
  const QUESTS = [
    { title: 'Monsoon Meetup',     desc: 'Host 3 indoor plans this month', progress: 1, total: 3, reward: '🌧️ Rain Hero badge' },
    { title: 'Diwali Sparkler',    desc: 'Attend a festival meetup',       progress: 0, total: 1, reward: '✨ Sparkler badge' },
    { title: 'New Year Crew',      desc: 'Join a NYE plan',                progress: 0, total: 1, reward: '🎆 Pyrotechnic badge' },
  ];
  return (
    <FeatureShell title="Seasonal Challenges" hero={{ icon: 'fc:trophy', label: 'Limited-time quests', sub: 'Earn rare badges before they expire', tone: 'accent' }}>
      <PrototypeBanner />
      <div className="space-y-2">
        {QUESTS.map(q => (
          <div key={q.title} className="liquid-glass-heavy rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[13px] font-bold">{q.title}</p>
              <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">SEASONAL</span>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">{q.desc}</p>
            <div className="h-2 rounded-full bg-muted/40 overflow-hidden mb-2">
              <div className="h-full bg-accent rounded-full" style={{ width: `${(q.progress / q.total) * 100}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] tabular-nums text-muted-foreground">{q.progress}/{q.total}</span>
              <span className="text-[10px] font-semibold">Reward: {q.reward}</span>
            </div>
          </div>
        ))}
      </div>
    </FeatureShell>
  );
}

/* ─────────── Squad Quests ─────────── */
export function SquadQuestsPage() {
  const SQUADS = [
    { name: 'Bandra Brunchers', members: 5, quest: 'Host 10 plans together', progress: 7, total: 10 },
    { name: 'Trek Squad',       members: 4, quest: 'Complete 3 weekend treks', progress: 1, total: 3 },
  ];
  return (
    <FeatureShell title="Squad Quests" hero={{ icon: 'fc:conference-call', label: 'Team up for shared rewards', sub: 'Group challenges with friends', tone: 'success' }}>
      <PrototypeBanner />
      <Button className="w-full" onClick={() => toast.success('Squad creation — coming in v2')}>+ Create new squad</Button>
      <div className="space-y-2">
        {SQUADS.map(s => (
          <div key={s.name} className="liquid-glass-heavy rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[13px] font-bold">{s.name}</p>
              <span className="text-[10px] text-muted-foreground">{s.members} members</span>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">{s.quest}</p>
            <div className="h-2 rounded-full bg-muted/40 overflow-hidden mb-2">
              <div className="h-full bg-success rounded-full" style={{ width: `${(s.progress / s.total) * 100}%` }} />
            </div>
            <span className="text-[10px] tabular-nums text-muted-foreground">{s.progress}/{s.total}</span>
          </div>
        ))}
      </div>
    </FeatureShell>
  );
}

/* ─────────── Quest Pass ─────────── */
export function QuestPassPage() {
  const TIERS = [
    { tier: 1, free: '50 XP',  premium: '100 XP + ⊕2',     unlocked: true  },
    { tier: 2, free: '🏅 Bronze badge', premium: '🥇 Gold badge', unlocked: true  },
    { tier: 3, free: '100 XP', premium: 'Avatar frame', unlocked: false },
    { tier: 4, free: '⊕1',     premium: '⊕5 + theme',   unlocked: false },
    { tier: 5, free: '🎖️ Veteran badge', premium: '👑 Pass-Holder badge', unlocked: false },
  ];
  return (
    <FeatureShell title="Quest Pass" hero={{ icon: 'se:crown', label: 'Premium track', sub: 'Unlock exclusive cosmetics & rewards', tone: 'accent' }}>
      <PrototypeBanner />
      <Button className="w-full" onClick={() => toast.success('Quest Pass purchased! (prototype)')}>
        Get Quest Pass · ⊕25
      </Button>
      <div className="space-y-2">
        {TIERS.map(t => (
          <div key={t.tier} className={cn('rounded-2xl p-3.5 flex items-center gap-3', t.unlocked ? 'liquid-glass-heavy' : 'liquid-glass opacity-70')}>
            <span className="w-8 h-8 rounded-full bg-accent/15 text-accent text-[12px] font-bold flex items-center justify-center shrink-0">{t.tier}</span>
            <div className="flex-1 grid grid-cols-2 gap-2 text-[11px]">
              <div><p className="text-muted-foreground/60 uppercase tracking-wider text-[9px]">Free</p><p className="font-semibold truncate">{t.free}</p></div>
              <div><p className="text-accent uppercase tracking-wider text-[9px]">Premium</p><p className="font-bold truncate">{t.premium}</p></div>
            </div>
          </div>
        ))}
      </div>
    </FeatureShell>
  );
}