import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Trust scene — mirrors the visual language of slide 1 (Discover):
 * a hero "plate" with a clear focal subject (verified profile card)
 * and orbiting trust badges acting like the map pins on slide 1.
 */

type Badge = {
  id: string;
  emoji: string;
  label: string;
  color: string;
  x: number;
  y: number;
};

const BADGES: Badge[] = [
  { id: 'id', emoji: '🪪', label: 'ID', color: 'hsl(211 100% 52%)', x: 14, y: 22 },
  { id: 'star', emoji: '⭐', label: '4.9', color: 'hsl(36 92% 55%)', x: 84, y: 18 },
  { id: 'shield', emoji: '🛡️', label: 'Safe', color: 'hsl(var(--success))', x: 86, y: 70 },
  { id: 'heart', emoji: '💚', label: '128', color: 'hsl(340 75% 58%)', x: 14, y: 72 },
];

export default function SafeVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<SVGPathElement>(null);
  const badgeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ringsRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<SVGSVGElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        plateRef.current,
        { opacity: 0, scale: 0.94, y: 8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: 'power3.out' }
      );

      // Pulse rings around the avatar (echoes slide 1's pulse rings)
      gsap.to(ringsRef.current?.querySelectorAll('.trust-ring') || [], {
        scale: 2.6,
        opacity: 0,
        duration: 2.6,
        stagger: 0.85,
        repeat: -1,
        ease: 'power2.out',
      });

      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.85, y: 10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.55, delay: 0.2, ease: 'back.out(1.6)' }
      );

      gsap.fromTo(
        avatarRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, delay: 0.32, ease: 'back.out(1.8)' }
      );

      // Verified check stroke
      if (checkRef.current) {
        const len = checkRef.current.getTotalLength();
        gsap.set(checkRef.current, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(checkRef.current, {
          strokeDashoffset: 0,
          duration: 0.4,
          delay: 0.65,
          ease: 'power2.out',
        });
      }

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

      badgeRefs.current.forEach((el, i) => {
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
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-[290px] aspect-square mx-auto flex items-center justify-center">
      <div
        className="absolute inset-0 rounded-[40px]"
        style={{
          background: 'radial-gradient(circle at 50% 50%, hsl(var(--success) / 0.18) 0%, transparent 70%)',
          filter: 'blur(8px)',
        }}
      />

      <div
        ref={plateRef}
        className="relative w-[90%] aspect-square rounded-[32px] overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, hsl(156 34% 97%) 0%, hsl(158 24% 93%) 100%)',
          boxShadow: [
            '0 20px 50px -12px hsl(160 42% 28% / 0.22)',
            '0 8px 20px -8px hsl(160 42% 28% / 0.12)',
            'inset 0 1.5px 0 hsl(0 0% 100% / 0.9)',
            '0 0 0 1px hsl(154 22% 87%)',
          ].join(', '),
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 50%, hsl(var(--success) / 0.12) 0%, transparent 64%)',
          }}
        />

        {/* Concentric guide rings — softer than slide 1 grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.16]" viewBox="0 0 260 260" fill="none">
          <circle cx="130" cy="130" r="56" stroke="hsl(158 22% 50%)" strokeWidth="1" strokeDasharray="2 6" />
          <circle cx="130" cy="130" r="86" stroke="hsl(158 22% 50%)" strokeWidth="0.8" strokeDasharray="2 8" />
          <circle cx="130" cy="130" r="112" stroke="hsl(158 22% 50%)" strokeWidth="0.6" strokeDasharray="1 10" />
        </svg>

        {/* Connection lines from each badge to center card */}
        <svg ref={orbitRef} className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 260 260" fill="none">
          <path d="M 52 70 Q 90 100 118 124" stroke="hsl(var(--success) / 0.42)" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="3 5" />
          <path d="M 208 60 Q 170 96 142 124" stroke="hsl(var(--success) / 0.42)" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="3 5" />
          <path d="M 212 188 Q 176 160 148 144" stroke="hsl(var(--success) / 0.42)" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="3 5" />
          <path d="M 48 192 Q 86 162 116 144" stroke="hsl(var(--success) / 0.42)" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="3 5" />
        </svg>

        {/* Pulse rings around avatar */}
        <div
          ref={ringsRef}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="trust-ring absolute w-20 h-20 rounded-full"
              style={{
                border: '1.5px solid hsl(var(--success) / 0.42)',
                boxShadow: '0 0 18px hsl(var(--success) / 0.25)',
              }}
            />
          ))}
        </div>

        <div
          ref={glowRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[170px] h-[170px] rounded-full opacity-70"
          style={{
            background: 'radial-gradient(circle, hsl(var(--success) / 0.22) 0%, transparent 72%)',
            filter: 'blur(14px)',
          }}
        />

        {/* Center: avatar — focal subject like the "you" pin on slide 1 */}
        <div
          ref={cardRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
        >
          <div ref={avatarRef} className="relative">
            <div className="absolute -inset-4 rounded-full bg-success/30 blur-md" />
            <div
              className="relative w-[88px] h-[88px] rounded-full flex items-center justify-center text-[34px] font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, hsl(36 92% 60%), hsl(20 88% 56%))',
                boxShadow: [
                  '0 14px 30px hsl(20 88% 40% / 0.5)',
                  'inset 0 2px 0 hsl(0 0% 100% / 0.5)',
                  'inset 0 -4px 8px hsl(0 0% 0% / 0.2)',
                  '0 0 0 4px hsl(0 0% 100%)',
                ].join(', '),
              }}
            >
              A
              <div
                className="absolute top-2 left-3.5 w-4 h-2 rounded-full opacity-70"
                style={{
                  background: 'radial-gradient(ellipse, hsl(0 0% 100% / 0.95), transparent 70%)',
                }}
              />
            </div>

            {/* Verified tick — bigger, prominent like a pin */}
            <div
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle at 32% 26%, hsl(211 100% 68%), hsl(211 100% 48%))',
                boxShadow: '0 6px 14px hsl(211 100% 38% / 0.55), 0 0 0 3px hsl(0 0% 100%)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  ref={checkRef}
                  d="M3.5 8.4 L6.4 11.2 L12.5 5.2"
                  stroke="white"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Name plate beneath avatar */}
            <div
              className="absolute left-1/2 -translate-x-1/2 mt-3 px-3 py-1 rounded-full whitespace-nowrap"
              style={{
                top: '100%',
                background: 'linear-gradient(160deg, hsl(0 0% 100% / 0.98), hsl(0 0% 96% / 0.95))',
                backdropFilter: 'blur(10px)',
                boxShadow: [
                  '0 6px 16px hsl(160 25% 20% / 0.14)',
                  'inset 0 1px 0 hsl(0 0% 100%)',
                  '0 0 0 1px hsl(150 22% 86%)',
                ].join(', '),
              }}
            >
              <span className="text-[11px] font-bold text-foreground">Alex</span>
              <span className="text-[10px] font-medium text-muted-foreground ml-1">· Trusted</span>
            </div>
          </div>
        </div>

        {/* Orbiting trust badges — like map pins on slide 1 */}
        {BADGES.map((badge, i) => (
          <div
            key={badge.id}
            ref={(el) => {
              badgeRefs.current[i] = el;
            }}
            className="absolute z-30"
            style={{
              left: `${badge.x}%`,
              top: `${badge.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="relative flex flex-col items-center">
              <div
                className="relative w-11 h-11 rounded-full flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle at 32% 26%, hsl(0 0% 100%), hsl(0 0% 98%) 60%, ${badge.color}20)`,
                  boxShadow: [
                    `0 8px 16px ${badge.color}55`,
                    '0 1.5px 4px hsl(0 0% 0% / 0.1)',
                    'inset 0 1px 0 hsl(0 0% 100% / 0.95)',
                    `0 0 0 2px ${badge.color}`,
                  ].join(', '),
                }}
              >
                <span className="text-[18px] leading-none">{badge.emoji}</span>
              </div>
              {/* Tail like map pin */}
              <div
                className="w-0 h-0 -mt-[2px]"
                style={{
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  borderTop: `6px solid ${badge.color}`,
                  filter: `drop-shadow(0 2px 2px ${badge.color}55)`,
                }}
              />
              <span
                className="absolute -bottom-4 text-[9px] font-bold whitespace-nowrap"
                style={{ color: badge.color }}
              >
                {badge.label}
              </span>
            </div>
          </div>
        ))}

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, transparent 55%, hsl(160 30% 20% / 0.08) 100%)',
          }}
        />
      </div>
    </div>
  );
}
