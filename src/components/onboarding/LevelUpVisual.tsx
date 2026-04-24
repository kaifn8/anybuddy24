import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Reduced particle count + brand palette for smoother perf
const BRAND_COLORS = [
  'hsl(211 100% 55%)', // primary
  'hsl(36 85% 58%)',   // accent gold
  'hsl(260 55% 62%)',  // secondary purple
  'hsl(152 55% 50%)',  // success
  'hsl(195 80% 55%)',  // sky
  'hsl(330 70% 60%)',  // pink
];
const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  angle: (i / 12) * Math.PI * 2 + gsap.utils.random(-0.15, 0.15),
  dist: gsap.utils.random(80, 140, 1),
  size: gsap.utils.random(4, 9, 1),
  color: BRAND_COLORS[i % BRAND_COLORS.length],
  delay: gsap.utils.random(0, 0.3),
  shape: i % 3, // 0=circle, 1=square, 2=triangle
}));

const RAYS = Array.from({ length: 6 }, (_, i) => ({
  angle: (i / 8) * 360,
}));

export default function LevelUpVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const trophyRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<(HTMLDivElement | null)[]>([]);
  const particlesRef = useRef<(HTMLDivElement | null)[]>([]);
  const glowRef = useRef<HTMLDivElement>(null);
  const raysRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Plate fade in (matches DiscoverVisual)
      gsap.fromTo(
        plateRef.current,
        { opacity: 0, scale: 0.94, y: 8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: 'power3.out' }
      );

      // Trophy bounce in
      gsap.fromTo(
        trophyRef.current,
        { y: 40, scale: 0.4, opacity: 0, rotate: -12 },
        { y: 0, scale: 1, opacity: 1, rotate: 0, duration: 0.6, delay: 0.2, ease: 'back.out(1.6)' }
      );

      // Glow pulse
      gsap.to(glowRef.current, {
        opacity: 0.7,
        scale: 1.15,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.5,
      });

      // Rays slow rotation
      if (raysRef.current) {
        gsap.fromTo(
          raysRef.current,
          { opacity: 0, scale: 0.5 },
          { opacity: 1, scale: 1, duration: 0.5, delay: 0.2, ease: 'power2.out' }
        );
        gsap.to(raysRef.current, {
          rotation: 360,
          duration: 16,
          repeat: -1,
          ease: 'none',
        });
      }

      // XP bar fill
      gsap.fromTo(
        fillRef.current,
        { scaleX: 0 },
        {
          scaleX: 0.85,
          duration: 0.9,
          delay: 0.35,
          ease: 'power2.out',
          transformOrigin: 'left',
        }
      );

      // Stars pop
      starsRef.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { scale: 0, rotation: -180, opacity: 0 },
          {
            scale: 1,
            rotation: 0,
            opacity: 1,
            duration: 0.4,
            delay: 0.5 + i * 0.08,
            ease: 'back.out(1.8)',
          }
        );
        gsap.to(el, {
          y: gsap.utils.random(-8, 8),
          rotation: gsap.utils.random(-12, 12),
          duration: gsap.utils.random(2.2, 3.2),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1,
        });
      });

      // Confetti particles burst
      particlesRef.current.forEach((el, i) => {
        if (!el) return;
        const p = PARTICLES[i];
        gsap.fromTo(
          el,
          { scale: 0, opacity: 1, x: 0, y: 0, rotation: 0 },
          {
            scale: gsap.utils.random(0.8, 1.5),
            opacity: 0,
            x: Math.cos(p.angle) * p.dist,
            y: Math.sin(p.angle) * p.dist,
            rotation: gsap.utils.random(-200, 200),
            duration: 1.2,
            delay: 0.4 + p.delay,
            ease: 'power2.out',
          }
        );
      });

      // Trophy gentle float
      gsap.to(trophyRef.current, {
        y: -10,
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.8,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[290px] aspect-square mx-auto flex items-center justify-center"
    >
      {/* Ambient backdrop glow (matches DiscoverVisual) */}
      <div
        className="absolute inset-0 rounded-[40px]"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, hsl(var(--accent) / 0.22) 0%, transparent 70%)',
          filter: 'blur(8px)',
        }}
      />

      {/* Plate */}
      <div
        ref={plateRef}
        className="relative w-[90%] aspect-square rounded-[32px] overflow-hidden flex items-center justify-center"
        style={{
          background:
            'linear-gradient(135deg, hsl(40 50% 97%) 0%, hsl(36 45% 93%) 100%)',
          boxShadow: [
            '0 20px 50px -12px hsl(36 60% 30% / 0.25)',
            '0 8px 20px -8px hsl(36 60% 30% / 0.15)',
            'inset 0 1.5px 0 hsl(0 0% 100% / 0.9)',
            '0 0 0 1px hsl(36 30% 88%)',
          ].join(', '),
        }}
      >
        {/* Soft inner radial wash */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 42%, hsl(var(--accent) / 0.16) 0%, transparent 65%)',
          }}
        />

        {/* Light rays */}
        <div
          ref={raysRef}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: 0 }}
        >
          {RAYS.map((r, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                width: '2px',
                height: '140px',
                background:
                  'linear-gradient(to bottom, transparent, hsl(var(--accent) / 0.45), transparent)',
                transform: `rotate(${r.angle}deg)`,
                transformOrigin: 'center',
              }}
            />
          ))}
        </div>

        {/* Confetti particles */}
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            ref={(el) => {
              particlesRef.current[i] = el;
            }}
            className="absolute"
            style={{
              width: p.size,
              height: p.size,
              background: p.color,
              left: 'calc(50% - 4px)',
              top: 'calc(50% - 4px)',
              borderRadius: p.shape === 0 ? '50%' : p.shape === 1 ? '2px' : '0',
              clipPath: p.shape === 2 ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined,
              boxShadow: `0 0 8px ${p.color}80`,
            }}
          />
        ))}

        <div className="flex flex-col items-center gap-1 relative z-10">
          {/* Stars */}
          <div className="flex items-end gap-5">
            {['⭐', '🌟', '⭐'].map((s, i) => (
              <div
                key={i}
                ref={(el) => {
                  starsRef.current[i] = el;
                }}
                className={i === 1 ? 'text-[42px] -mb-1' : 'text-[26px] mb-1.5'}
                style={{
                  filter:
                    'drop-shadow(0 4px 10px hsl(45 95% 50% / 0.55)) drop-shadow(0 0 16px hsl(45 95% 65% / 0.3))',
                }}
              >
                {s}
              </div>
            ))}
          </div>

          {/* Trophy with glow */}
          <div className="relative">
            <div
              ref={glowRef}
              className="absolute -inset-8 rounded-full opacity-40"
              style={{
                background:
                  'radial-gradient(circle, hsl(var(--accent) / 0.65) 0%, hsl(36 85% 50% / 0.32) 40%, transparent 70%)',
                filter: 'blur(20px)',
              }}
            />
            <div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-2.5 rounded-full opacity-40"
              style={{
                background:
                  'radial-gradient(ellipse, hsl(38 90% 30% / 0.6), transparent 70%)',
                filter: 'blur(6px)',
              }}
            />
            <div
              ref={trophyRef}
              className="relative text-[80px] leading-none"
              style={{
                filter:
                  'drop-shadow(0 10px 18px hsl(36 85% 35% / 0.5)) drop-shadow(0 2px 4px hsl(var(--accent) / 0.4))',
              }}
            >
              🏆
            </div>
          </div>

          {/* XP Progress bar */}
          <div className="w-48 mt-2">
            <div className="flex justify-between text-[10px] mb-1.5">
              <span className="font-bold text-foreground">Level 4</span>
              <span className="font-medium text-muted-foreground">850 / 1000 XP</span>
            </div>
            <div
              className="h-2.5 rounded-full overflow-hidden relative"
              style={{
                background: 'hsl(var(--muted) / 0.7)',
                boxShadow:
                  'inset 0 1px 2px hsl(220 20% 30% / 0.15), inset 0 -1px 0 hsl(0 0% 100% / 0.5)',
              }}
            >
              <div
                ref={fillRef}
                className="h-full rounded-full relative overflow-hidden"
                style={{
                  background:
                    'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(230 80% 60%) 50%, hsl(var(--secondary)) 100%)',
                  transformOrigin: 'left',
                  boxShadow:
                    '0 0 12px hsl(var(--primary) / 0.5), inset 0 1px 0 hsl(0 0% 100% / 0.4)',
                }}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-[shimmer_2.5s_infinite]"
                  style={{ backgroundSize: '200% 100%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Subtle vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, transparent 55%, hsl(36 30% 20% / 0.08) 100%)',
          }}
        />
      </div>
    </div>
  );
}
