import type { Category } from '@/types/anybuddy';

const emojiMap: Record<Category, string> = {
  chai:     '☕',
  explore:  '🧭',
  shopping: '🛍️',
  work:     '💻',
  help:     '🤝',
  casual:   '✨',
  sports:   '🏀',
  food:     '🍽️',
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
  const sizeClasses = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-14 h-14' };
  const fontSize = { sm: '16px', md: '20px', lg: '28px' };

  return (
    <div className={`inline-flex items-center justify-center rounded-2xl ${bgMap[category]} ${sizeClasses[size]} ${className || ''}`}>
      <span style={{ fontSize: fontSize[size], lineHeight: 1 }}>{emojiMap[category] || '✨'}</span>
    </div>
  );
}

export function getCategoryEmoji(category: Category): string {
  return emojiMap[category] || '✨';
}

export function getCategoryLabel(category: Category): string {
  const labels: Record<Category, string> = {
    chai: 'Chai & Coffee', explore: 'Explore', shopping: 'Shopping',
    work: 'Work-along', help: 'Help', casual: 'Casual',
    sports: 'Sports', food: 'Food', walk: 'Walk',
  };
  return labels[category] || category;
}
