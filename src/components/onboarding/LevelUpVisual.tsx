import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  angle: (i / 16) * Math.PI * 2,
  dist: gsap.utils.random(70, 130, 1),
  size: gsap.utils.random(4, 10, 1),
  color: ['#3B82F6', '#F59E0B', '#A78BFA', '#EC4899', '#10B981', '#F97316'][i % 6],
  delay: gsap.utils.random(0, 0.5),
  shape: i % 3, // 0=circle, 1=square, 2=triangle
}));

export default function LevelUpVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trophyRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<(HTMLDivElement | null)[]>([]);
  const particlesRef = useRef<(HTMLDivElement | null)[]>([]);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Trophy bounce in
      gsap.fromTo(trophyRef.current,
        { y: 50, scale: 0, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.6)' }
      );

      // Glow pulse
      gsap.to(glowRef.current, {
        opacity: 0.6,
        scale: 1.1,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.8,
      });

      // XP bar fill
      gsap.fromTo(fillRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.2, delay: 0.5, ease: 'power2.out', transformOrigin: 'left' }
      );

      // Stars pop
      starsRef.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(el,
          { scale: 0, rotation: -180 },
          { scale: 1, rotation: 0, duration: 0.5, delay: 0.8 + i * 0.15, ease: 'back.out(2)' }
        );
        gsap.to(el, {
          y: gsap.utils.random(-6, 6),
          rotation: gsap.utils.random(-10, 10),
          duration: gsap.utils.random(1.5, 2.5),
          repeat: -1, yoyo: true, ease: 'sine.inOut',
          delay: 1.5,
        });
      });

      // Confetti particles burst
      particlesRef.current.forEach((el, i) => {
        if (!el) return;
        const p = PARTICLES[i];
        gsap.fromTo(el,
          { scale: 0, opacity: 1, x: 0, y: 0, rotation: 0 },
          {
            scale: gsap.utils.random(0.8, 1.5),
            opacity: 0,
            x: Math.cos(p.angle) * p.dist,
            y: Math.sin(p.angle) * p.dist,
            rotation: gsap.utils.random(-180, 180),
            duration: 1.4,
            delay: 0.6 + p.delay,
            ease: 'power2.out',
          }
        );
      });

      // Trophy gentle float
      gsap.to(trophyRef.current, {
        y: -8, duration: 2, repeat: -1, yoyo: true,
        ease: 'sine.inOut', delay: 1,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative w-[280px] h-[280px] flex items-center justify-center">
      {/* Confetti particles */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          ref={el => { particlesRef.current[i] = el; }}
          className="absolute"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            left: 'calc(50% - 4px)',
            top: 'calc(50% - 4px)',
            borderRadius: p.shape === 0 ? '50%' : p.shape === 1 ? '2px' : '0',
            clipPath: p.shape === 2 ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined,
          }}
        />
      ))}

      <div className="flex flex-col items-center gap-1">
        {/* Stars */}
        <div className="flex items-end gap-5">
          {['⭐', '🌟', '⭐'].map((s, i) => (
            <div
              key={i}
              ref={el => { starsRef.current[i] = el; }}
              className={i === 1 ? 'text-5xl -mb-1' : 'text-3xl mb-1'}
              style={{ filter: 'drop-shadow(0 2px 6px rgba(245,158,11,0.4))' }}
            >
              {s}
            </div>
          ))}
        </div>

        {/* Trophy with glow */}
        <div className="relative">
          <div
            ref={glowRef}
            className="absolute -inset-6 rounded-full bg-amber-400/30 blur-2xl opacity-40"
          />
          <div ref={trophyRef} className="relative text-[90px] leading-none" style={{ filter: 'drop-shadow(0 8px 16px rgba(245,158,11,0.35))' }}>
            🏆
          </div>
        </div>

        {/* XP Progress bar */}
        <div ref={barRef} className="w-52 mt-1">
          <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
            <span className="font-semibold">Level 4</span>
            <span className="font-medium">850 / 1000 XP</span>
          </div>
          <div className="h-3.5 rounded-full bg-muted/60 overflow-hidden shadow-inner">
            <div
              ref={fillRef}
              className="h-full rounded-full relative overflow-hidden"
              style={{
                background: 'linear-gradient(90deg, hsl(211 100% 50%), hsl(250 60% 60%))',
                transformOrigin: 'left',
              }}
            >
              {/* Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[shimmer_2s_infinite]" style={{ backgroundSize: '200% 100%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
