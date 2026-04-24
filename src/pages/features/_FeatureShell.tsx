import { ReactNode } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { AppIcon, type AppIconName } from '@/components/icons/AppIcon';
import { cn } from '@/lib/utils';

/**
 * Shared shell for prototype feature pages.
 * Renders a TopBar with back button + a hero header + scrollable content + BottomNav.
 */
export function FeatureShell({
  title, hero, children, hideNav = false,
}: {
  title: string;
  hero?: { icon: AppIconName; label: string; sub: string; tone?: 'primary' | 'accent' | 'success' };
  children: ReactNode;
  hideNav?: boolean;
}) {
  const tone = hero?.tone ?? 'primary';
  const toneStyles = {
    primary: 'from-primary/15 to-primary/5 border-primary/20 text-primary',
    accent:  'from-accent/15 to-accent/5 border-accent/20 text-accent',
    success: 'from-success/15 to-success/5 border-success/20 text-success',
  }[tone];

  return (
    <>
      <div className="mobile-container min-h-screen bg-background pb-nav">
        <TopBar title={title} showBack hideRight />
        <div className="px-4 pt-3 space-y-3 animate-fade-in">
          {hero && (
            <div
              className={cn(
                'rounded-[1.25rem] p-4 border bg-gradient-to-br animate-scale-in',
                toneStyles
              )}
            >
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-2xl bg-background/60 flex items-center justify-center shrink-0 shadow-sm">
                  <AppIcon name={hero.icon} size={26} />
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-bold tracking-tight text-foreground">{hero.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{hero.sub}</p>
                </div>
              </div>
            </div>
          )}
          {children}
        </div>
      </div>
      {!hideNav && <BottomNav />}
    </>
  );
}

export function PrototypeBanner() {
  return (
    <div className="rounded-2xl px-3.5 py-2.5 flex items-center gap-2 bg-muted/30 border border-border/30 animate-fade-in">
      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
      <AppIcon name="fc:info" size={14} />
      <p className="text-[10.5px] text-muted-foreground leading-snug">
        Prototype preview — interactions are local-only and reset on refresh.
      </p>
    </div>
  );
}