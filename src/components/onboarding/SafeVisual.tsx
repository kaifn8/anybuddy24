import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function SafeVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shieldRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<HTMLDivElement>(null);
  const orbitsRef = useRef<(HTMLDivElement | null)[]>([]);

  const badges = ['✅', '🛡️', '⭐', '🔒', '👥', '✅'];

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
        { scale: 1, duration: 0.4, delay: 0.6, ease: 'back.out(2)' }
      );

      // Shield glow pulse
      gsap.to(shieldRef.current, {
        boxShadow: '0 0 40px hsl(152 55% 44% / 0.4), 0 0 80px hsl(152 55% 44% / 0.15)',
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Orbiting badges
      orbitsRef.current.forEach((el, i) => {
        if (!el) return;
        const angle = (i / badges.length) * Math.PI * 2;
        const radius = 105;
        gsap.fromTo(el,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.4, delay: 0.8 + i * 0.1, ease: 'back.out(1.5)' }
        );
        // Slow orbit
        gsap.to(el, {
          motionPath: undefined,
          keyframes: Array.from({ length: 5 }, (_, k) => {
            const a = angle + ((k + 1) / 5) * Math.PI * 2;
            return { x: Math.cos(a) * radius, y: Math.sin(a) * radius, duration: 3 };
          }),
          repeat: -1,
          ease: 'none',
          delay: 1,
        });
        // Set initial position
        gsap.set(el, { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative w-[280px] h-[280px] flex items-center justify-center">
      {/* Shield */}
      <div
        ref={shieldRef}
        className="relative z-10 w-24 h-28 rounded-b-[3rem] rounded-t-xl flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, hsl(152 55% 50%), hsl(180 50% 45%))',
          boxShadow: '0 0 20px hsl(152 55% 44% / 0.3)',
        }}
      >
        <div ref={checkRef} className="text-4xl drop-shadow-md">✓</div>
        {/* Shine */}
        <div className="absolute inset-0 rounded-b-[3rem] rounded-t-xl overflow-hidden">
          <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-white/25 to-transparent" />
        </div>
      </div>

      {/* Orbiting badges */}
      {badges.map((emoji, i) => (
        <div
          key={i}
          ref={el => { orbitsRef.current[i] = el; }}
          className="absolute z-10 w-9 h-9 rounded-full bg-card shadow-md border border-border flex items-center justify-center"
          style={{ left: 'calc(50% - 18px)', top: 'calc(50% - 18px)' }}
        >
          <span className="text-sm">{emoji}</span>
        </div>
      ))}
    </div>
  );
}
