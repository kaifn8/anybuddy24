/**
 * AppIcon — Central color-icon wrapper using Iconify with bundled icon sets.
 * Uses flat-color-icons for UI accents, streamline-emojis for badges,
 * and twemoji for navigation & category icons (Instagram-style colorful).
 * Icons are bundled locally (no API call needed).
 */
import { Icon, addCollection } from '@iconify/react';
import flatColorIconsData from '@iconify-json/flat-color-icons/icons.json';
import streamlineEmojisData from '@iconify-json/streamline-emojis/icons.json';
import twemojiData from '@iconify-json/twemoji/icons.json';

// Register the icon sets once
addCollection(flatColorIconsData as Parameters<typeof addCollection>[0]);
addCollection(streamlineEmojisData as Parameters<typeof addCollection>[0]);
addCollection(twemojiData as Parameters<typeof addCollection>[0]);

export type AppIconName =
  // flat-color-icons (UI accent)
  | 'fc:home'
  | 'fc:settings'
  | 'fc:plus'
  | 'fc:search'
  | 'fc:share'
  | 'fc:bookmark'
  | 'fc:calendar'
  | 'fc:statistics'
  | 'fc:todo-list'
  | 'fc:conference-call'
  | 'fc:invite'
  | 'fc:like'
  | 'fc:feedback'
  | 'fc:comments'
  | 'fc:trophy'
  | 'fc:globe'
  | 'fc:clock'
  | 'fc:info'
  | 'fc:cancel'
  | 'fc:checkmark'
  | 'fc:vip'
  | 'fc:rating'
  | 'fc:money-transfer'
  | 'fc:lock'
  | 'fc:unlock'
  | 'fc:businessman'
  | 'fc:collaboration'
  | 'fc:support'
  | 'fc:department'
  | 'fc:news'
  | 'fc:idea'
  | 'fc:advertising'
  | 'fc:sports-mode'
  | 'fc:shop'
  | 'fc:biotech'
  | 'fc:trail-flow'
  | 'fc:accept-database'
  | 'fc:music'
  | 'fc:reading'
  | 'fc:camera'
  | 'fc:leave'
  // streamline-emojis (badges & gamification)
  | 'se:bell'
  | 'se:bell-with-slash'
  | 'se:fire'
  | 'se:snowflake'
  | 'se:crown'
  | 'se:sparkles'
  | 'se:trophy-1'
  | 'se:map-1'
  // twemoji — navigation icons (Instagram-style)
  | 'tw:home'
  | 'tw:map'
  | 'tw:bell'
  | 'tw:chat'
  | 'tw:settings'
  | 'tw:quests'
  | 'tw:circle'
  | 'tw:leaderboard'
  | 'tw:plus'
  // twemoji — UI / state icons
  | 'tw:pin'
  | 'tw:clock'
  | 'tw:people'
  | 'tw:fire'
  | 'tw:party'
  | 'tw:check'
  | 'tw:star'
  | 'tw:lightning'
  | 'tw:medal'
  | 'tw:megaphone'
  | 'tw:world'
  | 'tw:man'
  | 'tw:woman'
  | 'tw:globe'
  | 'tw:trophy'
  | 'tw:shield'
  | 'tw:seedling'
  | 'tw:handshake'
  | 'tw:edit'
  | 'tw:camera'
  // twemoji — category icons
  | 'se:chai'
  | 'se:food'
  | 'se:sports'
  | 'se:walk'
  | 'se:explore'
  | 'se:work'
  | 'se:shopping'
  | 'se:help'
  | 'se:casual';

