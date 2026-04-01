export type XPAction =
  | 'join_hangout'
  | 'post_hangout'
  | 'someone_joined_yours'
  | 'complete_hangout'
  | 'receive_thanks'
  | 'react_to_plan'
  | 'daily_quest_complete'
  | 'streak_milestone';

export const XP_REWARDS: Record<XPAction, number> = {
  join_hangout: 20,
  post_hangout: 30,
  someone_joined_yours: 40,
  complete_hangout: 50,
  receive_thanks: 25,
  react_to_plan: 5,
  daily_quest_complete: 30,
  streak_milestone: 50,
};

export interface XPLevel {
  level: number;
  title: string;
  emoji: string;
  xpRequired: number;
  color: string;
}

export const XP_LEVELS: XPLevel[] = [
  { level: 1, title: 'Newcomer',     emoji: '👋', xpRequired: 0,    color: '220 8% 55%'   },
  { level: 2, title: 'Explorer',     emoji: '🌱', xpRequired: 100,  color: '152 55% 44%'  },
  { level: 3, title: 'Connector',    emoji: '🤝', xpRequired: 300,  color: '211 100% 50%' },
  { level: 4, title: 'Social Spark', emoji: '⚡', xpRequired: 700,  color: '36 80% 58%'   },
  { level: 5, title: 'City Insider', emoji: '🏙️', xpRequired: 1500, color: '260 36% 56%'  },
  { level: 6, title: 'Scene Maker',  emoji: '🌟', xpRequired: 3000, color: '0 68% 52%'    },
  { level: 7, title: 'Legend',       emoji: '🔥', xpRequired: 6000, color: '36 80% 58%'   },
];

export function getLevelForXP(xp: number): XPLevel {
  let current = XP_LEVELS[0];
  for (const lvl of XP_LEVELS) {
    if (xp >= lvl.xpRequired) current = lvl;
    else break;
  }
  return current;
}

export function getNextLevel(xp: number): XPLevel | null {
  const current = getLevelForXP(xp);
  const idx = XP_LEVELS.findIndex(l => l.level === current.level);
  return idx < XP_LEVELS.length - 1 ? XP_LEVELS[idx + 1] : null;
}

export function getXPProgress(xp: number): number {
  const current = getLevelForXP(xp);
  const next = getNextLevel(xp);
  if (!next) return 100;
  const range = next.xpRequired - current.xpRequired;
  const earned = xp - current.xpRequired;
  return Math.min(100, (earned / range) * 100);
}

// ── Daily Quests ──────────────────────────────────────────────
export type QuestType =
  | 'react_to_3_plans'
  | 'join_1_activity'
  | 'post_a_hangout'
  | 'send_3_messages'
  | 'complete_a_meetup'
  | 'save_2_plans'
  | 'browse_map';

export interface DailyQuest {
  id: QuestType;
  title: string;
  description: string;
  emoji: string;
  target: number;
  xpReward: number;
  creditReward?: number;
}

export const DAILY_QUESTS: DailyQuest[] = [
  {
    id: 'react_to_3_plans',
    title: 'Social Butterfly',
    description: 'React to 3 nearby hangouts',
    emoji: '🦋',
    target: 3,
    xpReward: 30,
    // No creditReward — passive engagement only earns XP
  },
  {
    id: 'join_1_activity',
    title: 'Get Out There',
    description: 'Join 1 activity today',
    emoji: '🚀',
    target: 1,
    xpReward: 40,
    creditReward: 1, // Partial credit refund for real-world participation
  },
  {
    id: 'post_a_hangout',
    title: 'Be the Host',
    description: 'Post a hangout for others',
    emoji: '📣',
    target: 1,
    xpReward: 50,
    // No creditReward — posting costs credits; XP is the hosting reward
  },
  {
    id: 'send_3_messages',
    title: 'Chatterbox',
    description: 'Send 3 messages in chats',
    emoji: '💬',
    target: 3,
    xpReward: 20,
    // No creditReward — messaging earns XP only
  },
  {
    id: 'complete_a_meetup',
    title: 'Made it Happen',
    description: 'Complete a meetup',
    emoji: '✅',
    target: 1,
    xpReward: 60,
    creditReward: 2, // Partial credit refund for confirmed attendance
  },
  {
    id: 'save_2_plans',
    title: 'Weekend Planner',
    description: 'Save 2 plans for later',
    emoji: '📌',
    target: 2,
    xpReward: 15,
    // No creditReward — saving earns XP only
  },
  {
    id: 'browse_map',
    title: 'City Scout',
    description: 'Browse the map for activities',
    emoji: '🗺️',
    target: 1,
    xpReward: 10,
    // No creditReward — discovery earns XP only
  },
];

// Get 3 deterministic daily quests based on the current day
export function getDailyQuests(): DailyQuest[] {
  const dayIndex = Math.floor(Date.now() / 86400000);
  const shuffled = [...DAILY_QUESTS];
  // Seeded shuffle based on day
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (dayIndex * 2654435761 + i) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 3);
}

// ── Achievements ──────────────────────────────────────────────
export type AchievementId =
  | 'first_join'
  | 'first_post'
  | 'food_lover'
  | 'night_owl'
  | 'helper'
  | 'streak_3'
  | 'streak_7'
  | 'streak_30'
  | 'social_100xp'
  | 'connector_5joins'
  | 'host_5plans'
  | 'early_bird';

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpBonus: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_join',      title: 'First Step',        description: 'Joined your first hangout',             emoji: '👟', rarity: 'common',    xpBonus: 50  },
  { id: 'first_post',      title: 'Host Mode',         description: 'Posted your first hangout',             emoji: '📣', rarity: 'common',    xpBonus: 50  },
  { id: 'food_lover',      title: 'Foodie',            description: 'Joined 3 food hangouts',                emoji: '🍜', rarity: 'common',    xpBonus: 75  },
  { id: 'night_owl',       title: 'Night Owl',         description: 'Attended an activity after 9 PM',       emoji: '🦉', rarity: 'rare',      xpBonus: 100 },
  { id: 'helper',          title: 'Helping Hand',      description: 'Helped someone 3 times',                emoji: '🤝', rarity: 'rare',      xpBonus: 100 },
  { id: 'streak_3',        title: 'On a Roll',         description: 'Kept a 3-day streak',                   emoji: '🔥', rarity: 'common',    xpBonus: 75  },
  { id: 'streak_7',        title: 'Week Warrior',      description: 'Kept a 7-day streak',                   emoji: '⚡', rarity: 'rare',      xpBonus: 150 },
  { id: 'streak_30',       title: 'Monthly Legend',    description: 'Kept a 30-day streak',                  emoji: '🌟', rarity: 'legendary', xpBonus: 500 },
  { id: 'social_100xp',    title: 'Social 100',        description: 'Earned 100 XP',                         emoji: '💯', rarity: 'common',    xpBonus: 50  },
  { id: 'connector_5joins','title': 'Super Connector', description: 'Joined 5 different hangouts',           emoji: '🔗', rarity: 'epic',      xpBonus: 200 },
  { id: 'host_5plans',     title: 'Regular Host',      description: 'Hosted 5 plans',                        emoji: '🏠', rarity: 'epic',      xpBonus: 200 },
  { id: 'early_bird',      title: 'Early Bird',        description: 'Joined an activity before 8 AM',        emoji: '🌅', rarity: 'rare',      xpBonus: 100 },
];

// ── Leaderboard ───────────────────────────────────────────────
export interface LeaderboardEntry {
  userId: string;
  name: string;
  xp: number;
  weeklyXp: number;
  level: number;
  city: string;
  streak: number;
  avatar?: string;
}
