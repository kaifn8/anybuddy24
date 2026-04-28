import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { CategoryIcon, getCategoryLabel } from '@/components/icons/CategoryIcon';
import { Search, Trash2, Eye, AlertTriangle, MapPin, Clock, Users as UsersIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Request, Category, Urgency } from '@/types/anybuddy';

type StatusFilter = 'all' | 'active' | 'full' | 'expired';

export default function AdminPlans() {
  const { requests, removePlan } = useAppStore();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<Urgency | 'all'>('all');
  const [selected, setSelected] = useState<Request | null>(null);

  // ?focus=req_xxx auto-open
  useEffect(() => {
    const focus = params.get('focus');
    if (focus) {
      const r = requests.find(x => x.id === focus);
      if (r) setSelected(r);
      params.delete('focus');
      setParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const planStatus = (r: Request): StatusFilter => {
    if (new Date(r.expiresAt) < new Date()) return 'expired';
    if (r.seatsTaken >= r.seatsTotal) return 'full';
    return 'active';
  };

  const filtered = useMemo(() => {
    return requests.filter(r => {
      if (search && !r.title.toLowerCase().includes(search.toLowerCase()) &&
          !r.userName.toLowerCase().includes(search.toLowerCase()) &&
          !r.location.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== 'all' && planStatus(r) !== statusFilter) return false;
      if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
      if (urgencyFilter !== 'all' && r.urgency !== urgencyFilter) return false;
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [requests, search, statusFilter, categoryFilter, urgencyFilter]);

  const stats = useMemo(() => ({
    total: requests.length,
    active: requests.filter(r => planStatus(r) === 'active').length,
    full: requests.filter(r => planStatus(r) === 'full').length,
    expired: requests.filter(r => planStatus(r) === 'expired').length,
  }), [requests]);

  const handleRemove = (r: Request) => {
    removePlan(r.id);
    toast.success(`🗑️ "${r.title}" removed`);
    if (selected?.id === r.id) setSelected(null);
  };

  const URGENCY_STYLES: Record<Urgency, string> = {
    now: 'bg-destructive/15 text-destructive',
    today: 'bg-warning/15 text-warning',
    week: 'bg-primary/15 text-primary',
  };

  const STATUS_STYLES: Record<StatusFilter, string> = {
    all: '',
    active: 'bg-success/15 text-success',
    full: 'bg-primary/15 text-primary',
    expired: 'bg-muted text-muted-foreground',
  };

  const CATS: Category[] = ['chai', 'food', 'sports', 'work', 'explore', 'walk', 'help', 'casual', 'shopping'];

  return (
    <div className="p-4 lg:p-6 max-w-5xl space-y-5">
      <div className="hidden lg:block">
        <h2 className="text-xl font-bold">Plans</h2>
        <p className="text-sm text-muted-foreground">Browse, inspect and moderate plans across the platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2.5">
        {[
          { label: 'Total', value: stats.total, color: 'text-foreground' },
          { label: 'Active', value: stats.active, color: 'text-success' },
          { label: 'Full', value: stats.full, color: 'text-primary' },
          { label: 'Expired', value: stats.expired, color: 'text-muted-foreground' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-border/30 bg-background/60 backdrop-blur-sm p-3 text-center">
            <p className={cn('text-lg lg:text-xl font-bold tabular-nums', s.color)}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, host, or location…"
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border/30 bg-background/60 backdrop-blur-sm text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {(['all', 'active', 'full', 'expired'] as StatusFilter[]).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn('shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize transition-all',
                statusFilter === s ? 'bg-foreground text-background' : 'bg-foreground/[0.03] text-muted-foreground'
              )}>
              {s}
            </button>
          ))}
          <span className="w-px h-6 bg-border/30 self-center mx-0.5" />
          {(['all', 'now', 'today', 'week'] as const).map(u => (
            <button key={u} onClick={() => setUrgencyFilter(u)}
              className={cn('shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize transition-all',
                urgencyFilter === u ? 'bg-foreground text-background' : 'bg-foreground/[0.03] text-muted-foreground'
              )}>
              {u === 'all' ? 'All urgency' : u}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          <button onClick={() => setCategoryFilter('all')}
            className={cn('shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all',
              categoryFilter === 'all' ? 'bg-foreground text-background' : 'bg-foreground/[0.03] text-muted-foreground'
            )}>
            All categories
          </button>
          {CATS.map(c => (
            <button key={c} onClick={() => setCategoryFilter(c)}
              className={cn('shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize flex items-center gap-1 transition-all',
                categoryFilter === c ? 'bg-foreground text-background' : 'bg-foreground/[0.03] text-muted-foreground'
              )}>
              <CategoryIcon category={c} size="sm" />
              {getCategoryLabel(c)}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground font-medium">{filtered.length} plan{filtered.length === 1 ? '' : 's'}</p>

      {/* Plan list */}
      <div className="space-y-2">
        {filtered.map(r => {
          const status = planStatus(r);
          return (
            <div key={r.id} className="rounded-2xl border border-border/20 bg-background/60 backdrop-blur-sm p-3.5 hover:border-border/40 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <CategoryIcon category={r.category} size="md" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold truncate">{r.title}</p>
                    <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize shrink-0', STATUS_STYLES[status])}>{status}</span>
                    <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase shrink-0', URGENCY_STYLES[r.urgency])}>{r.urgency}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-2 flex-wrap">
                    <span>by <span className="font-medium text-foreground/80">{r.userName}</span></span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5"><MapPin size={9} />{r.location.name}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5"><UsersIcon size={9} />{r.seatsTaken}/{r.seatsTotal}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5"><Clock size={9} />{formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</span>
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Button variant="outline" size="sm" className="h-7 text-[10px] px-2" onClick={() => setSelected(r)}>
                    <Eye size={11} className="mr-1" /> View
                  </Button>
                  <Button variant="destructive" size="sm" className="h-7 text-[10px] px-2" onClick={() => handleRemove(r)}>
                    <Trash2 size={11} />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 rounded-2xl border border-border/20 bg-background/40">
            <span className="text-3xl block mb-2">🔍</span>
            <p className="text-xs text-muted-foreground">No plans match your filters</p>
          </div>
        )}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-[420px] rounded-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <CategoryIcon category={selected.category} size="md" />
                  {selected.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-foreground/[0.03] p-2.5">
                    <p className="text-[9px] text-muted-foreground font-semibold uppercase">Host</p>
                    <p className="text-xs font-semibold mt-0.5">{selected.userName}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{selected.userTrust} · {selected.userReliability}% reliable</p>
                  </div>
                  <div className="rounded-xl bg-foreground/[0.03] p-2.5">
                    <p className="text-[9px] text-muted-foreground font-semibold uppercase">Seats</p>
                    <p className="text-xs font-semibold mt-0.5">{selected.seatsTaken} / {selected.seatsTotal}</p>
                    <p className="text-[10px] text-muted-foreground">{selected.seatsTotal - selected.seatsTaken} left</p>
                  </div>
                  <div className="rounded-xl bg-foreground/[0.03] p-2.5">
                    <p className="text-[9px] text-muted-foreground font-semibold uppercase">When</p>
                    <p className="text-xs font-semibold mt-0.5">{format(new Date(selected.when), 'MMM d, h:mm a')}</p>
                  </div>
                  <div className="rounded-xl bg-foreground/[0.03] p-2.5">
                    <p className="text-[9px] text-muted-foreground font-semibold uppercase">Where</p>
                    <p className="text-xs font-semibold mt-0.5 truncate">{selected.location.name}</p>
                    <p className="text-[10px] text-muted-foreground">{selected.location.distance.toFixed(1)} km</p>
                  </div>
                </div>
                <div className="rounded-xl bg-foreground/[0.03] p-2.5">
                  <p className="text-[9px] text-muted-foreground font-semibold uppercase mb-0.5">Plan ID</p>
                  <p className="text-[10px] font-mono">{selected.id}</p>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" className="flex-1 h-9" onClick={() => setSelected(null)}>
                    Close
                  </Button>
                  <Button variant="destructive" size="sm" className="flex-1 h-9" onClick={() => handleRemove(selected)}>
                    <Trash2 size={12} className="mr-1" /> Remove plan
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}