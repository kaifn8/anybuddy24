import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MoreVertical, UserX, Ban, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { LocationMapPreview, formatWalkTime } from '@/components/LocationMap';
import { useAppStore } from '@/store/useAppStore';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import { AppIcon } from '@/components/icons/AppIcon';
import { UrgencyBadge } from '@/components/ui/UrgencyBadge';
import { TrustBadge } from '@/components/ui/TrustBadge';
import { ShareSheet } from '@/components/ShareSheet';
import { ReportDialog } from '@/components/ReportDialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const QUICK_ACTIONS = [
  { label: '🏃 On my way', message: "I'm on my way! 🏃" },
  { label: '📍 I\'m here', message: "I'm here! 📍" },
  { label: '⏰ Running late', message: "Running a bit late, be there soon! ⏰" },
];

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    requests, joinedRequests, chatMessages, sendMessage, leaveRequest, user, refreshFeed,
    removeParticipant, blockUser, approveJoinRequest, declineJoinRequest, endPlanEarly,
  } = useAppStore();

  const [message, setMessage] = useState('');
  const [showShare, setShowShare] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ id: string; name: string; type: 'user' | 'plan' } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const pullStartY = useRef<number | null>(null);

  const request = requests.find(r => r.id === id);
  const isJoined = joinedRequests.includes(id || '');
  const isHost = request?.userId === user?.id;
  const isMember = isJoined || isHost;
  const msgs = chatMessages[id || ''] || [];
  const pendingRequests = (request?.pendingJoinRequests || []).filter(j => j.status === 'pending');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  // Simulated typing indicator
  useEffect(() => {
    if (!isMember || !request) return;
    const participants = request.participants || [];
    if (participants.length === 0) return;
    
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const randomP = participants[Math.floor(Math.random() * participants.length)];
        setTypingUser(randomP.name);
        setTimeout(() => setTypingUser(null), 2000 + Math.random() * 1500);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [isMember, request]);

  // Pull-to-refresh handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const container = chatContainerRef.current;
    if (container && container.scrollTop <= 0) {
      pullStartY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (pullStartY.current === null) return;
    const delta = e.touches[0].clientY - pullStartY.current;
    if (delta > 0 && delta < 120) {
      setPullDistance(delta);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance > 60) {
      setIsRefreshing(true);
      setPullDistance(0);
      // Simulate refresh
      setTimeout(() => {
        refreshFeed();
        setIsRefreshing(false);
      }, 1200);
    } else {
      setPullDistance(0);
    }
    pullStartY.current = null;
  }, [pullDistance, refreshFeed]);

  if (!request) {
    return (
      <div className="mobile-container min-h-screen bg-ambient flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Request not found</p>
      </div>
    );
  }

  const handleSend = () => { if (!message.trim() || !id) return; sendMessage(id, message.trim()); setMessage(''); };
  const handleLeave = () => { if (!id) return; leaveRequest(id); navigate('/home'); };
  const handleLeaveClick = () => setShowLeaveWarning(true);
  const minutesToStart = (new Date(request.when).getTime() - Date.now()) / 60000;
  const canRemove = minutesToStart > 5 || minutesToStart < 0;
  const handleRemoveParticipant = (participantId: string, name: string) => {
    if (!canRemove) { toast.error("Can't remove within 5 min of start"); return; }
    removeParticipant(request.id, participantId);
    toast(`${name} removed`);
  };
  const handleBlock = (userId: string, name: string) => { blockUser(userId); toast(`${name} blocked`); };
  const handleEndEarly = () => { endPlanEarly(request.id); toast('Plan ended'); navigate('/home'); };
  const handleApprove = (userId: string) => { approveJoinRequest(request.id, userId); toast('✅ Approved'); };
  const handleDecline = (userId: string) => { declineJoinRequest(request.id, userId); toast('Declined'); };
  const handleQuickAction = (msg: string) => { if (!id) return; sendMessage(id, msg); toast('Status sent ✓'); };

  const seatsLeft = request.seatsTotal - request.seatsTaken;
  const timeLeft = formatDistanceToNow(new Date(request.expiresAt), { addSuffix: false });
  const minsToStart = Math.max(0, Math.round((new Date(request.when).getTime() - Date.now()) / 60000));
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${request.location.coords.lat},${request.location.coords.lng}`;

  // ─── JOINED / HOST: Chat-first layout ───
  if (isMember) {
    return (
      <div className="mobile-container min-h-screen bg-ambient flex flex-col">
        {/* Custom top bar with info button */}
        <header className="sticky top-0 z-40 liquid-glass-nav">
          <div className="flex items-center gap-3 px-4 h-12 max-w-md mx-auto">
            <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl tap-scale text-sm hover:bg-muted transition-colors">←</button>
              <div className="flex-1 min-w-0 flex items-center gap-2">
              <CategoryIcon category={request.category} size="sm" className="shrink-0" />
              <div className="min-w-0">
                <h1 className="text-[13px] font-semibold truncate">{request.title}</h1>
                <p className="text-[10px] text-muted-foreground">
                  {request.seatsTaken} people · {request.location.name}
                </p>
              </div>
            </div>
            <button onClick={() => setShowInfo(true)}
              className="w-8 h-8 rounded-xl flex items-center justify-center tap-scale hover:bg-muted transition-colors">
              <AppIcon name="fc:info" size={18} />
            </button>
          </div>
        </header>

        {/* Quick status strip */}
        <div className="px-3 py-2 flex gap-1.5 border-b border-border/8">
          {QUICK_ACTIONS.map((action) => (
            <button key={action.label} onClick={() => handleQuickAction(action.message)}
              className="flex-1 py-1.5 rounded-full bg-muted/40 text-[11px] font-medium tap-scale hover:bg-muted/60 transition-colors text-center">
              {action.label}
            </button>
          ))}
        </div>

        {/* Attendance prompt — shown when plan start time has passed */}
        {new Date(request.when).getTime() < Date.now() && request.status !== 'completed' && (
          <button
            onClick={() => navigate(`/attendance/${request.id}`)}
            className="mx-3 mt-2 flex items-center gap-2.5 px-3.5 py-2.5 rounded-[0.875rem] tap-scale text-left"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(var(--secondary) / 0.08))',
              border: '0.5px solid hsl(var(--primary) / 0.25)',
            }}>
            <span className="text-lg shrink-0">✅</span>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-foreground tracking-tight">How did it go?</p>
              <p className="text-[11px] text-muted-foreground/70">Rate attendance · earn XP</p>
            </div>
            <span className="text-[11px] font-bold text-primary shrink-0">Rate →</span>
          </button>
        )}

        {/* Pull-to-refresh indicator */}
        {(pullDistance > 0 || isRefreshing) && (
          <div className="flex justify-center py-2 transition-all" style={{ height: isRefreshing ? 40 : Math.min(pullDistance * 0.6, 40) }}>
            <div className={cn(
              'flex items-center gap-2 text-[11px] text-muted-foreground font-medium',
              isRefreshing && 'animate-pulse'
            )}>
              <div className={cn(
                'w-4 h-4 border-2 border-primary/40 border-t-primary rounded-full',
                isRefreshing && 'animate-spin'
              )} />
              {isRefreshing ? 'Refreshing...' : pullDistance > 60 ? 'Release to refresh' : 'Pull to refresh'}
            </div>
          </div>
        )}

        {/* Chat messages — fills remaining space */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 py-3 space-y-1"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {msgs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <span className="text-4xl mb-3">💬</span>
              <p className="text-sm font-medium text-muted-foreground mb-1">You're in!</p>
              <p className="text-xs text-muted-foreground/60">Say hi or use a quick action above</p>
            </div>
          )}

          {msgs.map((msg, i) => {
            const isMe = msg.senderId === user?.id;
            const isSystem = msg.senderId === 'system';
            const showName = !isMe && !isSystem && (i === 0 || msgs[i - 1]?.senderId !== msg.senderId);
            const isLastInGroup = i === msgs.length - 1 || msgs[i + 1]?.senderId !== msg.senderId;
            const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center py-2">
                  <span className="text-[10px] text-muted-foreground/50 italic">{msg.message}</span>
                </div>
              );
            }

            return (
              <div key={msg.id} className={cn(
                'flex items-end gap-2',
                isMe ? 'flex-row-reverse' : 'flex-row',
                isLastInGroup ? 'mb-2' : 'mb-0.5'
              )}>
                <div className="w-7 shrink-0">
                  {showName && !isMe ? (
                    <GradientAvatar name={msg.senderName} size={28} showInitials={false} />
                  ) : null}
                </div>
                <div className={cn('max-w-[72%]', isMe ? 'items-end' : 'items-start')}>
                  {showName && (
                    <p className="text-[10px] font-medium text-muted-foreground ml-1 mb-1">{msg.senderName}</p>
                  )}
                  <div className={cn(
                    'px-3.5 py-2.5 text-[13px] leading-[1.45]',
                    isMe
                      ? 'bg-primary text-primary-foreground rounded-[18px] rounded-br-[6px]'
                      : 'bg-muted/50 text-foreground rounded-[18px] rounded-bl-[6px]'
                  )}>
                    {msg.message}
                  </div>
                  {isLastInGroup && (
                    <p className={cn('text-[9px] text-muted-foreground/40 px-1 mt-0.5', isMe ? 'text-right' : 'text-left')}>
                      {time}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {typingUser && (
            <div className="flex items-end gap-2 mb-2 animate-fade-in">
              <div className="w-7 shrink-0">
                <GradientAvatar name={typingUser} size={28} showInitials={false} />
              </div>
              <div>
                <p className="text-[10px] font-medium text-muted-foreground ml-1 mb-1">{typingUser}</p>
                <div className="px-4 py-3 bg-muted/50 rounded-[18px] rounded-bl-[6px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message input — fixed at bottom */}
        <div className="px-3 py-3 liquid-glass-nav border-t border-border/10">
          <div className="max-w-md mx-auto">
            {/* Emoji quick reactions */}
            <div className="flex items-center gap-1.5 mb-2.5 overflow-x-auto scrollbar-hide">
              {['👍', '❤️', '😂', '🔥', '👏', '🙌', '💯', '✨'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => { if (id) sendMessage(id, emoji); }}
                  className="w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center shrink-0 tap-scale hover:bg-muted/60 transition-colors text-sm"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Input row */}
            <div className="flex gap-2 items-end">
              {/* Text input */}
              <div className="flex-1">
                <textarea
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={1}
                  className="w-full rounded-2xl bg-muted/40 min-h-[44px] max-h-[120px] px-4 py-3 text-[14px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-muted/50 transition-all placeholder:text-muted-foreground/40 leading-[1.4]"
                  style={{ height: message.split('\n').length > 1 ? 'auto' : '44px' }}
                />
              </div>

              {/* Send button */}
              <div className="shrink-0 pb-1">
                <Button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  size="icon"
                  className="w-10 h-10 rounded-full"
                >
                  <span className="text-base font-bold leading-none">↑</span>
                </Button>
              </div>
            </div>

            {/* Character count for long messages */}
            {message.length > 100 && (
              <p className={cn(
                'text-[10px] text-right mt-1 transition-colors',
                message.length > 450 ? 'text-destructive' : 'text-muted-foreground/50'
              )}>
                {message.length}/500
              </p>
            )}
          </div>
        </div>

        {/* ── Info panel (slide-up overlay) ── */}
        {showInfo && (
          <div className="fixed inset-0 z-50 flex flex-col">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowInfo(false)} />
            
            {/* Panel */}
            <div className="relative mt-auto max-h-[85vh] bg-background rounded-t-3xl overflow-hidden animate-slide-in-bottom flex flex-col">
              {/* Handle + header */}
              <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-xl pt-3 pb-2 px-5 border-b border-border/10">
                <div className="w-8 h-1 rounded-full bg-muted-foreground/20 mx-auto mb-3" />
                <div className="flex items-center justify-between">
                  <h2 className="text-[15px] font-bold">Plan Details</h2>
                  <button onClick={() => setShowInfo(false)} className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center tap-scale">
                    <AppIcon name="fc:cancel" size={16} />
                  </button>
                </div>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                
                {/* Hero */}
                <div className="flex items-start gap-3">
                 <CategoryIcon category={request.category} size="lg" className="shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base leading-tight mb-1">{request.title}</h3>
                    <UrgencyBadge urgency={request.urgency} />
                  </div>
                </div>

                {/* Info rows */}
                <div className="space-y-3">
                  {[
                    { icon: <AppIcon name="fc:globe" size={18} />, title: request.location.name, sub: `${request.location.distance} km away` },
                    { icon: <AppIcon name="fc:clock" size={18} />, title: minsToStart <= 0 ? 'Happening now' : minsToStart < 60 ? `In ${minsToStart} min` : `${timeLeft} left`, sub: new Date(request.when).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
                    { icon: <AppIcon name="fc:conference-call" size={18} />, title: `${request.seatsTaken} of ${request.seatsTotal} going`, sub: seatsLeft === 0 ? 'Full' : `${seatsLeft} spot${seatsLeft > 1 ? 's' : ''} left` },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">{row.icon}</div>
                      <div>
                        <p className="text-sm font-semibold">{row.title}</p>
                        <p className="text-[11px] text-muted-foreground">{row.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Map + directions */}
                {request.location.coords && (
                  <LocationMapPreview
                    coords={request.location.coords}
                    locationName={request.location.name}
                    distance={request.location.distance}
                  />
                )}

                {/* Info rows - update distance to show walk time */}
                <div className="space-y-3">
                  {[
                    { icon: <AppIcon name="fc:globe" size={18} />, title: request.location.name, sub: `${request.location.distance} km · ${formatWalkTime(request.location.distance)}` },
                    { icon: <AppIcon name="fc:clock" size={18} />, title: minsToStart <= 0 ? 'Happening now' : minsToStart < 60 ? `In ${minsToStart} min` : `${timeLeft} left`, sub: new Date(request.when).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
                    { icon: <AppIcon name="fc:conference-call" size={18} />, title: `${request.seatsTaken} of ${request.seatsTotal} going`, sub: seatsLeft === 0 ? 'Full' : `${seatsLeft} spot${seatsLeft > 1 ? 's' : ''} left` },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">{row.icon}</div>
                      <div>
                        <p className="text-sm font-semibold">{row.title}</p>
                        <p className="text-[11px] text-muted-foreground">{row.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Host */}
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">Host</p>
                  <div className="flex items-center gap-3">
                    <GradientAvatar name={request.userName} size={36} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold flex items-center gap-1">
                        {request.userName}
                        {(request.userTrust === 'trusted' || request.userTrust === 'anchor') && <AppIcon name="fc:vip" size={14} />}
                      </p>
                      <div className="flex items-center gap-2">
                        <TrustBadge level={request.userTrust} size="sm" />
                        {request.userReliability && <span className="text-[10px] text-muted-foreground">⭐ {request.userReliability}%</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Participants */}
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">People going ({request.participants.length + 1})</p>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <GradientAvatar name={request.userName} size={28} showInitials={false} />
                      <span className="text-xs font-medium flex-1">{request.userName}</span>
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold">Host</span>
                    </div>
                    {request.participants.map((p) => (
                      <div key={p.id} className="flex items-center gap-2.5">
                        <GradientAvatar name={p.name} size={28} showInitials={false} />
                        <span className="text-xs font-medium flex-1">{p.name}</span>
                        {isHost && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1 rounded-md hover:bg-muted/50 tap-scale"><MoreVertical size={14} className="text-muted-foreground" /></button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem onClick={() => handleRemoveParticipant(p.id, p.name)} className={cn("text-xs", !canRemove && "opacity-50")}>
                                <UserX size={14} className="mr-2" /> Remove {!canRemove && '(locked)'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setReportTarget({ id: p.id, name: p.name, type: 'user' }); setShowReport(true); }} className="text-xs">
                                <AppIcon name="fc:feedback" size={14} className="mr-2" /> Report
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleBlock(p.id, p.name)} className="text-xs text-destructive">
                                <Ban size={14} className="mr-2" /> Block
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        {!isHost && p.id !== user?.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1 rounded-md hover:bg-muted/50 tap-scale"><MoreVertical size={14} className="text-muted-foreground" /></button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                              <DropdownMenuItem onClick={() => { setReportTarget({ id: p.id, name: p.name, type: 'user' }); setShowReport(true); }} className="text-xs">
                                <AppIcon name="fc:feedback" size={14} className="mr-2" /> Report
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleBlock(p.id, p.name)} className="text-xs text-destructive">
                                <Ban size={14} className="mr-2" /> Block
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pending join requests (host) */}
                {isHost && pendingRequests.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-warning uppercase">✋ Join Requests ({pendingRequests.length})</p>
                    {pendingRequests.map((jr) => (
                      <div key={jr.userId} className="flex items-center gap-2 py-1.5">
                        <GradientAvatar name={jr.userName} size={28} showInitials={false} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{jr.userName}</p>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            {jr.reliability && <span>⭐ {jr.reliability}%</span>}
                            {jr.note && <span>"{jr.note}"</span>}
                          </div>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <Button size="sm" className="h-7 px-2.5 text-[11px]" onClick={() => handleApprove(jr.userId)}>Accept</Button>
                          <Button size="sm" variant="secondary" className="h-7 px-2.5 text-[11px]" onClick={() => handleDecline(jr.userId)}>Decline</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2 border-t border-border/10">
                  <button onClick={() => setShowShare(true)} className="flex items-center gap-1.5 text-[12px] text-primary font-semibold tap-scale">
                    <AppIcon name="fc:share" size={16} /> Share
                  </button>
                  {isHost ? (
                    <button onClick={handleEndEarly} className="flex items-center gap-1.5 text-[12px] text-destructive/70 font-semibold tap-scale ml-auto">
                      <XCircle size={12} /> End plan
                    </button>
                  ) : (
                    <button onClick={handleLeaveClick} className="flex items-center gap-1.5 text-[12px] text-destructive/70 font-semibold tap-scale ml-auto">
                      Leave plan
                    </button>
                  )}
                </div>

                {/* Rate meetup CTA for completed or expired plans */}
                {(request.status === 'completed' || new Date(request.when).getTime() < Date.now()) && (
                  <Button
                    onClick={() => { setShowInfo(false); navigate(`/attendance/${request.id}`); }}
                    className="w-full h-11 gap-2"
                  >
                    ✅ Rate this meetup
                  </Button>
                )}

                <div className="h-4" />
              </div>
            </div>
          </div>
        )}

        <ShareSheet open={showShare} onClose={() => setShowShare(false)} title={request.title} request={request} />
        <ReportDialog open={showReport} onClose={() => { setShowReport(false); setReportTarget(null); }}
          targetId={(reportTarget || { id: request.id }).id}
          targetName={(reportTarget || { name: request.title }).name}
          targetType={(reportTarget || { type: 'plan' as const }).type} />

        <AlertDialog open={showLeaveWarning} onOpenChange={setShowLeaveWarning}>
          <AlertDialogContent className="max-w-[320px] rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base">Leave this plan?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                Your spot will be released and others can join. You won't be able to see the group chat anymore.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Stay</AlertDialogCancel>
              <AlertDialogAction onClick={handleLeave} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Leave plan
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // ─── NOT JOINED: Event details view ───
  return (
    <div className="mobile-container min-h-screen bg-ambient flex flex-col">
      <header className="sticky top-0 z-40 liquid-glass-nav">
        <div className="flex items-center gap-3 px-4 h-12 max-w-md mx-auto">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl tap-scale text-sm hover:bg-muted transition-colors">←</button>
          <h1 className="text-[13px] font-semibold truncate flex-1">{request.title}</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pt-3 space-y-3 pb-6">
        {/* Hero card */}
        <div className="liquid-glass-heavy p-4 rounded-3xl">
          {minsToStart <= 30 && (
            <div className={cn(
              'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold mb-3',
              minsToStart <= 5 ? 'text-warning bg-warning/10 border border-warning/20' : 'text-primary bg-primary/10 border border-primary/20'
            )}>
              {minsToStart <= 5 ? '⚡ Happening now' : `⏰ Starts in ${minsToStart} min`}
            </div>
          )}
          <div className="flex items-start gap-3 mb-4">
            <CategoryIcon category={request.category} size="lg" className="shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-bold text-base leading-tight">{request.title}</h2>
                <UrgencyBadge urgency={request.urgency} />
              </div>
            </div>
          </div>
          <div className="space-y-2.5">
            {[
              { icon: <AppIcon name="fc:globe" size={18} />, title: request.location.name, sub: `${request.location.distance} km · ${formatWalkTime(request.location.distance)}` },
              { icon: <AppIcon name="fc:clock" size={18} />, title: minsToStart <= 0 ? 'Happening now' : minsToStart < 60 ? `In ${minsToStart} min` : `${timeLeft} left`, sub: new Date(request.when).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
              { icon: <AppIcon name="fc:conference-call" size={18} />, title: `${request.seatsTaken} of ${request.seatsTotal} going`, sub: seatsLeft === 0 ? 'Full' : `${seatsLeft} spot${seatsLeft > 1 ? 's' : ''} left` },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">{row.icon}</div>
                <div>
                  <p className="text-sm font-semibold">{row.title}</p>
                  <p className="text-2xs text-muted-foreground">{row.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map preview (blurred for non-members) */}
        {request.location.coords && (
          <LocationMapPreview
            coords={request.location.coords}
            locationName={request.location.name}
            distance={request.location.distance}
            showOpenInMaps={false}
          />
        )}

        {/* Host */}
        <div className="liquid-glass p-3.5 rounded-2xl">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">Host</p>
          <div className="flex items-center gap-3">
            <GradientAvatar name={request.userName} size={36} />
            <div className="flex-1">
              <p className="text-sm font-semibold flex items-center gap-1">
                {request.userName}
                {(request.userTrust === 'trusted' || request.userTrust === 'anchor') && <AppIcon name="fc:vip" size={14} />}
              </p>
              <div className="flex items-center gap-2">
                <TrustBadge level={request.userTrust} size="sm" />
                {request.userReliability && <span className="text-[10px] text-muted-foreground">⭐ {request.userReliability}%</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Locked chat preview */}
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <span className="text-3xl block mb-3">🔒</span>
            <p className="text-sm text-muted-foreground mb-1">Join to unlock chat & location</p>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-3 py-2">
          <button onClick={() => setShowShare(true)} className="flex items-center gap-1.5 text-[12px] text-primary font-semibold tap-scale">
            <AppIcon name="fc:share" size={16} /> Share
          </button>
          <button onClick={() => { setReportTarget({ id: request.id, name: request.title, type: 'plan' }); setShowReport(true); }}
            className="flex items-center gap-1.5 text-[12px] text-destructive/70 font-semibold tap-scale ml-auto">
            <AppIcon name="fc:feedback" size={16} /> Report
          </button>
        </div>

        {/* Join CTA */}
        <Button className="w-full h-12 tap-scale" onClick={() => navigate(`/join/${request.id}`)} disabled={seatsLeft === 0}>
          {seatsLeft === 0 ? 'Plan is full' : request.joinMode === 'approval' ? 'Request to Join' : 'Join Plan'}
        </Button>
      </div>

      <ShareSheet open={showShare} onClose={() => setShowShare(false)} title={request.title} request={request} />
      <ReportDialog open={showReport} onClose={() => { setShowReport(false); setReportTarget(null); }}
        targetId={(reportTarget || { id: request.id }).id}
        targetName={(reportTarget || { name: request.title }).name}
        targetType={(reportTarget || { type: 'plan' as const }).type} />
    </div>
  );
}