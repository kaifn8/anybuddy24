import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  action?: React.ReactNode;
  transparent?: boolean;
  className?: string;
}

export function PageHeader({ 
  title, 
  subtitle, 
  showBack = true, 
  action,
  transparent = false,
  className 
}: PageHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <header 
      className={cn(
        'sticky top-0 z-40',
        transparent ? 'bg-transparent' : 'liquid-glass-nav',
        className
      )}
    >
      <div className="flex items-center gap-3 px-5 h-12 max-w-md mx-auto">
        {showBack && (
          <button 
            onClick={() => navigate(-1)} 
            className="w-8 h-8 rounded-lg tap-scale text-sm hover:bg-muted transition-colors"
          >
            ←
          </button>
        )}
        
        <div className="flex-1 min-w-0">
          <h1 className="text-title-sm font-semibold text-foreground truncate">{title}</h1>
          {subtitle && (
            <p className="text-2xs text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}
