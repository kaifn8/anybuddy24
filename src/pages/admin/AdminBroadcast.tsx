import { useMemo, useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Megaphone, Send, Users, Sparkles, ShieldCheck, Bell, Check, Eye, Ban, Calendar, Clock, Save, Trash2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Notification } from '@/types/anybuddy';
import { generateFakeUsers, type AdminUser } from '@/data/adminData';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { differenceInDays } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

type Audience = 'all' | 'verified' | 'trusted' | 'new';
type NotifType = Notification['type'];

const TEMPLATES: { id: string; title: string; message: string; type: NotifType; emoji: string }[] = [
  { id: 'new-feature', emoji: '✨', title: 'New feature drop!', message: "We've launched something new — check it out in your home feed.", type: 'nearby' },
  { id: 'safety', emoji: '🛡️', title: 'Safety reminder', message: 'Always meet in public places. Verify before you commit.', type: 'trust' },
  { id: 'weekend', emoji: '🎉', title: 'Weekend buddies waiting', message: 'Lots of plans live near you this weekend. Hop in!', type: 'nearby' },
  { id: 'maintenance', emoji: '⚙️', title: 'Scheduled maintenance', message: 'AnyBuddy will be unavailable briefly tonight. We appreciate your patience.', type: 'reminder' },
];

const AUDIENCE_OPTIONS: { id: Audience; label: string; description: string; icon: typeof Users }[] = [
  { id: 'all', label: 'All users', description: 'Everyone on the platform', icon: Users },
  { id: 'verified', label: 'Verified only', description: 'Users who passed selfie verification', icon: ShieldCheck },
  { id: 'trusted', label: 'Trusted & Anchor', description: 'High-trust members', icon: Sparkles },
  { id: 'new', label: 'New users', description: 'Joined in the last 7 days', icon: Bell },
];

// Stable seeded user pool for audience preview
const POOL_SIZE = 288;
const USER_POOL: AdminUser[] = generateFakeUsers(POOL_SIZE);

function matchesAudience(u: AdminUser, audience: Audience): boolean {
  switch (audience) {
    case 'all': return true;
    case 'verified': return u.verificationStatus === 'verified';
    case 'trusted': return u.trustLevel === 'trusted' || u.trustLevel === 'anchor';
    case 'new': return differenceInDays(new Date(), new Date(u.joinedAt)) <= 7;
  }
}

const DRAFT_KEY = 'admin_broadcast_draft_v1';

