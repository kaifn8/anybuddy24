import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { getCategoryLabel, CategoryIcon } from '@/components/icons/CategoryIcon';
import { ANALYTICS_DATA } from '@/data/adminData';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import type { Category } from '@/types/anybuddy';
import { cn } from '@/lib/utils';
import {
  TrendingUp, TrendingDown, ArrowRight, Activity, Users, MapPin,
  ShieldAlert, Zap, Sparkles,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const categoryDemand: Record<Category, number> = {
  chai: 85, explore: 72, shopping: 45, work: 68, help: 90, casual: 55,
  sports: 78, food: 82, walk: 60,
};

// Mini sparkline data (last 7 ticks)
const SPARK_DATA = {
  plans: [4, 7, 6, 9, 8, 12, 14],
  users: [22, 26, 31, 28, 35, 41, 48],
  fill: [54, 58, 61, 60, 65, 68, 72],
  reports: [3, 2, 4, 1, 3, 2, 1],
};

function Sparkline({ data, color = 'hsl(var(--primary))' }: { data: number[]; color?: string }) {
  const formatted = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={28}>
      <LineChart data={formatted}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { requests, pendingVerifications, reports, flaggedMessages } = useAppStore();
  const [now, setNow] = useState(new Date());

  // Tick clock for live feel
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const liveRequests = requests.filter(r => new Date(r.expiresAt) > new Date()).length;
  const totalParticipants = requests.reduce((acc, r) => acc + r.seatsTaken, 0);
  const avgFillRate = requests.length > 0
    ? Math.round(requests.reduce((acc, r) => acc + (r.seatsTaken / r.seatsTotal) * 100, 0) / requests.length)
    : 0;
  const pendingVerifs = pendingVerifications.filter(v => v.status === 'pending').length;
  const pendingReports = reports.filter(r => r.status === 'pending').length;

  const kpis = [
    {
      label: 'Live Plans', value: liveRequests, delta: '+18%', up: true,
      icon: MapPin, color: 'text-primary', bg: 'bg-primary/10', spark: SPARK_DATA.plans,
      sparkColor: 'hsl(var(--primary))',
      onClick: () => navigate('/admin/plans'),
    },
    {
      label: 'Active Users', value: totalParticipants + liveRequests, delta: '+12%', up: true,
      icon: Users, color: 'text-secondary', bg: 'bg-secondary/10', spark: SPARK_DATA.users,
      sparkColor: 'hsl(var(--secondary))',
      onClick: () => navigate('/admin/users'),
    },
    {
      label: 'Avg Fill Rate', value: `${avgFillRate}%`, delta: '+4pt', up: true,
      icon: Sparkles, color: 'text-warning', bg: 'bg-warning/10', spark: SPARK_DATA.fill,
      sparkColor: 'hsl(var(--warning))',
      onClick: () => navigate('/admin/plans'),
    },
    {
      label: 'Pending Reports', value: pendingReports + pendingVerifs, delta: '-2', up: false,
      icon: ShieldAlert, color: 'text-destructive', bg: 'bg-destructive/10', spark: SPARK_DATA.reports,
      sparkColor: 'hsl(var(--destructive))',
      onClick: () => navigate('/admin/moderation'),
    },
  ];

  // Top hosts (from requests)
  const topHosts = useMemo(() => {
    const counts = new Map<string, { name: string; plans: number; trust: string }>();
    requests.forEach(r => {
      const key = r.userName;
      const c = counts.get(key) || { name: r.userName, plans: 0, trust: r.userTrust };
      c.plans += 1;
      counts.set(key, c);
    });
    return Array.from(counts.values()).sort((a, b) => b.plans - a.plans).slice(0, 5);
  }, [requests]);

  // Top zones
  const topZones = useMemo(() => {
    const counts = new Map<string, number>();
    requests.forEach(r => counts.set(r.location.name, (counts.get(r.location.name) || 0) + 1));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [requests]);

  // Live activity feed (synthetic + real)
  const activityFeed = useMemo(() => {
    const items: { id: string; emoji: string; text: string; ts: Date }[] = [];
    requests.slice(0, 4).forEach((r, i) => {
      items.push({
        id: `act-plan-${r.id}`,
        emoji: '📍',
        text: `${r.userName} created "${r.title}"`,
        ts: new Date(now.getTime() - (i + 1) * 4 * 60_000),
      });
    });
    pendingVerifications.slice(0, 2).forEach((v, i) => {
      items.push({
        id: `act-ver-${v.userId}`,
        emoji: '🔒',
        text: `${v.userName} submitted selfie verification`,
        ts: new Date(now.getTime() - (i + 1) * 7 * 60_000),
      });
    });
    reports.slice(0, 2).forEach((r, i) => {
      items.push({
        id: `act-rep-${r.id}`,
        emoji: '🚩',
        text: `${r.reporterName} reported ${r.targetName} (${r.reason})`,
        ts: new Date(now.getTime() - (i + 1) * 11 * 60_000),
      });
    });
    flaggedMessages.slice(0, 2).forEach((m, i) => {
      items.push({
        id: `act-msg-${m.id}`,
        emoji: '🤖',
        text: `AI flagged a message in "${m.requestTitle}"`,
        ts: new Date(now.getTime() - (i + 1) * 13 * 60_000),
      });
    });
    return items.sort((a, b) => b.ts.getTime() - a.ts.getTime()).slice(0, 8);
  }, [requests, pendingVerifications, reports, flaggedMessages, now]);

  // Funnel
  const funnel = [
    { label: 'Plan views', value: 1240, color: 'bg-primary' },
    { label: 'Plans joined', value: 412, color: 'bg-primary/80' },
    { label: 'Met up', value: 287, color: 'bg-success' },
    { label: 'Reviewed', value: 198, color: 'bg-warning' },
  ];
  const funnelMax = Math.max(...funnel.map(f => f.value));

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-6xl">
      <div className="hidden lg:flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time pulse of the AnyBuddy platform</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Last update</p>
          <p className="text-xs font-semibold flex items-center gap-1.5 justify-end">
            <Activity size={11} className="text-success" />
            {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* KPIs with sparklines + deltas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {kpis.map((kpi) => (
          <button
            key={kpi.label}
            onClick={kpi.onClick}
            className="text-left rounded-2xl border border-border/30 bg-background/60 backdrop-blur-sm p-3.5 lg:p-4 hover:border-border/50 hover:shadow-sm transition-all tap-scale group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', kpi.bg)}>
                <kpi.icon size={14} className={kpi.color} />
              </div>
              <span className={cn('text-[10px] font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded-full',
                kpi.up ? 'text-success bg-success/10' : 'text-destructive bg-destructive/10'
              )}>
                {kpi.up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                {kpi.delta}
              </span>
            </div>
            <p className={cn('text-2xl font-bold tabular-nums leading-none mb-1.5', kpi.color)}>{kpi.value}</p>
            <p className="text-[10px] text-muted-foreground font-medium mb-2">{kpi.label}</p>
            <Sparkline data={kpi.spark} color={kpi.sparkColor} />
          </button>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Plans & Joins over the week */}
        <div className="rounded-2xl border border-border/30 bg-background/60 backdrop-blur-sm p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Plans & Joins This Week</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={ANALYTICS_DATA.dailyPlans} barGap={2}>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={25} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="plans" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={14} />
              <Bar dataKey="joins" fill="hsl(var(--primary) / 0.3)" radius={[4, 4, 0, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 justify-center">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <div className="w-2 h-2 rounded-sm bg-primary" /> Plans
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <div className="w-2 h-2 rounded-sm bg-primary/30" /> Joins
            </div>
          </div>
        </div>

        {/* Peak hours */}
        <div className="rounded-2xl border border-border/30 bg-background/60 backdrop-blur-sm p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Peak Activity Hours</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={ANALYTICS_DATA.peakHours}>
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={25} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <defs>
                <linearGradient id="peakGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="activity" stroke="hsl(var(--primary))" fill="url(#peakGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Live activity + Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-4">
        {/* Activity feed */}
        <div className="rounded-2xl border border-border/30 bg-background/60 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Zap size={11} className="text-warning" /> Live Activity
            </h3>
            <span className="flex items-center gap-1 text-[9px] text-success font-semibold">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
              </span>
              Real-time
            </span>
          </div>
          <div className="space-y-1.5">
            {activityFeed.map(a => (
              <div key={a.id} className="flex items-center gap-2.5 py-1.5 border-b border-border/10 last:border-0">
                <span className="text-sm shrink-0">{a.emoji}</span>
                <p className="flex-1 text-[11px] truncate">{a.text}</p>
                <span className="text-[9px] text-muted-foreground shrink-0">
                  {formatDistanceToNow(a.ts, { addSuffix: true })}
                </span>
              </div>
            ))}
            {activityFeed.length === 0 && (
              <p className="text-center text-xs text-muted-foreground py-6">No activity yet</p>
            )}
          </div>
        </div>

        {/* Funnel */}
        <div className="rounded-2xl border border-border/30 bg-background/60 backdrop-blur-sm p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Conversion Funnel</h3>
          <div className="space-y-2.5">
            {funnel.map((step, i) => {
              const pct = (step.value / funnelMax) * 100;
              const dropoff = i > 0 ? Math.round((1 - step.value / funnel[i - 1].value) * 100) : null;
              return (
                <div key={step.label}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-medium">{step.label}</span>
                    <span className="tabular-nums font-semibold">{step.value.toLocaleString()}</span>
                  </div>
                  <div className="h-6 bg-muted/40 rounded-lg overflow-hidden flex items-center">
                    <div className={cn('h-full transition-all', step.color)} style={{ width: `${pct}%` }} />
                  </div>
                  {dropoff !== null && dropoff > 0 && (
                    <p className="text-[9px] text-destructive/70 mt-0.5 text-right">−{dropoff}% drop-off</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top hosts + Top zones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border/30 bg-background/60 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Top Hosts</h3>
            <button onClick={() => navigate('/admin/users')} className="text-[10px] text-primary font-semibold flex items-center gap-0.5 tap-scale">
              View all <ArrowRight size={10} />
            </button>
          </div>
          <div className="space-y-1.5">
            {topHosts.map((h, i) => (
              <div key={h.name} className="flex items-center gap-2.5 py-1.5">
                <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0',
                  i === 0 ? 'bg-warning/15 text-warning' :
                  i === 1 ? 'bg-muted text-muted-foreground' :
                  'bg-foreground/[0.04] text-muted-foreground'
                )}>
                  {i + 1}
                </div>
                <p className="flex-1 text-xs font-semibold truncate">{h.name}</p>
                <span className="text-[9px] capitalize px-1.5 py-0.5 rounded-full bg-foreground/[0.04] text-muted-foreground">{h.trust}</span>
                <span className="text-xs font-bold tabular-nums w-6 text-right">{h.plans}</span>
              </div>
            ))}
            {topHosts.length === 0 && <p className="text-center text-xs text-muted-foreground py-4">No hosts yet</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-border/30 bg-background/60 backdrop-blur-sm p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Top Zones</h3>
          <div className="space-y-2">
            {topZones.map(([zone, count], i) => {
              const pct = (count / topZones[0][1]) * 100;
              return (
                <div key={zone}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-medium flex items-center gap-1.5">
                      <MapPin size={10} className="text-primary" /> {zone}
                    </span>
                    <span className="font-bold tabular-nums">{count}</span>
                  </div>
                  <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category demand + Trust distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border/30 bg-background/60 backdrop-blur-sm p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Category Demand</h3>
          <div className="space-y-2.5">
            {(Object.entries(categoryDemand) as [Category, number][]).map(([cat, demand]) => (
              <div key={cat}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium flex items-center gap-1.5">
                    <CategoryIcon category={cat} size="sm" />
                    {getCategoryLabel(cat)}
                  </span>
                  <span className={demand > 80 ? 'text-warning font-semibold' : 'text-muted-foreground'}>{demand}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', demand > 80 ? 'bg-warning' : demand > 60 ? 'bg-primary' : 'bg-secondary')}
                    style={{ width: `${demand}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/30 bg-background/60 backdrop-blur-sm p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Trust Distribution</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={ANALYTICS_DATA.trustDistribution}
                  dataKey="count"
                  nameKey="level"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  innerRadius={35}
                  strokeWidth={0}
                >
                  {ANALYTICS_DATA.trustDistribution.map((_, i) => (
                    <Cell key={i} fill={[
                      'hsl(var(--muted-foreground) / 0.3)',
                      'hsl(var(--secondary))',
                      'hsl(var(--primary))',
                      'hsl(var(--warning))',
                    ][i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-1">
            {ANALYTICS_DATA.trustDistribution.map((item, i) => (
              <div key={item.level} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <div className="w-2 h-2 rounded-sm" style={{ background: [
                  'hsl(var(--muted-foreground))', 'hsl(var(--secondary))',
                  'hsl(var(--primary))', 'hsl(var(--warning))',
                ][i] }} />
                {item.level} ({item.count})
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
