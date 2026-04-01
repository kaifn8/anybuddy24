import type { TrustLevel } from '@/types/anybuddy';
import { cn } from '@/lib/utils';
import React from 'react';

interface TrustBadgeProps {
  level: TrustLevel;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const emojiMap = {
  seed: '🌱',
  solid: '🛡️',
  trusted: '⭐',
  anchor: '🏆',
};

const styleMap = {
  seed: 'trust-seed',
  solid: 'trust-solid',
  trusted: 'trust-trusted',
  anchor: 'trust-anchor',
};

const labelMap: Record<TrustLevel, string> = {
  seed: 'New',
  solid: 'Verified',
  trusted: 'Trusted',
  anchor: 'Star',
};

const sizeMap = {
  sm: 'text-2xs px-1.5 py-0.5 gap-0.5',
  md: 'text-xs px-2 py-0.5 gap-1',
  lg: 'text-sm px-2.5 py-1 gap-1',
};

export const TrustBadge = React.forwardRef<HTMLDivElement, TrustBadgeProps>(
  ({ level, showLabel = true, size = 'sm', className }, ref) => {
    return (
      <div ref={ref} className={cn(
        'inline-flex items-center rounded-full font-medium',
        styleMap[level],
        sizeMap[size],
        className
      )}>
        <span className={size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-[12px]' : 'text-[14px]'}>{emojiMap[level]}</span>
        {showLabel && <span>{labelMap[level]}</span>}
      </div>
    );
  }
);
TrustBadge.displayName = 'TrustBadge';
