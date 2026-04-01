import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  XPAction, XP_REWARDS, getDailyQuests, QuestType, AchievementId, ACHIEVEMENTS,
  getLevelForXP, LeaderboardEntry,
} from '@/types/gamification';

export interface QuestProgress {
  questId: QuestType;
  progress: number;
  completed: boolean;
  claimedAt?: string; // ISO date
}

export interface UnlockedAchievement {
  id: AchievementId;
  unlockedAt: string; // ISO date
  seen: boolean;
}

interface StreakState {
  count: number;
  lastActiveDate: string | null; // ISO date string 'YYYY-MM-DD'
  freezeCount: number; // number of freeze tokens available
  freezeUsedDate: string | null;
}

interface GamificationState {
  xp: number;
  weeklyXp: number;
  weekStartDate: string | null;
  streak: StreakState;
  dailyQuestProgress: QuestProgress[];
  questRefreshDate: string | null; // date quests were last refreshed
  unlockedAchievements: UnlockedAchievement[];
  pendingAchievement: AchievementId | null; // for celebration animation
  xpPopups: { id: string; amount: number; label: string }[];

  // Actions
  addXP: (action: XPAction, label?: string) => void;
  recordActivity: () => void;
  checkStreakAchievements: (count: number) => void;
  progressQuest: (questId: QuestType, amount?: number) => void;
  claimQuestReward: (questId: QuestType) => { xp: number; credits: number } | null;
  dismissAchievement: () => void;
  clearXPPopup: (id: string) => void;
  refreshDailyQuests: () => void;
  useStreakFreeze: () => boolean;
  resetWeeklyXP: () => void;
}

