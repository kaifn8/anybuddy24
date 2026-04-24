import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const AVATARS = [
// Brand-aligned palette: primary blue, secondary purple, accent gold, success green
const AVATARS = [
  { emoji: '👩‍🦰', color: 'hsl(211 100% 55%)', x: 0, y: -110 },
  { emoji: '🧑‍💼', color: 'hsl(152 55% 50%)', x: 95, y: -55 },
  { emoji: '👩‍🎨', color: 'hsl(260 50% 62%)', x: 95, y: 55 },
  { emoji: '🧑‍🎤', color: 'hsl(36 85% 58%)', x: 0, y: 110 },
  { emoji: '👨‍🍳', color: 'hsl(195 80% 55%)', x: -95, y: 55 },
  { emoji: '👩‍🔬', color: 'hsl(290 55% 62%)', x: -95, y: -55 },
];

export default function DiscoverVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);
  const avatarsRef = useRef<(HTMLDivElement | null)[]>([]);
  const linesRef = useRef<(SVGLineElement | null)[]>([]);
  const sweepRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Radar pulse rings
      gsap.to(pulseRef.current?.querySelectorAll('.pulse-ring') || [], {
        scale: 3.5,
        opacity: 0,
        duration: 2.4,
        stagger: 0.8,
        repeat: -1,
        ease: 'power1.out',
      });

      // Radar sweep rotation
      if (sweepRef.current) {
        gsap.to(sweepRef.current, {
          rotation: 360,
          transformOrigin: '50% 50%',
          duration: 3.2,
          repeat: -1,
          ease: 'none',
        });
      }

      // Connection lines draw in
      linesRef.current.forEach((el, i) => {
        if (!el) return;
        const length = el.getTotalLength();
        gsap.set(el, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(el, {
          strokeDashoffset: 0,
          duration: 0.5,
          delay: 0.2 + i * 0.05,
          ease: 'power2.out',
        });
      });

      // Avatars float in from center
      avatarsRef.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { scale: 0, opacity: 0, x: 0, y: 0 },
          {
            scale: 1,
            opacity: 1,
            x: AVATARS[i].x,
            y: AVATARS[i].y,
            duration: 0.6,
            delay: 0.15 + i * 0.06,
            ease: 'back.out(1.6)',
          }
        );
        // Gentle float
        gsap.to(el, {
          y: AVATARS[i].y + gsap.utils.random(-6, 6),
          x: AVATARS[i].x + gsap.utils.random(-4, 4),
          duration: gsap.utils.random(3, 4.5),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 0.9 + i * 0.1,
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const cx = 140,
    cy = 140;

  return (
    <div ref={containerRef} className="relative w-[280px] h-[280px] flex items-center justify-center">
      {/* Soft ambient backdrop */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle at center, hsl(var(--primary) / 0.10) 0%, transparent 65%)',
        }}
      />

      {/* Concentric range rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute w-[160px] h-[160px] rounded-full border border-primary/10" />
        <div className="absolute w-[220px] h-[220px] rounded-full border border-dashed border-primary/[0.08]" />
        <div className="absolute w-[270px] h-[270px] rounded-full border border-dashed border-primary/[0.05]" />
      </div>

      {/* Radar sweep */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 280 280">
        <defs>
          <radialGradient id="sweep-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g ref={sweepRef}>
          <path
            d={`M ${cx} ${cy} L ${cx + 135} ${cy} A 135 135 0 0 0 ${cx + 95} ${cy - 95} Z`}
            fill="url(#sweep-grad)"
          />
        </g>
      </svg>

      {/* Connection lines SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
        {AVATARS.map((a, i) => (
          <line
            key={i}
            ref={(el) => {
              linesRef.current[i] = el;
            }}
            x1={cx}
            y1={cy}
            x2={cx + a.x}
            y2={cy + a.y}
            stroke={a.color}
            strokeWidth="1.5"
            strokeOpacity="0.22"
            strokeDasharray="3 5"
            strokeLinecap="round"
          />
        ))}
      </svg>

      {/* Pulse rings */}
      <div ref={pulseRef} className="absolute inset-0 flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="pulse-ring absolute w-16 h-16 rounded-full"
            style={{
              border: '2px solid hsl(var(--primary) / 0.3)',
              boxShadow: '0 0 20px hsl(var(--primary) / 0.15)',
            }}
          />
        ))}
      </div>

      {/* Center pin with glow */}
      <div className="relative z-10">
        <div className="absolute -inset-4 rounded-full bg-primary/25 blur-xl animate-pulse" />
        <div
          className="relative w-[68px] h-[68px] rounded-full flex items-center justify-center"
          style={{
            background:
              'radial-gradient(circle at 30% 25%, hsl(211 100% 65%), hsl(211 100% 45%) 60%, hsl(220 90% 35%))',
            boxShadow:
              '0 8px 28px hsl(211 100% 45% / 0.5), inset 0 1px 0 hsl(0 0% 100% / 0.4), inset 0 -2px 4px hsl(220 90% 25% / 0.3)',
          }}
        >
          <span className="text-3xl drop-shadow-md">📍</span>
          {/* Glossy highlight */}
          <div
            className="absolute top-1.5 left-1.5 w-6 h-4 rounded-full opacity-50"
            style={{
              background: 'radial-gradient(ellipse, hsl(0 0% 100% / 0.7), transparent 70%)',
            }}
          />
        </div>
      </div>

      {/* Floating avatars */}
      {AVATARS.map((a, i) => (
        <div
          key={i}
          ref={(el) => {
            avatarsRef.current[i] = el;
          }}
          className="absolute z-10 flex items-center justify-center"
          style={{ left: 'calc(50% - 24px)', top: 'calc(50% - 24px)' }}
        >
          <div className="relative">
            <div
              className="absolute -inset-1.5 rounded-full opacity-40 blur-md"
              style={{ background: a.color }}
            />
            <div
              className="relative w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: `radial-gradient(circle at 30% 25%, ${a.color}40, ${a.color}15 70%, ${a.color}25)`,
                boxShadow: `0 6px 16px ${a.color}55, inset 0 1px 0 hsl(0 0% 100% / 0.5), 0 0 0 2px hsl(0 0% 100% / 0.85)`,
              }}
            >
              <span className="text-[22px]">{a.emoji}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
