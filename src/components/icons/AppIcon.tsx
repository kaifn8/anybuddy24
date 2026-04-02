/**
 * AppIcon — Renders native emoji instead of Iconify icon sets.
 * Drop-in replacement: same API, emoji output.
 */

export type AppIconName =
  // flat-color-icons (UI accent)
  | 'fc:home' | 'fc:settings' | 'fc:plus' | 'fc:search' | 'fc:share'
  | 'fc:bookmark' | 'fc:calendar' | 'fc:statistics' | 'fc:todo-list'
  | 'fc:conference-call' | 'fc:invite' | 'fc:like' | 'fc:feedback'
  | 'fc:comments' | 'fc:trophy' | 'fc:globe' | 'fc:clock' | 'fc:info'
  | 'fc:cancel' | 'fc:checkmark' | 'fc:vip' | 'fc:rating'
  | 'fc:money-transfer' | 'fc:lock' | 'fc:unlock' | 'fc:businessman'
  | 'fc:collaboration' | 'fc:support' | 'fc:department' | 'fc:news'
  | 'fc:idea' | 'fc:advertising' | 'fc:sports-mode' | 'fc:shop'
  | 'fc:biotech' | 'fc:trail-flow' | 'fc:accept-database' | 'fc:music'
  | 'fc:reading' | 'fc:camera' | 'fc:leave'
  // streamline-emojis (badges & gamification)
  | 'se:bell' | 'se:bell-with-slash' | 'se:fire' | 'se:snowflake'
  | 'se:crown' | 'se:sparkles' | 'se:trophy-1' | 'se:map-1'
  // twemoji — navigation
  | 'tw:home' | 'tw:map' | 'tw:bell' | 'tw:chat' | 'tw:settings'
  | 'tw:quests' | 'tw:circle' | 'tw:leaderboard' | 'tw:plus'
  // twemoji — UI / state
  | 'tw:pin' | 'tw:clock' | 'tw:people' | 'tw:fire' | 'tw:party'
  | 'tw:check' | 'tw:star' | 'tw:lightning' | 'tw:medal' | 'tw:megaphone'
  | 'tw:world' | 'tw:man' | 'tw:woman' | 'tw:globe' | 'tw:trophy'
  | 'tw:shield' | 'tw:seedling' | 'tw:handshake' | 'tw:edit' | 'tw:camera'
  // category icons
  | 'se:chai' | 'se:food' | 'se:sports' | 'se:walk' | 'se:explore'
  | 'se:work' | 'se:shopping' | 'se:help' | 'se:casual';

const EMOJI_MAP: Record<AppIconName, string> = {
  'fc:home': '🏠',
  'fc:settings': '⚙️',
  'fc:plus': '➕',
  'fc:search': '🔍',
  'fc:share': '🔗',
  'fc:bookmark': '🔖',
  'fc:calendar': '📅',
  'fc:statistics': '📊',
  'fc:todo-list': '📋',
  'fc:conference-call': '👥',
  'fc:invite': '💌',
  'fc:like': '❤️',
  'fc:feedback': '💬',
  'fc:comments': '💬',
  'fc:trophy': '🏆',
  'fc:globe': '🌍',
  'fc:clock': '🕐',
  'fc:info': 'ℹ️',
  'fc:cancel': '✖️',
  'fc:checkmark': '✅',
  'fc:vip': '⭐',
  'fc:rating': '⭐',
  'fc:money-transfer': '💸',
  'fc:lock': '🔒',
  'fc:unlock': '🔓',
  'fc:businessman': '👔',
  'fc:collaboration': '🤝',
  'fc:support': '🙌',
  'fc:department': '🏢',
  'fc:news': '📰',
  'fc:idea': '💡',
  'fc:advertising': '📢',
  'fc:sports-mode': '🏃',
  'fc:shop': '🛒',
  'fc:biotech': '🧬',
  'fc:trail-flow': '🔀',
  'fc:accept-database': '✅',
  'fc:music': '🎵',
  'fc:reading': '📖',
  'fc:camera': '📷',
  'fc:leave': '🚪',
  // streamline-emojis
  'se:bell': '🔔',
  'se:bell-with-slash': '🔕',
  'se:fire': '🔥',
  'se:snowflake': '❄️',
  'se:crown': '👑',
  'se:sparkles': '✨',
  'se:trophy-1': '🏆',
  'se:map-1': '🌍',
  // twemoji — navigation
  'tw:home': '🏠',
  'tw:map': '🗺️',
  'tw:bell': '🔔',
  'tw:chat': '💬',
  'tw:settings': '⚙️',
  'tw:quests': '📋',
  'tw:circle': '👥',
  'tw:leaderboard': '📊',
  'tw:plus': '➕',
  // twemoji — UI / state
  'tw:pin': '📍',
  'tw:clock': '⏰',
  'tw:people': '👥',
  'tw:fire': '🔥',
  'tw:party': '🎉',
  'tw:check': '✅',
  'tw:star': '⭐',
  'tw:lightning': '⚡',
  'tw:medal': '🏅',
  'tw:megaphone': '📢',
  'tw:world': '🌏',
  'tw:man': '👨',
  'tw:woman': '👩',
  'tw:globe': '🗺️',
  'tw:trophy': '🏆',
  'tw:shield': '🛡️',
  'tw:seedling': '🌱',
  'tw:handshake': '🤝',
  'tw:edit': '✏️',
  'tw:camera': '📷',
  // category icons
  'se:chai': '☕',
  'se:food': '🍽️',
  'se:sports': '🏀',
  'se:walk': '🚶',
  'se:explore': '🧭',
  'se:work': '💻',
  'se:shopping': '🛍️',
  'se:help': '🤝',
  'se:casual': '✨',
};

interface AppIconProps {
  name: AppIconName;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export function AppIcon({ name, size = 24, className, style }: AppIconProps) {
  const fontSize = typeof size === 'number' ? `${size}px` : size;
  return (
    <span
      role="img"
      className={className}
      style={{ fontSize, lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }}
    >
      {EMOJI_MAP[name] || '❓'}
    </span>
  );
}
