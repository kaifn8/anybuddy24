import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function SafeVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shieldRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<SVGPathElement>(null);
  const orbitsRef = useRef<(HTMLDivElement | null)[]>([]);
  const ringRef = useRef<HTMLDivElement>(null);

  const badges = [
    { emoji: '✅', color: '#10B981' },
    { emoji: '🛡️', color: '#3B82F6' },
    { emoji: '⭐', color: '#F59E0B' },
    { emoji: '🔒', color: '#6366F1' },
    { emoji: '👥', color: '#EC4899' },
    { emoji: '💎', color: '#06B6D4' },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Shield entrance
      gsap.fromTo(
        shieldRef.current,
        { scale: 0, rotateY: -90, y: 20 },
        { scale: 1, rotateY: 0, y: 0, duration: 0.9, ease: 'back.out(1.4)' }
      );

      // Checkmark draw-in
      if (checkRef.current) {
        const length = checkRef.current.getTotalLength();
        gsap.set(checkRef.current, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(checkRef.current, {
          strokeDashoffset: 0,
          duration: 0.6,
          delay: 0.7,
          ease: 'power2.out',
        });
      }

      // Shield gentle float
      gsap.to(shieldRef.current, {
        y: -6,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1,
      });

      // Orbit ring slow rotation
      if (ringRef.current) {
        gsap.to(ringRef.current, {
          rotation: 360,
          duration: 30,
          repeat: -1,
          ease: 'none',
        });
      }

      // Orbiting badges
      orbitsRef.current.forEach((el, i) => {
        if (!el) return;
        const angle = (i / badges.length) * Math.PI * 2;
        const radius = 105;
        gsap.set(el, { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
        gsap.fromTo(
          el,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            delay: 0.9 + i * 0.1,
            ease: 'back.out(1.6)',
          }
        );
        // Slow orbit
        gsap.to(el, {
          keyframes: Array.from({ length: 6 }, (_, k) => {
            const a = angle + ((k + 1) / 6) * Math.PI * 2;
            return { x: Math.cos(a) * radius, y: Math.sin(a) * radius, duration: 4 };
          }),
          repeat: -1,
          ease: 'none',
          delay: 1.2,
        });
        // Subtle bob
        gsap.to(el, {
          scale: 1.06,
          duration: gsap.utils.random(1.5, 2.5),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1.5 + i * 0.2,
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-[280px] h-[280px] flex items-center justify-center"
    >
      {/* Ambient backdrop */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle at center, hsl(152 55% 50% / 0.12) 0%, transparent 65%)',
        }}
      />

      {/* Decorative orbit ring */}
      <div ref={ringRef} className="absolute w-[210px] h-[210px]">
        <div className="absolute inset-0 rounded-full border border-dashed border-emerald-400/25" />
        {/* Tick marks on the ring */}
        {[0, 90, 180, 270].map((deg) => (
          <div
            key={deg}
            className="absolute w-1 h-1 rounded-full bg-emerald-400/40"
            style={{
              left: '50%',
              top: '50%',
              transform: `rotate(${deg}deg) translateY(-105px) translateX(-50%)`,
            }}
          />
        ))}
      </div>

      {/* Shield */}
      <div className="relative z-10">
        {/* Outer glow */}
        <div className="absolute -inset-6 rounded-[2.5rem] bg-emerald-400/20 blur-2xl" />
        <div
          ref={shieldRef}
          className="relative w-[96px] h-[110px] flex items-center justify-center"
          style={{
            background:
              'linear-gradient(155deg, hsl(152 60% 60%) 0%, hsl(160 55% 48%) 45%, hsl(170 50% 38%) 100%)',
            borderRadius: '24px 24px 48px 48px / 24px 24px 56px 56px',
            boxShadow:
              '0 14px 36px hsl(152 55% 35% / 0.45), inset 0 2px 0 hsl(0 0% 100% / 0.35), inset 0 -3px 8px hsl(160 60% 25% / 0.4)',
          }}
        >
          {/* Inner border highlight */}
          <div
            className="absolute inset-[3px]"
            style={{
              borderRadius: '21px 21px 45px 45px / 21px 21px 53px 53px',
              border: '1px solid hsl(0 0% 100% / 0.25)',
            }}
          />
          {/* Glossy top highlight */}
          <div
            className="absolute top-1 left-2 right-2 h-8 opacity-50"
            style={{
              background:
                'radial-gradient(ellipse at center top, hsl(0 0% 100% / 0.7), transparent 70%)',
              borderRadius: '20px 20px 40px 40px',
            }}
          />
          {/* Drawn checkmark */}
          <svg
            width="44"
            height="44"
            viewBox="0 0 44 44"
            className="relative z-10"
            style={{ filter: 'drop-shadow(0 2px 4px hsl(160 60% 20% / 0.5))' }}
          >
            <path
              ref={checkRef}
              d="M10 23 L19 32 L34 14"
              fill="none"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Orbiting badges */}
      {badges.map((b, i) => (
        <div
          key={i}
          ref={(el) => {
            orbitsRef.current[i] = el;
          }}
          className="absolute z-10 flex items-center justify-center"
          style={{ left: 'calc(50% - 20px)', top: 'calc(50% - 20px)' }}
        >
          <div className="relative">
            <div
              className="absolute -inset-1 rounded-full blur-md opacity-40"
              style={{ background: b.color }}
            />
            <div
              className="relative w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background:
                  'linear-gradient(145deg, hsl(0 0% 100%), hsl(0 0% 96%))',
                boxShadow: `0 6px 16px ${b.color}40, inset 0 1px 0 hsl(0 0% 100%), 0 0 0 1.5px ${b.color}30`,
              }}
            >
              <span className="text-[15px]">{b.emoji}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
