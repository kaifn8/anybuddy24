import { GradientAvatar } from '@/components/ui/GradientAvatar';
import type { Badge, User, VerificationStatus } from '@/types/anybuddy';

interface ProfileHeroProps {
  user: User & { badges: Badge[] };
  joinText: string;
  stats: { value: string | number; label: string }[];
}

function VerificationPill({ status }: { status: VerificationStatus }) {
  if (status === 'verified') {
    return (
      <div className="flex items-center gap-1 px-2.5 py-[3px] rounded-full bg-primary/8 text-primary text-[10px] font-bold">
        🛡️ Verified
      </div>
    );
  }
  if (status === 'pending') {
    return (
      <div className="flex items-center gap-1 px-2.5 py-[3px] rounded-full bg-warning/10 text-warning text-[10px] font-bold">
        ⏳ Pending
      </div>
    );
  }
  if (status === 'failed') {
    return (
      <div className="flex items-center gap-1 px-2.5 py-[3px] rounded-full bg-destructive/10 text-destructive text-[10px] font-bold">
        ⚠️ Failed
      </div>
    );
  }
  return (
    <div className="px-2.5 py-[3px] rounded-full bg-muted text-muted-foreground text-[10px] font-medium">
      Unverified
    </div>
  );
}

export function ProfileHero({ user, joinText, stats }: ProfileHeroProps) {
  const verificationStatus: VerificationStatus = user.verificationStatus || 'unverified';

  return (
    <div className="relative overflow-hidden liquid-glass-heavy">
      <div className="absolute top-0 left-0 right-0 h-32 opacity-[0.04]" style={{
        background: 'radial-gradient(ellipse at 50% 0%, hsl(var(--primary)), transparent 70%)',
      }} />

      <div className="relative z-10">
        <div className="flex flex-col items-center px-6 pt-8 pb-6">
          {/* Avatar — gradient */}
          <div className="relative mb-4">
            <GradientAvatar name={user.firstName} size={88} className="text-2xl" showInitials={true} />
            {verificationStatus === 'verified' && (
              <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full flex items-center justify-center bg-primary" style={{
                boxShadow: '0 2px 8px hsl(var(--primary) / 0.3), 0 0 0 2px hsl(var(--background))',
              }}>
                <span className="text-[11px]">✅</span>
              </div>
            )}
          </div>

          <h2 className="text-[24px] font-bold tracking-tight text-foreground">{user.firstName}</h2>

          <div className="flex items-center gap-2 mt-2">
            {user.gender && (
              <span className="text-[11px] font-medium capitalize text-muted-foreground">{user.gender}</span>
            )}
            <VerificationPill status={verificationStatus} />
          </div>

          {user.bio && (
            <p className="text-[13px] text-center mt-3.5 leading-[1.65] max-w-[260px] text-muted-foreground">{user.bio}</p>
          )}

          <div className="flex items-center gap-3 mt-3.5 text-muted-foreground/50">
            <div className="flex items-center gap-1">
              <span className="text-[10px]">📍</span>
              <span className="text-[11px] font-medium">{user.zone ? `${user.zone}, ${user.city}` : user.city}</span>
            </div>
            <span className="w-px h-2.5 bg-border/50" />
            <span className="text-[11px] font-medium">{joinText}</span>
          </div>
        </div>

        <div className="mx-5 mb-5 grid grid-cols-3 overflow-hidden rounded-[1rem] liquid-glass" style={{ borderRadius: '1rem' }}>
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center py-4 gap-1" style={{
              borderRight: i < 2 ? '0.5px solid hsla(var(--glass-border))' : undefined,
            }}>
              <span className="text-[20px] font-bold tabular-nums text-foreground tracking-tight">{stat.value}</span>
              <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
