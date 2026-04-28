import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Megaphone, Send, Users, Sparkles, ShieldCheck, Bell, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Notification } from '@/types/anybuddy';

type Audience = 'all' | 'verified' | 'trusted' | 'new';
type NotifType = Notification['type'];

const TEMPLATES: { id: string; title: string; message: string; type: NotifType; emoji: string }[] = [
  { id: 'new-feature', emoji: '✨', title: 'New feature drop!', message: "We've launched something new — check it out in your home feed.", type: 'nearby' },
  { id: 'safety', emoji: '🛡️', title: 'Safety reminder', message: 'Always meet in public places. Verify before you commit.', type: 'trust' },
  { id: 'weekend', emoji: '🎉', title: 'Weekend buddies waiting', message: 'Lots of plans live near you this weekend. Hop in!', type: 'nearby' },
  { id: 'maintenance', emoji: '⚙️', title: 'Scheduled maintenance', message: 'AnyBuddy will be unavailable briefly tonight. We appreciate your patience.', type: 'reminder' },
];

const AUDIENCE_OPTIONS: { id: Audience; label: string; description: string; icon: typeof Users; estimate: string }[] = [
  { id: 'all', label: 'All users', description: 'Everyone on the platform', icon: Users, estimate: '~288' },
  { id: 'verified', label: 'Verified only', description: 'Users who passed selfie verification', icon: ShieldCheck, estimate: '~142' },
  { id: 'trusted', label: 'Trusted & Anchor', description: 'High-trust members', icon: Sparkles, estimate: '~54' },
  { id: 'new', label: 'New users', description: 'Joined in the last 7 days', icon: Bell, estimate: '~31' },
];

export default function AdminBroadcast() {
  const { addNotification } = useAppStore();
  const [audience, setAudience] = useState<Audience>('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotifType>('nearby');
  const [history, setHistory] = useState<{ id: string; title: string; audience: Audience; sentAt: Date }[]>([]);

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
    addNotification({ type, title: title.trim(), message: message.trim() });
    setHistory(h => [{ id: `bc_${Date.now()}`, title: title.trim(), audience, sentAt: new Date() }, ...h]);
    toast.success(`📢 Broadcast sent to ${AUDIENCE_OPTIONS.find(a => a.id === audience)?.label}`);
    setTitle('');
    setMessage('');
  };

  const audienceOption = AUDIENCE_OPTIONS.find(a => a.id === audience)!;

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

          <Button onClick={send} disabled={!title.trim() || !message.trim()} size="lg" className="w-full h-11">
            <Send size={14} className="mr-2" /> Send to {audienceOption.label} ({audienceOption.estimate})
          </Button>

          {/* History */}
          {history.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Recently sent</p>
              <div className="space-y-1.5">
                {history.map(h => (
                  <div key={h.id} className="rounded-xl border border-border/20 bg-background/40 p-3 flex items-center gap-2">
                    <Check size={12} className="text-success shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{h.title}</p>
                      <p className="text-[10px] text-muted-foreground">to {h.audience} · {h.sentAt.toLocaleTimeString()}</p>
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
                  <span className="text-[10px] text-muted-foreground font-mono shrink-0">{opt.estimate}</span>
                </button>
              ))}
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