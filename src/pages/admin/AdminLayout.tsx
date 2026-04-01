import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, ShieldAlert, ShieldCheck, 
  CreditCard, ChevronLeft, Menu, X 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
  { id: 'verification', label: 'Verification', icon: ShieldCheck, path: '/admin/verification' },
  { id: 'moderation', label: 'Moderation', icon: ShieldAlert, path: '/admin/moderation' },
  { id: 'pricing', label: 'Pricing', icon: CreditCard, path: '/admin/pricing' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pendingVerifications } = useAppStore();
  const pendingCount = pendingVerifications.filter(v => v.status === 'pending').length;

  const currentPath = location.pathname;
  const isActive = (path: string) => {
    if (path === '/admin') return currentPath === '/admin';
    return currentPath.startsWith(path);
  };

  const activeItem = NAV_ITEMS.find(item => isActive(item.path)) || NAV_ITEMS[0];

  return (
    <div className="min-h-screen bg-ambient flex flex-col">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-50 flex items-center justify-between px-4 h-14 border-b border-border/20 bg-background/80 backdrop-blur-xl">
        <button onClick={() => navigate('/home')} className="flex items-center gap-1.5 text-muted-foreground tap-scale">
          <ChevronLeft size={18} />
          <span className="text-xs font-medium">App</span>
        </button>
        <h1 className="text-sm font-bold">🛡️ Admin</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="tap-scale p-1">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile nav tabs */}
      <div className="lg:hidden flex border-b border-border/15 overflow-x-auto scrollbar-hide bg-background/60 backdrop-blur-sm">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => { navigate(item.path); setSidebarOpen(false); }}
            className={cn(
              'flex-1 min-w-[80px] py-2.5 text-[10px] font-semibold transition-colors whitespace-nowrap px-2 flex flex-col items-center gap-1 relative',
              isActive(item.path) ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
            )}
          >
            <item.icon size={16} />
            {item.label}
            {item.id === 'verification' && pendingCount > 0 && (
              <span className="absolute top-1.5 right-2 w-3.5 h-3.5 rounded-full bg-destructive text-white text-[8px] font-bold flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-56 border-r border-border/20 bg-background/60 backdrop-blur-xl sticky top-0 h-screen">
          {/* Sidebar header */}
          <div className="p-5 border-b border-border/15">
            <button onClick={() => navigate('/home')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors tap-scale mb-3">
              <ChevronLeft size={14} />
              <span className="text-xs font-medium">Back to app</span>
            </button>
            <h1 className="text-lg font-bold flex items-center gap-2">
              🛡️ <span>Admin Panel</span>
            </h1>
          </div>

          {/* Nav items */}
          <nav className="flex-1 p-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all tap-scale relative',
                  isActive(item.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <item.icon size={18} />
                {item.label}
                {item.id === 'verification' && pendingCount > 0 && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-border/15">
            <p className="text-[10px] text-muted-foreground text-center">anybuddy admin v1.0</p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
