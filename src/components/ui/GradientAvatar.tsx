import { cn } from '@/lib/utils';

// Premium gradient pairs — Apple-inspired pastel tones
const GRADIENT_PAIRS = [
  ['#FF6B6B', '#FFA07A'],  // coral → salmon
  ['#667EEA', '#764BA2'],  // indigo → purple
  ['#F093FB', '#F5576C'],  // pink → rose
  ['#4FACFE', '#00F2FE'],  // sky → cyan
  ['#43E97B', '#38F9D7'],  // green → teal
  ['#FA709A', '#FEE140'],  // rose → gold
  ['#A18CD1', '#FBC2EB'],  // lavender → blush
  ['#FCCB90', '#D57EEB'],  // peach → violet
  ['#E0C3FC', '#8EC5FC'],  // lilac → blue
  ['#F5AF19', '#F12711'],  // amber → red
  ['#89F7FE', '#66A6FF'],  // aqua → blue
  ['#FDDB92', '#D1FDFF'],  // cream → ice
  ['#A1C4FD', '#C2E9FB'],  // soft blue pair
  ['#D4FC79', '#96E6A1'],  // lime → mint
  ['#84FAB0', '#8FD3F4'],  // mint → sky
  ['#FFD26F', '#3677FF'],  // gold → blue
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

interface GradientAvatarProps {
  name: string;
  size?: number;
  className?: string;
  showInitials?: boolean;
}

export function GradientAvatar({ name, size = 32, className, showInitials = true }: GradientAvatarProps) {
  const hash = hashName(name);
  const pair = GRADIENT_PAIRS[hash % GRADIENT_PAIRS.length];
  const angle = (hash % 360);
  const initials = getInitials(name);
  
  const fontSize = Math.max(size * 0.38, 8);
  
  return (
    <div
      className={cn('rounded-full flex items-center justify-center shrink-0 select-none', className)}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(${angle}deg, ${pair[0]}, ${pair[1]})`,
        boxShadow: `0 2px 8px ${pair[0]}25`,
      }}
    >
      {showInitials && (
        <span
          className="font-bold text-white/90 leading-none"
          style={{ 
            fontSize,
            textShadow: '0 0.5px 1px rgba(0,0,0,0.1)',
            letterSpacing: '-0.02em',
          }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}

/** Generates a gradient background style for inline use */
export function getGradientStyle(name: string) {
  const hash = hashName(name);
  const pair = GRADIENT_PAIRS[hash % GRADIENT_PAIRS.length];
  const angle = (hash % 360);
  return {
    background: `linear-gradient(${angle}deg, ${pair[0]}, ${pair[1]})`,
  };
}
