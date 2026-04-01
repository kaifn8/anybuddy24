interface BlueTickProps {
  size?: number;
  className?: string;
}

export function BlueTick({ size = 14, className = '' }: BlueTickProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" className={`inline-block shrink-0 ${className}`}>
      <circle cx="11" cy="11" r="11" fill="hsl(var(--primary))" />
      <path d="M6.5 11.5L9.5 14.5L15.5 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
