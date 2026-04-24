import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Progression scene — mirrors slide 1 & 2: focal subject at center
 * (current level badge with animated XP ring) surrounded by orbiting
 * tier pins. Same plate, pulse rings, and dashed connectors.
 */

type Tier = {
  id: string;
  emoji: string;
  label: string;
  color: string;
  x: number;
  y: number;
  state: 'done' | 'current' | 'future';
};

const TIERS: Tier[] = [
  { id: 'seed', emoji: '🌱', label: 'Seed', color: 'hsl(152 60% 48%)', x: 14, y: 22, state: 'done' },
  { id: 'solid', emoji: '💎', label: 'Solid', color: 'hsl(195 85% 52%)', x: 84, y: 22, state: 'done' },
  { id: 'trusted', emoji: '⭐', label: 'Trusted', color: 'hsl(36 92% 55%)', x: 14, y: 72, state: 'current' },
  { id: 'anchor', emoji: '👑', label: 'Anchor', color: 'hsl(265 70% 62%)', x: 84, y: 72, state: 'future' },
];

const RADIUS = 38;
const CIRC = 2 * Math.PI * RADIUS;
const PROGRESS = 0.7; // 70% to next level

export default function LevelUpVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const ringProgressRef = useRef<SVGCircleElement>(null);
  const tierRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pulseRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<SVGSVGElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const sparkleRefs = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        plateRef.current,
        { opacity: 0, scale: 0.94, y: 8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: 'power3.out' }
      );

      // Pulse rings around badge
      gsap.to(pulseRef.current?.querySelectorAll('.level-ring') || [], {
        scale: 2.4,
        opacity: 0,
        duration: 2.6,
        stagger: 0.85,
        repeat: -1,
        ease: 'power2.out',
      });

      gsap.fromTo(
        badgeRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.55, delay: 0.25, ease: 'back.out(1.8)' }
      );

      // Animate XP ring fill
      if (ringProgressRef.current) {
        gsap.set(ringProgressRef.current, { strokeDasharray: CIRC, strokeDashoffset: CIRC });
        gsap.to(ringProgressRef.current, {
          strokeDashoffset: CIRC * (1 - PROGRESS),
          duration: 1.1,
          delay: 0.55,
          ease: 'power2.out',
        });
      }

      // Connection lines
      if (orbitRef.current) {
        orbitRef.current.querySelectorAll('path').forEach((path, i) => {
          const len = (path as SVGPathElement).getTotalLength();
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
          gsap.to(path, {
            strokeDashoffset: 0,
            opacity: 1,
            duration: 0.6,
            delay: 0.45 + i * 0.08,
            ease: 'power2.out',
          });
        });
      }

      // Tier pins drop in
      tierRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.5, y: -8 },
          { opacity: 1, scale: 1, y: 0, duration: 0.5, delay: 0.7 + i * 0.1, ease: 'back.out(2)' }
        );
        gsap.to(el, {
          y: -3,
          duration: gsap.utils.random(2.2, 2.9),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1.4 + i * 0.12,
        });
      });

      gsap.to(glowRef.current, {
        opacity: 0.85,
        scale: 1.08,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.6,
      });

      // Sparkles around badge
      sparkleRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.to(el, {
          opacity: 0,
          scale: 0.5,
          duration: 1.4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1.5 + i * 0.35,
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-[290px] aspect-square mx-auto flex items-center justify-center">
      <div
        className="absolute inset-0 rounded-[40px]"
        style={{
          background: 'radial-gradient(circle at 50% 50%, hsl(36 92% 55% / 0.18) 0%, transparent 70%)',
          filter: 'blur(8px)',
        }}
      />

      <div
        ref={plateRef}
        className="relative w-[90%] aspect-square rounded-[32px] overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, hsl(40 48% 97%) 0%, hsl(34 42% 93%) 100%)',
          boxShadow: [
            '0 20px 50px -12px hsl(36 60% 30% / 0.22)',
            '0 8px 20px -8px hsl(36 60% 30% / 0.12)',
            'inset 0 1.5px 0 hsl(0 0% 100% / 0.9)',
            '0 0 0 1px hsl(36 28% 88%)',
          ].join(', '),
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 50%, hsl(36 92% 55% / 0.14) 0%, transparent 64%)',
          }}
        />

        {/* Concentric guide rings — same as slide 2 */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.16]" viewBox="0 0 260 260" fill="none">
          <circle cx="130" cy="130" r="56" stroke="hsl(36 40% 38%)" strokeWidth="1" strokeDasharray="2 6" />
          <circle cx="130" cy="130" r="86" stroke="hsl(36 40% 38%)" strokeWidth="0.8" strokeDasharray="2 8" />
          <circle cx="130" cy="130" r="112" stroke="hsl(36 40% 38%)" strokeWidth="0.6" strokeDasharray="1 10" />
        </svg>

        {/* Connection lines from each tier to center badge */}
        <svg ref={orbitRef} className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 260 260" fill="none">
          <path d="M 52 70 Q 90 100 118 124" stroke="hsl(36 86% 48% / 0.45)" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="3 5" />
          <path d="M 208 60 Q 170 96 142 124" stroke="hsl(36 86% 48% / 0.45)" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="3 5" />
          <path d="M 48 192 Q 86 162 116 144" stroke="hsl(36 86% 48% / 0.45)" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="3 5" />
          <path d="M 212 188 Q 176 160 148 144" stroke="hsl(36 86% 48% / 0.45)" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="3 5" />
        </svg>

        {/* Pulse rings around badge */}
        <div
          ref={pulseRef}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="level-ring absolute w-20 h-20 rounded-full"
              style={{
                border: '1.5px solid hsl(36 92% 55% / 0.42)',
                boxShadow: '0 0 18px hsl(36 92% 55% / 0.25)',
              }}
            />
          ))}
        </div>

        <div
          ref={glowRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[170px] h-[170px] rounded-full opacity-70"
          style={{
            background: 'radial-gradient(circle, hsl(36 92% 55% / 0.24) 0%, transparent 72%)',
            filter: 'blur(14px)',
          }}
        />

        {/* Center: level badge with XP ring */}
        <div
          ref={badgeRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
        >
          <div className="relative">
            {/* XP progress ring */}
            <svg
              width="100"
              height="100"
              viewBox="0 0 100 100"
              className="absolute inset-0 -rotate-90"
              style={{ width: 100, height: 100 }}
            >
              <circle
                cx="50"
                cy="50"
                r={RADIUS}
                fill="none"
                stroke="hsl(36 24% 85%)"
                strokeWidth="6"
              />
              <circle
                ref={ringProgressRef}
                cx="50"
                cy="50"
                r={RADIUS}
                fill="none"
                stroke="url(#xp-grad)"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="xp-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(36 92% 55%)" />
                  <stop offset="100%" stopColor="hsl(265 70% 62%)" />
                </linearGradient>
              </defs>

              {/* Sparkles */}
              {[
                { cx: 84, cy: 18, r: 1.6 },
                { cx: 12, cy: 28, r: 1.2 },
                { cx: 90, cy: 70, r: 1.4 },
              ].map((s, i) => (
                <circle
                  key={i}
                  ref={(el) => {
                    sparkleRefs.current[i] = el;
                  }}
                  cx={s.cx}
                  cy={s.cy}
                  r={s.r}
                  fill="hsl(36 92% 60%)"
                />
              ))}
            </svg>

            {/* Center badge inside the ring */}
            <div className="relative" style={{ width: 100, height: 100 }}>
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[72px] h-[72px] rounded-full flex flex-col items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, hsl(36 92% 60%), hsl(20 88% 56%))',
                  boxShadow: [
                    '0 12px 26px hsl(20 88% 40% / 0.5)',
                    'inset 0 2px 0 hsl(0 0% 100% / 0.5)',
                    'inset 0 -3px 6px hsl(0 0% 0% / 0.2)',
                    '0 0 0 3px hsl(0 0% 100%)',
                  ].join(', '),
                }}
              >
                <span
                  className="text-[24px] leading-none"
                  style={{ filter: 'drop-shadow(0 1.5px 2px hsl(20 88% 30% / 0.5))' }}
                >
                  ⭐
                </span>
                <div
                  className="absolute top-2 left-3 w-3.5 h-1.5 rounded-full opacity-65"
                  style={{
                    background: 'radial-gradient(ellipse, hsl(0 0% 100% / 0.95), transparent 70%)',
                  }}
                />
              </div>
            </div>

            {/* Level chip beneath */}
            <div
              className="absolute left-1/2 -translate-x-1/2 mt-3 px-3 py-1 rounded-full whitespace-nowrap"
              style={{
                top: '100%',
                background: 'linear-gradient(160deg, hsl(0 0% 100% / 0.98), hsl(36 30% 96% / 0.95))',
                backdropFilter: 'blur(10px)',
                boxShadow: [
                  '0 6px 16px hsl(36 40% 24% / 0.16)',
                  'inset 0 1px 0 hsl(0 0% 100%)',
                  '0 0 0 1px hsl(36 26% 86%)',
                ].join(', '),
              }}
            >
              <span className="text-[11px] font-bold text-foreground">Lv 7</span>
              <span className="text-[10px] font-medium text-muted-foreground ml-1">· 850 XP</span>
            </div>
          </div>
        </div>

        {/* Orbiting tier pins */}
        {TIERS.map((tier, i) => (
          <div
            key={tier.id}
            ref={(el) => {
              tierRefs.current[i] = el;
            }}
            className="absolute z-30"
            style={{
              left: `${tier.x}%`,
              top: `${tier.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="relative flex flex-col items-center">
              <div
                className="relative w-11 h-11 rounded-full flex items-center justify-center"
                style={{
                  background:
                    tier.state === 'future'
                      ? `radial-gradient(circle at 32% 26%, hsl(0 0% 100%), hsl(36 14% 92%) 60%, ${tier.color}15)`
                      : `radial-gradient(circle at 32% 26%, hsl(0 0% 100%), hsl(0 0% 98%) 60%, ${tier.color}20)`,
                  boxShadow: [
                    `0 8px 16px ${tier.color}${tier.state === 'future' ? '30' : '55'}`,
                    '0 1.5px 4px hsl(0 0% 0% / 0.1)',
                    'inset 0 1px 0 hsl(0 0% 100% / 0.95)',
                    `0 0 0 2px ${tier.state === 'future' ? 'hsl(36 14% 78%)' : tier.color}`,
                  ].join(', '),
                  opacity: tier.state === 'future' ? 0.85 : 1,
                }}
              >
                <span
                  className="text-[18px] leading-none"
                  style={{ filter: tier.state === 'future' ? 'grayscale(0.4)' : 'none' }}
                >
                  {tier.emoji}
                </span>

                {/* Status indicator */}
                {tier.state === 'done' && (
                  <div
                    className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                    style={{
                      background: 'hsl(var(--success))',
                      boxShadow: '0 0 0 1.5px hsl(0 0% 100%), 0 0 6px hsl(var(--success) / 0.6)',
                    }}
                  >
                    <svg width="7" height="7" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4.2 L3.2 5.8 L6.5 2.4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
                {tier.state === 'current' && (
                  <div
                    className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                    style={{
                      background: 'hsl(36 92% 55%)',
                      boxShadow: '0 0 0 1.5px hsl(0 0% 100%), 0 0 8px hsl(36 92% 55% / 0.7)',
                    }}
                  />
                )}
              </div>
              <div
                className="w-0 h-0 -mt-[2px]"
                style={{
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  borderTop: `6px solid ${tier.state === 'future' ? 'hsl(36 14% 78%)' : tier.color}`,
                  filter: `drop-shadow(0 2px 2px ${tier.color}55)`,
                }}
              />
              <span
                className="absolute -bottom-4 text-[9px] font-bold whitespace-nowrap"
                style={{ color: tier.state === 'future' ? 'hsl(36 14% 56%)' : tier.color }}
              >
                {tier.label}
              </span>
            </div>
          </div>
        ))}

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, transparent 56%, hsl(36 30% 20% / 0.08) 100%)',
          }}
        />
      </div>
    </div>
  );
}
