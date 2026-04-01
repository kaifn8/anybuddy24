import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MessageCircle, Search, Filter, Calendar, User, 
  Flag, Trash2, AlertTriangle, Ban, Eye, FileText, Image,
  ChevronRight, Shield, Clock, Hash, Send, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isAfter, subDays } from 'date-fns';
import { toast } from 'sonner';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { generateFakeUsers } from '@/data/adminData';
import {
  generateConversationsForUser,
  generateMessagesForConversation,
  generateAuditLogs,
  type AdminConversation,
  type AdminChatMessage,
  type AdminChatAuditLog,
} from '@/data/adminChatData';

type ConvFilter = 'all' | 'recent' | 'flagged' | 'reported' | 'with_plan';
type Tab = 'overview' | 'conversations' | 'moderation';

export default function AdminUserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  // Generate user
  const user = useMemo(() => {
    const users = generateFakeUsers(30);
    return users.find(u => u.id === userId) || users[0];
  }, [userId]);

  const [activeTab, setActiveTab] = useState<Tab>('conversations');
  const [conversations, setConversations] = useState(() =>
    generateConversationsForUser(user.id, user.firstName, 10)
  );
  const [convFilter, setConvFilter] = useState<ConvFilter>('all');
  const [convSearch, setConvSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [participantFilter, setParticipantFilter] = useState('');
  const [selectedConv, setSelectedConv] = useState<AdminConversation | null>(null);
  const [messages, setMessages] = useState<AdminChatMessage[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminChatAuditLog[]>([]);
  const [msgSearch, setMsgSearch] = useState('');
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter conversations
  const filteredConvs = useMemo(() => {
    let result = conversations;
    if (convFilter === 'recent') result = result.filter(c => isAfter(c.lastActiveAt, subDays(new Date(), 3)));
    if (convFilter === 'flagged') result = result.filter(c => c.isFlagged);
    if (convFilter === 'reported') result = result.filter(c => c.isReported);
    if (convFilter === 'with_plan') result = result.filter(c => !!c.linkedPlanId);
    if (convSearch) {
      const q = convSearch.toLowerCase();
      result = result.filter(c =>
        c.participants.some(p => p.name.toLowerCase().includes(q)) ||
        c.lastMessage.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    }
    if (participantFilter) {
      const q = participantFilter.toLowerCase();
      result = result.filter(c => c.participants.some(p => p.name.toLowerCase().includes(q) && p.id !== user.id));
    }
    if (dateFrom) {
      const from = new Date(dateFrom);
      result = result.filter(c => isAfter(c.lastActiveAt, from));
    }
    return result;
  }, [conversations, convFilter, convSearch, participantFilter, dateFrom, user.id]);

  // Filter messages
  const filteredMessages = useMemo(() => {
    if (!msgSearch) return messages;
    const q = msgSearch.toLowerCase();
    return messages.filter(m => m.message.toLowerCase().includes(q) || m.senderName.toLowerCase().includes(q));
  }, [messages, msgSearch]);

  const openConversation = useCallback((conv: AdminConversation) => {
    setSelectedConv(conv);
    setMessages(generateMessagesForConversation(conv, conv.messageCount));
    setAuditLogs(generateAuditLogs(conv.id));
    setMsgSearch('');
    // Log audit
    toast.info(`📋 Audit: Conversation ${conv.id} opened by Admin`);
  }, []);

  const deleteMessage = (msgId: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isDeletedByAdmin: true } : m));
    toast.success('Message deleted by admin');
  };

  const flagMessageAction = (msgId: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isFlagged: true } : m));
    toast('🚩 Message flagged');
  };

  const warnUser = (userName: string) => {
    toast.warning(`⚠️ Warning sent to ${userName}`);
  };

  const suspendUser = (userName: string) => {
    toast(`⏸️ ${userName} has been suspended`);
  };

  const banUser = (userName: string) => {
    toast.error(`🚫 ${userName} has been banned`);
  };

  const FILTER_CHIPS: { id: ConvFilter; label: string; count?: number }[] = [
    { id: 'all', label: 'All', count: conversations.length },
    { id: 'recent', label: 'Recent' },
    { id: 'flagged', label: 'Flagged', count: conversations.filter(c => c.isFlagged).length },
    { id: 'reported', label: 'Reported', count: conversations.filter(c => c.isReported).length },
    { id: 'with_plan', label: 'With Plan' },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-5xl">
      {/* Header */}
      <button onClick={() => navigate('/admin/users')} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-4 tap-scale">
        <ArrowLeft size={16} />
        <span className="text-xs font-medium">Back to Users</span>
      </button>

      {/* User summary card */}
      <div className="rounded-2xl border border-border/20 bg-background/60 backdrop-blur-sm p-4 mb-5">
        <div className="flex items-center gap-3">
          <GradientAvatar name={user.firstName} size={48} />
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold">{user.firstName}</h2>
            <p className="text-[10px] text-muted-foreground">{user.zone}, {user.city} · ID: {user.id.slice(0, 12)}…</p>
          </div>
          <div className="flex gap-1.5">
            <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full capitalize',
              user.trustLevel === 'anchor' ? 'bg-warning/15 text-warning' :
              user.trustLevel === 'trusted' ? 'bg-primary/15 text-primary' :
              'bg-muted text-muted-foreground'
            )}>{user.trustLevel}</span>
            {user.isBanned && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-destructive/15 text-destructive">Banned</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-border/15 overflow-x-auto scrollbar-hide">
        {(['overview', 'conversations', 'moderation'] as Tab[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn('px-3 py-2 text-xs font-semibold transition-colors capitalize whitespace-nowrap',
              activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
            )}>
            {tab === 'conversations' && <MessageCircle size={12} className="inline mr-1" />}
            {tab}
            {tab === 'conversations' && (
              <span className="ml-1 text-[9px] bg-foreground/5 px-1.5 py-0.5 rounded-full">{conversations.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              { label: 'Reliability', value: `${user.reliabilityScore}%`, color: 'text-primary' },
              { label: 'Attended', value: user.meetupsAttended, color: 'text-foreground' },
              { label: 'Hosted', value: user.meetupsHosted, color: 'text-foreground' },
              { label: 'No-shows', value: user.noShows, color: 'text-destructive' },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-border/20 bg-background/60 p-3 text-center">
                <p className={cn('text-lg font-bold', s.color)}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border/20 bg-background/60 p-4">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">USER INFO</h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Joined</span><span>{format(new Date(user.joinedAt), 'MMM d, yyyy')}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Verification</span><span className="capitalize">{user.verificationStatus}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Completed Joins</span><span>{user.completedJoins}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Conversations</span><span>{conversations.length}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Conversations tab */}
      {activeTab === 'conversations' && !selectedConv && (
        <div className="space-y-3">
          {/* Search & filter bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Search by keyword, user, or conv ID…" value={convSearch}
                onChange={e => setConvSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 rounded-lg border border-border/30 bg-background/60 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <Button variant="outline" size="sm" className="h-8 text-[10px] px-2.5" onClick={() => setShowFilters(!showFilters)}>
              <Filter size={12} className="mr-1" /> Filters
            </Button>
          </div>

          {/* Advanced filters */}
          {showFilters && (
            <div className="rounded-xl border border-border/20 bg-background/60 p-3 space-y-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[9px] font-semibold text-muted-foreground uppercase mb-1 block">Participant</label>
                  <input type="text" placeholder="Name…" value={participantFilter}
                    onChange={e => setParticipantFilter(e.target.value)}
                    className="w-full h-7 px-2 rounded-md border border-border/30 bg-background/60 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[9px] font-semibold text-muted-foreground uppercase mb-1 block">From Date</label>
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                    className="w-full h-7 px-2 rounded-md border border-border/30 bg-background/60 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Filter chips */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {FILTER_CHIPS.map(f => (
              <button key={f.id} onClick={() => setConvFilter(f.id)}
                className={cn('shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all',
                  convFilter === f.id ? 'bg-foreground text-background' : 'bg-foreground/[0.03] text-muted-foreground'
                )}>
                {f.label} {f.count !== undefined && <span className="opacity-60">({f.count})</span>}
              </button>
            ))}
          </div>

          {/* Conversation list */}
          <div className="space-y-1.5">
            {filteredConvs.map(conv => {
              const other = conv.participants.find(p => p.id !== user.id) || conv.participants[1];
              return (
                <button key={conv.id} onClick={() => openConversation(conv)}
                  className="w-full text-left rounded-xl border border-border/20 bg-background/60 hover:border-border/40 p-3 transition-all tap-scale"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <GradientAvatar name={other.name} size={36} showInitials={false} />
                      {conv.isFlagged && (
                        <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-warning flex items-center justify-center">
                          <Flag size={7} className="text-warning-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold truncate">{other.name}</p>
                        <span className="text-[9px] text-muted-foreground shrink-0">
                          {formatDistanceToNow(conv.lastActiveAt, { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] text-muted-foreground truncate">
                          {conv.lastMessageSender}: {conv.lastMessage}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {conv.hasMedia && <Image size={10} className="text-muted-foreground" />}
                          {conv.unreadCount > 0 && (
                            <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-[8px] font-bold text-primary-foreground">{conv.unreadCount}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[8px] text-muted-foreground/60 font-mono">{conv.id.slice(0, 16)}…</span>
                        {conv.linkedPlanTitle && (
                          <span className="text-[8px] bg-primary/8 text-primary px-1.5 py-0.5 rounded-full truncate max-w-[120px]">
                            📍 {conv.linkedPlanTitle}
                          </span>
                        )}
                        {conv.isReported && <span className="text-[8px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full">Reported</span>}
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>

          {filteredConvs.length === 0 && (
            <div className="text-center py-10">
              <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No conversations match your filters</p>
            </div>
          )}
        </div>
      )}

      {/* Conversation detail view */}
      {activeTab === 'conversations' && selectedConv && (
        <div className="space-y-3">
          {/* Back + conv header */}
          <div className="flex items-center justify-between">
            <button onClick={() => setSelectedConv(null)} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground tap-scale">
              <ArrowLeft size={14} />
              <span className="text-xs font-medium">Conversations</span>
            </button>
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" className="h-7 text-[10px] px-2" onClick={() => setShowAuditLog(!showAuditLog)}>
                <FileText size={10} className="mr-1" /> Audit Log
              </Button>
            </div>
          </div>

          {/* Conv info bar */}
          <div className="rounded-xl border border-border/20 bg-background/60 p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex -space-x-2">
                {selectedConv.participants.map(p => (
                  <GradientAvatar key={p.id} name={p.name} size={28} showInitials={false} className="border-2 border-background" />
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold">{selectedConv.participants.map(p => p.name).join(' & ')}</p>
                <p className="text-[9px] text-muted-foreground">{selectedConv.messageCount} messages · Last active {formatDistanceToNow(selectedConv.lastActiveAt, { addSuffix: true })}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedConv.linkedPlanTitle && (
                <span className="text-[9px] bg-primary/8 text-primary px-2 py-0.5 rounded-full">📍 {selectedConv.linkedPlanTitle}</span>
              )}
              {selectedConv.isFlagged && <span className="text-[9px] bg-warning/10 text-warning px-2 py-0.5 rounded-full">🚩 Flagged</span>}
              {selectedConv.isReported && <span className="text-[9px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">⚠️ Reported</span>}
              <span className="text-[9px] bg-muted px-2 py-0.5 rounded-full font-mono">{selectedConv.id.slice(0, 20)}</span>
            </div>
          </div>

          {/* Admin actions */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {selectedConv.participants.filter(p => p.id !== user.id).map(p => (
              <div key={p.id} className="flex gap-1">
                <Button variant="outline" size="sm" className="h-7 text-[9px] px-2" onClick={() => warnUser(p.name)}>
                  <AlertTriangle size={10} className="mr-0.5" /> Warn {p.name}
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-[9px] px-2" onClick={() => suspendUser(p.name)}>
                  <Clock size={10} className="mr-0.5" /> Suspend
                </Button>
                <Button variant="destructive" size="sm" className="h-7 text-[9px] px-2" onClick={() => banUser(p.name)}>
                  <Ban size={10} className="mr-0.5" /> Ban
                </Button>
              </div>
            ))}
          </div>

          {/* Message search */}
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search messages…" value={msgSearch}
              onChange={e => setMsgSearch(e.target.value)}
              className="w-full h-7 pl-8 pr-3 rounded-lg border border-border/30 bg-background/60 text-[11px] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>

          {/* Messages */}
          <div className="space-y-1 max-h-[60vh] overflow-y-auto rounded-xl border border-border/20 bg-background/40 p-3">
            {filteredMessages.map(msg => (
              <div key={msg.id} className={cn(
                'group rounded-lg p-2 transition-colors',
                msg.isDeletedByAdmin ? 'opacity-30 line-through bg-destructive/[0.03]' :
                msg.isFlagged ? 'bg-warning/[0.05] border border-warning/20' :
                msg.isSystem ? 'text-center' :
                'hover:bg-muted/30'
              )}>
                {msg.isSystem ? (
                  <p className="text-[10px] text-muted-foreground italic">{msg.message}</p>
                ) : (
                  <div className="flex gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn('text-[11px] font-semibold', msg.senderId === user.id ? 'text-primary' : 'text-foreground')}>
                          {msg.senderName}
                        </span>
                        <span className="text-[8px] text-muted-foreground">{format(msg.timestamp, 'MMM d, h:mm a')}</span>
                        {msg.isFlagged && <Flag size={8} className="text-warning" />}
                      </div>
                      <p className="text-[11px] text-foreground/80">{msg.message}</p>
                      {msg.mediaUrl && (
                        <div className="mt-1 inline-flex items-center gap-1 text-[9px] text-primary bg-primary/8 px-2 py-0.5 rounded-full">
                          <Image size={8} /> Media attached
                        </div>
                      )}
                    </div>
                    {!msg.isDeletedByAdmin && (
                      <div className="hidden group-hover:flex items-start gap-0.5 shrink-0">
                        <button onClick={() => flagMessageAction(msg.id)} className="p-1 rounded hover:bg-warning/10 tap-scale" title="Flag">
                          <Flag size={10} className="text-muted-foreground" />
                        </button>
                        <button onClick={() => deleteMessage(msg.id)} className="p-1 rounded hover:bg-destructive/10 tap-scale" title="Delete">
                          <Trash2 size={10} className="text-muted-foreground" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Audit log panel */}
          {showAuditLog && (
            <div className="rounded-xl border border-border/20 bg-background/60 p-3">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Audit Log</h4>
              <div className="space-y-1.5">
                {auditLogs.map(log => (
                  <div key={log.id} className="flex items-center justify-between text-[10px] py-1 border-b border-border/10 last:border-0">
                    <div className="flex items-center gap-2">
                      <Shield size={10} className="text-muted-foreground" />
                      <span className="font-medium">{log.adminName}</span>
                      <span className="text-muted-foreground capitalize">{log.action.replace('_', ' ')}</span>
                      {log.detail && <span className="text-muted-foreground/60">— {log.detail}</span>}
                    </div>
                    <span className="text-muted-foreground/60">{format(log.timestamp, 'MMM d, h:mm a')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Moderation tab */}
      {activeTab === 'moderation' && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-border/20 bg-background/60 p-3 text-center">
              <p className="text-lg font-bold text-warning">{conversations.filter(c => c.isFlagged).length}</p>
              <p className="text-[9px] text-muted-foreground">Flagged Chats</p>
            </div>
            <div className="rounded-xl border border-border/20 bg-background/60 p-3 text-center">
              <p className="text-lg font-bold text-destructive">{conversations.filter(c => c.isReported).length}</p>
              <p className="text-[9px] text-muted-foreground">Reported</p>
            </div>
            <div className="rounded-xl border border-border/20 bg-background/60 p-3 text-center">
              <p className="text-lg font-bold text-foreground">{conversations.length}</p>
              <p className="text-[9px] text-muted-foreground">Total Chats</p>
            </div>
          </div>

          <div className="rounded-xl border border-border/20 bg-background/60 p-3">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="h-9 text-[11px]" onClick={() => warnUser(user.firstName)}>
                <AlertTriangle size={12} className="mr-1" /> Warn User
              </Button>
              <Button variant="outline" size="sm" className="h-9 text-[11px]" onClick={() => suspendUser(user.firstName)}>
                <Clock size={12} className="mr-1" /> Suspend User
              </Button>
              <Button variant="destructive" size="sm" className="h-9 text-[11px] col-span-2" onClick={() => banUser(user.firstName)}>
                <Ban size={12} className="mr-1" /> Ban User
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
