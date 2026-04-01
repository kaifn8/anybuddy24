import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import gsap from 'gsap';
import { useAppStore } from '@/store/useAppStore';
import { AppIcon } from '@/components/icons/AppIcon';
import { Button } from '@/components/ui/button';

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { requests, submitReview, completeMeetup, user } = useAppStore();
  
  const [didHappen, setDidHappen] = useState<'yes' | 'no' | 'didnt_attend' | null>(null);
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const request = requests.find(r => r.id === id);
  
  useEffect(() => {
    if (containerRef.current?.children) {
      gsap.fromTo(containerRef.current.children, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.06 });
    }
  }, []);
  
  useEffect(() => {
    if (submitted && successRef.current) {
      gsap.fromTo(successRef.current, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' });
    }
  }, [submitted]);
  
  if (!request || !user) {
    return (
      <div className="mobile-container min-h-screen bg-ambient flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Not found</p>
      </div>
    );
  }
  
  const handleSubmit = () => {
    if (!didHappen) return;
    submitReview({ requestId: request.id, reviewerId: user.id, rating, didHappen });
    if (didHappen === 'yes') completeMeetup(request.id);
    setSubmitted(true);
    setTimeout(() => navigate('/home'), 2000);
  };
  
  return (
    <div className="mobile-container min-h-screen bg-ambient">
      <TopBar showBack title="Rate Meetup" />
      
      {submitted ? (
        <div ref={successRef} className="flex flex-col items-center justify-center min-h-[70vh] px-8">
          <AppIcon name="tw:party" size={72} className="mb-4" />
          <h2 className="text-title font-bold mb-1">Thanks!</h2>
          <p className="text-sm text-muted-foreground">Your feedback helps the community</p>
        </div>
      ) : (
        <div ref={containerRef} className="px-5 pt-4 space-y-5">
          {/* Meetup info */}
          <div className="liquid-glass-heavy p-4 text-center">
            <h2 className="text-body font-bold">{request.title}</h2>
            <p className="text-xs text-muted-foreground mt-1">with {request.userName}</p>
          </div>
          
          {/* Did it happen? */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">DID THIS MEETUP HAPPEN?</h3>
            <div className="flex gap-2">
              {[
                { v: 'yes' as const, l: '✅ Yes' },
                { v: 'no' as const, l: '❌ No' },
                { v: 'didnt_attend' as const, l: "🚫 Didn't attend" },
              ].map((opt) => (
                <Button key={opt.v} onClick={() => setDidHappen(opt.v)}
                  variant={didHappen === opt.v ? 'default' : 'secondary'}
                  className="flex-1 py-3 h-auto text-xs"
                >
                  {opt.l}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Rating */}
          {didHappen === 'yes' && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-3">RATE YOUR EXPERIENCE</h3>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)}
                    className={`text-3xl transition-all tap-scale ${star <= rating ? '' : 'opacity-20'}`}>
                    ⭐
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center text-xs text-muted-foreground mt-2">
                  {rating <= 2 ? 'Could be better' : rating <= 3 ? 'It was okay' : rating === 4 ? 'Great meetup!' : 'Amazing! 🎉'}
                </p>
              )}
            </div>
          )}
          
          <Button className="w-full h-12"
            onClick={handleSubmit} disabled={!didHappen || (didHappen === 'yes' && rating === 0)}>
            Submit Review
          </Button>
        </div>
      )}
    </div>
  );
}