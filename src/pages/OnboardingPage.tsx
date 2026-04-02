import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import type { Category } from '@/types/anybuddy';

const slides = [
  {
    id: 'discover',
    title: 'Friends busy?\nPeople nearby aren\'t.',
    description: 'See who\'s free around you right now — for coffee, walks, food, anything.',
  },
  {
    id: 'safe',
    title: 'Groups only.\nNo creeps.',
    description: 'Verified users. Public meetups. Real ratings. You\'re always in control.',
  },
  {
    id: 'loop',
    title: 'Show up.\nLevel up.',
    description: 'Earn credits, build your reputation, and unlock better plans.',
  },
];

const NEARBY_PEOPLE = [
  { name: 'Aarav', distance: '0.3 km' },
  { name: 'Priya', distance: '0.5 km' },
  { name: 'Rohan', distance: '0.8 km' },
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
    gsap.fromTo(visualRef.current, { opacity: 0, y: 24, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' });
    gsap.fromTo(textRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, delay: 0.18, ease: 'power2.out' });
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

  const renderVisual = () => {
    switch (slide.id) {
      /* ── Slide 1: Nearby discovery radar ── */
      case 'discover':
        return (
          <div className="w-full max-w-[300px]">
            <div className="relative rounded-[28px] overflow-hidden" style={{ height: 340 }}>
              <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-background to-background" />

              {/* Radar rings */}
              <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                {[0, 1, 2].map(i => (
                  <div key={i} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      width: `${64 + i * 52}px`,
                      height: `${64 + i * 52}px`,
                      border: '1px solid hsl(var(--primary) / 0.12)',
                      animation: `pulse 3s ease-in-out ${i * 0.5}s infinite`,
                      opacity: 0.7 - i * 0.15,
                    }} />
                ))}
                <div className="relative w-12 h-12 rounded-full flex items-center justify-center" style={{
                  background: 'linear-gradient(145deg, hsl(var(--primary)) 0%, hsl(211 100% 40%) 100%)',
                  boxShadow: '0 0 28px hsl(var(--primary) / 0.35)',
                }}>
                  <span className="text-lg">📍</span>
                </div>
                <p className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-primary whitespace-nowrap liquid-glass px-2.5 py-0.5" style={{ borderRadius: '100px' }}>You</p>
              </div>

              {/* People bubbles */}
              {NEARBY_PEOPLE.map((p, i) => {
                const positions = [
                  { top: '10%', left: '8%' },
                  { top: '12%', right: '6%' },
                  { bottom: '38%', left: '5%' },
                ];
                return (
                  <div key={p.name} className="absolute z-20" style={{ ...positions[i], animation: `fade-in 0.5s ease-out both, float 4.5s ease-in-out ${i * 0.7}s infinite`, animationDelay: `${i * 0.15}s` }}>
                    <div className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 liquid-glass" style={{ borderRadius: '100px' }}>
                      <div className="relative shrink-0">
                        <GradientAvatar name={p.name} size={28} showInitials={false} />
                        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-background" style={{ background: 'hsl(var(--success))' }} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-foreground leading-none">{p.name}</p>
                        <p className="text-[8px] text-muted-foreground mt-0.5">{p.distance}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Bottom activity chips */}
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-8 bg-gradient-to-t from-background via-background/90 to-transparent z-30">
                <div className="flex justify-center gap-3 mb-3">
                  {(['chai', 'walk', 'sports', 'food'] as Category[]).map((cat, i) => (
                    <div key={i} className="flex flex-col items-center gap-1" style={{ animation: 'scale-in 0.3s ease-out both', animationDelay: `${0.4 + i * 0.08}s` }}>
                      <CategoryIcon category={cat} size="md" className="liquid-glass" />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-1.5 px-3 py-2 liquid-glass" style={{ borderRadius: '1rem' }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'hsl(var(--success))' }} />
                  <span className="text-[10px] text-foreground font-bold">8 people free nearby</span>
                </div>
              </div>
            </div>
          </div>
        );

      /* ── Slide 2: Safety & trust ── */
      case 'safe':
        return (
          <div className="w-full max-w-[300px]">
            <div className="relative rounded-[28px] overflow-hidden" style={{ height: 340 }}>
              <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-background to-primary/6" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full blur-[80px]" style={{ background: 'hsl(var(--success) / 0.15)' }} />

              {/* Central shield */}
              <div className="absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                {[0, 1].map(i => (
                  <div key={i} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      width: `${90 + i * 44}px`, height: `${90 + i * 44}px`,
                      border: `1.5px solid hsl(var(--success) / ${0.18 - i * 0.06})`,
                      animation: `pulse ${2.5 + i * 0.5}s ease-in-out infinite`,
                    }} />
                ))}
                <div className="relative w-18 h-18 rounded-[1.25rem] flex items-center justify-center" style={{
                  background: 'linear-gradient(145deg, hsl(var(--success)) 0%, hsl(152 55% 34%) 100%)',
                  boxShadow: '0 8px 32px hsl(var(--success) / 0.3)',
                  width: 72, height: 72,
                }}>
                  <span className="text-[32px]">🛡️</span>
                </div>
              </div>

              {/* Trust features */}
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-6 bg-gradient-to-t from-background/95 via-background/80 to-transparent z-30">
                <div className="space-y-2">
                  {[
                    { emoji: '👥', label: 'Groups only, no 1-on-1 DMs' },
                    { emoji: '✅', label: 'Every person is verified' },
                    { emoji: '⭐', label: 'Rated after every meetup' },
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 liquid-glass" style={{ borderRadius: '0.875rem', animation: 'fade-in 0.4s ease-out forwards', animationDelay: `${i * 0.1}s` }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'hsl(var(--success) / 0.12)' }}>
                        <span className="text-sm">{f.emoji}</span>
                      </div>
                      <p className="text-[11px] font-bold text-foreground">{f.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      /* ── Slide 3: Earn & level up ── */
      case 'loop':
        return (
          <div className="w-full max-w-[300px]">
            <div className="relative rounded-[28px] overflow-hidden" style={{ height: 340 }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent/6" />

              <div className="relative z-10 px-5 pt-6 pb-4 h-full flex flex-col">
                {/* Credit orb */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 w-16 h-16 -m-2 rounded-full blur-3xl animate-pulse" style={{ background: 'hsl(var(--primary) / 0.2)' }} />
                    <div className="relative w-14 h-14 rounded-[1.125rem] flex items-center justify-center" style={{
                      background: 'linear-gradient(145deg, hsl(var(--primary)) 0%, hsl(211 100% 38%) 100%)',
                      boxShadow: '0 8px 32px hsl(var(--primary) / 0.3)',
                    }}>
                      <span className="text-[24px]">⭐</span>
                    </div>
                    <div className="absolute -top-2 -right-3 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{
                      background: 'hsl(var(--success))', color: 'hsl(var(--success-foreground))',
                      animation: 'float 3s ease-in-out infinite',
                    }}>+1.0</div>
                  </div>
                </div>

                <div className="text-center mb-5">
                  <p className="text-[28px] font-bold text-foreground tracking-tight leading-none">3.0</p>
                  <p className="text-[11px] text-muted-foreground font-medium mt-1">starter credits</p>
                </div>

                {/* Journey steps */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="relative">
                    <div className="absolute left-[17px] top-5 bottom-5 w-[2px] rounded-full" style={{
                      background: 'linear-gradient(to bottom, hsl(var(--primary) / 0.25), hsl(var(--success) / 0.3), hsl(var(--accent) / 0.25))',
                    }} />
                    <div className="space-y-3">
                      {[
                        { emoji: '📍', text: 'Join a plan', detail: '-0.5', accent: 'primary' },
                        { emoji: '🤝', text: 'Show up on time', detail: '+1.0', accent: 'success' },
                        { emoji: '⭐', text: 'Earn a great review', detail: '+0.5', accent: 'accent' },
                      ].map((s, i) => (
                        <div key={i} className="flex items-center gap-3 relative" style={{ animation: 'fade-in 0.4s ease-out forwards', animationDelay: `${i * 0.15}s` }}>
                          <div className="w-9 h-9 rounded-xl liquid-glass flex items-center justify-center shrink-0 relative z-10">
                            <span className="text-sm">{s.emoji}</span>
                          </div>
                          <p className="text-[12px] font-semibold text-foreground flex-1">{s.text}</p>
                          <span className="text-[13px] font-bold tabular-nums" style={{
                            color: s.detail.startsWith('+') ? 'hsl(var(--success))' : 'hsl(var(--muted-foreground))',
                          }}>{s.detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div ref={containerRef} className="mobile-container min-h-screen flex flex-col bg-ambient">
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-4">
        <div ref={visualRef} className="mb-6 w-full flex justify-center">
          {renderVisual()}
        </div>

        <div ref={textRef} className="text-center max-w-[280px]">
          <h2 className="text-[22px] font-bold text-foreground mb-2 tracking-tight whitespace-pre-line">{slide.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{slide.description}</p>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="px-6 pb-10">
        <div className="flex justify-center gap-1.5 mb-6">
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
          <button className="w-full mt-3 py-2.5 text-sm font-semibold text-muted-foreground/50 hover:text-muted-foreground tap-scale transition-colors" onClick={handleSkip}>
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
