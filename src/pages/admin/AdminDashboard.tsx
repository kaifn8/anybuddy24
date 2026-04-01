import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { getCategoryLabel, CategoryIcon } from '@/components/icons/CategoryIcon';
import { ANALYTICS_DATA } from '@/data/adminData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import type { Category } from '@/types/anybuddy';
import { cn } from '@/lib/utils';

const categoryDemand: Record<Category, number> = {
  chai: 85, explore: 72, shopping: 45, work: 68, help: 90, casual: 55,
  sports: 78, food: 82, walk: 60,
};

export default function AdminDashboard() {
  const { requests, pendingVerifications } = useAppStore();

  const liveRequests = requests.filter(r => new Date(r.expiresAt) > new Date()).length;
  const totalParticipants = requests.reduce((acc, r) => acc + r.seatsTaken, 0);
  const avgFillRate = requests.length > 0
    ? Math.round(requests.reduce((acc, r) => acc + (r.seatsTaken / r.seatsTotal) * 100, 0) / requests.length)
    : 0;
  const pendingVerifs = pendingVerifications.filter(v => v.status === 'pending').length;

  const kpis = [
    { label: 'Live Plans', value: liveRequests, icon: '📍', color: 'text-primary' },
    { label: 'Active Users', value: totalParticipants + liveRequests, icon: '👥', color: 'text-secondary' },
    { label: 'Avg Fill Rate', value: `${avgFillRate}%`, icon: '📊', color: 'text-warning' },
    { label: 'Pending Verif', value: pendingVerifs, icon: '🔒', color: 'text-destructive' },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-5xl">
      <div className="hidden lg:block">
        <h2 className="text-xl font-bold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Real-time overview of the platform</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-border/30 bg-background/60 backdrop-blur-sm p-3.5 lg:p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-base">{kpi.icon}</span>
              <p className="text-[10px] lg:text-xs text-muted-foreground font-medium">{kpi.label}</p>
            </div>
            <p className={cn('text-xl lg:text-2xl font-bold tabular-nums', kpi.color)}>{kpi.value}</p>
          </div>
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
