import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Brand-aligned palette: primary blue, secondary purple, accent gold, success green
const AVATARS = [
  { emoji: '👩‍🦰', color: 'hsl(211 100% 58%)', x: 0, y: -108 },
  { emoji: '🧑‍💼', color: 'hsl(152 60% 48%)', x: 94, y: -54 },
  { emoji: '👩‍🎨', color: 'hsl(265 65% 65%)', x: 94, y: 54 },
  { emoji: '🧑‍🎤', color: 'hsl(36 92% 58%)', x: 0, y: 108 },
  { emoji: '👨‍🍳', color: 'hsl(195 85% 55%)', x: -94, y: 54 },
  { emoji: '👩‍🔬', color: 'hsl(295 60% 65%)', x: -94, y: -54 },
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
        scale: 4,
        opacity: 0,
        duration: 2.8,
        stagger: 0.9,
        repeat: -1,
        ease: 'power2.out',
      });

      // Radar sweep rotation
      if (sweepRef.current) {
        gsap.to(sweepRef.current, {
          rotation: 360,
          transformOrigin: '50% 50%',
          duration: 4.5,
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
    <div ref={containerRef} className="relative w-[300px] h-[300px] flex items-center justify-center">
      {/* Soft ambient backdrop - layered for depth */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, hsl(var(--primary) / 0.14) 0%, hsl(var(--primary) / 0.04) 40%, transparent 70%)',
        }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, hsl(265 65% 65% / 0.06) 0%, transparent 50%)',
        }}
      />

      {/* Concentric range rings - finer, more refined */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="absolute w-[150px] h-[150px] rounded-full"
          style={{ border: '1px solid hsl(var(--primary) / 0.14)' }}
        />
        <div
          className="absolute w-[210px] h-[210px] rounded-full"
          style={{ border: '1px dashed hsl(var(--primary) / 0.10)' }}
        />
        <div
          className="absolute w-[270px] h-[270px] rounded-full"
          style={{ border: '1px dashed hsl(var(--primary) / 0.06)' }}
        />
      </div>

      {/* Radar sweep - softer, more elegant cone */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 300">
        <defs>
          <radialGradient id="sweep-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.32" />
            <stop offset="60%" stopColor="hsl(var(--primary))" stopOpacity="0.08" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g ref={sweepRef} style={{ transformOrigin: '150px 150px' }}>
          <path
            d={`M 150 150 L ${150 + 135} 150 A 135 135 0 0 0 ${150 + 75} ${150 - 112} Z`}
            fill="url(#sweep-grad)"
          />
        </g>
      </svg>

      {/* Connection lines SVG - subtle gradient strokes */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
        <defs>
          {AVATARS.map((a, i) => (
            <linearGradient key={i} id={`line-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%"
              gradientUnits="userSpaceOnUse"
              x1Override={cx} y1Override={cy} x2Override={cx + a.x} y2Override={cy + a.y}
            >
              <stop offset="0%" stopColor={a.color} stopOpacity="0.05" />
              <stop offset="100%" stopColor={a.color} stopOpacity="0.35" />
            </linearGradient>
          ))}
        </defs>
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
            strokeWidth="1.25"
            strokeOpacity="0.28"
            strokeDasharray="2 6"
            strokeLinecap="round"
          />
        ))}
      </svg>

      {/* Pulse rings - thinner, more refined */}
      <div ref={pulseRef} className="absolute inset-0 flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="pulse-ring absolute w-[70px] h-[70px] rounded-full"
            style={{
              border: '1.5px solid hsl(var(--primary) / 0.35)',
              boxShadow: '0 0 24px hsl(var(--primary) / 0.2), inset 0 0 12px hsl(var(--primary) / 0.08)',
            }}
          />
        ))}
      </div>

      {/* Center pin with layered glow */}
      <div className="relative z-10">
        <div className="absolute -inset-6 rounded-full bg-primary/20 blur-2xl animate-pulse" />
        <div className="absolute -inset-2 rounded-full bg-primary/30 blur-md" />
        <div
          className="relative w-[72px] h-[72px] rounded-full flex items-center justify-center"
          style={{
            background:
              'radial-gradient(circle at 32% 26%, hsl(211 100% 70%), hsl(211 100% 48%) 55%, hsl(220 95% 32%))',
            boxShadow:
              '0 10px 32px hsl(211 100% 45% / 0.55), 0 2px 8px hsl(220 90% 25% / 0.3), inset 0 1.5px 0 hsl(0 0% 100% / 0.5), inset 0 -3px 6px hsl(220 90% 20% / 0.4), 0 0 0 1px hsl(211 100% 60% / 0.4)',
          }}
        >
          <span className="text-[28px] drop-shadow-md" style={{ filter: 'drop-shadow(0 1px 2px hsl(220 90% 20% / 0.4))' }}>📍</span>
          {/* Glossy highlight */}
          <div
            className="absolute top-2 left-2 w-7 h-4 rounded-full opacity-60"
            style={{
              background: 'radial-gradient(ellipse, hsl(0 0% 100% / 0.85), transparent 70%)',
            }}
          />
        </div>
      </div>

      {/* Floating avatars - premium glassy treatment */}
      {AVATARS.map((a, i) => (
        <div
          key={i}
          ref={(el) => {
            avatarsRef.current[i] = el;
          }}
          className="absolute z-10 flex items-center justify-center"
          style={{ left: 'calc(50% - 26px)', top: 'calc(50% - 26px)' }}
        >
          <div className="relative">
            {/* Outer color glow */}
            <div
              className="absolute -inset-2 rounded-full opacity-50 blur-lg"
              style={{ background: a.color }}
            />
            {/* Avatar bubble */}
            <div
              className="relative w-[52px] h-[52px] rounded-full flex items-center justify-center backdrop-blur-sm"
              style={{
                background: `radial-gradient(circle at 32% 26%, hsl(0 0% 100% / 0.95), hsl(0 0% 98% / 0.85) 60%, ${a.color}25)`,
                boxShadow: `0 8px 20px ${a.color}60, 0 2px 6px hsl(0 0% 0% / 0.08), inset 0 1.5px 0 hsl(0 0% 100% / 0.9), 0 0 0 1.5px hsl(0 0% 100% / 0.95), 0 0 0 2.5px ${a.color}40`,
              }}
            >
              <span className="text-[24px] leading-none">{a.emoji}</span>
            </div>
            {/* Tiny live dot */}
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full"
              style={{
                background: 'hsl(152 70% 48%)',
                boxShadow: '0 0 0 2px hsl(0 0% 100%), 0 0 8px hsl(152 70% 48% / 0.6)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
