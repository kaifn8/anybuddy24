import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import type { Category } from '@/types/anybuddy';

const slides = [
  { id: 'people', title: "Friends busy?", description: "People around you are free right now. Coffee, food, walks, games. Jump in." },
  { id: 'realtime', title: 'Plans fill up fast.', description: 'Post what you want to do.\nNearby people join in minutes.' },
  { id: 'safe', title: 'No DMs. No weirdos.', description: 'Group-only meetups. Verified people.\nShow up and vibe.' },
  { id: 'credits', title: 'Show up. Level up.', description: 'The more you show up, the cheaper it gets.\nReliable people get the best perks.' },
];

const NEARBY_PEOPLE = [
  { name: 'Aarav', activity: '☕ Coffee buddy', distance: '0.3 km' },
  { name: 'Priya', activity: '🚶 Walk partner', distance: '0.5 km' },
  { name: 'Rohan', activity: '🏸 Badminton', distance: '0.8 km' },
];

const LIVE_ACTIVITY = [
  { emoji: '☕', text: "Aarav's coffee plan — 1 spot left", time: 'Just now', accent: 'primary' },
  { emoji: '✋', text: 'Priya joined before you!', time: '2 min ago', accent: 'success' },
  { emoji: '🔥', text: '"Evening Run" is full', time: '5 min ago', accent: 'destructive' },
];

