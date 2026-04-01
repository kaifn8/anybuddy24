import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminVerification() {
  const { pendingVerifications, approveVerification, rejectVerification } = useAppStore();

  const pending = pendingVerifications.filter(v => v.status === 'pending');
  const approved = pendingVerifications.filter(v => v.status === 'verified');
  const rejected = pendingVerifications.filter(v => v.status === 'failed');

  return (
    <div className="p-4 lg:p-6 max-w-3xl space-y-5">
      <div className="hidden lg:block">
        <h2 className="text-xl font-bold">Verification Review</h2>
        <p className="text-sm text-muted-foreground">Review selfie verification submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl border border-border/30 bg-background/60 p-3 text-center">
          <p className="text-lg font-bold text-warning">{pending.length}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Pending</p>
        </div>
        <div className="rounded-2xl border border-border/30 bg-background/60 p-3 text-center">
          <p className="text-lg font-bold text-primary">{approved.length}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Approved</p>
        </div>
        <div className="rounded-2xl border border-border/30 bg-background/60 p-3 text-center">
          <p className="text-lg font-bold text-destructive">{rejected.length}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Rejected</p>
        </div>
      </div>

      {/* Pending queue */}
      <div>
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Pending Review</h3>
        {pending.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-border/20 bg-background/40">
            <span className="text-3xl block mb-2">✅</span>
            <p className="text-xs text-muted-foreground">All caught up, no pending verifications</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {pending.map((v) => (
              <div key={v.userId} className="rounded-2xl border border-border/30 bg-background/60 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <img src={v.selfieUrl} alt="Selfie" className="w-16 h-16 rounded-xl object-cover border border-border/30" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{v.userName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Submitted {new Date(v.submittedAt).toLocaleDateString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">ID: {v.userId.slice(0, 12)}...</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="destructive" size="sm" className="flex-1 h-9 text-[12px]" onClick={() => rejectVerification(v.userId)}>
                    <XCircle size={14} className="mr-1" /> Reject
                  </Button>
                  <Button size="sm" className="flex-1 h-9 text-[12px]" onClick={() => approveVerification(v.userId)}>
                    <CheckCircle2 size={14} className="mr-1" /> Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      {(approved.length > 0 || rejected.length > 0) && (
        <div>
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">History</h3>
          <div className="space-y-2">
            {[...approved, ...rejected]
              .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
              .map((v) => (
                <div key={v.userId} className="flex items-center gap-3 p-3 rounded-xl border border-border/20 bg-background/40">
                  <img src={v.selfieUrl} alt="Selfie" className="w-8 h-8 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">{v.userName}</p>
                    <p className="text-[9px] text-muted-foreground">{new Date(v.submittedAt).toLocaleDateString()}</p>
                  </div>
                  <span className={cn(
                    'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                    v.status === 'verified' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                  )}>
                    {v.status === 'verified' ? 'Approved' : 'Rejected'}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
