import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAppStore } from '@/store/useAppStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import { AppIcon } from '@/components/icons/AppIcon';
import { toast } from '@/hooks/use-toast';

type AttendanceStatus = 'attended' | 'late' | 'no_show';
type FeedbackType = 'good' | 'okay' | 'bad';

const FEEDBACK_OPTIONS: { type: FeedbackType; emoji: string; label: string; color: string }[] = [
  { type: 'good', emoji: '😄', label: 'Great vibe',  color: 'text-success'     },
  { type: 'okay', emoji: '😐', label: 'It was okay', color: 'text-muted-foreground' },
  { type: 'bad',  emoji: '😞', label: 'Not great',   color: 'text-destructive'  },
];

const ATTENDANCE_OPTIONS: { status: AttendanceStatus; icon: React.ReactNode; label: string; sub: string }[] = [
  {
    status: 'attended',
    icon: <AppIcon name="fc:checkmark" size={22} />,
    label: 'I was there',
    sub: 'Showed up on time',
  },
  {
    status: 'late',
    icon: <AppIcon name="fc:clock" size={22} />,
    label: 'Joined late',
    sub: 'Got there a bit late',
  },
  {
    status: 'no_show',
    icon: <AppIcon name="fc:cancel" size={22} />,
    label: "Couldn't make it",
    sub: 'Did not attend',
  },
];

