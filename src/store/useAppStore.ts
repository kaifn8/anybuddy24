import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Request, Notification, CreditTransaction, Category, TrustLevel, Urgency, Participant, ChatMessage, MeetupReview, Badge, VerificationStatus, Gender } from '@/types/anybuddy';

const FAKE_NAMES = ['Priya', 'Arjun', 'Maya', 'Rohan', 'Zara', 'Aditya', 'Neha', 'Vikram', 'Ananya', 'Kabir', 'Riya', 'Dev', 'Simran', 'Rahul'];

const FAKE_REQUEST_TITLES = [
  'Anyone for chai at Carter Road?',
  'Need help moving a couch 🛋️',
  'Looking for a co-working buddy in Bandra',
  'Exploring Kala Ghoda art district',
  'Quick grocery run - need company!',
  'Study session at Asiatic Library?',
  'Morning walk at Marine Drive',
  'Anyone know good cafes in Versova?',
  'Trying a new restaurant in Colaba tonight',
  'Weekend trek to Karnala Fort',
  'Need a gym buddy in Andheri 💪',
  'Coffee and brainstorming at Prithvi Cafe',
  'Badminton at 6 PM in Powai?',
  'Street food crawl in Mohammad Ali Road',
  'Evening jog at Juhu Beach',
];

const LOCATIONS = [
  { name: 'Bandra West', distance: 0.5, coords: { lat: 19.0596, lng: 72.8295 } },
  { name: 'Andheri West', distance: 1.8, coords: { lat: 19.1197, lng: 72.8464 } },
  { name: 'Colaba', distance: 3.5, coords: { lat: 18.9067, lng: 72.8147 } },
  { name: 'Juhu', distance: 2.1, coords: { lat: 19.0883, lng: 72.8265 } },
  { name: 'Powai', distance: 4.2, coords: { lat: 19.1176, lng: 72.9060 } },
  { name: 'Lower Parel', distance: 1.5, coords: { lat: 18.9930, lng: 72.8302 } },
  { name: 'Versova', distance: 2.8, coords: { lat: 19.1320, lng: 72.8145 } },
  { name: 'Worli', distance: 1.2, coords: { lat: 19.0176, lng: 72.8150 } },
  { name: 'Dadar', distance: 2.0, coords: { lat: 19.0178, lng: 72.8478 } },
  { name: 'Malad West', distance: 3.5, coords: { lat: 19.1860, lng: 72.8385 } },
];

const CATEGORIES: Category[] = ['chai', 'explore', 'shopping', 'work', 'help', 'casual', 'sports', 'food', 'walk'];
const URGENCIES: Urgency[] = ['now', 'today', 'week'];
const TRUST_LEVELS: TrustLevel[] = ['seed', 'solid', 'trusted', 'anchor'];

const BIOS = [
  'Cutting chai addict ☕ Love meeting new people',
  'Weekend explorer - Konkan coast is home 🧭',
  'Fitness enthusiast & street food lover',
  'Just moved to Mumbai, looking for buddies!',
  'Book nerd who also loves monsoon treks',
  'Tech geek by day, cricket player by evening',
];

interface VerificationRequest {
  userId: string;
  userName: string;
  selfieUrl: string;
  submittedAt: Date;
  status: VerificationStatus;
}

export interface UserReport {
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

export interface FlaggedMessage {
  id: string;
  requestId: string;
  requestTitle: string;
  senderId: string;
  senderName: string;
  message: string;
  flagReason: string;
  flaggedAt: Date;
  status: 'pending' | 'removed' | 'cleared';
}

export interface PricingConfig {
  base: number;
  now: number;
  today: number;
  week: number;
  joinEarn: number;
  signupBonus: number;
  referral: number;
}

const DEFAULT_PRICING_CONFIG: PricingConfig = {
  base: 1, now: 0.5, today: 0.25, week: 0, joinEarn: 0.5, signupBonus: 3, referral: 1,
};

const DEFAULT_TRUST_DISCOUNTS: Record<TrustLevel, number> = {
  seed: 0, solid: 10, trusted: 20, anchor: 35,
};

interface AppState {
  user: User | null;
  isOnboarded: boolean;
  requests: Request[];
  myRequests: Request[];
  joinedRequests: string[];
  chatMessages: Record<string, ChatMessage[]>;
  notifications: Notification[];
  creditHistory: CreditTransaction[];
  reviews: MeetupReview[];
  pendingVerifications: VerificationRequest[];
  reports: UserReport[];
  flaggedMessages: FlaggedMessage[];
  
