import { useState, useMemo } from 'react';
import { useAppStore, type UserReport, type FlaggedMessage } from '@/store/useAppStore';
import { generateModerationLogs, type ModerationLog } from '@/data/adminData';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertTriangle, Shield, Bot, User, MessageSquare, Trash2, Eye, Ban } from 'lucide-react';
import { AppIcon } from '@/components/icons/AppIcon';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const WORD_FILTERS = [
  { word: 'scam', severity: 'high', autoAction: 'block' },
  { word: 'send money', severity: 'high', autoAction: 'block' },
  { word: 'meet alone', severity: 'medium', autoAction: 'flag' },
  { word: 'personal number', severity: 'medium', autoAction: 'flag' },
  { word: 'cash only', severity: 'medium', autoAction: 'flag' },
];

// Generate some fake flagged messages for demo
function generateFakeFlaggedMessages(): FlaggedMessage[] {
  const names = ['Rohan', 'Zara', 'Kabir', 'Neha'];
  const messages = [
    { msg: 'Hey send me your personal number', reason: 'Personal info sharing' },
    { msg: 'Can you send money for booking?', reason: 'Scam pattern detected' },
    { msg: 'Let\'s meet alone somewhere private', reason: 'Safety concern' },
    { msg: 'This is trash, worst meetup ever', reason: 'Toxic language' },
  ];
  return messages.map((m, i) => ({
    id: `flag_demo_${i}`,
    requestId: `req_demo_${i}`,
    requestTitle: ['Chai at Bandra', 'Sports in Powai', 'Food crawl', 'Evening walk'][i],
    senderId: `user_${i}`,
    senderName: names[i],
    message: m.msg,
    flagReason: m.reason,
    flaggedAt: new Date(Date.now() - Math.random() * 3 * 24 * 3600000),
    status: 'pending' as const,
  }));
}

