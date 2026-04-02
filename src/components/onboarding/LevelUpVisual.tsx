import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  angle: (i / 12) * Math.PI * 2,
  dist: gsap.utils.random(60, 120, 1),
  size: gsap.utils.random(4, 10, 1),
  color: ['#3B82F6', '#F59E0B', '#A78BFA', '#EC4899', '#10B981'][i % 5],
  delay: gsap.utils.random(0, 0.5),
}));

export default function LevelUpVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trophyRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<(HTMLDivElement | null)[]>([]);
  const particlesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Trophy bounce in
      gsap.fromTo(trophyRef.current,
        { y: 40, scale: 0, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(1.6)' }
      );

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
          y: gsap.utils.random(-5, 5),
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
          { scale: 0, opacity: 1, x: 0, y: 0 },
          {
            scale: 1, opacity: 0,
            x: Math.cos(p.angle) * p.dist,
            y: Math.sin(p.angle) * p.dist,
            duration: 1.2,
            delay: 0.6 + p.delay,
            ease: 'power2.out',
          }
        );
      });

      // Trophy gentle float
      gsap.to(trophyRef.current, {
        y: -6, duration: 2, repeat: -1, yoyo: true,
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
          className="absolute rounded-full"
          style={{
            width: p.size, height: p.size,
            background: p.color,
            left: 'calc(50% - 4px)', top: 'calc(50% - 4px)',
          }}
        />
      ))}

      <div className="flex flex-col items-center gap-4">
        {/* Stars */}
        <div className="flex items-end gap-2">
          {['⭐', '🌟', '⭐'].map((s, i) => (
            <div
              key={i}
              ref={el => { starsRef.current[i] = el; }}
              className={i === 1 ? 'text-3xl -mb-1' : 'text-xl'}
            >
              {s}
            </div>
          ))}
        </div>

        {/* Trophy */}
        <div ref={trophyRef} className="text-7xl drop-shadow-lg">🏆</div>

        {/* XP Progress bar */}
        <div ref={barRef} className="w-40 mt-2">
          <div className="flex justify-between text-2xs text-muted-foreground mb-1">
            <span>Level 4</span>
            <span>850 / 1000 XP</span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              ref={fillRef}
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, hsl(211 100% 50%), hsl(260 36% 56%))',
                transformOrigin: 'left',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