const TRUST_FEATURES = [
  { emoji: '🛡️', label: 'Every person is verified', desc: 'Real names, real faces' },
  { emoji: '👥', label: 'Groups only, no 1-on-1 DMs', desc: 'Designed to feel safe' },
  { emoji: '🚫', label: 'Bad actors get removed', desc: 'Community-driven moderation' },
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
    if (currentSlide < slides.length - 1) {
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

  const handleBack = () => {
    if (currentSlide > 0) {
      gsap.to([visualRef.current, textRef.current], {
        opacity: 0, y: 12, duration: 0.15,
        onComplete: () => setCurrentSlide(prev => prev - 1),
      });
    }
  };

  const renderVisual = () => {
    switch (slide.id) {
      /* ═══════════════════════════════════
         SLIDE 1 — Map radar with people
         ═══════════════════════════════════ */
      case 'people':
        return (
          <div className="w-full max-w-[320px]">
            <div className="relative rounded-[28px] overflow-hidden" style={{ height: 390 }}>
              {/* Ambient gradient background */}
              <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-background to-background" />
              
              {/* Subtle map grid */}
              <div className="absolute inset-0 opacity-[0.04]" style={{
                backgroundImage: `
                  linear-gradient(0deg, hsl(var(--foreground)) 0.5px, transparent 0.5px),
                  linear-gradient(90deg, hsl(var(--foreground)) 0.5px, transparent 0.5px)
                `,
                backgroundSize: '52px 52px',
              }} />

              {/* Warm glow behind center */}
              <div className="absolute top-[32%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full blur-[80px] pointer-events-none" style={{
                background: 'radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 70%)',
              }} />

              {/* Radar rings */}
              <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                {[0, 1, 2].map(i => (
                  <div key={i} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      width: `${70 + i * 56}px`,
                      height: `${70 + i * 56}px`,
                      border: '1px solid hsl(var(--primary) / 0.12)',
                      animation: `pulse 3s ease-in-out ${i * 0.5}s infinite`,
                      opacity: 0.7 - i * 0.15,
                    }} />
                ))}
                {/* Your dot */}
                <div className="relative w-14 h-14 rounded-full flex items-center justify-center" style={{
                  background: 'linear-gradient(145deg, hsl(var(--primary)) 0%, hsl(211 100% 40%) 100%)',
                  boxShadow: '0 0 28px hsl(var(--primary) / 0.35), inset 0 1px 0 hsla(0 0% 100% / 0.2)',
                }}>
                  <span className="text-xl">📍</span>
                </div>
                <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-primary whitespace-nowrap liquid-glass px-2.5 py-0.5" style={{ borderRadius: '100px' }}>You</p>
              </div>

              {/* People bubbles — liquid glass cards */}
              {NEARBY_PEOPLE.map((p, i) => {
                const positions = [
                  { top: '8%', left: '5%' },
                  { top: '10%', right: '4%' },
                  { bottom: '35%', left: '3%' },
                ];
                const pos = positions[i];
                return (
                  <div key={p.name} className="absolute z-20"
                    style={{ ...pos, animation: `fade-in 0.5s ease-out both, float 4.5s ease-in-out ${i * 0.7}s infinite`, animationDelay: `${i * 0.15}s` }}>
                    <div className="flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 liquid-glass" style={{ borderRadius: '100px' }}>
                      <div className="relative shrink-0">
                        <GradientAvatar name={p.name} size={30} showInitials={false} />
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-[1.5px] border-background" style={{ background: 'hsl(var(--success))' }} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-foreground leading-none">{p.name}</p>
                        <p className="text-[8px] text-muted-foreground mt-0.5">{p.distance}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Dashed connection lines */}
              <svg className="absolute inset-0 w-full h-full z-[5] pointer-events-none" viewBox="0 0 320 390">
                <line x1="160" y1="140" x2="72" y2="60" stroke="hsl(211 100% 50% / 0.1)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="160" y1="140" x2="265" y2="68" stroke="hsl(211 100% 50% / 0.1)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="160" y1="140" x2="55" y2="240" stroke="hsl(211 100% 50% / 0.1)" strokeWidth="1" strokeDasharray="4 4" />
              </svg>

              {/* Bottom section */}
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-10 bg-gradient-to-t from-background via-background/90 to-transparent z-30">
                {/* Activity chips */}
                <div className="flex justify-center gap-2.5 mb-3">
                  {(
                    [
                      { category: 'chai' as Category, count: 3 },
                      { category: 'walk' as Category, count: 2 },
                      { category: 'sports' as Category, count: 4 },
                      { category: 'food' as Category, count: 1 },
                    ] as { category: Category; count: number }[]
                  ).map((a, i) => (
                    <div key={i} className="flex flex-col items-center gap-1"
                      style={{ animation: 'scale-in 0.3s ease-out both', animationDelay: `${0.4 + i * 0.08}s` }}>
                      <CategoryIcon category={a.category} size="md" className="liquid-glass" />
                      <span className="text-[8px] font-bold text-muted-foreground">{a.count} plans</span>
                    </div>
                  ))}
                </div>

                {/* Live counter */}
                <div className="flex items-center justify-between px-3.5 py-2.5 liquid-glass-heavy" style={{ borderRadius: '1rem' }}>
                  <div className="flex -space-x-2">
                    {NEARBY_PEOPLE.map((p, i) => (
                      <GradientAvatar key={i} name={p.name} size={24} showInitials={false} className="border-2 border-background" />
                    ))}
                    <div className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-background" style={{ background: 'hsl(var(--primary) / 0.12)' }}>
                      <span className="text-[8px] font-bold text-primary">+5</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'hsl(var(--success))' }} />
                    <span className="text-[10px] text-foreground font-bold">8 active nearby</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      /* ═══════════════════════════════════
         SLIDE 2 — Real-time notifications
         ═══════════════════════════════════ */
      case 'realtime':
        return (
          <div className="w-full max-w-[300px]">
            {/* Phone mockup */}
            <div className="relative rounded-[28px] overflow-hidden" style={{
              background: 'hsla(var(--glass-bg) / 0.3)',
              backdropFilter: 'blur(var(--glass-blur-heavy)) saturate(200%)',
              WebkitBackdropFilter: 'blur(var(--glass-blur-heavy)) saturate(200%)',
              border: '0.5px solid hsla(var(--glass-border) / 0.4)',
              boxShadow: '0 8px 40px hsla(var(--glass-shadow-lg)), inset 0 0.5px 0 hsla(var(--glass-highlight))',
            }}>
              {/* Notch */}
              <div className="flex justify-center pt-2 pb-3">
                <div className="w-20 h-5 rounded-full bg-foreground/10" />
              </div>

              {/* Notification badge */}
              <div className="absolute top-2 right-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center animate-bounce" style={{
                  background: 'hsl(var(--destructive))',
                  boxShadow: '0 2px 8px hsl(var(--destructive) / 0.4)',
                }}>
                  <span className="text-[10px] font-bold" style={{ color: 'hsl(var(--destructive-foreground))' }}>3</span>
                </div>
              </div>
              
              <div className="px-3 pb-4 space-y-2">
                {LIVE_ACTIVITY.map((item, i) => (
                  <div
                    key={i}
                    className="liquid-glass flex items-start gap-2.5 px-3 py-3"
                    style={{ 
                      borderRadius: '1rem',
                      animation: 'fade-in 0.4s ease-out both',
                      animationDelay: `${i * 0.12}s`,
                    }}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{
                      background: `hsl(var(--${item.accent}) / 0.12)`,
                    }}>
                      <span className="text-base">{item.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold leading-tight text-foreground">{item.text}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        <span className="text-[8px]">⚡</span>
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Live indicator */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'hsl(var(--success))' }} />
              <span className="text-[10px] font-semibold" style={{ color: 'hsl(var(--success))' }}>Live updates every second</span>
            </div>
          </div>
        );

      /* ═══════════════════════════════════
         SLIDE 3 — Safety shield
         ═══════════════════════════════════ */
      case 'safe':
        return (
          <div className="relative w-full max-w-[320px]">
            <div className="relative rounded-[28px] overflow-hidden" style={{ height: 370 }}>
              {/* Ambient background */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-background to-primary/6" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[90px]" style={{ background: 'hsl(var(--success) / 0.15)' }} />
                <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full blur-[70px]" style={{ background: 'hsl(var(--primary) / 0.1)' }} />
              </div>

              {/* Subtle dot grid */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'radial-gradient(hsl(var(--foreground)) 0.5px, transparent 0.5px)',
                backgroundSize: '16px 16px',
              }} />
              
              {/* Central shield */}
              <div className="absolute top-[26%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                {/* Protective rings */}
                {[0, 1].map(i => (
                  <div key={i} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      width: `${100 + i * 48}px`,
                      height: `${100 + i * 48}px`,
                      border: `1.5px solid hsl(var(--success) / ${0.2 - i * 0.07})`,
                      animation: `pulse ${2.5 + i * 0.5}s ease-in-out infinite`,
                      animationDelay: `${i * 0.4}s`,
                    }} />
                ))}
                
                {/* Shield orb */}
                <div className="relative">
                  <div className="absolute inset-0 w-24 h-24 -m-2 rounded-full blur-3xl animate-pulse" style={{ background: 'hsl(var(--success) / 0.25)' }} />
                  <div className="relative w-20 h-20 rounded-[1.5rem] flex items-center justify-center border-4 border-background" style={{
                    background: 'linear-gradient(145deg, hsl(var(--success)) 0%, hsl(152 55% 34%) 100%)',
                    boxShadow: '0 8px 32px hsl(var(--success) / 0.35), inset 0 1px 0 hsla(0 0% 100% / 0.2)',
                  }}>
                    <span className="text-[36px]">🛡️</span>
                  </div>
                  {/* Checkmark badge */}
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2" style={{
                    background: 'hsl(var(--success))',
                    borderColor: 'hsl(var(--background))',
                    boxShadow: '0 2px 8px hsl(var(--success) / 0.3)',
                  }}>
                    <span className="text-[12px]">✓</span>
                  </div>
                </div>
              </div>
              
              {/* Blocked message floaters */}
              <div className="absolute top-[12%] left-[5%] z-20" style={{ animation: 'float 5s ease-in-out infinite' }}>
                <div className="relative px-3 py-2 liquid-glass" style={{ borderRadius: '0.75rem', borderColor: 'hsl(var(--destructive) / 0.2)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🚫</span>
                    <span className="text-[10px] font-medium line-through" style={{ color: 'hsl(var(--destructive) / 0.7)' }}>Random DM</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{
                    background: 'hsl(var(--destructive))',
                  }}>
                    <span className="text-[8px] font-bold" style={{ color: 'hsl(var(--destructive-foreground))' }}>✕</span>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-[6%] right-[6%] z-20" style={{ animation: 'float 5s ease-in-out 1s infinite' }}>
                <div className="relative px-3 py-2 liquid-glass transform rotate-3" style={{ borderRadius: '0.75rem', borderColor: 'hsl(var(--destructive) / 0.2)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">👻</span>
                    <span className="text-[10px] font-medium line-through" style={{ color: 'hsl(var(--destructive) / 0.7)' }}>Stalker</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{
                    background: 'hsl(var(--destructive))',
                  }}>
                    <span className="text-[8px] font-bold" style={{ color: 'hsl(var(--destructive-foreground))' }}>✕</span>
                  </div>
                </div>
              </div>
              
              {/* Trust features */}
              <div className="absolute bottom-0 left-0 right-0 px-4 pt-4 pb-4 bg-gradient-to-t from-background/95 via-background/80 to-transparent z-30">
                <div className="space-y-2">
                  {TRUST_FEATURES.map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-3 py-2.5 liquid-glass"
                      style={{
                        borderRadius: '0.875rem',
                        animation: 'fade-in 0.4s ease-out forwards',
                        animationDelay: `${i * 0.1}s`,
                      }}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{
                        background: 'hsl(var(--success) / 0.12)',
                        border: '0.5px solid hsl(var(--success) / 0.15)',
                      }}>
                        <span className="text-base">{feature.emoji}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-foreground">{feature.label}</p>
                        <p className="text-[9px] text-muted-foreground">{feature.desc}</p>
                      </div>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'hsl(var(--success) / 0.15)' }}>
                        <span className="text-[10px]" style={{ color: 'hsl(var(--success))' }}>✓</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      /* ═══════════════════════════════════
         SLIDE 4 — Credits / Level up
         ═══════════════════════════════════ */
      case 'credits':
        return (
          <div className="w-full max-w-[320px]">
            <div className="relative rounded-[28px] overflow-hidden" style={{ height: 380 }}>
              {/* Ambient gradient */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent/6" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-48 rounded-full blur-[80px]" style={{ background: 'hsl(var(--primary) / 0.15)' }} />
                <div className="absolute bottom-0 right-0 w-44 h-44 rounded-full blur-[70px]" style={{ background: 'hsl(var(--accent) / 0.12)' }} />
              </div>

              {/* Dot pattern */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'radial-gradient(hsl(var(--foreground)) 0.5px, transparent 0.5px)',
                backgroundSize: '16px 16px',
              }} />

              <div className="relative z-10 px-5 pt-5 pb-4 h-full flex flex-col">
                {/* Credit orb */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 w-20 h-20 -m-2 rounded-full blur-3xl animate-pulse" style={{ background: 'hsl(var(--primary) / 0.2)' }} />
                    <div className="relative w-16 h-16 rounded-[1.25rem] flex items-center justify-center border-4 border-background" style={{
                      background: 'linear-gradient(145deg, hsl(var(--primary)) 0%, hsl(211 100% 38%) 100%)',
                      boxShadow: '0 8px 32px hsl(var(--primary) / 0.3), inset 0 1px 0 hsla(0 0% 100% / 0.2)',
                    }}>
                      <span className="text-[28px]">⭐</span>
                    </div>
                    {/* Floating +1 */}
                    <div className="absolute -top-2 -right-3 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{
                      background: 'hsl(var(--success))',
                      color: 'hsl(var(--success-foreground))',
                      boxShadow: '0 2px 8px hsl(var(--success) / 0.3)',
                      animation: 'float 3s ease-in-out infinite',
                    }}>
                      +1.0
                    </div>
                  </div>
                </div>

                {/* Balance display */}
                <div className="text-center mb-5">
                  <p className="text-[30px] font-bold text-foreground tracking-tight leading-none">2.5</p>
                  <p className="text-[11px] text-muted-foreground font-medium mt-1">starter credits</p>
                </div>

                {/* Journey steps — connected */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-[19px] top-5 bottom-5 w-[2px] rounded-full" style={{
                      background: 'linear-gradient(to bottom, hsl(var(--primary) / 0.25), hsl(var(--success) / 0.3), hsl(var(--accent) / 0.25))',
                    }} />
                    
                    <div className="space-y-3">
                      {[
                        { emoji: '📍', text: 'Join a plan', detail: '-0.5', accent: 'primary' },
                        { emoji: '🤝', text: 'Show up on time', detail: '+1.0', accent: 'success' },
                        { emoji: '⭐', text: 'Earn a great review', detail: '+0.5', accent: 'accent' },
                      ].map((step, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 relative"
                          style={{ animation: 'fade-in 0.4s ease-out forwards', animationDelay: `${i * 0.15}s` }}
                        >
                          <div className="w-10 h-10 rounded-xl liquid-glass flex items-center justify-center shrink-0 relative z-10" style={{
                            borderColor: `hsl(var(--${step.accent}) / 0.2)`,
                          }}>
                            <span className="text-base">{step.emoji}</span>
                          </div>
                          <p className="text-[12px] font-semibold text-foreground flex-1">{step.text}</p>
                          <span className={`text-[13px] font-bold tabular-nums`} style={{
                            color: step.detail.startsWith('+') ? 'hsl(var(--success))' : 'hsl(var(--muted-foreground))',
                          }}>{step.detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom tagline */}
                <div className="flex items-center justify-center gap-2 mt-3 px-3 py-2.5 liquid-glass" style={{ borderRadius: '0.875rem' }}>
                  <div className="flex -space-x-1.5">
                    {['🥇', '🥈', '🥉'].map((m, i) => (
                      <span key={i} className="text-sm">{m}</span>
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold text-foreground/80">Regulars get perks others don't</span>
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
      {/* Back button */}
      {currentSlide > 0 && (
        <div className="px-4 pt-4">
          <button 
            onClick={handleBack}
            className="flex items-center gap-1.5 text-muted-foreground tap-scale py-2 pr-3"
          >
            <span className="text-sm">←</span>
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      )}
      
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-4">
        <div ref={visualRef} className="mb-6 w-full flex justify-center">
          {renderVisual()}
        </div>
        
        <div ref={textRef} className="text-center max-w-[280px]">
          <h2 className="text-[22px] font-bold text-foreground mb-2 tracking-tight">{slide.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{slide.description}</p>
        </div>
      </div>
      
      {/* Bottom controls */}
      <div className="px-6 pb-10">
        {/* Dots */}
        <div className="flex justify-center gap-1.5 mb-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === currentSlide ? 24 : 6,
                background: i === currentSlide ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.2)',
              }}
            />
          ))}
        </div>
        
        <Button 
          className="w-full h-12 text-[15px] font-semibold"
          onClick={handleNext}
        >
          {isLastSlide ? "Let's go →" : 'Continue →'}
        </Button>
        
        {currentSlide < slides.length - 1 && (
          <button 
            className="w-full mt-3 py-2.5 text-sm font-semibold text-muted-foreground/50 hover:text-muted-foreground tap-scale transition-colors rounded-xl"
            onClick={handleSkip}
          >
            I'll figure it out
          </button>
        )}
      </div>
    </div>
  );
}
