import type { TrustLevel, Category, VerificationStatus, Gender } from '@/types/anybuddy';

export interface AdminUser {
  id: string;
  firstName: string;
  avatar: string;
  city: string;
  gender?: Gender;
  zone?: string;
  trustLevel: TrustLevel;
  reliabilityScore: number;
  meetupsAttended: number;
  meetupsHosted: number;
  noShows: number;
  completedJoins: number;
  verificationStatus: VerificationStatus;
  joinedAt: Date;
  isFlagged: boolean;
  isBanned: boolean;
}

export interface AdminReport {
  id: string;
  reporterId: string;
  reporterName: string;
  targetId: string;
  targetName: string;
  targetType: 'user' | 'plan';
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  createdAt: Date;
}

export interface ModerationLog {
  id: string;
  action: string;
  target: string;
  reason: string;
  by: string;
  timestamp: Date;
}

const NAMES = ['Priya', 'Arjun', 'Maya', 'Rohan', 'Zara', 'Aditya', 'Neha', 'Vikram', 'Ananya', 'Kabir', 'Riya', 'Dev', 'Simran', 'Rahul', 'Tanya', 'Karan', 'Isha', 'Aman', 'Divya', 'Nikhil'];
const CITIES = ['Mumbai', 'Mumbai', 'Mumbai', 'Pune', 'Delhi'];
const ZONES = ['Bandra', 'Andheri', 'Colaba', 'Juhu', 'Powai', 'Worli', 'Versova', 'Malad', 'Dadar', 'Lower Parel'];
const TRUST_LEVELS: TrustLevel[] = ['seed', 'solid', 'trusted', 'anchor'];
const VERIFICATION_STATUSES: VerificationStatus[] = ['unverified', 'pending', 'verified', 'failed'];
const GENDERS: Gender[] = ['male', 'female', 'other'];

const REPORT_REASONS = [
  'Inappropriate behavior', 'No-show', 'Spam', 'Fake profile', 
  'Harassment', 'Misleading plan description', 'Unsafe location',
];

const MODERATION_ACTIONS = [
  'Auto-flagged for review', 'Content removed', 'Warning issued',
  'Account restricted', 'Plan removed', 'Report dismissed',
];

export function generateFakeUsers(count: number): AdminUser[] {
  return Array.from({ length: count }, (_, i) => {
    const name = NAMES[i % NAMES.length];
    const trust = TRUST_LEVELS[Math.floor(Math.random() * TRUST_LEVELS.length)];
    return {
      id: `user_${i}_${Math.random().toString(36).substr(2, 6)}`,
      firstName: name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}${i}`,
      city: CITIES[Math.floor(Math.random() * CITIES.length)],
      gender: GENDERS[Math.floor(Math.random() * GENDERS.length)],
      zone: ZONES[Math.floor(Math.random() * ZONES.length)],
      trustLevel: trust,
      reliabilityScore: Math.floor(Math.random() * 30) + 70,
      meetupsAttended: Math.floor(Math.random() * 25),
      meetupsHosted: Math.floor(Math.random() * 15),
      noShows: Math.floor(Math.random() * 4),
      completedJoins: Math.floor(Math.random() * 30),
      verificationStatus: VERIFICATION_STATUSES[Math.floor(Math.random() * VERIFICATION_STATUSES.length)],
      joinedAt: new Date(Date.now() - Math.random() * 90 * 24 * 3600000),
      isFlagged: Math.random() < 0.1,
      isBanned: Math.random() < 0.03,
    };
  });
}

export function generateFakeReports(count: number): AdminReport[] {
  return Array.from({ length: count }, (_, i) => {
    const reporter = NAMES[Math.floor(Math.random() * NAMES.length)];
    const target = NAMES[Math.floor(Math.random() * NAMES.length)];
    return {
      id: `report_${i}_${Math.random().toString(36).substr(2, 6)}`,
      reporterId: `user_${Math.floor(Math.random() * 20)}`,
      reporterName: reporter,
      targetId: `user_${Math.floor(Math.random() * 20)}`,
      targetName: target,
      targetType: Math.random() > 0.3 ? 'user' : 'plan',
      reason: REPORT_REASONS[Math.floor(Math.random() * REPORT_REASONS.length)],
      description: `${reporter} reported ${target} for ${REPORT_REASONS[Math.floor(Math.random() * REPORT_REASONS.length)].toLowerCase()}.`,
      status: (['pending', 'reviewed', 'dismissed'] as const)[Math.floor(Math.random() * 3)],
      createdAt: new Date(Date.now() - Math.random() * 14 * 24 * 3600000),
    };
  });
}

export function generateModerationLogs(count: number): ModerationLog[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `mod_${i}`,
    action: MODERATION_ACTIONS[Math.floor(Math.random() * MODERATION_ACTIONS.length)],
    target: NAMES[Math.floor(Math.random() * NAMES.length)],
    reason: REPORT_REASONS[Math.floor(Math.random() * REPORT_REASONS.length)],
    by: Math.random() > 0.4 ? 'AI System' : 'Admin',
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 3600000),
  }));
}

// Simulated analytics data
export const ANALYTICS_DATA = {
  dailyPlans: [
    { day: 'Mon', plans: 12, joins: 34 },
    { day: 'Tue', plans: 18, joins: 45 },
    { day: 'Wed', plans: 15, joins: 38 },
    { day: 'Thu', plans: 22, joins: 56 },
    { day: 'Fri', plans: 28, joins: 72 },
    { day: 'Sat', plans: 35, joins: 89 },
    { day: 'Sun', plans: 30, joins: 78 },
  ],
  peakHours: [
    { hour: '6am', activity: 5 }, { hour: '8am', activity: 15 },
    { hour: '10am', activity: 25 }, { hour: '12pm', activity: 40 },
    { hour: '2pm', activity: 30 }, { hour: '4pm', activity: 45 },
    { hour: '6pm', activity: 85 }, { hour: '8pm', activity: 70 },
    { hour: '10pm', activity: 35 },
  ],
  categoryBreakdown: [
    { category: 'Chai', value: 28, fill: 'hsl(var(--primary))' },
    { category: 'Food', value: 22, fill: 'hsl(var(--warning))' },
    { category: 'Sports', value: 18, fill: 'hsl(var(--success))' },
    { category: 'Explore', value: 12, fill: 'hsl(var(--secondary))' },
    { category: 'Work', value: 10, fill: 'hsl(var(--muted-foreground))' },
    { category: 'Walk', value: 10, fill: 'hsl(var(--accent-foreground))' },
  ],
  trustDistribution: [
    { level: 'Seed', count: 145 }, { level: 'Solid', count: 89 },
    { level: 'Trusted', count: 42 }, { level: 'Anchor', count: 12 },
  ],
};
