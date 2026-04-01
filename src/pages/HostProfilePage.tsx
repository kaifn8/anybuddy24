import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { useAppStore } from '@/store/useAppStore';
import { TrustBadge } from '@/components/ui/TrustBadge';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import { AppIcon } from '@/components/icons/AppIcon';
import { Button } from '@/components/ui/button';
import { BlueTick } from '@/components/ui/BlueTick';
import { ReportDialog } from '@/components/ReportDialog';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
const FAKE_REVIEWS = [
  { name: 'Priya', rating: 5, comment: 'Great host, very chill meetup!', ago: '2 days ago' },
  { name: 'Arjun', rating: 4, comment: 'Really fun, would do it again.', ago: '1 week ago' },
  { name: 'Maya', rating: 5, comment: 'Super organized and on time 👍', ago: '2 weeks ago' },
];

export default function HostProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { requests } = useAppStore();
  const [showReport, setShowReport] = useState(false);

  const hostRequests = requests.filter(r => r.userId === userId);
  const host = hostRequests[0];

  if (!host) {
    return (
      <div className="mobile-container min-h-screen bg-ambient flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl block mb-3">🤷</span>
          <p className="text-sm text-muted-foreground mb-4">Host not found</p>
          <Button onClick={() => navigate(-1)} className="h-10 px-6">Go Back</Button>
        </div>
      </div>
    );
  }

  const completedMeetups = hostRequests.filter(r => r.status === 'completed').length;
  const activeMeetups = hostRequests.filter(r => r.status === 'active').length;
  const totalMeetups = completedMeetups + activeMeetups;
  const successRate = totalMeetups > 0 ? Math.round((completedMeetups / Math.max(totalMeetups, 1)) * 100) : 92;

  return (
    <div className="mobile-container min-h-screen bg-ambient pb-8">
      <TopBar showBack title="Host Profile" />

      <div className="px-5 pt-5 space-y-4">
        {/* Profile card — glass */}
        <div className="liquid-glass-heavy p-5 text-center">
          <GradientAvatar name={host.userName} size={80} className="mx-auto border-3 border-background text-2xl" />
          <h2 className="text-title font-bold mt-3">{host.userName}</h2>
          {host.userGender && (
            <span className="text-xs text-muted-foreground capitalize mt-0.5">
              {host.userGender === 'male' ? '👨' : host.userGender === 'female' ? '👩' : '🧑'} {host.userGender}
            </span>
          )}
          <div className="flex items-center justify-center gap-2 mt-1.5">
            <TrustBadge level={host.userTrust} size="md" />
            <span className="text-2xs text-success font-semibold">🟢 Online</span>
          </div>
          <div className="flex items-center justify-center gap-1 mt-2">
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">🛡️ Public meetup · <BlueTick size={12} /> Verified host</span>
          </div>
          <Button onClick={() => setShowReport(true)} variant="link" size="sm" className="h-auto p-0 mt-2 mx-auto text-[11px] text-destructive/60 gap-1">
            <AppIcon name="fc:feedback" size={12} /> Report user
          </Button>
        </div>

        {/* Stats — glass grid */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: `${host.userReliability || 0}%`, label: 'Reliable' },
            { value: host.userHostRating ? `${host.userHostRating}★` : '—', label: 'Rating' },
            { value: totalMeetups || 12, label: 'Meetups' },
            { value: `${successRate}%`, label: 'Success' },
          ].map((stat, i) => (
            <div key={i} className="liquid-glass p-2.5 text-center">
              <p className="text-sm font-bold text-foreground">{stat.value}</p>
              <p className="text-2xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Reviews — glass */}
        <div className="liquid-glass-heavy p-4">
          <h3 className="text-xs font-semibold text-muted-foreground mb-3">REVIEWS</h3>
          <div className="space-y-3">
            {FAKE_REVIEWS.map((review, i) => (
              <div key={i} className="liquid-glass p-3" style={{ borderRadius: '0.75rem' }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <GradientAvatar name={review.name} size={20} showInitials={false} />
                    <span className="text-xs font-semibold">{review.name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{review.ago}</span>
                </div>
                <div className="text-xs text-warning mb-1">
                  {'⭐'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
                <p className="text-xs text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Meetups — glass */}
        {hostRequests.length > 0 && (
          <div className="liquid-glass-heavy p-4">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2.5">MEETUPS</h3>
            <div className="space-y-2">
              {hostRequests.slice(0, 5).map((req) => (
                <button key={req.id} onClick={() => navigate(`/request/${req.id}`)}
                  className="w-full liquid-glass-interactive flex items-center gap-3 p-3 text-left">
                  <CategoryIcon category={req.category} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[14px] truncate">{req.title}</p>
                    <p className="text-[12px] text-muted-foreground mt-1">{req.seatsTaken} of {req.seatsTotal} spots filled • {req.status}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <ReportDialog
        open={showReport}
        onClose={() => setShowReport(false)}
        targetId={host.userId}
        targetName={host.userName}
        targetType="user"
      />
    </div>
  );
}
