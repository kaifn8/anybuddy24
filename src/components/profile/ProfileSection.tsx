import type { ReactNode } from 'react';

interface ProfileSectionProps {
  title: string;
  icon?: string;
  action?: string;
  onAction?: () => void;
  children: ReactNode;
}

export function ProfileSection({ title, icon, action, onAction, children }: ProfileSectionProps) {
  return (
    <div className="liquid-glass-heavy rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
          {icon && <span className="mr-1">{icon}</span>}
          {title}
        </h3>
        {action && onAction && (
          <button onClick={onAction} className="text-[11px] text-primary font-semibold tap-scale">
            {action}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
