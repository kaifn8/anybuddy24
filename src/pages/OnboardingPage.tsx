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
    gsap.fromTo(visualRef.current, { opacity: 0, y: 24, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' });
    gsap.fromTo(textRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.2, ease: 'power2.out' });
  }, [currentSlide]);

  const handleNext = () => {
    if (!isLastSlide) {
      gsap.to([visualRef.current, textRef.current], {
        opacity: 0, y: -12, duration: 0.2,
        onComplete: () => setCurrentSlide(prev => prev + 1),
      });
    } else {
      gsap.to(containerRef.current, { opacity: 0, duration: 0.2, onComplete: () => navigate('/signup') });
    }
  };

  const handleSkip = () => {
    gsap.to(containerRef.current, { opacity: 0, duration: 0.2, onComplete: () => navigate('/signup') });
  };

  return (
    <div ref={containerRef} className="mobile-container h-[100dvh] flex flex-col bg-ambient overflow-hidden">
      {/* Visual */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 min-h-0">
        <div ref={visualRef} className="mb-4 w-full flex justify-center shrink-0">
          <Suspense fallback={<div className="w-[220px] h-[220px]" />}>
            <div className="scale-[0.85] origin-center">
              <slide.Visual key={slide.id} />
            </div>
          </Suspense>
        </div>

        <div ref={textRef} className="text-center max-w-[300px] shrink-0">
          <h2 className="text-[22px] font-bold text-foreground mb-2 tracking-tight whitespace-pre-line leading-[1.2]">
            {slide.title}
          </h2>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            {slide.description}
          </p>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="px-6 pb-8 shrink-0">
        <div className="flex justify-center gap-1.5 mb-4">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === currentSlide ? 24 : 6,
                background: i === currentSlide ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.2)',
              }} />
          ))}
        </div>

        <Button className="w-full h-12 text-[15px] font-semibold" onClick={handleNext}>
          {isLastSlide ? "Get Started →" : 'Continue →'}
        </Button>

        {!isLastSlide && (
          <button className="w-full mt-2 py-2 text-sm font-semibold text-muted-foreground/50 hover:text-muted-foreground tap-scale transition-colors" onClick={handleSkip}>
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
