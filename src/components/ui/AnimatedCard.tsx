import { useRef, forwardRef } from 'react';
import { gsapAnimations } from '@/hooks/useGsapAnimations';
import { cn } from '@/lib/utils';

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  enableHover?: boolean;
  enablePress?: boolean;
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, className, enableHover = true, enablePress = true, onClick, ...props }, ref) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const resolvedRef = (ref as React.RefObject<HTMLDivElement>) || cardRef;

    const handleMouseEnter = () => {
      if (enableHover && resolvedRef.current) {
        gsapAnimations.cardHover(resolvedRef.current, true);
      }
    };

    const handleMouseLeave = () => {
      if (enableHover && resolvedRef.current) {
        gsapAnimations.cardHover(resolvedRef.current, false);
      }
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (enablePress && resolvedRef.current) {
        gsapAnimations.buttonPress(resolvedRef.current);
        const rect = resolvedRef.current.getBoundingClientRect();
        gsapAnimations.ripple(resolvedRef.current, e.clientX - rect.left, e.clientY - rect.top);
      }
      onClick?.(e);
    };

    return (
      <div
        ref={resolvedRef}
        className={cn('glass-card cursor-pointer', className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';
