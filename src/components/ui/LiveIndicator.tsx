import { cn } from '@/lib/utils';

interface LiveIndicatorProps {
  className?: string;
}

export function LiveIndicator({ className }: LiveIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="relative flex items-center justify-center">
        <div className="h-2 w-2 rounded-full bg-success" />
        <div className="absolute inset-0 h-2 w-2 rounded-full bg-success pulse-live" />
      </div>
      <span className="text-xs font-medium text-success">Live</span>
    </div>
  );
}