const todayStr = () => new Date().toISOString().split('T')[0];
const weekStart = () => {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split('T')[0];
};

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      xp: 0,
      weeklyXp: 0,
      weekStartDate: null,
      streak: {
        count: 0,
        lastActiveDate: null,
        freezeCount: 1,
        freezeUsedDate: null,
      },
      dailyQuestProgress: [],
      questRefreshDate: null,
      unlockedAchievements: [],
      pendingAchievement: null,
      xpPopups: [],

      addXP: (action, label) => {
        const amount = XP_REWARDS[action];
        const { xp, weeklyXp, weekStartDate, unlockedAchievements, xpPopups } = get();
        const newXp = xp + amount;

        // Reset weekly XP on new week
        const currentWeek = weekStart();
        const newWeeklyXp = weekStartDate === currentWeek ? weeklyXp + amount : amount;

        // Check for achievement unlocks
        let newAchievement: AchievementId | null = null;
        const unlockedIds = new Set(unlockedAchievements.map(a => a.id));

        if (newXp >= 100 && !unlockedIds.has('social_100xp')) {
          newAchievement = 'social_100xp';
        }

        const popup = {
          id: `xp_${Date.now()}`,
          amount,
          label: label || action.replace(/_/g, ' '),
        };

        const newUnlocked = newAchievement
          ? [...unlockedAchievements, { id: newAchievement, unlockedAt: new Date().toISOString(), seen: false }]
          : unlockedAchievements;

        set({
          xp: newXp,
          weeklyXp: newWeeklyXp,
          weekStartDate: currentWeek,
          unlockedAchievements: newUnlocked,
          pendingAchievement: newAchievement || get().pendingAchievement,
          xpPopups: [...xpPopups, popup],
        });
      },

      recordActivity: () => {
        const { streak } = get();
        const today = todayStr();
        const last = streak.lastActiveDate;

        if (last === today) return; // Already active today

        let newCount = streak.count;
        if (!last) {
          newCount = 1;
        } else {
          const lastDate = new Date(last);
          const todayDate = new Date(today);
          const diff = Math.round((todayDate.getTime() - lastDate.getTime()) / 86400000);

          if (diff === 1) {
            newCount = streak.count + 1;
          } else if (diff === 2 && streak.freezeCount > 0 && streak.freezeUsedDate !== last) {
            // Streak freeze covers 1 missed day
            newCount = streak.count + 1;
            set({
              streak: {
                ...streak,
                count: newCount,
                lastActiveDate: today,
                freezeCount: streak.freezeCount - 1,
                freezeUsedDate: last,
              },
            });
            // Check streak achievements
            get().checkStreakAchievements(newCount);
            return;
          } else {
            newCount = 1; // Reset
          }
        }

        set({
          streak: { ...streak, count: newCount, lastActiveDate: today },
        });

        // XP for daily activity
        if (!last || last !== today) {
          get().addXP('react_to_plan', `Day ${newCount} streak`);
        }

        get().checkStreakAchievements(newCount);
      },

      checkStreakAchievements: (count: number) => {
        const { unlockedAchievements } = get();
        const unlockedIds = new Set(unlockedAchievements.map(a => a.id));
        let newAchievement: AchievementId | null = null;

        if (count >= 3 && !unlockedIds.has('streak_3')) newAchievement = 'streak_3';
        else if (count >= 7 && !unlockedIds.has('streak_7')) newAchievement = 'streak_7';
        else if (count >= 30 && !unlockedIds.has('streak_30')) newAchievement = 'streak_30';

        if (newAchievement) {
          const achievement = ACHIEVEMENTS.find(a => a.id === newAchievement);
          set({
            unlockedAchievements: [...unlockedAchievements, { id: newAchievement!, unlockedAt: new Date().toISOString(), seen: false }],
            pendingAchievement: newAchievement,
            xp: get().xp + (achievement?.xpBonus || 0),
          });
        }
      },

      progressQuest: (questId, amount = 1) => {
        const { dailyQuestProgress, questRefreshDate } = get();
        const today = todayStr();

        // Refresh quests if needed
        if (questRefreshDate !== today) {
          get().refreshDailyQuests();
        }

        const quests = getDailyQuests();
        const quest = quests.find(q => q.id === questId);
        if (!quest) return;

        const existing = dailyQuestProgress.find(p => p.questId === questId);
        if (existing?.completed) return;

        const currentProgress = existing?.progress || 0;
        const newProgress = Math.min(quest.target, currentProgress + amount);
        const completed = newProgress >= quest.target;

        const updated = existing
          ? dailyQuestProgress.map(p =>
              p.questId === questId ? { ...p, progress: newProgress, completed } : p
            )
          : [...dailyQuestProgress, { questId, progress: newProgress, completed }];

        set({ dailyQuestProgress: updated });
      },

      claimQuestReward: (questId) => {
        const { dailyQuestProgress } = get();
        const quests = getDailyQuests();
        const quest = quests.find(q => q.id === questId);
        const progress = dailyQuestProgress.find(p => p.questId === questId);

        if (!quest || !progress?.completed || progress.claimedAt) return null;

        const updated = dailyQuestProgress.map(p =>
          p.questId === questId ? { ...p, claimedAt: new Date().toISOString() } : p
        );

        set({ dailyQuestProgress: updated });
        get().addXP('daily_quest_complete', quest.title);

        return { xp: quest.xpReward, credits: quest.creditReward || 0 };
      },

      dismissAchievement: () => {
        const { unlockedAchievements, pendingAchievement } = get();
        if (!pendingAchievement) return;
        set({
          pendingAchievement: null,
          unlockedAchievements: unlockedAchievements.map(a =>
            a.id === pendingAchievement ? { ...a, seen: true } : a
          ),
        });
      },

      clearXPPopup: (id) => {
        set({ xpPopups: get().xpPopups.filter(p => p.id !== id) });
      },

      refreshDailyQuests: () => {
        const today = todayStr();
        const quests = getDailyQuests();
        // Keep existing progress for today's quests if they exist
        const { dailyQuestProgress, questRefreshDate } = get();
        if (questRefreshDate === today) return;

        // Clear old progress
        const freshProgress = quests.map(q => {
          const existing = dailyQuestProgress.find(p => p.questId === q.id);
          return existing && !existing.claimedAt
            ? existing
            : { questId: q.id, progress: 0, completed: false };
        });

        set({ questRefreshDate: today, dailyQuestProgress: freshProgress });
      },

      useStreakFreeze: () => {
        const { streak } = get();
        if (streak.freezeCount <= 0) return false;
        set({ streak: { ...streak, freezeCount: streak.freezeCount - 1 } });
        return true;
      },

      resetWeeklyXP: () => {
        set({ weeklyXp: 0, weekStartDate: weekStart() });
      },
    }),
    {
      name: 'anybuddy-gamification',
      partialize: (state) => ({
        xp: state.xp,
        weeklyXp: state.weeklyXp,
        weekStartDate: state.weekStartDate,
        streak: state.streak,
        dailyQuestProgress: state.dailyQuestProgress,
        questRefreshDate: state.questRefreshDate,
        unlockedAchievements: state.unlockedAchievements,
      }),
    }
  )
);