export default function AdminBroadcast() {
  const { addNotification } = useAppStore();
  const [audience, setAudience] = useState<Audience>('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotifType>('nearby');
  const [excludeBanned, setExcludeBanned] = useState(true);
  const [showAllRecipients, setShowAllRecipients] = useState(false);
  const [history, setHistory] = useState<{ id: string; title: string; audience: Audience; sentAt: Date; scheduledFor?: Date }[]>([]);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleAt, setScheduleAt] = useState<string>('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<Date | null>(null);

  // Hydrate draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.title) setTitle(d.title);
      if (d.message) setMessage(d.message);
      if (d.type) setType(d.type);
      if (d.audience) setAudience(d.audience);
      if (d.savedAt) setDraftSavedAt(new Date(d.savedAt));
    } catch {}
  }, []);

  // Autosave draft (debounced)
  useEffect(() => {
    if (!title && !message) return;
    const t = setTimeout(() => {
      const savedAt = new Date();
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, message, type, audience, savedAt: savedAt.toISOString() }));
      setDraftSavedAt(savedAt);
    }, 800);
    return () => clearTimeout(t);
  }, [title, message, type, audience]);

  // Compute matching recipient list
  const recipients = useMemo(() => {
    return USER_POOL.filter(u => matchesAudience(u, audience) && (!excludeBanned || !u.isBanned));
  }, [audience, excludeBanned]);

  // Counts per audience option (for sidebar pills)
  const audienceCounts = useMemo(() => {
    const counts: Record<Audience, number> = { all: 0, verified: 0, trusted: 0, new: 0 };
    USER_POOL.forEach(u => {
      if (excludeBanned && u.isBanned) return;
      (Object.keys(counts) as Audience[]).forEach(a => {
        if (matchesAudience(u, a)) counts[a] += 1;
      });
    });
    return counts;
  }, [excludeBanned]);

  // Breakdown (trust + verification + top zones)
  const breakdown = useMemo(() => {
    const trust = { seed: 0, solid: 0, trusted: 0, anchor: 0 };
    const verif = { unverified: 0, pending: 0, verified: 0, failed: 0 };
    const zones = new Map<string, number>();
    recipients.forEach(u => {
      trust[u.trustLevel] += 1;
      verif[u.verificationStatus] += 1;
      if (u.zone) zones.set(u.zone, (zones.get(u.zone) || 0) + 1);
    });
    const topZones = Array.from(zones.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
    return { trust, verif, topZones };
  }, [recipients]);

  const visibleRecipients = showAllRecipients ? recipients : recipients.slice(0, 12);

  const applyTemplate = (t: typeof TEMPLATES[number]) => {
    setTitle(t.title);
    setMessage(t.message);
    setType(t.type);
  };

  const send = () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required');
      return;
    }
    if (recipients.length === 0) {
      toast.error('No recipients match this audience');
      return;
    }
    setConfirmOpen(true);
  };

  const confirmSend = () => {
    const scheduled = scheduleEnabled && scheduleAt ? new Date(scheduleAt) : null;
    if (scheduled) {
      // Simulate scheduled send
      setHistory(h => [{ id: `bc_${Date.now()}`, title: title.trim(), audience, sentAt: new Date(), scheduledFor: scheduled }, ...h]);
      toast.success(`🗓️ Scheduled for ${scheduled.toLocaleString()} · ${recipients.length} recipients`);
    } else {
      addNotification({ type, title: title.trim(), message: message.trim() });
      setHistory(h => [{ id: `bc_${Date.now()}`, title: title.trim(), audience, sentAt: new Date() }, ...h]);
      toast.success(`📢 Broadcast sent to ${recipients.length} ${recipients.length === 1 ? 'user' : 'users'}`);
    }
    setConfirmOpen(false);
    setTitle('');
    setMessage('');
    setScheduleEnabled(false);
    setScheduleAt('');
    localStorage.removeItem(DRAFT_KEY);
    setDraftSavedAt(null);
  };

  const clearDraft = () => {
    setTitle(''); setMessage(''); setType('nearby');
    localStorage.removeItem(DRAFT_KEY);
    setDraftSavedAt(null);
    toast.success('Draft cleared');
  };

  const audienceOption = AUDIENCE_OPTIONS.find(a => a.id === audience)!;
  const totalActive = USER_POOL.filter(u => !u.isBanned).length;
  const reachPct = totalActive > 0 ? Math.round((recipients.length / totalActive) * 100) : 0;

  return (
    <div className="p-4 lg:p-6 max-w-4xl space-y-5">
      <div className="hidden lg:block">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Megaphone size={18} className="text-primary" /> Broadcast
        </h2>
        <p className="text-sm text-muted-foreground">Send announcements to user notification inboxes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-4">
        {/* Composer */}
        <div className="space-y-4">
          {/* Templates */}
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Quick templates</p>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => applyTemplate(t)}
                  className="text-left rounded-xl border border-border/20 bg-background/60 p-3 hover:border-primary/30 hover:bg-primary/[0.02] transition-all tap-scale"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-base">{t.emoji}</span>
                    <p className="text-[11px] font-semibold">{t.title}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-2">{t.message}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-border/30 bg-background/60 backdrop-blur-sm p-4 space-y-3">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. New feature drop!"
                maxLength={60}
                className="w-full h-10 px-3 rounded-xl border border-border/30 bg-background/80 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              <p className="text-[9px] text-muted-foreground mt-1 text-right">{title.length}/60</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                placeholder="What do you want to tell users?"
                maxLength={240}
                className="w-full p-3 rounded-xl border border-border/30 bg-background/80 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
              />
              <p className="text-[9px] text-muted-foreground mt-1 text-right">{message.length}/240</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Notification type</label>
              <div className="flex flex-wrap gap-1.5">
                {(['nearby', 'urgent', 'trust', 'reminder', 'credit'] as NotifType[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={cn('px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize transition-all',
                      type === t ? 'bg-primary text-primary-foreground' : 'bg-foreground/[0.04] text-muted-foreground'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={send}
            disabled={!title.trim() || !message.trim() || recipients.length === 0}
            size="lg"
            className="w-full h-11"
          >
            {scheduleEnabled && scheduleAt ? (
              <><Calendar size={14} className="mr-2" /> Schedule for {recipients.length.toLocaleString()} {recipients.length === 1 ? 'user' : 'users'}</>
            ) : (
              <><Send size={14} className="mr-2" /> Send to {recipients.length.toLocaleString()} {recipients.length === 1 ? 'user' : 'users'}</>
            )}
          </Button>

          {/* Schedule + draft controls */}
          <div className="rounded-2xl border border-border/30 bg-background/60 backdrop-blur-sm p-3 space-y-2.5">
            <button
              onClick={() => setScheduleEnabled(v => !v)}
              className="w-full flex items-center gap-2"
            >
              <div className={cn('w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0',
                scheduleEnabled ? 'bg-primary border-primary' : 'border-border'
              )}>
                {scheduleEnabled && <Check size={9} className="text-primary-foreground" />}
              </div>
              <Calendar size={11} className="text-primary" />
              <span className="text-[11px] font-semibold flex-1 text-left">Schedule for later</span>
            </button>
            {scheduleEnabled && (
              <input
                type="datetime-local"
                value={scheduleAt}
                onChange={e => setScheduleAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full h-9 px-3 rounded-xl border border-border/30 bg-background/80 text-[12px] focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            )}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/15">
              <span className="flex items-center gap-1">
                <Save size={10} />
                {draftSavedAt ? `Draft saved · ${draftSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Auto-saves as you type'}
              </span>
              {(title || message) && (
                <button onClick={clearDraft} className="flex items-center gap-1 text-destructive hover:underline">
                  <Trash2 size={10} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Recent activity</p>
              <div className="space-y-1.5">
                {history.map(h => (
                  <div key={h.id} className="rounded-xl border border-border/20 bg-background/40 p-3 flex items-center gap-2">
                    {h.scheduledFor ? <Clock size={12} className="text-warning shrink-0" /> : <Check size={12} className="text-success shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{h.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        to {h.audience} · {h.scheduledFor ? `scheduled ${h.scheduledFor.toLocaleString()}` : h.sentAt.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Audience + Preview */}
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Audience</p>
            <div className="space-y-1.5">
              {AUDIENCE_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setAudience(opt.id)}
                  className={cn('w-full text-left rounded-xl border p-3 transition-all tap-scale flex items-center gap-3',
                    audience === opt.id
                      ? 'border-primary/30 bg-primary/[0.04]'
                      : 'border-border/20 bg-background/60 hover:border-border/40'
                  )}
                >
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                    audience === opt.id ? 'bg-primary/15 text-primary' : 'bg-foreground/[0.04] text-muted-foreground')}>
                    <opt.icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold flex items-center gap-1.5">
                      {opt.label}
                      {audience === opt.id && <Check size={10} className="text-primary" />}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{opt.description}</p>
                  </div>
                  <span className={cn('text-[11px] font-bold tabular-nums shrink-0',
                    audience === opt.id ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {audienceCounts[opt.id].toLocaleString()}
                  </span>
                </button>
              ))}
            </div>

            {/* Exclusion toggle */}
            <button
              onClick={() => setExcludeBanned(v => !v)}
              className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-border/20 bg-background/40 hover:bg-background/60 transition-colors"
            >
              <div className={cn('w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0',
                excludeBanned ? 'bg-primary border-primary' : 'border-border'
              )}>
                {excludeBanned && <Check size={9} className="text-primary-foreground" />}
              </div>
              <Ban size={11} className="text-destructive" />
              <span className="text-[11px] font-medium flex-1 text-left">Exclude banned users</span>
            </button>
          </div>

          {/* ── Audience preview panel ── */}
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Eye size={11} /> Audience Preview
            </p>
            <div className="rounded-2xl border border-border/30 bg-background/60 backdrop-blur-sm overflow-hidden">
              {/* Headline */}
              <div className="p-3 border-b border-border/15 bg-gradient-to-br from-primary/[0.04] to-transparent">
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold tabular-nums text-primary leading-none">
                    {recipients.length.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    of {totalActive.toLocaleString()} active · <span className="font-semibold text-foreground">{reachPct}%</span> reach
                  </p>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Recipients matching <span className="font-semibold text-foreground">{audienceOption.label}</span>
                </p>
              </div>

              {/* Breakdowns */}
              {recipients.length > 0 && (
                <div className="p-3 border-b border-border/15 space-y-2.5">
                  {/* Trust */}
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-1">By trust level</p>
                    <div className="flex h-2 rounded-full overflow-hidden bg-muted/40">
                      {(['seed', 'solid', 'trusted', 'anchor'] as const).map(level => {
                        const v = breakdown.trust[level];
                        const pct = (v / recipients.length) * 100;
                        const colors = { seed: 'bg-muted-foreground/40', solid: 'bg-secondary', trusted: 'bg-primary', anchor: 'bg-warning' };
                        return pct > 0 ? <div key={level} className={colors[level]} style={{ width: `${pct}%` }} /> : null;
                      })}
                    </div>
                    <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 mt-1">
                      {(['seed', 'solid', 'trusted', 'anchor'] as const).map(level => (
                        <span key={level} className="text-[9px] text-muted-foreground capitalize tabular-nums">
                          <span className="font-semibold text-foreground">{breakdown.trust[level]}</span> {level}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Verification */}
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-1">By verification</p>
                    <div className="flex flex-wrap gap-1">
                      {(['verified', 'pending', 'unverified', 'failed'] as const).map(s => {
                        if (breakdown.verif[s] === 0) return null;
                        const colors = {
                          verified: 'bg-primary/10 text-primary',
                          pending: 'bg-warning/10 text-warning',
                          unverified: 'bg-muted text-muted-foreground',
                          failed: 'bg-destructive/10 text-destructive',
                        };
                        return (
                          <span key={s} className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded-full capitalize', colors[s])}>
                            {s} · {breakdown.verif[s]}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  {/* Top zones */}
                  {breakdown.topZones.length > 0 && (
                    <div>
                      <p className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-1">Top zones</p>
                      <div className="flex flex-wrap gap-1">
                        {breakdown.topZones.map(([zone, count]) => (
                          <span key={zone} className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-foreground/[0.04] text-muted-foreground">
                            📍 {zone} <span className="text-foreground/70 font-bold">{count}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recipient list */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-widest">Recipients</p>
                  <p className="text-[9px] text-muted-foreground tabular-nums">
                    Showing {Math.min(visibleRecipients.length, recipients.length)} / {recipients.length.toLocaleString()}
                  </p>
                </div>
                {recipients.length === 0 ? (
                  <div className="text-center py-6">
                    <span className="text-2xl block mb-1">🚫</span>
                    <p className="text-[11px] text-muted-foreground">No users match this audience</p>
                  </div>
                ) : (
                  <>
                    <div className={cn('space-y-1', !showAllRecipients ? '' : 'max-h-[280px] overflow-y-auto pr-1')}>
                      {visibleRecipients.map(u => (
                        <div key={u.id} className="flex items-center gap-2 py-1">
                          <GradientAvatar name={u.firstName} size={22} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold truncate flex items-center gap-1">
                              {u.firstName}
                              {u.verificationStatus === 'verified' && (
                                <ShieldCheck size={9} className="text-primary shrink-0" />
                              )}
                            </p>
                            <p className="text-[9px] text-muted-foreground truncate">
                              {u.zone} · <span className="capitalize">{u.trustLevel}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {recipients.length > 12 && (
                      <button
                        onClick={() => setShowAllRecipients(v => !v)}
                        className="mt-2 w-full text-center text-[10px] font-semibold text-primary hover:text-primary/80 py-1.5 rounded-lg hover:bg-primary/[0.04] transition-colors"
                      >
                        {showAllRecipients ? 'Show less' : `Show all ${recipients.length.toLocaleString()} recipients`}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Live preview */}
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Preview</p>
            <div className="rounded-2xl border border-border/30 bg-gradient-to-br from-background to-background/60 p-3 shadow-sm">
              <div className="flex items-start gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shrink-0">
                  <Bell size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{title || 'Notification title'}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-3">
                    {message || 'Your message preview will appear here as you type.'}
                  </p>
                  <p className="text-[9px] text-muted-foreground/60 mt-1.5">just now · AnyBuddy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}