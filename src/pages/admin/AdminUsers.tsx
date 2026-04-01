import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShieldCheck, Ban, Flag, MessageSquareWarning, ChevronUp, ChevronDown, Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateFakeUsers, type AdminUser } from '@/data/adminData';
import { cn } from '@/lib/utils';
import type { TrustLevel } from '@/types/anybuddy';
import { format } from 'date-fns';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { GradientAvatar } from '@/components/ui/GradientAvatar';

const TRUST_COLORS: Record<TrustLevel, string> = {
  seed: 'bg-muted text-muted-foreground',
  solid: 'bg-secondary/20 text-secondary',
  trusted: 'bg-primary/15 text-primary',
  anchor: 'bg-warning/15 text-warning',
};

const TRUST_ORDER: TrustLevel[] = ['seed', 'solid', 'trusted', 'anchor'];

const VERIFICATION_LABELS: Record<string, { label: string; color: string }> = {
  unverified: { label: 'Unverified', color: 'bg-muted text-muted-foreground' },
  pending: { label: 'Pending', color: 'bg-warning/15 text-warning' },
  verified: { label: 'Verified', color: 'bg-primary/15 text-primary' },
  failed: { label: 'Failed', color: 'bg-destructive/15 text-destructive' },
};

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>(() => generateFakeUsers(30));
  const [search, setSearch] = useState('');
  const [trustFilter, setTrustFilter] = useState<TrustLevel | 'all'>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [warningDialog, setWarningDialog] = useState<AdminUser | null>(null);
  const [warningText, setWarningText] = useState('');

  const { sendAdminWarning, adminWarnings } = useAppStore();

  const filtered = useMemo(() => {
    return users.filter(u => {
      if (search && !u.firstName.toLowerCase().includes(search.toLowerCase()) && !u.id.includes(search)) return false;
      if (trustFilter !== 'all' && u.trustLevel !== trustFilter) return false;
      if (verificationFilter !== 'all' && u.verificationStatus !== verificationFilter) return false;
      return true;
    });
  }, [users, search, trustFilter, verificationFilter]);

  const toggleBan = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      const newBanned = !u.isBanned;
      toast(newBanned ? `🚫 ${u.firstName} has been banned` : `✅ ${u.firstName} has been unbanned`);
      return { ...u, isBanned: newBanned, isFlagged: newBanned ? false : u.isFlagged };
    }));
  };

  const toggleFlag = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      const newFlagged = !u.isFlagged;
      toast(newFlagged ? `🚩 ${u.firstName} has been flagged` : `Flag removed from ${u.firstName}`);
      return { ...u, isFlagged: newFlagged };
    }));
  };

  const changeTrust = (userId: string, direction: 'up' | 'down') => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      const idx = TRUST_ORDER.indexOf(u.trustLevel);
      const newIdx = direction === 'up' ? Math.min(idx + 1, TRUST_ORDER.length - 1) : Math.max(idx - 1, 0);
      if (newIdx === idx) return u;
      const newLevel = TRUST_ORDER[newIdx];
      toast(`${u.firstName}'s trust changed to ${newLevel}`);
      return { ...u, trustLevel: newLevel };
    }));
  };

  const handleSendWarning = () => {
    if (!warningDialog || !warningText.trim()) return;
    sendAdminWarning(warningDialog.id, warningDialog.firstName, warningText.trim());
    toast(`⚠️ Warning sent to ${warningDialog.firstName}`);
    setWarningText('');
    setWarningDialog(null);
  };

  return (
    <div className="p-4 lg:p-6 max-w-5xl">
      <div className="hidden lg:block mb-5">
        <h2 className="text-xl font-bold">User Management</h2>
        <p className="text-sm text-muted-foreground">{users.length} total users · {users.filter(u => u.isFlagged).length} flagged · {users.filter(u => u.isBanned).length} banned</p>
      </div>

      {/* Filters */}
      <div className="space-y-2.5 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border/30 bg-background/60 backdrop-blur-sm text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {(['all', 'seed', 'solid', 'trusted', 'anchor'] as const).map((level) => (
            <button key={level} onClick={() => setTrustFilter(level)}
              className={cn('shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold tap-scale transition-all capitalize',
                trustFilter === level ? 'bg-foreground text-background' : 'bg-foreground/[0.03] text-muted-foreground'
              )}>
              {level === 'all' ? 'All trust' : level}
            </button>
          ))}
          <span className="w-px h-6 bg-border/30 self-center mx-0.5" />
          {(['all', 'verified', 'pending', 'unverified', 'failed'] as const).map((status) => (
            <button key={status} onClick={() => setVerificationFilter(status)}
              className={cn('shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold tap-scale transition-all capitalize',
                verificationFilter === status ? 'bg-foreground text-background' : 'bg-foreground/[0.03] text-muted-foreground'
              )}>
              {status === 'all' ? 'All status' : status}
            </button>
          ))}
        </div>
      </div>

      {/* User list */}
      <div className="space-y-2">
        {filtered.map((user) => {
          const warnings = adminWarnings[user.id] || [];
          return (
            <button
              key={user.id}
              onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
              className={cn(
                'w-full text-left rounded-2xl border p-3 transition-all tap-scale',
                user.isBanned ? 'border-destructive/30 bg-destructive/[0.03]' :
                selectedUser?.id === user.id
                  ? 'border-primary/30 bg-primary/[0.03] shadow-sm'
                  : 'border-border/20 bg-background/60 hover:border-border/40'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <GradientAvatar name={user.firstName} size={40} className={cn(user.isBanned && "opacity-40 grayscale")} />
                  {user.isBanned && (
                    <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive flex items-center justify-center">
                      <Ban size={8} className="text-destructive-foreground" />
                    </div>
                  )}
                  {user.isFlagged && !user.isBanned && (
                    <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-warning flex items-center justify-center">
                      <Flag size={8} className="text-warning-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn("text-sm font-semibold truncate", user.isBanned && "line-through text-muted-foreground")}>{user.firstName}</p>
                    {user.verificationStatus === 'verified' && <ShieldCheck size={12} className="text-primary shrink-0" />}
                    {warnings.length > 0 && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-warning/15 text-warning">
                        {warnings.length} warn{warnings.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {user.gender && <span className="capitalize">{user.gender === 'male' ? '👨' : user.gender === 'female' ? '👩' : '🧑'} {user.gender} · </span>}
                    {user.zone}, {user.city} · Joined {format(new Date(user.joinedAt), 'MMM d')}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full capitalize', TRUST_COLORS[user.trustLevel])}>
                    {user.trustLevel}
                  </span>
                  <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full', VERIFICATION_LABELS[user.verificationStatus].color)}>
                    {VERIFICATION_LABELS[user.verificationStatus].label}
                  </span>
                </div>
              </div>

              {/* Expanded detail */}
              {selectedUser?.id === user.id && (
                <div className="mt-3 pt-3 border-t border-border/15 space-y-3" onClick={(e) => e.stopPropagation()}>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div><p className="text-sm font-bold">{user.reliabilityScore}%</p><p className="text-[9px] text-muted-foreground">Reliable</p></div>
                    <div><p className="text-sm font-bold">{user.meetupsAttended}</p><p className="text-[9px] text-muted-foreground">Attended</p></div>
                    <div><p className="text-sm font-bold">{user.meetupsHosted}</p><p className="text-[9px] text-muted-foreground">Hosted</p></div>
                    <div><p className="text-sm font-bold text-destructive">{user.noShows}</p><p className="text-[9px] text-muted-foreground">No-shows</p></div>
                  </div>

                  {/* Warning history */}
                  {warnings.length > 0 && (
                    <div className="rounded-xl bg-warning/[0.05] border border-warning/20 p-2.5">
                      <p className="text-[10px] font-semibold text-warning mb-1.5">⚠️ Warning History</p>
                      {warnings.map((w, i) => (
                        <p key={i} className="text-[10px] text-muted-foreground leading-relaxed">• {w}</p>
                      ))}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-[11px]" onClick={() => toggleFlag(user.id)}>
                      <Flag size={12} className="mr-1" /> {user.isFlagged ? 'Unflag' : 'Flag'}
                    </Button>
                    <Button
                      variant={user.isBanned ? 'secondary' : 'destructive'}
                      size="sm" className="h-8 text-[11px]"
                      onClick={() => toggleBan(user.id)}
                    >
                      <Ban size={12} className="mr-1" /> {user.isBanned ? 'Unban' : 'Ban'}
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-[11px]"
                      onClick={() => setWarningDialog(user)}>
                      <MessageSquareWarning size={12} className="mr-1" /> Warn via DM
                    </Button>
                    <Button variant="secondary" size="sm" className="h-8 text-[11px]"
                      onClick={() => navigate(`/admin/users/${user.id}`)}>
                      <MessageCircle size={12} className="mr-1" /> View Chats
                    </Button>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" className="flex-1 h-8 text-[11px]"
                        disabled={user.trustLevel === 'seed'}
                        onClick={() => changeTrust(user.id, 'down')}>
                        <ChevronDown size={12} className="mr-0.5" /> Demote
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 h-8 text-[11px]"
                        disabled={user.trustLevel === 'anchor'}
                        onClick={() => changeTrust(user.id, 'up')}>
                        <ChevronUp size={12} className="mr-0.5" /> Promote
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <span className="text-3xl block mb-2">🔍</span>
          <p className="text-sm text-muted-foreground">No users match your filters</p>
        </div>
      )}

      {/* Warning DM Dialog */}
      <Dialog open={!!warningDialog} onOpenChange={(v) => !v && setWarningDialog(null)}>
        <DialogContent className="max-w-[360px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <MessageSquareWarning size={16} className="text-warning" />
              Warn {warningDialog?.firstName}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              This sends a direct warning message to the user's DM inbox.
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={warningText}
            onChange={(e) => setWarningText(e.target.value)}
            placeholder="Type your warning message..."
            rows={3}
            maxLength={500}
            className="w-full rounded-xl border border-border/30 bg-background/60 p-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-warning/30 resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">{warningText.length}/500</span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setWarningDialog(null)}>Cancel</Button>
              <Button size="sm" onClick={handleSendWarning} disabled={!warningText.trim()}
                className="bg-warning text-warning-foreground hover:bg-warning/90">
                <Send size={12} className="mr-1" /> Send Warning
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
