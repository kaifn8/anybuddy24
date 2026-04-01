import { cn } from '@/lib/utils';

interface ProgressDotsProps {
  total: number;
  current: number;
  className?: string;
}

export function ProgressDots({ total, current, className }: ProgressDotsProps) {
  return (
    <div className={cn('flex gap-1.5', className)}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1 rounded-full transition-all duration-300',
            i <= current
              ? 'bg-primary flex-[2]'
              : 'bg-muted-foreground/20 flex-1'
          )}
        />
      ))}
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

import React from 'react';

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ value, max = 100, className, showLabel = false, size = 'md' }, ref) => {
    const percentage = Math.min(100, (value / max) * 100);
    
    return (
      <div ref={ref} className={cn('space-y-1.5', className)}>
        {showLabel && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{value}</span>
            <span>{max}</span>
          </div>
        )}
        <div className={cn(
          'w-full rounded-full overflow-hidden',
          'bg-muted/50',
          size === 'sm' && 'h-1',
          size === 'md' && 'h-2',
          size === 'lg' && 'h-3'
        )}>
          <div 
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${percentage}%`,
              background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))'
            }}
          />
        </div>
      </div>
    );
  }
);
ProgressBar.displayName = 'ProgressBar';
