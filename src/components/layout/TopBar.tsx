import { useNavigate, useLocation } from 'react-router-dom';
import { forwardRef } from 'react';

interface TopBarProps {
  showBack?: boolean;
  title?: string;
  /** Custom center content (overrides title) */
  center?: React.ReactNode;
  /** Right-side action slot */
  rightAction?: React.ReactNode;
  /** Left-side content after back button */
  leftContent?: React.ReactNode;
  /** Hide default right actions */
  hideRight?: boolean;
  className?: string;
}

const glassStyle = {
  background: 'hsla(var(--glass-bg) / 0.3)',
  backdropFilter: 'blur(var(--glass-blur-ultra)) saturate(240%)',
  WebkitBackdropFilter: 'blur(var(--glass-blur-ultra)) saturate(240%)',
  borderBottom: '0.5px solid hsla(var(--glass-border) / 0.5)',
  boxShadow: '0 0.5px 8px hsla(var(--glass-shadow)), inset 0 0.5px 0 hsla(var(--glass-highlight))',
} as const;

export const TopBar = forwardRef<HTMLElement, TopBarProps>(({
  showBack = false,
  title,
  center,
  rightAction,
  leftContent,
  hideRight = false,
  className,
}, ref) => {
  const navigate = useNavigate();
  const location = useLocation();

  const shouldShowBack = showBack || [
    '/credits', '/invite', '/settings', '/circle',
    '/attendance', '/review',
  ].some(p => location.pathname.startsWith(p));

  return (
    <header
      ref={ref}
      className={`sticky top-0 z-40 lg:pl-64 safe-top ${className || ''}`}
      style={glassStyle}
    >
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto flex items-center justify-between h-[48px] px-4">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0 shrink-0">
          {shouldShowBack && (
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center tap-scale shrink-0"
            >
              <span className="text-sm font-medium">←</span>
            </button>
          )}
          {leftContent}
        </div>

        {/* Center */}
        <div className="flex-1 min-w-0 flex items-center justify-center">
          {center || (title ? (
            <span className="text-[17px] font-bold text-foreground tracking-tight truncate">{title}</span>
          ) : (
            <>
              <span className="text-[20px] lg:hidden" style={{ fontFamily: "'Pacifico', cursive" }}>
                any<span className="text-primary">buddy</span>
              </span>
              <span className="hidden lg:block text-[16px] font-bold text-foreground tracking-tight">Home</span>
            </>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!hideRight && rightAction}
        </div>
      </div>
    </header>
  );
});

TopBar.displayName = 'TopBar';