// Maps our short prefix to Iconify prefixes + icon names
const ICON_MAP: Record<AppIconName, string> = {
  'fc:home': 'flat-color-icons:home',
  'fc:settings': 'flat-color-icons:settings',
  'fc:plus': 'flat-color-icons:plus',
  'fc:search': 'flat-color-icons:search',
  'fc:share': 'flat-color-icons:share',
  'fc:bookmark': 'flat-color-icons:bookmark',
  'fc:calendar': 'flat-color-icons:calendar',
  'fc:statistics': 'flat-color-icons:statistics',
  'fc:todo-list': 'flat-color-icons:todo-list',
  'fc:conference-call': 'flat-color-icons:conference-call',
  'fc:invite': 'flat-color-icons:invite',
  'fc:like': 'flat-color-icons:like',
  'fc:feedback': 'flat-color-icons:feedback',
  'fc:comments': 'flat-color-icons:comments',
  'fc:trophy': 'flat-color-icons:icons8-cup',
  'fc:globe': 'flat-color-icons:globe',
  'fc:clock': 'flat-color-icons:clock',
  'fc:info': 'flat-color-icons:info',
  'fc:cancel': 'flat-color-icons:cancel',
  'fc:checkmark': 'flat-color-icons:checkmark',
  'fc:vip': 'flat-color-icons:vip',
  'fc:rating': 'flat-color-icons:rating',
  'fc:money-transfer': 'flat-color-icons:money-transfer',
  'fc:lock': 'flat-color-icons:lock',
  'fc:unlock': 'flat-color-icons:unlock',
  'fc:businessman': 'flat-color-icons:businessman',
  'fc:collaboration': 'flat-color-icons:collaboration',
  'fc:support': 'flat-color-icons:support',
  'fc:department': 'flat-color-icons:department',
  'fc:news': 'flat-color-icons:news',
  'fc:idea': 'flat-color-icons:idea',
  'fc:advertising': 'flat-color-icons:advertising',
  'fc:sports-mode': 'flat-color-icons:sports-mode',
  'fc:shop': 'flat-color-icons:shop',
  'fc:biotech': 'flat-color-icons:biotech',
  'fc:trail-flow': 'flat-color-icons:trail-flow',
  'fc:accept-database': 'flat-color-icons:accept-database',
  'fc:music': 'flat-color-icons:music',
  'fc:reading': 'flat-color-icons:reading',
  'fc:camera': 'flat-color-icons:camera',
  'fc:leave': 'flat-color-icons:leave',
  // streamline-emojis (badges)
  'se:bell': 'streamline-emojis:bell',
  'se:bell-with-slash': 'streamline-emojis:bell-with-slash',
  'se:fire': 'streamline-emojis:fire',
  'se:snowflake': 'streamline-emojis:snowflake',
  'se:crown': 'streamline-emojis:crown',
  'se:sparkles': 'streamline-emojis:sparkles',
  'se:trophy-1': 'streamline-emojis:trophy-1',
  'se:map-1': 'streamline-emojis:globe-showing-europe-africa',
  // twemoji — navigation (Instagram-style colorful)
  'tw:home':        'twemoji:house',
  'tw:map':         'twemoji:world-map',
  'tw:bell':        'twemoji:bell',
  'tw:chat':        'twemoji:speech-balloon',
  'tw:settings':    'twemoji:gear',
  'tw:quests':      'twemoji:clipboard',
  'tw:circle':      'twemoji:busts-in-silhouette',
  'tw:leaderboard': 'twemoji:bar-chart',
  'tw:plus':        'twemoji:plus',
  // twemoji — UI / state icons
  'tw:pin':         'twemoji:round-pushpin',
  'tw:clock':       'twemoji:alarm-clock',
  'tw:people':      'twemoji:busts-in-silhouette',
  'tw:fire':        'twemoji:fire',
  'tw:party':       'twemoji:party-popper',
  'tw:check':       'twemoji:check-mark-button',
  'tw:star':        'twemoji:star',
  'tw:lightning':   'twemoji:high-voltage',
  'tw:medal':       'twemoji:sports-medal',
  'tw:megaphone':   'twemoji:loudspeaker',
  'tw:world':       'twemoji:globe-showing-asia-australia',
  'tw:man':         'twemoji:man',
  'tw:woman':       'twemoji:woman',
  'tw:globe':       'twemoji:world-map',
  'tw:trophy':      'twemoji:trophy',
  'tw:shield':      'twemoji:shield',
  'tw:seedling':    'twemoji:seedling',
  'tw:handshake':   'twemoji:handshake',
  'tw:edit':        'twemoji:pencil',
  'tw:camera':      'twemoji:camera',
  // twemoji — category icons
  'se:chai':     'twemoji:hot-beverage',
  'se:food':     'twemoji:fork-and-knife-with-plate',
  'se:sports':   'twemoji:basketball',
  'se:walk':     'twemoji:person-walking',
  'se:explore':  'twemoji:compass',
  'se:work':     'twemoji:laptop',
  'se:shopping': 'twemoji:shopping-bags',
  'se:help':     'twemoji:handshake',
  'se:casual':   'twemoji:sparkles',
};

interface AppIconProps {
  name: AppIconName;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export function AppIcon({ name, size = 24, className, style }: AppIconProps) {
  return (
    <Icon
      icon={ICON_MAP[name]}
      width={size}
      height={size}
      className={className}
      style={style}
    />
  );
}