  // Actions
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  setOnboarded: (value: boolean) => void;
  updateCredits: (amount: number, reason: string) => void;
  updateTrust: (level: TrustLevel) => void;
  createRequest: (request: Omit<Request, 'id' | 'createdAt' | 'participants'>) => void;
  joinRequest: (requestId: string, note?: string) => void;
  leaveRequest: (requestId: string) => void;
  sendMessage: (requestId: string, message: string) => void;
  refreshFeed: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  savePlan: (requestId: string) => void;
  unsavePlan: (requestId: string) => void;
  submitReview: (review: Omit<MeetupReview, 'id' | 'timestamp'>) => void;
  completeMeetup: (requestId: string) => void;
  submitVerificationSelfie: (selfieUrl: string) => void;
  approveVerification: (userId: string) => void;
  rejectVerification: (userId: string) => void;
  submitReport: (report: { targetId: string; targetName: string; targetType: 'user' | 'plan'; reason: string; description: string }) => void;
  updateReportStatus: (reportId: string, status: 'reviewed' | 'dismissed') => void;
  flagMessage: (requestId: string, messageId: string, reason: string) => void;
  updateFlaggedMessage: (messageId: string, status: 'removed' | 'cleared') => void;
  removePlan: (requestId: string) => void;
  // Host actions
  removeParticipant: (requestId: string, participantId: string) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  requestToJoin: (requestId: string, note?: string) => void;
  approveJoinRequest: (requestId: string, userId: string) => void;
  declineJoinRequest: (requestId: string, userId: string) => void;
  endPlanEarly: (requestId: string) => void;
  // Seat reservation
  reserveSeat: (requestId: string) => void;
  releaseReservation: (requestId: string) => void;
  // Admin actions
  adminWarnings: Record<string, string[]>;
  pricingConfig: PricingConfig;
  trustDiscounts: Record<TrustLevel, number>;
  sendAdminWarning: (userId: string, userName: string, message: string) => void;
  updatePricingConfig: (config: PricingConfig) => void;
  updateTrustDiscounts: (discounts: Record<TrustLevel, number>) => void;
  reset: () => void;
}

const GENDERS: Gender[] = ['male', 'female', 'other'];

const generateFakeRequest = (): Request => {
  const name = FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)];
  const urgency = URGENCIES[Math.floor(Math.random() * URGENCIES.length)];
  const now = new Date();
  
  let when = new Date();
  let expiresAt = new Date();
  
  if (urgency === 'now') {
    when = now;
    expiresAt = new Date(now.getTime() + (Math.random() * 30 + 10) * 60000);
  } else if (urgency === 'today') {
    when = new Date(now.getTime() + Math.random() * 8 * 3600000);
    expiresAt = new Date(when.getTime() + 2 * 3600000);
  } else {
    when = new Date(now.getTime() + (Math.random() * 6 + 1) * 24 * 3600000);
    expiresAt = new Date(when.getTime() + 24 * 3600000);
  }
  
  const seatsTotal = Math.floor(Math.random() * 5) + 1;
  const seatsTaken = Math.floor(Math.random() * seatsTotal);
  const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  const reliability = Math.floor(Math.random() * 30) + 70;
  
  return {
    id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: `user_${Math.random().toString(36).substr(2, 9)}`,
    userName: name,
    userTrust: TRUST_LEVELS[Math.floor(Math.random() * TRUST_LEVELS.length)],
    userGender: GENDERS[Math.floor(Math.random() * GENDERS.length)],
    userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    userReliability: reliability,
    userHostRating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
    title: FAKE_REQUEST_TITLES[Math.floor(Math.random() * FAKE_REQUEST_TITLES.length)],
    category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
    urgency,
    when,
    location,
    seatsTotal,
    seatsTaken,
    expiresAt,
    createdAt: new Date(now.getTime() - Math.random() * 3600000),
    liveShare: Math.random() > 0.5,
    participants: [],
    status: 'active',
    joinMode: Math.random() > 0.6 ? 'approval' : 'auto',
    visibility: 'public',
    pendingJoinRequests: [],
  };
};

