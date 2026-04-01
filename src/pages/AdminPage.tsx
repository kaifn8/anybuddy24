import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { useAppStore } from '@/store/useAppStore';
import { getCategoryLabel } from '@/components/icons/CategoryIcon';
import { Button } from '@/components/ui/button';
import { AppIcon } from '@/components/icons/AppIcon';
import type { Category } from '@/types/anybuddy';
import { cn } from '@/lib/utils';

const categoryDemand: Record<Category, number> = {
  chai: 85, explore: 72, shopping: 45, work: 68, help: 90, casual: 55,
  sports: 78, food: 82, walk: 60,
};

export default function AdminPage() {
  const navigate = useNavigate();
  const { requests, pendingVerifications, approveVerification, rejectVerification } = useAppStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'moderation' | 'pricing' | 'verification'>('overview');
  
  const liveRequests = requests.filter(r => new Date(r.expiresAt) > new Date()).length;
  const totalParticipants = requests.reduce((acc, r) => acc + r.seatsTaken, 0);

  const pendingCount = pendingVerifications.filter(v => v.status === 'pending').length;
  
  return (
    <div className="mobile-container min-h-screen bg-ambient">
      <TopBar showBack title="🛡️ Admin" />
      <div className="flex max-w-md mx-auto border-b border-border/15 overflow-x-auto scrollbar-hide">
        {(['overview', 'verification', 'moderation', 'pricing'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-2.5 text-xs font-medium transition-colors whitespace-nowrap px-3 relative',
              activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
            )}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'verification' && pendingCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-destructive text-white text-[9px] font-bold">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>
      
      <div className="px-5 pt-3 space-y-4 pb-8">
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="liquid-glass p-3.5">
                <p className="text-2xs text-muted-foreground mb-1">Live Requests</p>
                <p className="text-heading font-bold text-primary">{liveRequests}</p>
              </div>
              <div className="liquid-glass p-3.5">
                <p className="text-2xs text-muted-foreground mb-1">Active Users</p>
                <p className="text-heading font-bold text-secondary">{totalParticipants + liveRequests}</p>
              </div>
            </div>
            
            <div className="liquid-glass-heavy p-4">
              <h3 className="text-xs font-semibold text-muted-foreground mb-3">CATEGORY DEMAND</h3>
              <div className="space-y-2.5">
                {(Object.entries(categoryDemand) as [Category, number][]).map(([cat, demand]) => (
                  <div key={cat}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">{getCategoryLabel(cat)}</span>
                      <span className={demand > 80 ? 'text-warning font-semibold' : 'text-muted-foreground'}>{demand}%</span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${demand > 80 ? 'bg-warning' : demand > 60 ? 'bg-primary' : 'bg-secondary'}`}
                        style={{ width: `${demand}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'verification' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="liquid-glass p-3 text-center">
                <p className="text-title font-bold text-warning">{pendingVerifications.filter(v => v.status === 'pending').length}</p>
                <p className="text-2xs text-muted-foreground">Pending</p>
              </div>
              <div className="liquid-glass p-3 text-center">
                <p className="text-title font-bold text-primary">{pendingVerifications.filter(v => v.status === 'verified').length}</p>
                <p className="text-2xs text-muted-foreground">Approved</p>
              </div>
              <div className="liquid-glass p-3 text-center">
                <p className="text-title font-bold text-destructive">{pendingVerifications.filter(v => v.status === 'failed').length}</p>
                <p className="text-2xs text-muted-foreground">Rejected</p>
              </div>
            </div>

            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pending Review</h3>

            {pendingVerifications.filter(v => v.status === 'pending').length === 0 ? (
              <div className="text-center py-10">
                <AppIcon name="tw:check" size={32} className="mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No pending verifications</p>
              </div>
            ) : (
              pendingVerifications
                .filter(v => v.status === 'pending')
                .map((v) => (
                  <div key={v.userId} className="liquid-glass-heavy p-4 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <img src={v.selfieUrl} alt="Selfie" className="w-14 h-14 rounded-xl object-cover border border-border/30" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{v.userName}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Submitted {new Date(v.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1 h-9 text-[12px]"
                        onClick={() => rejectVerification(v.userId)}
                      >
                        <AppIcon name="fc:cancel" size={14} className="mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 h-9 text-[12px]"
                        onClick={() => approveVerification(v.userId)}
                      >
                        <AppIcon name="fc:checkmark" size={14} className="mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                ))
            )}

            {/* History */}
            {pendingVerifications.filter(v => v.status !== 'pending').length > 0 && (
              <>
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-4">History</h3>
                {pendingVerifications
                  .filter(v => v.status !== 'pending')
                  .map((v) => (
                    <div key={v.userId} className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border/20">
                      <img src={v.selfieUrl} alt="Selfie" className="w-8 h-8 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold">{v.userName}</p>
                      </div>
                      <span className={cn(
                        'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                        v.status === 'verified' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                      )}>
                        {v.status === 'verified' ? 'Approved' : 'Rejected'}
                      </span>
                    </div>
                  ))
                }
              </>
            )}
          </div>
        )}
        
        {activeTab === 'moderation' && (
          <div className="liquid-glass p-4">
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[{ v: '847', l: 'Approved', c: 'text-success' }, { v: '23', l: 'Flagged', c: 'text-warning' }, { v: '12', l: 'Rejected', c: 'text-destructive' }].map((s, i) => (
                <div key={i} className="text-center py-2">
                  <p className={`text-title font-bold ${s.c}`}>{s.v}</p>
                  <p className="text-2xs text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">AI CHECKS</h3>
            {['Sexual/Explicit', 'Hate/Harassment', 'Scam patterns', 'Spam behavior'].map((check) => (
              <div key={check} className="flex justify-between py-2 border-b border-border/15 text-xs last:border-0">
                <span>{check}</span><span className="text-success font-semibold">Active ✓</span>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'pricing' && (
          <div className="liquid-glass-heavy p-4">
            <h3 className="text-xs font-semibold text-muted-foreground mb-3">CREDIT PRICING</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1"><span>Base cost</span><span className="font-semibold">1 credit</span></div>
              <div className="border-t border-border/15 pt-2 space-y-1 text-muted-foreground">
                <div className="flex justify-between"><span>Right Now</span><span>+0.5</span></div>
                <div className="flex justify-between"><span>Today</span><span>+0.25</span></div>
                <div className="flex justify-between"><span>This Week</span><span>+0</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}