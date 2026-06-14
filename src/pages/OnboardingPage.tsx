import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import DiscoverVisual from '@/components/onboarding/DiscoverVisual';
import SafeVisual from '@/components/onboarding/SafeVisual';
import LevelUpVisual from '@/components/onboarding/LevelUpVisual';

const slides = [
  {
    id: 'discover',
    eyebrow: 'Swipe through to get started',
    title: 'Friends busy?\nPeople nearby aren\'t.',
    description: 'See who\'s free around you right now for coffee, walks, food, anything.',
    Visual: DiscoverVisual,
  },
  {
    id: 'safe',
    eyebrow: 'Built for trust',
    title: 'No guesswork. No surprises.\n',
    description: 'Verified users, public meetups, real ratings.\n\nJoin only when you feel comfortable.',
    Visual: SafeVisual,
  },
  {
    id: 'loop',
    eyebrow: 'Earn as you meet',
    title: 'Earn trust by showing up.\n',
    description: 'Reliable people unlock better plans and more access.',
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
    <div ref={containerRef} className="mobile-container relative h-[100dvh] flex flex-col overflow-hidden pt-[24px] bg-ambient">

      {/* Top bar with progress indicator on the left */}
      <div className="relative z-10 shrink-0 safe-top px-6 pb-2 flex items-center justify-between">
        <div className="liquid-glass-subtle flex items-center gap-1.5 px-3 py-2">
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
            className="liquid-glass-subtle text-[13px] font-semibold text-foreground/70 hover:text-foreground tap-scale active:scale-95 transition-colors px-4 py-2"
          >
            Skip
          </button>
        ) : (
          <div className="w-[40px]" />
        )}
      </div>

      {/* Spacer to balance composition */}
      <div className="h-[7vh] shrink-0 relative z-10" />

      {/* Visual area - takes upper 50% */}
      <div ref={visualRef} className="relative z-10 flex-[3] flex items-center justify-center px-6 min-h-0">
        <slide.Visual key={slide.id} />
      </div>

      {/* Text + controls - takes lower portion */}
      <div className="relative z-10 flex-[2] flex flex-col justify-between px-6 pb-8">
        <div ref={textRef} className="text-center max-w-[300px] mx-auto my-0 py-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/80 mb-2">
            {slide.eyebrow}
          </p>
          <h2 className="text-[24px] font-bold text-foreground mb-2 tracking-tight whitespace-pre-line leading-[1.2] py-[8px]">
            {slide.title}
          </h2>
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            {slide.description}
          </p>
        </div>

        <button
          onClick={handleNext}
          className="relative w-full h-14 rounded-full overflow-hidden font-semibold text-[16px] tracking-tight tap-scale active:scale-[0.97] transition-transform group text-primary-foreground"
          style={{
            background: 'linear-gradient(180deg, hsl(var(--primary) / 0.92), hsl(var(--primary)))',
            backdropFilter: 'blur(24px) saturate(220%)',
            WebkitBackdropFilter: 'blur(24px) saturate(220%)',
            boxShadow:
              '0 18px 40px -12px hsl(var(--primary) / 0.55), inset 0 1px 0 hsl(0 0% 100% / 0.45), inset 0 -1px 0 hsl(220 40% 20% / 0.18), 0 0 0 0.5px hsl(0 0% 100% / 0.35)',
          }}
        >
          {/* Top specular sheen */}
          <span className="pointer-events-none absolute inset-x-3 top-0 h-1/2 rounded-full bg-gradient-to-b from-white/35 to-transparent blur-[2px]" />
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isLastSlide ? 'Get Started' : 'Continue'}
            <span className="transition-transform group-active:translate-x-0.5">→</span>
          </span>
          {/* Sweeping specular */}
          <span className="pointer-events-none absolute top-0 -left-1/3 h-full w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] opacity-0 group-hover:opacity-100 group-hover:left-[110%] transition-all duration-700" />
        </button>
      </div>
    </div>
  );
}
