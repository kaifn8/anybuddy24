// Simulated admin chat data for user conversation visibility

export interface AdminConversation {
  id: string;
  participants: { id: string; name: string; avatar: string }[];
  linkedPlanId?: string;
  linkedPlanTitle?: string;
  lastMessage: string;
  lastMessageSender: string;
  lastActiveAt: Date;
  messageCount: number;
  unreadCount: number;
  isFlagged: boolean;
  isReported: boolean;
  hasMedia: boolean;
}

export interface AdminChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  isSystem: boolean;
  isFlagged: boolean;
  isDeletedByAdmin: boolean;
  mediaUrl?: string;
  linkedPlanId?: string;
}

export interface AdminChatAuditLog {
  id: string;
  conversationId: string;
  adminName: string;
  action: 'viewed' | 'deleted_message' | 'warned_user' | 'suspended_user' | 'banned_user' | 'searched';
  detail?: string;
  timestamp: Date;
}

const NAMES = ['Priya', 'Arjun', 'Maya', 'Rohan', 'Zara', 'Aditya', 'Neha', 'Vikram', 'Ananya', 'Kabir', 'Riya', 'Dev', 'Simran', 'Rahul', 'Tanya', 'Karan'];

const PLAN_TITLES = [
  'Chai at Carter Road', 'Evening jog at Juhu', 'Study session at Asiatic Library',
  'Street food crawl in Colaba', 'Co-working at Blue Tokai', 'Badminton at Powai',
  'Morning walk at Marine Drive', 'Weekend trek to Karnala',
];

const MESSAGES = [
  'Hey, are you coming?', 'On my way! 🏃', 'Running 5 min late', 'Where should we meet exactly?',
  'This is going to be fun!', 'Can we change the time?', 'I brought an extra umbrella ☔',
  'See you at the entrance', 'Great meetup yesterday!', 'Let me know when you reach',
  'Should we invite more people?', 'The weather looks perfect!', 'I\'ll be there in 10',
  'Thanks for organizing!', 'Anyone want to grab chai after?', 'That was awesome, let\'s do it again!',
  'Sorry, something came up', 'Can\'t make it today 😔', 'Photos from yesterday!',
  'Check out this cool spot I found', 'The food was amazing 🍕', 'Next time let\'s try the other route',
];

const SYSTEM_MESSAGES = [
  'joined the plan', 'left the plan', 'Plan starts in 30 minutes',
  'Plan has been completed', 'New participant added',
];

const FLAG_REASONS = ['Spam content', 'Inappropriate language', 'Sharing personal info', 'Suspicious links'];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateConversationsForUser(userId: string, userName: string, count: number = 8): AdminConversation[] {
  return Array.from({ length: count }, (_, i) => {
    const otherName = NAMES.filter(n => n !== userName)[Math.floor(Math.random() * (NAMES.length - 1))];
    const hasPlan = Math.random() > 0.3;
    return {
      id: `conv_${userId}_${i}_${Math.random().toString(36).substr(2, 6)}`,
      participants: [
        { id: userId, name: userName, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}` },
        { id: `user_other_${i}`, name: otherName, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherName}${i}` },
      ],
      linkedPlanId: hasPlan ? `plan_${i}` : undefined,
      linkedPlanTitle: hasPlan ? randomItem(PLAN_TITLES) : undefined,
      lastMessage: randomItem(MESSAGES),
      lastMessageSender: Math.random() > 0.5 ? userName : otherName,
      lastActiveAt: new Date(Date.now() - Math.random() * 14 * 24 * 3600000),
      messageCount: Math.floor(Math.random() * 50) + 3,
      unreadCount: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0,
      isFlagged: Math.random() < 0.15,
      isReported: Math.random() < 0.08,
      hasMedia: Math.random() > 0.6,
    };
  }).sort((a, b) => b.lastActiveAt.getTime() - a.lastActiveAt.getTime());
}

export function generateMessagesForConversation(conv: AdminConversation, count: number = 20): AdminChatMessage[] {
  const [p1, p2] = conv.participants;
  const baseTime = Date.now() - count * 5 * 60000;

  return Array.from({ length: count }, (_, i) => {
    const isSystem = Math.random() < 0.1;
    const sender = isSystem ? { id: 'system', name: 'System' } : (Math.random() > 0.5 ? p1 : p2);
    return {
      id: `msg_${conv.id}_${i}`,
      conversationId: conv.id,
      senderId: sender.id,
      senderName: sender.name,
      message: isSystem ? `${randomItem([p1.name, p2.name])} ${randomItem(SYSTEM_MESSAGES)}` : randomItem(MESSAGES),
      timestamp: new Date(baseTime + i * (3 + Math.random() * 10) * 60000),
      isSystem,
      isFlagged: !isSystem && Math.random() < 0.05,
      isDeletedByAdmin: false,
      mediaUrl: !isSystem && Math.random() < 0.08 ? 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200' : undefined,
      linkedPlanId: conv.linkedPlanId,
    };
  });
}

export function generateAuditLogs(conversationId: string, count: number = 5): AdminChatAuditLog[] {
  const actions: AdminChatAuditLog['action'][] = ['viewed', 'deleted_message', 'warned_user', 'searched'];
  return Array.from({ length: count }, (_, i) => ({
    id: `audit_${conversationId}_${i}`,
    conversationId,
    adminName: Math.random() > 0.5 ? 'Admin' : 'SuperAdmin',
    action: randomItem(actions),
    detail: Math.random() > 0.5 ? randomItem(FLAG_REASONS) : undefined,
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 3600000),
  })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}
