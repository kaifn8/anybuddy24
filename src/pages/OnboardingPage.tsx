import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';

const DiscoverVisual = lazy(() => import('@/components/onboarding/DiscoverVisual'));
const SafeVisual = lazy(() => import('@/components/onboarding/SafeVisual'));
const LevelUpVisual = lazy(() => import('@/components/onboarding/LevelUpVisual'));

const slides = [
  {
    id: 'discover',
    title: 'Friends busy?\nPeople nearby aren\'t.',
    description: 'See who\'s free around you right now — for coffee, walks, food, anything.',
    Visual: DiscoverVisual,
  },
  {
    id: 'safe',
    title: 'Groups only.\nNo creeps.',
    description: 'Verified users. Public meetups. Real ratings. You\'re always in control.',
    Visual: SafeVisual,
  },
  {
    id: 'loop',
    title: 'Show up.\nLevel up.',
    description: 'Earn credits, build your reputation, and unlock better plans.',
    Visual: LevelUpVisual,
  },
];

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const containerRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  useEffect(() => {
    gsap.fromTo(visualRef.current, { opacity: 0, y: 16, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out' });
    gsap.fromTo(textRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, delay: 0.1, ease: 'power2.out' });
  }, [currentSlide]);

  const handleNext = () => {
    if (!isLastSlide) {
      gsap.to([visualRef.current, textRef.current], {
        opacity: 0, y: -8, duration: 0.15, ease: 'power2.in',
        onComplete: () => setCurrentSlide(prev => prev + 1),
      });
    } else {
      gsap.to(containerRef.current, { opacity: 0, duration: 0.18, onComplete: () => navigate('/signup') });
    }
  };

  const handleSkip = () => {
    gsap.to(containerRef.current, { opacity: 0, duration: 0.18, onComplete: () => navigate('/signup') });
  };

  return (
    <div ref={containerRef} className="mobile-container h-[100dvh] flex flex-col bg-ambient overflow-hidden">
      {/* Top bar with progress indicator on the left */}
      <div className="shrink-0 safe-top px-6 pb-2 flex items-center justify-between pt-[30px]">
        <div className="flex items-center gap-1.5">
          {slides.map((i_, i) => {
            const isActive = i === currentSlide;
            const isPast = i < currentSlide;
            return (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="h-1.5 rounded-full transition-all duration-500 active:scale-90 ease-out overflow-hidden relative"
                style={{
                  width: isActive ? 28 : 14,
                  background: isActive
                    ? 'hsl(var(--primary))'
                    : isPast
                      ? 'hsl(var(--primary) / 0.4)'
                      : 'hsl(var(--muted-foreground) / 0.18)',
                  boxShadow: isActive ? '0 0 12px hsl(var(--primary) / 0.5)' : 'none',
                }}
              />
            );
          })}
        </div>

        {!isLastSlide ? (
          <button
            onClick={handleSkip}
            className="text-[13px] font-semibold text-muted-foreground/60 hover:text-foreground tap-scale active:scale-95 transition-colors px-2 py-1 -mr-2"
          >
            Skip
          </button>
        ) : (
          <div className="w-[40px]" />
        )}
      </div>

      {/* Spacer to balance composition */}
      <div className="h-[4vh] shrink-0" />

      {/* Visual area - takes upper 50% */}
      <div ref={visualRef} className="flex-[3] flex items-center justify-center px-6 min-h-0">
        <Suspense fallback={<div className="w-[240px] h-[240px]" />}>
          <slide.Visual key={slide.id} />
        </Suspense>
      </div>

      {/* Text + controls - takes lower portion */}
      <div className="flex-[2] flex flex-col justify-between px-6 pb-8">
        <div ref={textRef} className="text-center max-w-[300px] mx-auto">
          <h2 className="text-[24px] font-bold text-foreground mb-2 tracking-tight whitespace-pre-line leading-[1.2]">
            {slide.title}
          </h2>
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            {slide.description}
          </p>
        </div>

        <div>
          <Button className="w-full h-12 text-[15px] font-semibold tap-scale active:scale-[0.97] transition-transform shadow-lg shadow-primary/20" onClick={handleNext}>
            {isLastSlide ? "Get Started →" : 'Continue →'}
          </Button>
        </div>
      </div>
    </div>
  );
}
