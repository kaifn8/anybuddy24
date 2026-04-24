import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function SafeVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const shieldRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<SVGPathElement>(null);
  const orbitsRef = useRef<(HTMLDivElement | null)[]>([]);
  const ringRef = useRef<HTMLDivElement>(null);

  // Brand palette: success green core + primary/secondary/accent halo
  const badges = [
    { emoji: '✅', color: 'hsl(152 55% 44%)' },
    { emoji: '🛡️', color: 'hsl(211 100% 50%)' },
    { emoji: '⭐', color: 'hsl(36 85% 58%)' },
    { emoji: '🔒', color: 'hsl(260 50% 60%)' },
    { emoji: '👥', color: 'hsl(195 75% 52%)' },
    { emoji: '💎', color: 'hsl(180 65% 50%)' },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Plate fade in (matches DiscoverVisual)
      gsap.fromTo(
        plateRef.current,
        { opacity: 0, scale: 0.94, y: 8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: 'power3.out' }
      );

      // Shield entrance
      gsap.fromTo(
        shieldRef.current,
        { scale: 0.4, rotateY: -60, y: 16, opacity: 0 },
        { scale: 1, rotateY: 0, y: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: 'back.out(1.5)' }
      );

      // Checkmark draw-in
      if (checkRef.current) {
        const length = checkRef.current.getTotalLength();
        gsap.set(checkRef.current, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(checkRef.current, {
          strokeDashoffset: 0,
          duration: 0.4,
          delay: 0.4,
          ease: 'power2.out',
        });
      }

      // Shield gentle float
      gsap.to(shieldRef.current, {
        y: -6,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.7,
      });

      // Orbit ring slow rotation
      if (ringRef.current) {
        gsap.to(ringRef.current, {
          rotation: 360,
          duration: 24,
          repeat: -1,
          ease: 'none',
        });
      }

      // Orbiting badges
      orbitsRef.current.forEach((el, i) => {
        if (!el) return;
        const angle = (i / badges.length) * Math.PI * 2;
        const radius = 92;
        gsap.set(el, { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
        gsap.fromTo(
          el,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            delay: 0.5 + i * 0.06,
            ease: 'back.out(1.5)',
          }
        );
        // Slow orbit
        gsap.to(el, {
          keyframes: Array.from({ length: 6 }, (_, k) => {
            const a = angle + ((k + 1) / 6) * Math.PI * 2;
            return { x: Math.cos(a) * radius, y: Math.sin(a) * radius, duration: 5 };
          }),
          repeat: -1,
          ease: 'none',
          delay: 0.8,
        });
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
            'radial-gradient(circle at 50% 50%, hsl(var(--success) / 0.18) 0%, transparent 70%)',
          filter: 'blur(8px)',
        }}
      />

      {/* Plate */}
      <div
        ref={plateRef}
        className="relative w-[90%] aspect-square rounded-[32px] overflow-hidden flex items-center justify-center"
        style={{
          background:
            'linear-gradient(135deg, hsl(150 40% 97%) 0%, hsl(155 35% 93%) 100%)',
          boxShadow: [
            '0 20px 50px -12px hsl(160 50% 30% / 0.25)',
            '0 8px 20px -8px hsl(160 50% 30% / 0.15)',
            'inset 0 1.5px 0 hsl(0 0% 100% / 0.9)',
            '0 0 0 1px hsl(150 30% 88%)',
          ].join(', '),
        }}
      >
        {/* Soft inner radial wash */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 45%, hsl(var(--success) / 0.12) 0%, transparent 65%)',
          }}
        />

        {/* Decorative orbit ring */}
        <div ref={ringRef} className="absolute w-[190px] h-[190px]">
          <div
            className="absolute inset-0 rounded-full border border-dashed"
            style={{ borderColor: 'hsl(var(--success) / 0.32)' }}
          />
          {[0, 90, 180, 270].map((deg) => (
            <div
              key={deg}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transform: `rotate(${deg}deg) translateY(-95px) translateX(-50%)`,
                background: 'hsl(var(--success) / 0.55)',
              }}
            />
          ))}
        </div>

        {/* Shield */}
        <div className="relative z-10">
          <div
            className="absolute -inset-6 rounded-[2.5rem] blur-2xl"
            style={{ background: 'hsl(var(--success) / 0.3)' }}
          />
          <div
            ref={shieldRef}
            className="relative w-[86px] h-[100px] flex items-center justify-center"
            style={{
              background:
                'linear-gradient(155deg, hsl(152 65% 58%) 0%, hsl(var(--success)) 50%, hsl(170 55% 36%) 100%)',
              borderRadius: '22px 22px 44px 44px / 22px 22px 52px 52px',
              boxShadow:
                '0 14px 36px hsl(var(--success) / 0.5), inset 0 2px 0 hsl(0 0% 100% / 0.35), inset 0 -3px 8px hsl(160 60% 25% / 0.4), 0 0 0 2.5px hsl(0 0% 100%)',
            }}
          >
            <div
              className="absolute inset-[3px]"
              style={{
                borderRadius: '19px 19px 41px 41px / 19px 19px 49px 49px',
                border: '1px solid hsl(0 0% 100% / 0.25)',
              }}
            />
            <div
              className="absolute top-1 left-2 right-2 h-7 opacity-50"
              style={{
                background:
                  'radial-gradient(ellipse at center top, hsl(0 0% 100% / 0.7), transparent 70%)',
                borderRadius: '18px 18px 36px 36px',
              }}
            />
            <svg
              width="40"
              height="40"
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
            style={{ left: 'calc(50% - 18px)', top: 'calc(50% - 18px)' }}
          >
            <div className="relative">
              <div
                className="absolute -inset-1 rounded-full blur-md opacity-50"
                style={{ background: b.color }}
              />
              <div
                className="relative w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  background:
                    'radial-gradient(circle at 32% 26%, hsl(0 0% 100%), hsl(0 0% 98%) 60%, ' + b.color + '20)',
                  boxShadow: `0 6px 14px ${b.color}55, 0 1.5px 4px hsl(0 0% 0% / 0.1), inset 0 1px 0 hsl(0 0% 100% / 0.95), 0 0 0 2px ${b.color}`,
                }}
              >
                <span className="text-[14px] leading-none">{b.emoji}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Subtle vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, transparent 55%, hsl(160 30% 20% / 0.08) 100%)',
          }}
        />
      </div>
    </div>
  );
}
