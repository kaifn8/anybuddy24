import { forwardRef } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectionChipProps {
  selected?: boolean;
  icon?: React.ReactNode;
  label: string;
  sublabel?: string;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'compact';
}

export const SelectionChip = forwardRef<HTMLButtonElement, SelectionChipProps>(
  ({ selected, icon, label, sublabel, onClick, className, variant = 'default' }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={cn(
          'relative flex items-center gap-3 rounded-2xl font-medium transition-all duration-200',
          'border-2 active:scale-[0.98]',
          variant === 'default' ? 'p-4' : 'px-4 py-3',
          selected
            ? 'border-primary bg-primary/8 text-foreground shadow-sm'
            : 'border-transparent bg-card text-foreground shadow-sm hover:shadow-md hover:bg-card/80',
          className
        )}
      >
        {icon && (
          <div className={cn(
            'shrink-0',
            selected && 'text-primary'
          )}>
            {icon}
          </div>
        )}
        <div className="flex-1 text-left">
          <span className={cn(
            'text-sm',
            selected && 'text-primary font-semibold'
          )}>
            {label}
          </span>
          {sublabel && (
            <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>
          )}
        </div>
        {selected && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <Check size={12} className="text-primary-foreground" strokeWidth={3} />
          </div>
        )}
      </button>
    );
  }
);

SelectionChip.displayName = 'SelectionChip';

interface ChipGroupProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}

export function ChipGroup({ children, columns = 2, className }: ChipGroupProps) {
  return (
    <div className={cn(
      'grid gap-3',
      columns === 1 && 'grid-cols-1',
      columns === 2 && 'grid-cols-2',
      columns === 3 && 'grid-cols-3',
      className
    )}>
      {children}
    </div>
  );
}
