import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function SafeVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shieldRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<HTMLDivElement>(null);
  const orbitsRef = useRef<(HTMLDivElement | null)[]>([]);

  const badges = [
    { emoji: '✅', color: '#10B981' },
    { emoji: '🛡️', color: '#3B82F6' },
    { emoji: '⭐', color: '#F59E0B' },
    { emoji: '🔒', color: '#6366F1' },
    { emoji: '👥', color: '#EC4899' },
    { emoji: '✅', color: '#10B981' },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Shield entrance
      gsap.fromTo(shieldRef.current,
        { scale: 0, rotateY: -90 },
        { scale: 1, rotateY: 0, duration: 0.8, ease: 'back.out(1.4)' }
      );

      // Checkmark pop
      gsap.fromTo(checkRef.current,
        { scale: 0 },
        { scale: 1, duration: 0.5, delay: 0.6, ease: 'back.out(2.5)' }
      );

      // Shield glow pulse
      gsap.to(shieldRef.current, {
        boxShadow: '0 0 50px hsl(152 55% 44% / 0.5), 0 0 100px hsl(152 55% 44% / 0.15)',
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Orbiting badges
      orbitsRef.current.forEach((el, i) => {
        if (!el) return;
        const angle = (i / badges.length) * Math.PI * 2;
        const radius = 100;
        gsap.set(el, { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
        gsap.fromTo(el,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.4, delay: 0.8 + i * 0.1, ease: 'back.out(1.5)' }
        );
        // Slow orbit
        gsap.to(el, {
          keyframes: Array.from({ length: 5 }, (_, k) => {
            const a = angle + ((k + 1) / 5) * Math.PI * 2;
            return { x: Math.cos(a) * radius, y: Math.sin(a) * radius, duration: 3 };
          }),
          repeat: -1,
          ease: 'none',
          delay: 1,
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative w-[280px] h-[280px] flex items-center justify-center">
      {/* Decorative orbit ring */}
      <div className="absolute w-[200px] h-[200px] rounded-full border border-dashed border-emerald-300/20" />

      {/* Shield */}
      <div className="relative z-10">
        <div className="absolute -inset-4 rounded-[2rem] bg-emerald-400/15 blur-xl" />
        <div
          ref={shieldRef}
          className="relative w-[88px] h-[100px] rounded-b-[3rem] rounded-t-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(145deg, hsl(152 55% 55%), hsl(168 50% 45%))',
            boxShadow: '0 0 30px hsl(152 55% 44% / 0.35)',
          }}
        >
          <div ref={checkRef} className="text-white text-4xl font-bold drop-shadow-md">✓</div>
          {/* Shine overlay */}
          <div className="absolute inset-0 rounded-b-[3rem] rounded-t-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-white/30 to-transparent" />
          </div>
          {/* Inner border highlight */}
          <div className="absolute inset-[2px] rounded-b-[2.8rem] rounded-t-[14px] border border-white/20" />
        </div>
      </div>

      {/* Orbiting badges */}
      {badges.map((b, i) => (
        <div
          key={i}
          ref={el => { orbitsRef.current[i] = el; }}
          className="absolute z-10 flex items-center justify-center"
          style={{ left: 'calc(50% - 18px)', top: 'calc(50% - 18px)' }}
        >
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-full blur-sm opacity-30" style={{ background: b.color }} />
            <div className="relative w-9 h-9 rounded-full bg-card shadow-md border border-border/50 flex items-center justify-center backdrop-blur-sm">
              <span className="text-sm">{b.emoji}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
