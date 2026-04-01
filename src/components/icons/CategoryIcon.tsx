import { AppIcon } from '@/components/icons/AppIcon';
import type { AppIconName } from '@/components/icons/AppIcon';
import type { Category } from '@/types/anybuddy';

const iconMap: Record<Category, AppIconName> = {
  chai:     'se:chai',      // clinking mugs — coffee/drinks
  explore:  'se:explore',   // globe — exploration
  shopping: 'se:shopping',  // handbag
  work:     'se:work',      // briefcase
  help:     'se:help',      // handshake
  casual:   'se:casual',    // sparkles
  sports:   'se:sports',    // basketball
  food:     'se:food',      // hamburger
  walk:     'se:walk',      // person walking
};

// Fallback emoji for places that still need a string (e.g. filter chips)
const emojiMap: Record<Category, string> = {
  chai:     '☕',
  explore:  '🧭',
  shopping: '🛍️',
  work:     '💻',
  help:     '🤝',
  casual:   '✨',
  sports:   '🏸',
  food:     '🍜',
  walk:     '🚶',
};

const bgMap: Record<Category, string> = {
  chai:     'bg-warning/10',
  explore:  'bg-secondary/10',
  shopping: 'bg-primary/10',
  work:     'bg-muted',
  help:     'bg-success/10',
  casual:   'bg-accent/15',
  sports:   'bg-primary/10',
  food:     'bg-warning/10',
  walk:     'bg-success/10',
};

interface CategoryEmojiProps {
  category: Category;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CategoryIcon({ category, size = 'md', className }: CategoryEmojiProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };
  const iconSize = { sm: 18, md: 22, lg: 30 };

  return (
    <div className={`inline-flex items-center justify-center rounded-2xl ${bgMap[category]} ${sizeClasses[size]} ${className || ''}`}>
      <AppIcon name={iconMap[category]} size={iconSize[size]} />
    </div>
  );
}

/** @deprecated use CategoryIcon component for color icons */
export function getCategoryEmoji(category: Category): string {
  return emojiMap[category] || '✨';
}

export function getCategoryLabel(category: Category): string {
  const labels: Record<Category, string> = {
    chai:     'Chai & Coffee',
    explore:  'Explore',
    shopping: 'Shopping',
    work:     'Work-along',
    help:     'Help',
    casual:   'Casual',
    sports:   'Sports',
    food:     'Food',
    walk:     'Walk',
  };
  return labels[category] || category;
}
