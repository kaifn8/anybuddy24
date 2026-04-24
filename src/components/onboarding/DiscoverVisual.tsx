import { useEffect, useRef } from 'react';
import gsap from 'gsap';

type Pin = {
  id: string;
  kind: 'emoji' | 'initial';
  label: string;
  color: string;
  x: number; // % position within map
  y: number;
};

const PINS: Pin[] = [
  { id: 'p1', kind: 'emoji', label: '☕', color: 'hsl(36 92% 55%)', x: 22, y: 28 },
  { id: 'p2', kind: 'initial', label: 'M', color: 'hsl(265 65% 62%)', x: 78, y: 22 },
  { id: 'p3', kind: 'emoji', label: '🍕', color: 'hsl(12 85% 58%)', x: 82, y: 68 },
  { id: 'p4', kind: 'initial', label: 'A', color: 'hsl(195 85% 52%)', x: 18, y: 72 },
  { id: 'p5', kind: 'emoji', label: '🎾', color: 'hsl(152 60% 48%)', x: 58, y: 16 },
];

export default function DiscoverVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const pinsRef = useRef<(HTMLDivElement | null)[]>([]);
  const youRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Map plate fade in
      gsap.fromTo(
        mapRef.current,
        { opacity: 0, scale: 0.94, y: 8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: 'power3.out' }
      );

      // You-pin pop
      gsap.fromTo(
        youRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, delay: 0.25, ease: 'back.out(1.8)' }
      );

      // Pulse rings
      gsap.to(pulseRef.current?.querySelectorAll('.pulse-ring') || [], {
        scale: 3.2,
        opacity: 0,
        duration: 2.6,
        stagger: 0.85,
        repeat: -1,
        ease: 'power2.out',
      });

      // Pins drop in
      pinsRef.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { y: -14, opacity: 0, scale: 0.6 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.5,
            delay: 0.4 + i * 0.09,
            ease: 'back.out(2)',
          }
        );
        // Subtle bob
        gsap.to(el, {
          y: -3,
          duration: gsap.utils.random(1.6, 2.4),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1 + i * 0.1,
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-[290px] h-[290px] flex items-center justify-center"
    >
      {/* Ambient backdrop glow */}
      <div
        className="absolute inset-0 rounded-[40px]"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.18) 0%, transparent 70%)',
          filter: 'blur(8px)',
        }}
      />

      {/* Map plate */}
      <div
        ref={mapRef}
        className="relative w-[260px] h-[260px] rounded-[32px] overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, hsl(210 40% 97%) 0%, hsl(210 35% 93%) 100%)',
          boxShadow: [
            '0 20px 50px -12px hsl(220 50% 30% / 0.25)',
            '0 8px 20px -8px hsl(220 50% 30% / 0.15)',
            'inset 0 1.5px 0 hsl(0 0% 100% / 0.9)',
            '0 0 0 1px hsl(210 30% 88%)',
          ].join(', '),
        }}
      >
        {/* Map streets - SVG */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 260 260"
          fill="none"
        >
          <defs>
            <linearGradient id="street-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(210 30% 82%)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="hsl(210 30% 78%)" stopOpacity="0.5" />
            </linearGradient>
            <radialGradient id="park-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(140 45% 78%)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="hsl(140 45% 70%)" stopOpacity="0.3" />
            </radialGradient>
            <radialGradient id="water-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(200 75% 75%)" stopOpacity="0.45" />
              <stop offset="100%" stopColor="hsl(200 75% 68%)" stopOpacity="0.25" />
            </radialGradient>
          </defs>

          {/* Park blob (top-right) */}
          <ellipse cx="200" cy="60" rx="55" ry="40" fill="url(#park-grad)" />
          {/* Water blob (bottom-left) */}
          <ellipse cx="50" cy="210" rx="55" ry="38" fill="url(#water-grad)" />

          {/* Major streets */}
          <path
            d="M -10 130 Q 80 120 130 130 T 280 132"
            stroke="url(#street-grad)"
            strokeWidth="11"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 130 -10 Q 132 80 130 130 T 130 280"
            stroke="url(#street-grad)"
            strokeWidth="11"
            strokeLinecap="round"
            fill="none"
          />
          {/* Diagonal */}
          <path
            d="M -10 30 L 280 240"
            stroke="hsl(210 30% 84%)"
            strokeOpacity="0.55"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />

          {/* Minor streets */}
          <path
            d="M 0 70 L 260 70"
            stroke="hsl(210 25% 88%)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="0"
          />
          <path
            d="M 0 195 L 260 195"
            stroke="hsl(210 25% 88%)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M 75 0 L 75 260"
            stroke="hsl(210 25% 88%)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M 195 0 L 195 260"
            stroke="hsl(210 25% 88%)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Building blocks (small rounded rects, very subtle) */}
          {[
            { x: 22, y: 22, w: 38, h: 32 },
            { x: 90, y: 22, w: 30, h: 32 },
            { x: 22, y: 88, w: 38, h: 32 },
            { x: 152, y: 152, w: 32, h: 30 },
            { x: 210, y: 150, w: 30, h: 32 },
            { x: 152, y: 215, w: 32, h: 30 },
          ].map((b, i) => (
            <rect
              key={i}
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx="6"
              fill="hsl(210 25% 92%)"
              opacity="0.7"
            />
          ))}
        </svg>

        {/* Pulse rings around center */}
        <div
          ref={pulseRef}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="pulse-ring absolute w-14 h-14 rounded-full"
              style={{
                border: '1.5px solid hsl(var(--primary) / 0.4)',
                boxShadow: '0 0 18px hsl(var(--primary) / 0.25)',
              }}
            />
          ))}
        </div>

        {/* "You" pin - center */}
        <div
          ref={youRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
        >
          <div className="relative">
            <div className="absolute -inset-3 rounded-full bg-primary/30 blur-md" />
            <div
              className="relative w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background:
                  'radial-gradient(circle at 32% 26%, hsl(211 100% 72%), hsl(211 100% 48%) 55%, hsl(220 95% 32%))',
                boxShadow: [
                  '0 8px 22px hsl(211 100% 45% / 0.55)',
                  'inset 0 1.5px 0 hsl(0 0% 100% / 0.55)',
                  'inset 0 -3px 6px hsl(220 95% 18% / 0.4)',
                  '0 0 0 2.5px hsl(0 0% 100%)',
                ].join(', '),
              }}
            >
              <span
                className="text-[20px] leading-none"
                style={{ filter: 'drop-shadow(0 1px 2px hsl(220 95% 15% / 0.5))' }}
              >
                📍
              </span>
              <div
                className="absolute top-1.5 left-2 w-5 h-2.5 rounded-full opacity-65"
                style={{
                  background:
                    'radial-gradient(ellipse, hsl(0 0% 100% / 0.9), transparent 70%)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Nearby pins */}
        {PINS.map((pin, i) => (
          <div
            key={pin.id}
            ref={(el) => {
              pinsRef.current[i] = el;
            }}
            className="absolute z-10"
            style={{
              left: `${pin.x}%`,
              top: `${pin.y}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="relative flex flex-col items-center">
              {/* Pin bubble */}
              <div
                className="relative w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle at 32% 26%, hsl(0 0% 100%), hsl(0 0% 98%) 60%, ${pin.color}20)`,
                  boxShadow: [
                    `0 6px 14px ${pin.color}55`,
                    '0 1.5px 4px hsl(0 0% 0% / 0.1)',
                    'inset 0 1px 0 hsl(0 0% 100% / 0.95)',
                    `0 0 0 2px ${pin.color}`,
                  ].join(', '),
                }}
              >
                {pin.kind === 'emoji' ? (
                  <span className="text-[16px] leading-none">{pin.label}</span>
                ) : (
                  <span
                    className="text-[13px] font-bold leading-none"
                    style={{ color: pin.color }}
                  >
                    {pin.label}
                  </span>
                )}
              </div>
              {/* Tail */}
              <div
                className="w-0 h-0 -mt-[2px]"
                style={{
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  borderTop: `6px solid ${pin.color}`,
                  filter: `drop-shadow(0 2px 2px ${pin.color}55)`,
                }}
              />
              {/* Live dot */}
              <div
                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                style={{
                  background: 'hsl(152 70% 48%)',
                  boxShadow:
                    '0 0 0 1.5px hsl(0 0% 100%), 0 0 6px hsl(152 70% 48% / 0.6)',
                }}
              />
            </div>
          </div>
        ))}

        {/* Subtle vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, transparent 55%, hsl(220 30% 20% / 0.08) 100%)',
          }}
        />
      </div>
    </div>
  );
}
