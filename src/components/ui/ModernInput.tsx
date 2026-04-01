import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ModernInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const ModernInput = forwardRef<HTMLInputElement, ModernInputProps>(
  ({ className, label, hint, error, icon, suffix, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-xs font-medium text-muted-foreground">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full h-12 px-4 rounded-xl',
              'text-body text-foreground placeholder:text-muted-foreground/40',
              'focus:outline-none transition-all duration-150',
              'liquid-glass',
              'focus:ring-2 focus:ring-primary/20',
              icon && 'pl-11',
              suffix && 'pr-11',
              error && 'ring-2 ring-destructive/30',
              className
            )}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              {suffix}
            </div>
          )}
        </div>
        {(hint || error) && (
          <p className={cn('text-2xs', error ? 'text-destructive' : 'text-muted-foreground')}>
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

ModernInput.displayName = 'ModernInput';
