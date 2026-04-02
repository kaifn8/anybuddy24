import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const AVATARS = [
  { emoji: '👩‍🦰', color: '#FF6B6B', x: 0, y: -100 },
  { emoji: '🧑‍💼', color: '#4ECDC4', x: 87, y: -50 },
  { emoji: '👩‍🎨', color: '#A78BFA', x: 87, y: 50 },
  { emoji: '🧑‍🎤', color: '#F59E0B', x: 0, y: 100 },
  { emoji: '👨‍🍳', color: '#3B82F6', x: -87, y: 50 },
  { emoji: '👩‍🔬', color: '#EC4899', x: -87, y: -50 },
];

export default function DiscoverVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);
  const avatarsRef = useRef<(HTMLDivElement | null)[]>([]);
  const linesRef = useRef<(SVGLineElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Radar pulse rings
      gsap.to(pulseRef.current?.querySelectorAll('.pulse-ring') || [], {
        scale: 3,
        opacity: 0,
        duration: 2.5,
        stagger: 0.8,
        repeat: -1,
        ease: 'power1.out',
      });

      // Connection lines draw in
      linesRef.current.forEach((el, i) => {
        if (!el) return;
        const length = el.getTotalLength();
        gsap.set(el, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(el, {
          strokeDashoffset: 0,
          duration: 0.6,
          delay: 0.4 + i * 0.08,
          ease: 'power2.out',
        });
      });

      // Avatars float in from center
      avatarsRef.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(el,
          { scale: 0, opacity: 0, x: 0, y: 0 },
          {
            scale: 1, opacity: 1,
            x: AVATARS[i].x, y: AVATARS[i].y,
            duration: 0.7, delay: 0.3 + i * 0.1,
            ease: 'back.out(1.7)',
          }
        );
        // Gentle float
        gsap.to(el, {
          y: AVATARS[i].y + gsap.utils.random(-8, 8),
          x: AVATARS[i].x + gsap.utils.random(-5, 5),
          duration: gsap.utils.random(2, 3.5),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1.2 + i * 0.15,
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const cx = 140, cy = 140;

  return (
    <div ref={containerRef} className="relative w-[280px] h-[280px] flex items-center justify-center">
      {/* Concentric range rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute w-[180px] h-[180px] rounded-full border border-dashed border-primary/10" />
        <div className="absolute w-[240px] h-[240px] rounded-full border border-dashed border-primary/[0.06]" />
      </div>

      {/* Connection lines SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
        {AVATARS.map((a, i) => (
          <line
            key={i}
            ref={el => { linesRef.current[i] = el; }}
            x1={cx} y1={cy}
            x2={cx + a.x} y2={cy + a.y}
            stroke={a.color}
            strokeWidth="1.5"
            strokeOpacity="0.25"
            strokeDasharray="4 4"
          />
        ))}
      </svg>

      {/* Pulse rings */}
      <div ref={pulseRef} className="absolute inset-0 flex items-center justify-center">
        {[0, 1, 2].map(i => (
          <div key={i} className="pulse-ring absolute w-14 h-14 rounded-full border-2 border-primary/25" />
        ))}
      </div>

      {/* Center pin with glow */}
      <div className="relative z-10">
        <div className="absolute -inset-3 rounded-full bg-primary/20 blur-lg animate-pulse" />
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-[hsl(211,100%,38%)] shadow-[0_4px_24px_hsl(211_100%_50%/0.45)] flex items-center justify-center">
          <span className="text-3xl">📍</span>
        </div>
      </div>

      {/* Floating avatars */}
      {AVATARS.map((a, i) => (
        <div
          key={i}
          ref={el => { avatarsRef.current[i] = el; }}
          className="absolute z-10 flex items-center justify-center"
          style={{ left: 'calc(50% - 22px)', top: 'calc(50% - 22px)' }}
        >
          <div className="relative">
            <div className="absolute -inset-1 rounded-full opacity-40 blur-sm" style={{ background: a.color }} />
            <div
              className="relative w-11 h-11 rounded-full flex items-center justify-center shadow-lg border-2 border-white/80"
              style={{ background: `linear-gradient(135deg, ${a.color}18, ${a.color}30)` }}
            >
              <span className="text-xl">{a.emoji}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
