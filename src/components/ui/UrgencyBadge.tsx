import type { Urgency } from '@/types/anybuddy';
import { cn } from '@/lib/utils';

interface UrgencyBadgeProps {
  urgency: Urgency;
  className?: string;
  size?: 'sm' | 'md';
}

const emojiMap = {
  now: '⚡',
  today: '☀️',
  week: '📅',
};

const styleMap = {
  now: 'badge-now',
  today: 'badge-today',
  week: 'badge-week',
};

const labelMap: Record<Urgency, string> = {
  now: 'Now',
  today: 'Today',
  week: 'This Week',
};

export function UrgencyBadge({ urgency, className, size = 'sm' }: UrgencyBadgeProps) {
  return (
    <div className={cn(
      'inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap shrink-0',
      size === 'sm' ? 'px-2 py-0.5 text-2xs' : 'px-2.5 py-1 text-xs',
      styleMap[urgency],
      className
    )}>
      <span className={size === 'sm' ? 'text-[10px]' : 'text-[12px]'}>{emojiMap[urgency]}</span>
      <span>{labelMap[urgency]}</span>
    </div>
  );
}