const generateInitialRequests = (count: number): Request[] => {
  return Array.from({ length: count }, generateFakeRequest);
};

const createDefaultUser = (overrides: Partial<User>): User => ({
  id: '', firstName: '', phone: '', ageRange: '', city: 'Mumbai',
  interests: [], trustLevel: 'seed', credits: 3, completedJoins: 0,
  createdAt: new Date(), reliabilityScore: 100, joinRate: 100,
  hostRating: 0, meetupsHosted: 0, meetupsAttended: 0, noShows: 0,
  cancellations: 0, isVerified: false, verificationStatus: 'unverified',
  badges: [], savedPlans: [], blockedUsers: [],
  ...overrides,
});

const initialState = {
  user: null as User | null,
  isOnboarded: false,
  requests: generateInitialRequests(10),
  myRequests: [] as Request[],
  joinedRequests: [] as string[],
  chatMessages: {} as Record<string, ChatMessage[]>,
  notifications: [] as Notification[],
  creditHistory: [] as CreditTransaction[],
  reviews: [] as MeetupReview[],
  pendingVerifications: [] as VerificationRequest[],
  reports: [] as UserReport[],
  flaggedMessages: [] as FlaggedMessage[],
  adminWarnings: {} as Record<string, string[]>,
  pricingConfig: DEFAULT_PRICING_CONFIG,
  trustDiscounts: DEFAULT_TRUST_DISCOUNTS,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setUser: (user) => set({ user }),
      
      updateUser: (updates) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, ...updates } });
      },
      
      setOnboarded: (value) => set({ isOnboarded: value }),
      
      updateCredits: (amount, reason) => {
        const { user, creditHistory } = get();
        if (!user) return;
        const txn: CreditTransaction = {
          id: `txn_${Date.now()}`, type: amount > 0 ? 'earn' : 'spend',
          amount: Math.abs(amount), reason, timestamp: new Date(),
        };
        set({
          user: { ...user, credits: Math.max(0, user.credits + amount) },
          creditHistory: [txn, ...creditHistory],
        });
      },
      
      updateTrust: (level) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, trustLevel: level } });
      },
      
      createRequest: (requestData) => {
        const { user, myRequests, requests } = get();
        if (!user) return;
        const newRequest: Request = {
          ...requestData, id: `req_${Date.now()}`, createdAt: new Date(),
          participants: [], userId: user.id, userName: user.firstName,
          userTrust: user.trustLevel, userGender: user.gender, userAvatar: user.avatar,
          userReliability: user.reliabilityScore, userHostRating: user.hostRating,
        };
        set({
          myRequests: [newRequest, ...myRequests],
          requests: [newRequest, ...requests],
          user: { ...user, meetupsHosted: user.meetupsHosted + 1 },
        });
      },
      
      joinRequest: (requestId, note) => {
        const { user, requests, joinedRequests, chatMessages } = get();
        if (!user) return;
        const participant: Participant = {
          id: user.id, name: user.firstName, avatar: user.avatar, note, joinedAt: new Date(),
        };
        const updatedRequests = requests.map(r => 
          r.id === requestId 
            ? { ...r, seatsTaken: r.seatsTaken + 1, participants: [...r.participants, participant] }
            : r
        );
        const welcomeMessage: ChatMessage = {
          id: `msg_${Date.now()}`, senderId: 'system', senderName: 'AnyBuddy',
          message: `${user.firstName} joined! Say hi 👋`, timestamp: new Date(),
        };
        set({
          requests: updatedRequests,
          joinedRequests: [...joinedRequests, requestId],
          chatMessages: { ...chatMessages, [requestId]: [...(chatMessages[requestId] || []), welcomeMessage] },
        });
      },
      
      leaveRequest: (requestId) => {
        const { user, requests, joinedRequests } = get();
        if (!user) return;
        const updatedRequests = requests.map(r => 
          r.id === requestId 
            ? { ...r, seatsTaken: Math.max(0, r.seatsTaken - 1), participants: r.participants.filter(p => p.id !== user.id) }
            : r
        );
        set({
          requests: updatedRequests,
          joinedRequests: joinedRequests.filter(id => id !== requestId),
          user: { ...user, cancellations: user.cancellations + 1 },
        });
      },
      
      sendMessage: (requestId, message) => {
        const { user, chatMessages } = get();
        if (!user) return;
        const newMessage: ChatMessage = {
          id: `msg_${Date.now()}`, senderId: user.id, senderName: user.firstName,
          message, timestamp: new Date(),
        };
        set({ chatMessages: { ...chatMessages, [requestId]: [...(chatMessages[requestId] || []), newMessage] } });
        
        setTimeout(() => {
          const { chatMessages: current, requests } = get();
          const request = requests.find(r => r.id === requestId);
          if (!request) return;
          const responses = ["On my way! 🏃", "Sounds great!", "Can't wait!", "See you there 😊", "Perfect timing!", "Almost there!"];
          const fake: ChatMessage = {
            id: `msg_${Date.now()}_fake`, senderId: request.userId, senderName: request.userName,
            message: responses[Math.floor(Math.random() * responses.length)], timestamp: new Date(),
          };
          set({ chatMessages: { ...current, [requestId]: [...(current[requestId] || []), fake] } });
        }, 2000 + Math.random() * 3000);
      },
      
      refreshFeed: () => {
        const { requests, addNotification } = get();
        const now = new Date();
        let filtered = requests.filter(r => new Date(r.expiresAt) > now && r.status === 'active');
        const newReq = Math.random() > 0.4 ? generateFakeRequest() : null;
        if (newReq) {
          filtered = [newReq, ...filtered];
          // Simulate push notifications
          const roll = Math.random();
          if (roll < 0.35) {
            addNotification({
              type: 'nearby',
              title: `New plan nearby`,
              message: `${newReq.userName}: "${newReq.title}" · ${newReq.location.distance}km away`,
              requestId: newReq.id,
            });
          } else if (roll < 0.55) {
            const joinNames = FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)];
            const randomReq = filtered[Math.floor(Math.random() * filtered.length)];
            if (randomReq) {
              addNotification({
                type: 'join',
                title: `${joinNames} joined a plan`,
                message: `"${randomReq.title}" now has ${randomReq.seatsTaken + 1} people`,
                requestId: randomReq.id,
              });
            }
          } else if (roll < 0.7) {
            const msgName = FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)];
            const msgs = ['Are you coming?', 'Almost there! 🏃', 'See you in 5 min', 'Where should we meet exactly?', 'Running a bit late!'];
            addNotification({
              type: 'message',
              title: `New message from ${msgName}`,
              message: msgs[Math.floor(Math.random() * msgs.length)],
            });
          } else if (roll < 0.8) {
            const urgentReq = filtered.find(r => r.urgency === 'now');
            if (urgentReq) {
              addNotification({
                type: 'urgent',
                title: '⚡ Plan starting soon!',
                message: `"${urgentReq.title}" starts any minute, ${urgentReq.seatsTotal - urgentReq.seatsTaken} spots left`,
                requestId: urgentReq.id,
              });
            }
          }
        }
        set({ requests: filtered.slice(0, 15) });
      },
      
      addNotification: (notification) => {
        const { notifications } = get();
        set({ notifications: [{ ...notification, id: `notif_${Date.now()}`, timestamp: new Date(), read: false }, ...notifications] });
      },
      
      markNotificationRead: (id) => {
        const { notifications } = get();
        set({ notifications: notifications.map(n => n.id === id ? { ...n, read: true } : n) });
      },
      
      savePlan: (requestId) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, savedPlans: [...user.savedPlans, requestId] } });
      },
      
      unsavePlan: (requestId) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, savedPlans: user.savedPlans.filter(id => id !== requestId) } });
      },
      
      submitReview: (review) => {
        const { reviews, user } = get();
        const newReview: MeetupReview = { ...review, id: `rev_${Date.now()}`, timestamp: new Date() };
        set({ reviews: [newReview, ...reviews] });
        if (user && review.didHappen === 'yes') {
          set({
            user: {
              ...user,
              meetupsAttended: user.meetupsAttended + 1,
              completedJoins: user.completedJoins + 1,
              reliabilityScore: Math.min(100, user.reliabilityScore + 1),
            },
          });
        }
      },
      
      completeMeetup: (requestId) => {
        const { requests } = get();
        set({ requests: requests.map(r => r.id === requestId ? { ...r, status: 'completed' as const } : r) });
      },
      
      submitVerificationSelfie: (selfieUrl: string) => {
        const { user, pendingVerifications } = get();
        if (!user) return;
        const req: VerificationRequest = {
          userId: user.id, userName: user.firstName, selfieUrl,
          submittedAt: new Date(), status: 'pending',
        };
        set({
          user: { ...user, verificationStatus: 'pending', verificationSelfie: selfieUrl },
          pendingVerifications: [req, ...pendingVerifications],
        });
      },
      
      approveVerification: (userId: string) => {
        const { user, pendingVerifications } = get();
        set({
          pendingVerifications: pendingVerifications.map(v =>
            v.userId === userId ? { ...v, status: 'verified' as const } : v
          ),
          ...(user && user.id === userId ? {
            user: { ...user, verificationStatus: 'verified' as const, isVerified: true },
          } : {}),
        });
      },
      
      rejectVerification: (userId: string) => {
        const { user, pendingVerifications } = get();
        set({
          pendingVerifications: pendingVerifications.map(v =>
            v.userId === userId ? { ...v, status: 'failed' as const } : v
          ),
          ...(user && user.id === userId ? {
            user: { ...user, verificationStatus: 'failed' as const, isVerified: false, verificationSelfie: undefined },
          } : {}),
        });
      },
      
      submitReport: (report) => {
        const { user, reports } = get();
        if (!user) return;
        const newReport: UserReport = {
          id: `report_${Date.now()}`,
          reporterId: user.id,
          reporterName: user.firstName,
          ...report,
          status: 'pending',
          createdAt: new Date(),
        };
        set({ reports: [newReport, ...reports] });
      },

      updateReportStatus: (reportId, status) => {
        const { reports } = get();
        set({ reports: reports.map(r => r.id === reportId ? { ...r, status } : r) });
      },

      flagMessage: (requestId, messageId, reason) => {
        const { chatMessages, flaggedMessages, requests } = get();
        const msgs = chatMessages[requestId] || [];
        const msg = msgs.find(m => m.id === messageId);
        const req = requests.find(r => r.id === requestId);
        if (!msg) return;
        const flagged: FlaggedMessage = {
          id: `flag_${Date.now()}`,
          requestId,
          requestTitle: req?.title || 'Unknown plan',
          senderId: msg.senderId,
          senderName: msg.senderName,
          message: msg.message,
          flagReason: reason,
          flaggedAt: new Date(),
          status: 'pending',
        };
        set({ flaggedMessages: [flagged, ...flaggedMessages] });
      },

      updateFlaggedMessage: (messageId, status) => {
        const { flaggedMessages } = get();
        set({ flaggedMessages: flaggedMessages.map(m => m.id === messageId ? { ...m, status } : m) });
      },

      removePlan: (requestId) => {
        const { requests } = get();
        set({ requests: requests.map(r => r.id === requestId ? { ...r, status: 'cancelled' as const } : r) });
      },

      removeParticipant: (requestId, participantId) => {
        const { requests, joinedRequests, addNotification } = get();
        const req = requests.find(r => r.id === requestId);
        if (!req) return;
        // Prevent removal within 5 minutes of start
        const minutesToStart = (new Date(req.when).getTime() - Date.now()) / 60000;
        if (minutesToStart <= 5 && minutesToStart >= 0) return;
        const participant = req.participants.find(p => p.id === participantId);
        set({
          requests: requests.map(r => r.id === requestId ? {
            ...r,
            seatsTaken: Math.max(0, r.seatsTaken - 1),
            participants: r.participants.filter(p => p.id !== participantId),
          } : r),
          joinedRequests: joinedRequests.filter(id => id !== requestId),
        });
        if (participant) {
          addNotification({
            type: 'message',
            title: 'Removed from plan',
            message: `You were removed from "${req.title}" by the host.`,
            requestId,
          });
        }
      },

      blockUser: (userId) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, blockedUsers: [...(user.blockedUsers || []), userId] } });
      },

      unblockUser: (userId) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, blockedUsers: (user.blockedUsers || []).filter(id => id !== userId) } });
      },

      requestToJoin: (requestId, note) => {
        const { user, requests } = get();
        if (!user) return;
        const joinReq = {
          userId: user.id, userName: user.firstName, userAvatar: user.avatar,
          reliability: user.reliabilityScore, note, requestedAt: new Date(), status: 'pending' as const,
        };
        set({
          requests: requests.map(r => r.id === requestId ? {
            ...r, pendingJoinRequests: [...(r.pendingJoinRequests || []), joinReq],
          } : r),
        });
      },

      approveJoinRequest: (requestId, userId) => {
        const { requests, joinedRequests, chatMessages } = get();
        const req = requests.find(r => r.id === requestId);
        if (!req) return;
        const joinReq = (req.pendingJoinRequests || []).find(j => j.userId === userId);
        if (!joinReq) return;
        const participant = { id: joinReq.userId, name: joinReq.userName, avatar: joinReq.userAvatar, note: joinReq.note, joinedAt: new Date() };
        const welcomeMsg = { id: `msg_${Date.now()}`, senderId: 'system', senderName: 'AnyBuddy', message: `${joinReq.userName} joined! Say hi 👋`, timestamp: new Date() };
        set({
          requests: requests.map(r => r.id === requestId ? {
            ...r,
            seatsTaken: r.seatsTaken + 1,
            participants: [...r.participants, participant],
            pendingJoinRequests: (r.pendingJoinRequests || []).map(j => j.userId === userId ? { ...j, status: 'accepted' as const } : j),
          } : r),
          joinedRequests: [...joinedRequests, requestId],
          chatMessages: { ...chatMessages, [requestId]: [...(chatMessages[requestId] || []), welcomeMsg] },
        });
      },

      declineJoinRequest: (requestId, userId) => {
        const { requests } = get();
        set({
          requests: requests.map(r => r.id === requestId ? {
            ...r,
            pendingJoinRequests: (r.pendingJoinRequests || []).map(j => j.userId === userId ? { ...j, status: 'declined' as const } : j),
          } : r),
        });
      },

      endPlanEarly: (requestId) => {
        const { requests, addNotification } = get();
        const req = requests.find(r => r.id === requestId);
        set({ requests: requests.map(r => r.id === requestId ? { ...r, status: 'cancelled' as const } : r) });
        if (req) {
          addNotification({
            type: 'message',
            title: 'Plan ended early',
            message: `"${req.title}" was ended early by the host.`,
            requestId,
          });
        }
      },

      reserveSeat: (requestId) => {
        const { requests } = get();
        set({
          requests: requests.map(r => r.id === requestId
            ? { ...r, seatsTaken: r.seatsTaken + 1 }
            : r
          ),
        });
      },

      releaseReservation: (requestId) => {
        const { requests } = get();
        set({
          requests: requests.map(r => r.id === requestId
            ? { ...r, seatsTaken: Math.max(0, r.seatsTaken - 1) }
            : r
          ),
        });
      },

      sendAdminWarning: (userId, userName, message) => {
        const { adminWarnings, addNotification } = get();
        const existing = adminWarnings[userId] || [];
        set({ adminWarnings: { ...adminWarnings, [userId]: [...existing, message] } });
        addNotification({
          type: 'message',
          title: `⚠️ Warning sent to ${userName}`,
          message,
        });
      },

      updatePricingConfig: (config) => set({ pricingConfig: config }),

      updateTrustDiscounts: (discounts) => set({ trustDiscounts: discounts }),
      
      reset: () => set({ ...initialState, requests: generateInitialRequests(10) }),
    }),
    {
      name: 'anybuddy-storage',
      partialize: (state) => ({
        user: state.user ? { ...state.user, verificationSelfie: undefined } : state.user,
        isOnboarded: state.isOnboarded,
        creditHistory: state.creditHistory, joinedRequests: state.joinedRequests,
        reviews: state.reviews,
        reports: state.reports, flaggedMessages: state.flaggedMessages,
        adminWarnings: state.adminWarnings, pricingConfig: state.pricingConfig,
        trustDiscounts: state.trustDiscounts,
      }),
    }
  )
);

export { createDefaultUser };
