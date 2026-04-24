import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Trust scene: a clean profile card sits center-stage with three
 * floating "trust signal" chips (verified, rating, completed plans)
 * orbiting near it. Same plate aesthetic as DiscoverVisual.
 */

const CHIPS = [
  {
    id: 'verified',
    label: 'Verified',
    icon: '✓',
    iconBg: 'hsl(211 100% 50%)',
    x: 8,
    y: 18,
  },
  {
    id: 'rating',
    label: '4.9',
    icon: '★',
    iconBg: 'hsl(36 92% 55%)',
    x: 76,
    y: 14,
  },
  {
    id: 'plans',
    label: '12 plans',
    icon: '🤝',
    iconBg: 'hsl(152 55% 44%)',
    x: 78,
    y: 70,
  },
];

export default function SafeVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<SVGPathElement>(null);
  const chipsRef = useRef<(HTMLDivElement | null)[]>([]);
  const linesRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        plateRef.current,
        { opacity: 0, scale: 0.94, y: 8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: 'power3.out' }
      );

      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 14, scale: 0.92 },
        { opacity: 1, y: 0, scale: 1, duration: 0.55, delay: 0.2, ease: 'back.out(1.4)' }
      );

      // Floating bob
      gsap.to(cardRef.current, {
        y: -4,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.9,
      });

      // Animated checkmark
      if (checkRef.current) {
        const len = checkRef.current.getTotalLength();
        gsap.set(checkRef.current, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(checkRef.current, {
          strokeDashoffset: 0,
          duration: 0.45,
          delay: 0.55,
          ease: 'power2.out',
        });
      }

      // Connector lines draw in
      if (linesRef.current) {
        const paths = linesRef.current.querySelectorAll('path');
        paths.forEach((p, i) => {
          const len = (p as SVGPathElement).getTotalLength();
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
          gsap.to(p, {
            strokeDashoffset: 0,
            opacity: 1,
            duration: 0.5,
            delay: 0.5 + i * 0.1,
            ease: 'power2.out',
          });
        });
      }

      // Chips fly in then idle bob
      chipsRef.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.6, y: 8 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.45,
            delay: 0.7 + i * 0.12,
            ease: 'back.out(1.8)',
          }
        );
        gsap.to(el, {
          y: gsap.utils.random(-3, -6),
          duration: gsap.utils.random(2.2, 3),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1.4 + i * 0.15,
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
      {/* Ambient backdrop glow */}
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
        className="relative w-[90%] aspect-square rounded-[32px] overflow-hidden"
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
              'radial-gradient(circle at 50% 50%, hsl(var(--success) / 0.10) 0%, transparent 65%)',
          }}
        />

        {/* Subtle grid texture */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 260 260">
          <defs>
            <pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="hsl(160 40% 25%)" />
            </pattern>
          </defs>
          <rect width="260" height="260" fill="url(#dots)" />
        </svg>

        {/* Connector lines from card to chips */}
        <svg
          ref={linesRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 260 260"
          fill="none"
        >
          {/* Card center is roughly (130, 130). Chip centers (approx %): */}
          {/* verified (8,18) → (21, 47); rating (76,14) → (197, 36); plans (78,70) → (203, 182) */}
          <path
            d="M 110 120 Q 70 90 40 60"
            stroke="hsl(var(--success) / 0.45)"
            strokeWidth="1.5"
            strokeDasharray="3 4"
            strokeLinecap="round"
          />
          <path
            d="M 150 115 Q 180 90 197 50"
            stroke="hsl(36 80% 50% / 0.5)"
            strokeWidth="1.5"
            strokeDasharray="3 4"
            strokeLinecap="round"
          />
          <path
            d="M 158 145 Q 190 165 200 190"
            stroke="hsl(211 90% 50% / 0.45)"
            strokeWidth="1.5"
            strokeDasharray="3 4"
            strokeLinecap="round"
          />
        </svg>

        {/* Center profile card */}
        <div
          ref={cardRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
          style={{ width: 132 }}
        >
          <div
            className="relative rounded-2xl px-3 py-3 flex flex-col items-center"
            style={{
              background: 'linear-gradient(160deg, hsl(0 0% 100%), hsl(0 0% 98%))',
              boxShadow: [
                '0 14px 32px -8px hsl(160 50% 25% / 0.28)',
                '0 4px 10px -4px hsl(160 50% 25% / 0.15)',
                'inset 0 1.5px 0 hsl(0 0% 100%)',
                '0 0 0 1px hsl(150 25% 88%)',
              ].join(', '),
            }}
          >
            {/* Avatar */}
            <div className="relative mb-2">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-[22px] font-bold text-white"
                style={{
                  background:
                    'linear-gradient(135deg, hsl(265 70% 62%), hsl(220 80% 55%))',
                  boxShadow:
                    '0 6px 14px hsl(220 70% 40% / 0.4), inset 0 1.5px 0 hsl(0 0% 100% / 0.4), 0 0 0 2.5px hsl(0 0% 100%)',
                }}
              >
                S
              </div>
              {/* Verified tick on avatar */}
              <div
                className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                style={{
                  background:
                    'radial-gradient(circle at 32% 26%, hsl(211 100% 65%), hsl(211 100% 48%))',
                  boxShadow:
                    '0 2px 6px hsl(211 100% 40% / 0.5), 0 0 0 2px hsl(0 0% 100%)',
                }}
              >
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                  <path
                    ref={checkRef}
                    d="M3 7.2 L6 10 L11 4.5"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Name */}
            <div className="text-[12px] font-bold text-foreground leading-tight">
              Sarah, 26
            </div>

            {/* Rating row */}
            <div className="flex items-center gap-0.5 mt-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className="text-[9px] leading-none"
                  style={{ color: 'hsl(36 92% 55%)' }}
                >
                  ★
                </span>
              ))}
              <span className="text-[9px] text-muted-foreground ml-0.5 font-medium">
                4.9
              </span>
            </div>

            {/* Trust pill */}
            <div
              className="mt-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
              style={{
                background: 'linear-gradient(135deg, hsl(152 55% 92%), hsl(152 55% 86%))',
                color: 'hsl(152 55% 28%)',
                boxShadow: 'inset 0 0 0 1px hsl(152 55% 75%)',
              }}
            >
              Trusted
            </div>
          </div>
        </div>

        {/* Trust signal chips */}
        {CHIPS.map((chip, i) => (
          <div
            key={chip.id}
            ref={(el) => {
              chipsRef.current[i] = el;
            }}
            className="absolute z-10"
            style={{ left: `${chip.x}%`, top: `${chip.y}%` }}
          >
            <div
              className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full"
              style={{
                background: 'linear-gradient(160deg, hsl(0 0% 100%), hsl(0 0% 97%))',
                boxShadow: [
                  '0 6px 14px hsl(160 30% 20% / 0.16)',
                  '0 1.5px 4px hsl(0 0% 0% / 0.08)',
                  'inset 0 1px 0 hsl(0 0% 100%)',
                  '0 0 0 1px hsl(150 25% 88%)',
                ].join(', '),
              }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{
                  background: chip.iconBg,
                  boxShadow: `0 2px 4px ${chip.iconBg}80, inset 0 1px 0 hsl(0 0% 100% / 0.3)`,
                }}
              >
                {chip.icon}
              </div>
              <span className="text-[10px] font-bold text-foreground leading-none">
                {chip.label}
              </span>
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