export default function AdminModeration() {
  const { reports, updateReportStatus, flaggedMessages: storeFlagged, updateFlaggedMessage, requests, removePlan } = useAppStore();
  const [modLogs] = useState<ModerationLog[]>(() => generateModerationLogs(20));
  const [demoFlagged] = useState<FlaggedMessage[]>(() => generateFakeFlaggedMessages());
  const [activeTab, setActiveTab] = useState<'reports' | 'chat' | 'plans' | 'logs'>('reports');
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'reviewed' | 'dismissed'>('all');

  const allFlagged = [...storeFlagged, ...demoFlagged];
  const pendingFlagged = allFlagged.filter(m => m.status === 'pending');

  const filteredReports = useMemo(() => {
    if (reportFilter === 'all') return reports;
    return reports.filter(r => r.status === reportFilter);
  }, [reports, reportFilter]);

  const pendingReports = reports.filter(r => r.status === 'pending').length;
  const activePlans = requests.filter(r => r.status === 'active');

  const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-warning/15 text-warning',
    reviewed: 'bg-primary/15 text-primary',
    dismissed: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl space-y-5">
      <div className="hidden lg:block">
        <h2 className="text-xl font-bold">Reports & Moderation</h2>
        <p className="text-sm text-muted-foreground">
          {pendingReports} pending reports · {pendingFlagged.length} flagged messages
        </p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="rounded-2xl border border-border/30 bg-background/60 p-2.5 text-center">
          <p className="text-base font-bold text-warning">{pendingReports}</p>
          <p className="text-[9px] text-muted-foreground font-medium">Reports</p>
        </div>
        <div className="rounded-2xl border border-border/30 bg-background/60 p-2.5 text-center">
          <p className="text-base font-bold text-destructive">{pendingFlagged.length}</p>
          <p className="text-[9px] text-muted-foreground font-medium">Flagged Msgs</p>
        </div>
        <div className="rounded-2xl border border-border/30 bg-background/60 p-2.5 text-center">
          <p className="text-base font-bold text-primary">{activePlans.length}</p>
          <p className="text-[9px] text-muted-foreground font-medium">Active Plans</p>
        </div>
        <div className="rounded-2xl border border-border/30 bg-background/60 p-2.5 text-center">
          <p className="text-base font-bold text-muted-foreground">{modLogs.length}</p>
          <p className="text-[9px] text-muted-foreground font-medium">Mod Actions</p>
        </div>
      </div>

      {/* Sub tabs */}
      <div className="flex gap-1 bg-muted/40 p-1 rounded-2xl overflow-x-auto scrollbar-hide">
        {([
          { id: 'reports', label: `Reports${pendingReports > 0 ? ` (${pendingReports})` : ''}` },
          { id: 'chat', label: `Chat${pendingFlagged.length > 0 ? ` (${pendingFlagged.length})` : ''}` },
          { id: 'plans', label: 'Plans' },
          { id: 'logs', label: 'AI Logs' },
        ] as const).map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn('flex-1 py-2 text-[11px] font-semibold rounded-xl transition-all tap-scale whitespace-nowrap px-2',
              activeTab === tab.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
            )}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── REPORTS TAB ── */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {(['all', 'pending', 'reviewed', 'dismissed'] as const).map((f) => (
              <button key={f} onClick={() => setReportFilter(f)}
                className={cn('shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold tap-scale transition-all capitalize',
                  reportFilter === f ? 'bg-foreground text-background' : 'bg-foreground/[0.03] text-muted-foreground'
                )}>
                {f}
              </button>
            ))}
          </div>

          {filteredReports.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-border/20 bg-background/40">
              <AppIcon name="tw:check" size={32} className="mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                {reportFilter === 'all' ? 'No reports yet. Users can report from plan details and host profiles.' : `No ${reportFilter} reports`}
              </p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div key={report.id} className="rounded-2xl border border-border/30 bg-background/60 p-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                    <AlertTriangle size={14} className="text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-semibold">{report.reason}</p>
                      <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full capitalize', STATUS_STYLES[report.status])}>
                        {report.status}
                      </span>
                    </div>
                    {report.description && (
                      <p className="text-[11px] text-muted-foreground leading-snug mb-1.5">"{report.description}"</p>
                    )}
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span>📢 {report.reporterName}</span>
                      <span>→ {report.targetName}</span>
                      <span>{report.targetType === 'plan' ? '📍 Plan' : '👤 User'}</span>
                      <span>{formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>

                {report.status === 'pending' && (
                  <div className="flex gap-2 mt-3 pt-2.5 border-t border-border/15">
                    <Button variant="ghost" size="sm" className="flex-1 h-8 text-[11px]"
                      onClick={() => updateReportStatus(report.id, 'dismissed')}>
                      <XCircle size={12} className="mr-1" /> Dismiss
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-[11px]"
                      onClick={() => updateReportStatus(report.id, 'reviewed')}>
                      <Shield size={12} className="mr-1" /> Mark Reviewed
                    </Button>
                    <Button variant="destructive" size="sm" className="flex-1 h-8 text-[11px]"
                      onClick={() => updateReportStatus(report.id, 'reviewed')}>
                      <Ban size={12} className="mr-1" /> Action
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── CHAT MODERATION TAB ── */}
      {activeTab === 'chat' && (
        <div className="space-y-4">
          {/* Word filter config */}
          <div className="rounded-2xl border border-border/30 bg-background/60 p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Word Filters</h3>
            <div className="space-y-1.5">
              {WORD_FILTERS.map((wf) => (
                <div key={wf.word} className="flex items-center justify-between py-1.5 border-b border-border/10 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-[9px] font-bold px-1.5 py-0.5 rounded-full',
                      wf.severity === 'high' ? 'bg-destructive/15 text-destructive' : 'bg-warning/15 text-warning'
                    )}>
                      {wf.severity}
                    </span>
                    <span className="text-xs font-medium">"{wf.word}"</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground capitalize">{wf.autoAction}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Flagged messages queue */}
          <div>
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
              Flagged Messages ({pendingFlagged.length} pending)
            </h3>
            {allFlagged.length === 0 ? (
              <div className="text-center py-10 rounded-2xl border border-border/20 bg-background/40">
                <AppIcon name="tw:chat" size={32} className="mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No flagged messages</p>
              </div>
            ) : (
              <div className="space-y-2">
                {allFlagged.map((msg) => (
                  <div key={msg.id} className={cn(
                    'rounded-2xl border p-3.5',
                    msg.status === 'pending' ? 'border-warning/30 bg-warning/[0.03]' :
                    msg.status === 'removed' ? 'border-destructive/20 bg-background/40 opacity-60' :
                    'border-border/20 bg-background/40 opacity-60'
                  )}>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                        <MessageSquare size={12} className="text-warning" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-semibold">{msg.senderName}</p>
                          <span className="text-[9px] text-muted-foreground">in "{msg.requestTitle}"</span>
                        </div>
                        <div className="bg-muted/50 rounded-lg px-3 py-2 mb-1.5">
                          <p className="text-xs">{msg.message}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-warning/15 text-warning">
                            {msg.flagReason}
                          </span>
                          <span className="text-[9px] text-muted-foreground">
                            {formatDistanceToNow(new Date(msg.flaggedAt), { addSuffix: true })}
                          </span>
                          {msg.status !== 'pending' && (
                            <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize',
                              msg.status === 'removed' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                            )}>
                              {msg.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {msg.status === 'pending' && (
                      <div className="flex gap-2 mt-2.5 pt-2 border-t border-border/15">
                        <Button variant="ghost" size="sm" className="flex-1 h-8 text-[11px]"
                          onClick={() => updateFlaggedMessage(msg.id, 'cleared')}>
                          <CheckCircle2 size={12} className="mr-1" /> Clear
                        </Button>
                        <Button variant="destructive" size="sm" className="flex-1 h-8 text-[11px]"
                          onClick={() => updateFlaggedMessage(msg.id, 'removed')}>
                          <Trash2 size={12} className="mr-1" /> Remove
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PLAN MODERATION TAB ── */}
      {activeTab === 'plans' && (
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Active Plans ({activePlans.length})
          </h3>
          {activePlans.map((plan) => (
            <div key={plan.id} className="rounded-2xl border border-border/30 bg-background/60 p-3.5">
              <div className="flex items-center gap-3">
                <CategoryIcon category={plan.category} size="sm" className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{plan.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    by {plan.userName} · {plan.seatsTaken}/{plan.seatsTotal} spots · 📍 {plan.location.name}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-2.5 pt-2 border-t border-border/15">
                <Button variant="ghost" size="sm" className="flex-1 h-8 text-[11px]">
                  <Eye size={12} className="mr-1" /> View
                </Button>
                <Button variant="outline" size="sm" className="flex-1 h-8 text-[11px]">
                  <AlertTriangle size={12} className="mr-1" /> Flag
                </Button>
                <Button variant="destructive" size="sm" className="flex-1 h-8 text-[11px]"
                  onClick={() => removePlan(plan.id)}>
                  <Trash2 size={12} className="mr-1" /> Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── AI LOGS TAB ── */}
      {activeTab === 'logs' && (
        <div className="space-y-3">
          {/* AI checks status */}
          <div className="rounded-2xl border border-border/30 bg-background/60 p-4">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2.5 uppercase tracking-wider">AI Safety Checks</h3>
            {['Sexual/Explicit', 'Hate/Harassment', 'Scam patterns', 'Spam behavior', 'Underage content', 'Personal info sharing'].map((check) => (
              <div key={check} className="flex justify-between py-2 border-b border-border/10 text-xs last:border-0">
                <span>{check}</span>
                <span className="text-primary font-semibold flex items-center gap-1"><Bot size={10} /> Active ✓</span>
              </div>
            ))}
          </div>

          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recent Actions</h3>
          {modLogs.map((log) => (
            <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/20 bg-background/40">
              <div className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                log.by === 'AI System' ? 'bg-secondary/15' : 'bg-primary/10'
              )}>
                {log.by === 'AI System' ? <Bot size={12} className="text-secondary" /> : <User size={12} className="text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold">{log.action}</p>
                <p className="text-[10px] text-muted-foreground">
                  {log.target} · {log.reason} · <span className="font-medium">{log.by}</span>
                </p>
              </div>
              <span className="text-[9px] text-muted-foreground shrink-0">
                {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