export default function AttendancePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { requests, submitReview, completeMeetup, user, addNotification, updateCredits } = useAppStore();
  const { addXP, recordActivity, progressQuest } = useGamificationStore();

  const [step, setStep] = useState<'attendance' | 'feedback' | 'thanks' | 'participants'>('attendance');
  const [myStatus, setMyStatus] = useState<AttendanceStatus | null>(null);
  const [feedbacks, setFeedbacks] = useState<Record<string, FeedbackType>>({});
  const [thankYous, setThankYous] = useState<Set<string>>(new Set());

  const containerRef = useRef<HTMLDivElement>(null);

  const request = requests.find(r => r.id === id);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        Array.from(containerRef.current.children),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: 'power3.out' }
      );
    }
  }, [step]);

  if (!request || !user) {
    return (
      <div className="mobile-container min-h-screen bg-ambient flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Plan not found</p>
      </div>
    );
  }

  const participants = request.participants.filter(p => p.id !== user.id);
  const isHost = request.userId === user.id;

  const handleAttendanceNext = () => {
    if (!myStatus) return;
    if (myStatus === 'attended' || myStatus === 'late') {
      setStep(participants.length > 0 ? 'participants' : 'feedback');
    } else {
      handleFinalSubmit();
    }
  };

  const handleParticipantFeedback = (participantId: string, type: FeedbackType) => {
    setFeedbacks(prev => ({ ...prev, [participantId]: type }));
  };

  const handleThankYou = (participantId: string) => {
    setThankYous(prev => {
      const next = new Set(prev);
      next.has(participantId) ? next.delete(participantId) : next.add(participantId);
      return next;
    });
  };

  const handleFinalSubmit = () => {
    if (!myStatus || !user) return;

    submitReview({
      requestId: request.id,
      reviewerId: user.id,
      rating: myStatus === 'attended' ? 5 : myStatus === 'late' ? 3 : 1,
      didHappen: myStatus === 'attended' || myStatus === 'late' ? 'yes' : 'didnt_attend',
    });

    if (myStatus === 'attended' || myStatus === 'late') {
      completeMeetup(request.id);
      // XP for completing a meetup — reputation/leaderboard only
      addXP('complete_hangout', 'Completed a meetup');
      recordActivity();
      progressQuest('complete_a_meetup');
      // Credits for showing up — the core economy reward for real-world participation
      updateCredits(1, 'Showed up to a plan');

      if (thankYous.size > 0) {
        // XP for being thanked — reputation only, no credits
        addXP('receive_thanks', 'Received thanks');
        addNotification({
          type: 'trust',
          title: `+${thankYous.size} thanks received 🙏`,
          message: `People appreciated your company at "${request.title}"`,
        });
      }

      toast({
        title: '🎉 Meetup confirmed!',
        description: `+50 XP · +1 credit · Streak continued`,
      });
    }

    setStep('thanks');
    setTimeout(() => navigate('/home'), 2500);
  };

  return (
    <>
      <div className="mobile-container min-h-screen bg-ambient pb-28">
        <TopBar title="After the meetup" showBack hideChat />

        <div className="px-5 pt-5">
          {/* Plan summary */}
          <div className="liquid-glass p-3.5 flex items-center gap-3 mb-5">
            <CategoryIcon category={request.category} size="md" className="liquid-glass shrink-0" />
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-foreground truncate">{request.title}</p>
              <p className="text-[11px] text-muted-foreground">with {request.userName}</p>
            </div>
          </div>

          {/* ── Step: Attendance ── */}
          {step === 'attendance' && (
            <div ref={containerRef} className="space-y-4">
              <div>
                <h2 className="text-[18px] font-bold text-foreground tracking-tight">Did you make it?</h2>
                <p className="text-[13px] text-muted-foreground mt-1">Let us know how it went</p>
              </div>

              <div className="space-y-2">
                {ATTENDANCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.status}
                    onClick={() => setMyStatus(opt.status)}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-[1rem] transition-all tap-scale text-left',
                      myStatus === opt.status
                        ? 'liquid-glass-heavy ring-1 ring-primary/30'
                        : 'liquid-glass'
                    )}
                  >
                    <div className={cn(
                      'w-12 h-12 rounded-[0.875rem] flex items-center justify-center shrink-0',
                      myStatus === opt.status ? 'bg-primary/8' : 'bg-muted/30'
                    )}>
                      {opt.icon}
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-foreground">{opt.label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{opt.sub}</p>
                    </div>
                    {myStatus === opt.status && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <AppIcon name="fc:checkmark" size={12} />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <Button
                onClick={handleAttendanceNext}
                disabled={!myStatus}
                className="w-full h-12 text-[14px] font-bold mt-4"
              >
                Continue →
              </Button>
            </div>
          )}

          {/* ── Step: Rate participants ── */}
          {step === 'participants' && (
            <div ref={containerRef} className="space-y-4">
              <div>
                <h2 className="text-[18px] font-bold text-foreground tracking-tight">Who was great?</h2>
                <p className="text-[13px] text-muted-foreground mt-1">Rate the people you met</p>
              </div>

              <div className="space-y-3">
                {[
                  { id: request.userId, name: request.userName, role: 'Host' },
                  ...participants.map(p => ({ id: p.id, name: p.name, role: 'Joined' })),
                ]
                  .filter(p => p.id !== user.id)
                  .map((person) => (
                    <div key={person.id} className="liquid-glass-heavy p-4 rounded-[1rem]">
                      <div className="flex items-center gap-3 mb-3">
                        <GradientAvatar name={person.name} size={40} />
                        <div>
                          <p className="text-[13px] font-bold text-foreground">{person.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{person.role}</p>
                        </div>
                      </div>

                      {/* Feedback */}
                      <div className="flex gap-2 mb-2">
                        {FEEDBACK_OPTIONS.map((f) => (
                          <button
                            key={f.type}
                            onClick={() => handleParticipantFeedback(person.id, f.type)}
                            className={cn(
                              'flex-1 flex flex-col items-center gap-1 py-2 rounded-[0.75rem] transition-all tap-scale',
                              feedbacks[person.id] === f.type
                                ? 'bg-primary/8 ring-1 ring-primary/25'
                                : 'bg-muted/20'
                            )}
                          >
                            <span className="text-xl">{f.emoji}</span>
                            <span className={cn('text-[9px] font-semibold', f.color)}>{f.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Thank you */}
                      <button
                        onClick={() => handleThankYou(person.id)}
                        className={cn(
                          'w-full py-1.5 text-[11px] font-semibold rounded-[0.625rem] transition-all tap-scale',
                          thankYous.has(person.id)
                            ? 'bg-success/8 text-success ring-1 ring-success/20'
                            : 'bg-muted/20 text-muted-foreground'
                        )}
                      >
                        {thankYous.has(person.id) ? '🙏 Thanks sent!' : '👋 Send thank you'}
                      </button>
                    </div>
                  ))}
              </div>

              <Button onClick={() => setStep('feedback')} className="w-full h-12 text-[14px] font-bold">
                Next →
              </Button>
            </div>
          )}

          {/* ── Step: Overall feedback ── */}
          {step === 'feedback' && (
            <div ref={containerRef} className="space-y-5">
              <div>
                <h2 className="text-[18px] font-bold text-foreground tracking-tight">Overall, how was it?</h2>
                <p className="text-[13px] text-muted-foreground mt-1">Help us improve the experience</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {FEEDBACK_OPTIONS.map((f) => (
                  <button
                    key={f.type}
                    onClick={handleFinalSubmit}
                    className="liquid-glass-heavy flex flex-col items-center gap-2 py-5 rounded-[1rem] tap-scale transition-all hover:ring-1 hover:ring-primary/20"
                  >
                    <span className="text-3xl">{f.emoji}</span>
                    <span className={cn('text-[11px] font-bold', f.color)}>{f.label}</span>
                  </button>
                ))}
              </div>

              <Button onClick={handleFinalSubmit} variant="link" className="w-full text-[11px] text-muted-foreground">
                Skip
              </Button>
            </div>
          )}

          {/* ── Step: Thank you ── */}
          {step === 'thanks' && (
            <div className="flex flex-col items-center justify-center pt-20 text-center">
              <div
                className="w-24 h-24 rounded-[1.5rem] liquid-glass flex items-center justify-center mb-5"
                style={{ boxShadow: '0 0 32px hsl(var(--success) / 0.25)' }}
              >
                <AppIcon name="tw:party" size={72} className="mb-5" />
              </div>
              <h2 className="text-[22px] font-bold text-foreground tracking-tight mb-2">
                {myStatus === 'attended' ? 'Awesome!' : 'Thanks for letting us know'}
              </h2>
              {myStatus === 'attended' && (
                <div className="space-y-1">
                  <p className="text-[13px] text-muted-foreground">+50 XP · <span className="text-success font-semibold">+1 credit</span> · Streak continued</p>
                  {thankYous.size > 0 && (
                    <p className="text-[13px] text-success font-semibold">+{thankYous.size} thank you{thankYous.size > 1 ? 's' : ''} sent 🙏</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </>
  );
}
