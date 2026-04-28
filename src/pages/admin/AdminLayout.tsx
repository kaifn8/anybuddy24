import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, ShieldAlert, ShieldCheck,
  CreditCard, ChevronLeft, Menu, X, MapPinned, Megaphone,
  Search, Command, Bell, Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import CommandPalette from '@/components/admin/CommandPalette';

type NavItem = {
  id: string; label: string; icon: typeof LayoutDashboard;
  path: string; badgeKey?: 'verifications' | 'reports';
};

const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    ],
  },
  {
    label: 'Community',
    items: [
      { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
      { id: 'plans', label: 'Plans', icon: MapPinned, path: '/admin/plans' },
      { id: 'verification', label: 'Verification', icon: ShieldCheck, path: '/admin/verification', badgeKey: 'verifications' },
    ],
  },
  {
    label: 'Trust & Safety',
    items: [
      { id: 'moderation', label: 'Moderation', icon: ShieldAlert, path: '/admin/moderation', badgeKey: 'reports' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { id: 'broadcast', label: 'Broadcast', icon: Megaphone, path: '/admin/broadcast' },
      { id: 'pricing', label: 'Pricing', icon: CreditCard, path: '/admin/pricing' },
    ],
  },
];

const ALL_ITEMS = NAV_SECTIONS.flatMap(s => s.items);

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { pendingVerifications, reports } = useAppStore();
  const pendingCount = pendingVerifications.filter(v => v.status === 'pending').length;
  const pendingReports = reports.filter(r => r.status === 'pending').length;

  const badges: Record<string, number> = {
    verifications: pendingCount,
    reports: pendingReports,
  };

  const currentPath = location.pathname;
  const isActive = (path: string) => path === '/admin' ? currentPath === '/admin' : currentPath.startsWith(path);
  const activeItem = ALL_ITEMS.find(i => isActive(i.path)) || ALL_ITEMS[0];

  // ⌘K shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(p => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const renderNavButton = (item: NavItem, mobile = false) => {
    const badge = item.badgeKey ? badges[item.badgeKey] : 0;
    return (
      <button
        key={item.id}
        onClick={() => { navigate(item.path); if (mobile) setSidebarOpen(false); }}
        className={cn(
          'group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all tap-scale relative',
          isActive(item.path)
            ? 'bg-primary/10 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.18)]'
            : 'text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground'
        )}
      >
        <item.icon size={17} className={cn(isActive(item.path) && 'text-primary')} />
        <span className="flex-1 text-left">{item.label}</span>
        {badge > 0 && (
          <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-ambient flex flex-col lg:flex-row">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border/20 bg-background/70 backdrop-blur-2xl sticky top-0 h-screen shrink-0">
        {/* Brand */}
        <div className="px-5 pt-5 pb-4 border-b border-border/15">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors mb-3 tap-scale"
          >
            <ChevronLeft size={12} />
            Back to app
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-md">
              <ShieldAlert size={16} />
            </div>
            <div>
              <h1 className="text-[15px] font-bold leading-none">AnyBuddy</h1>
              <p className="text-[10px] text-muted-foreground mt-1">Admin Console</p>
            </div>
          </div>
        </div>

        {/* Search trigger */}
        <div className="px-3 pt-3">
          <button
            onClick={() => setPaletteOpen(true)}
            className="w-full h-9 px-3 rounded-xl border border-border/30 bg-background/60 hover:bg-background/80 transition-colors flex items-center gap-2 text-[12px] text-muted-foreground"
          >
            <Search size={13} />
            <span className="flex-1 text-left">Search & jump…</span>
            <kbd className="text-[9px] font-bold bg-foreground/[0.06] px-1.5 py-0.5 rounded">⌘K</kbd>
          </button>
        </div>

        {/* Sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {NAV_SECTIONS.map(section => (
            <div key={section.label}>
              <p className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-widest px-3 mb-1.5">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map(item => renderNavButton(item))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer status */}
        <div className="p-4 border-t border-border/15 space-y-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
              All systems operational
            </span>
          </div>
          <p className="text-[9px] text-muted-foreground/60 text-center">anybuddy admin · v2.0</p>
        </div>
      </aside>

      {/* ── Mobile header ── */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b border-border/20 bg-background/85 backdrop-blur-xl">
        <button onClick={() => navigate('/home')} className="flex items-center gap-1.5 text-muted-foreground tap-scale">
          <ChevronLeft size={18} />
          <span className="text-xs font-medium">App</span>
        </button>
        <h1 className="text-sm font-bold flex items-center gap-1.5">
          <ShieldAlert size={14} className="text-primary" /> Admin
        </h1>
        <div className="flex items-center gap-1">
          <button onClick={() => setPaletteOpen(true)} className="tap-scale p-1.5 rounded-lg hover:bg-muted/50">
            <Search size={16} />
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="tap-scale p-1.5 rounded-lg hover:bg-muted/50">
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {sidebarOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="lg:hidden fixed top-0 left-0 z-50 h-screen w-72 bg-background/95 backdrop-blur-2xl border-r border-border/20 flex flex-col animate-in slide-in-from-left">
            <div className="px-5 pt-5 pb-4 border-b border-border/15 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
                  <ShieldAlert size={14} />
                </div>
                <h1 className="text-sm font-bold">Admin</h1>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="tap-scale p-1.5 rounded-lg hover:bg-muted/50">
                <X size={16} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
              {NAV_SECTIONS.map(section => (
                <div key={section.label}>
                  <p className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-widest px-3 mb-1.5">
                    {section.label}
                  </p>
                  <div className="space-y-0.5">
                    {section.items.map(item => renderNavButton(item, true))}
                  </div>
                </div>
              ))}
            </nav>
          </aside>
        </>
      )}

      {/* ── Main column ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <div className="hidden lg:flex sticky top-0 z-30 items-center justify-between px-6 h-14 border-b border-border/15 bg-background/70 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-[12px]">
            <span className="text-muted-foreground">Admin</span>
            <span className="text-muted-foreground/40">/</span>
            <span className="font-semibold flex items-center gap-1.5">
              <activeItem.icon size={13} className="text-primary" />
              {activeItem.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-[10px] font-semibold">
              <Activity size={10} /> Live
            </div>
            <button
              onClick={() => navigate('/admin/broadcast')}
              className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold hover:bg-primary/15 transition-colors flex items-center gap-1.5"
            >
              <Megaphone size={10} /> Broadcast
            </button>
            {pendingReports + pendingCount > 0 && (
              <button
                onClick={() => navigate('/admin/moderation')}
                className="relative p-1.5 rounded-lg hover:bg-muted/50 tap-scale"
              >
                <Bell size={14} />
                <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-destructive" />
              </button>
            )}
          </div>
        </div>

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Command palette */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
