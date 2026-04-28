import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, ShieldCheck, ShieldAlert, CreditCard,
  MapPinned, Megaphone, Search, ArrowRight, Home, LogOut,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

interface Action {
  id: string;
  label: string;
  hint?: string;
  icon: typeof Home;
  group: 'Navigate' | 'Actions' | 'Users';
  run: () => void;
}

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { requests } = useAppStore();
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);

  useEffect(() => { if (!open) { setQuery(''); setHighlight(0); } }, [open]);

  const go = (path: string) => { navigate(path); onClose(); };

  const baseActions: Action[] = [
    { id: 'nav-dash', label: 'Go to Dashboard', icon: LayoutDashboard, group: 'Navigate', run: () => go('/admin') },
    { id: 'nav-users', label: 'Go to Users', icon: Users, group: 'Navigate', run: () => go('/admin/users') },
    { id: 'nav-plans', label: 'Go to Plans', icon: MapPinned, group: 'Navigate', run: () => go('/admin/plans') },
    { id: 'nav-verify', label: 'Go to Verification', icon: ShieldCheck, group: 'Navigate', run: () => go('/admin/verification') },
    { id: 'nav-mod', label: 'Go to Moderation', icon: ShieldAlert, group: 'Navigate', run: () => go('/admin/moderation') },
    { id: 'nav-broadcast', label: 'Go to Broadcast', icon: Megaphone, group: 'Navigate', run: () => go('/admin/broadcast') },
    { id: 'nav-pricing', label: 'Go to Pricing', icon: CreditCard, group: 'Navigate', run: () => go('/admin/pricing') },
    { id: 'act-broadcast', label: 'Send a broadcast', hint: 'Notify all users', icon: Megaphone, group: 'Actions', run: () => go('/admin/broadcast') },
    { id: 'act-back', label: 'Exit admin (back to app)', icon: LogOut, group: 'Actions', run: () => go('/home') },
  ];

  // dynamic plan/host suggestions
  const dynamicActions: Action[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const planMatches = requests
      .filter(r => r.title.toLowerCase().includes(q) || r.userName.toLowerCase().includes(q))
      .slice(0, 4)
      .map<Action>(r => ({
        id: `plan-${r.id}`,
        label: r.title,
        hint: `by ${r.userName} · ${r.location.name}`,
        icon: MapPinned,
        group: 'Actions',
        run: () => go(`/admin/plans?focus=${r.id}`),
      }));
    return planMatches;
  }, [query, requests]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = [...baseActions, ...dynamicActions];
    if (!q) return all;
    return all.filter(a =>
      a.label.toLowerCase().includes(q) || (a.hint && a.hint.toLowerCase().includes(q))
    );
  }, [query, dynamicActions]);

  const groups = useMemo(() => {
    const map = new Map<string, Action[]>();
    filtered.forEach(a => {
      if (!map.has(a.group)) map.set(a.group, []);
      map.get(a.group)!.push(a);
    });
    return Array.from(map.entries());
  }, [filtered]);

  useEffect(() => { setHighlight(0); }, [query]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(h + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)); }
    if (e.key === 'Enter') { e.preventDefault(); filtered[highlight]?.run(); }
  };

  let runningIndex = -1;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[520px] p-0 overflow-hidden rounded-2xl border-border/20">
        <div className="flex items-center gap-2 px-4 h-12 border-b border-border/15">
          <Search size={15} className="text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search pages, plans, hosts…"
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/60"
          />
          <kbd className="text-[9px] font-bold bg-foreground/[0.06] px-1.5 py-0.5 rounded">ESC</kbd>
        </div>
        <div className="max-h-[380px] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-8">No results</p>
          ) : (
            groups.map(([group, items]) => (
              <div key={group} className="mb-1.5">
                <p className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-widest px-4 py-1.5">{group}</p>
                {items.map(item => {
                  runningIndex++;
                  const active = runningIndex === highlight;
                  return (
                    <button
                      key={item.id}
                      onClick={item.run}
                      onMouseEnter={() => setHighlight(filtered.indexOf(item))}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2 text-left transition-colors',
                        active ? 'bg-primary/8' : 'hover:bg-foreground/[0.03]'
                      )}
                    >
                      <div className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                        active ? 'bg-primary/15 text-primary' : 'bg-foreground/[0.04] text-muted-foreground'
                      )}>
                        <item.icon size={13} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium truncate">{item.label}</p>
                        {item.hint && <p className="text-[10px] text-muted-foreground truncate">{item.hint}</p>}
                      </div>
                      {active && <ArrowRight size={12} className="text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <div className="px-4 h-9 border-t border-border/15 flex items-center justify-between text-[10px] text-muted-foreground bg-foreground/[0.02]">
          <span className="flex items-center gap-2">
            <kbd className="bg-foreground/[0.06] px-1.5 py-0.5 rounded font-bold">↑↓</kbd> navigate
            <kbd className="bg-foreground/[0.06] px-1.5 py-0.5 rounded font-bold">⏎</kbd> select
          </span>
          <span>{filtered.length} result{filtered.length === 1 ? '' : 's'}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}