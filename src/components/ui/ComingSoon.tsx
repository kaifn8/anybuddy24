import { cn } from '@/lib/utils';
import { AppIcon, type AppIconName } from '@/components/icons/AppIcon';
import { useNavigate } from 'react-router-dom';

/**
 * Small inline pill — drop next to any label that's not yet shippable.
 */
export function ComingSoonBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full',
        'text-[8px] font-bold uppercase tracking-wider',
        'bg-gradient-to-r from-primary/15 to-primary/5 text-primary',
        'border border-primary/15',
        className
      )}
    >
      <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
      Soon
    </span>
  );
}

/**
 * A teaser card that previews a feature that isn't built yet.
 * Tap = subtle shake + nothing happens. Used in feed surfaces.
 */
export function ComingSoonTile({
  icon, label, sub, className, to, onClick,
}: { icon: AppIconName; label: string; sub: string; className?: string; to?: string; onClick?: () => void }) {
  const navigate = useNavigate();
  const interactive = !!(to || onClick);
  const handle = () => {
    if (onClick) return onClick();
    if (to) navigate(to);
  };
  return (
    <button
      type="button"
      onClick={interactive ? handle : undefined}
      disabled={!interactive}
      className={cn(
        'relative w-full rounded-2xl p-3.5 text-left overflow-hidden',
        interactive ? 'liquid-glass-interactive tap-scale' : 'liquid-glass opacity-80 cursor-default select-none',
        'flex items-center gap-3',
        className
      )}
    >
      <span className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
        <AppIcon name={icon} size={22} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-[13px] font-bold tracking-tight truncate">{label}</p>
          {!interactive && <ComingSoonBadge />}
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{sub}</p>
      </div>
      {interactive && <span className="text-muted-foreground/40 shrink-0 text-sm">›</span>}
    </button>
  );
}

/**
 * Bigger teaser used as a section card.
 */
export function ComingSoonSection({
  title, description, icon, className,
}: { title: string; description: string; icon: AppIconName; className?: string }) {
  return (
    <div
      className={cn(
        'relative rounded-3xl p-4 overflow-hidden',
        'liquid-glass-heavy opacity-90',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shrink-0">
          <AppIcon name={icon} size={24} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-[14px] font-bold tracking-tight">{title}</h3>
            <ComingSoonBadge />
          </div>
          <p className="text-[11.5px] leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}