export type TrustLevel = 'seed' | 'solid' | 'trusted' | 'anchor';
export type Urgency = 'now' | 'today' | 'week';
export type Category = 'chai' | 'explore' | 'shopping' | 'work' | 'help' | 'casual' | 'sports' | 'food' | 'walk';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'failed';
export type JoinMode = 'auto' | 'approval';
export type PlanVisibility = 'public' | 'request';
export type Gender = 'male' | 'female' | 'other';

export interface JoinRequest {
  userId: string;
  userName: string;
  userAvatar?: string;
  reliability?: number;
  note?: string;
  requestedAt: Date;
  status: 'pending' | 'accepted' | 'declined';
}

export interface User {
  id: string;
  firstName: string;
  phone: string;
  email?: string;
  bio?: string;
  gender?: Gender;
  ageRange: string;
  city: string;
  zone?: string;
  interests: Category[];
  trustLevel: TrustLevel;
  credits: number;
  completedJoins: number;
  createdAt: Date;
  avatar?: string;
  // Enhanced profile fields
  reliabilityScore: number; // 0-100
  joinRate: number; // 0-100
  hostRating: number; // 0-5
  meetupsHosted: number;
  meetupsAttended: number;
  noShows: number;
  cancellations: number;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  verificationSelfie?: string;
  badges: Badge[];
  savedPlans: string[];
  loginMethod?: 'phone' | 'email' | 'google' | 'apple';
  blockedUsers: string[];
  isAdmin?: boolean;
}

export type Badge = 'verified_host' | 'top_host' | 'trusted_member' | 'early_adopter' | 'streak_7';

export interface Request {
  id: string;
  userId: string;
  userName: string;
  userTrust: TrustLevel;
  userGender?: Gender;
  userAvatar?: string;
  userReliability?: number;
  userHostRating?: number;
  title: string;
  description?: string;
  category: Category;
  urgency: Urgency;
  when: Date;
  location: {
    name: string;
    distance: number;
    coords?: { lat: number; lng: number };
  };
  seatsTotal: number;
  seatsTaken: number;
  expiresAt: Date;
  createdAt: Date;
  timer?: number;
  liveShare: boolean;
  participants: Participant[];
  photo?: string;
  isRecurring?: boolean;
  recurringDay?: string;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  joinMode: JoinMode;
  visibility: PlanVisibility;
  pendingJoinRequests: JoinRequest[];
}

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  note?: string;
  joinedAt: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
}

export interface Notification {
  id: string;
  type: 'nearby' | 'urgent' | 'join' | 'message' | 'credit' | 'trust' | 'reminder' | 'completion';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  requestId?: string;
}

export interface CreditTransaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  reason: string;
  timestamp: Date;
}

export interface MeetupReview {
  id: string;
  requestId: string;
  reviewerId: string;
  rating: number; // 1-5
  didHappen: 'yes' | 'no' | 'didnt_attend';
  comment?: string;
  timestamp: Date;
}

export interface MapPin {
  id: string;
  requestId: string;
  category: Category;
  title: string;
  coords: { lat: number; lng: number };
  seatsLeft: number;
  urgency: Urgency;
  distance: number;
}
