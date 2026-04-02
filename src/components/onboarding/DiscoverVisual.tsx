import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const AVATARS = [
  { emoji: '👩‍🦰', color: '#FF6B6B', x: 0, y: -110 },
  { emoji: '🧑‍💼', color: '#4ECDC4', x: 95, y: -55 },
  { emoji: '👩‍🎨', color: '#A78BFA', x: 95, y: 55 },
  { emoji: '🧑‍🎤', color: '#F59E0B', x: 0, y: 110 },
  { emoji: '👨‍🍳', color: '#3B82F6', x: -95, y: 55 },
  { emoji: '👩‍🔬', color: '#EC4899', x: -95, y: -55 },
];

export default function DiscoverVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);
  const avatarsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Radar pulse rings
      gsap.to(pulseRef.current?.querySelectorAll('.pulse-ring') || [], {
        scale: 2.5,
        opacity: 0,
        duration: 2,
        stagger: 0.6,
        repeat: -1,
        ease: 'power1.out',
      });

      // Avatars float in from center
      avatarsRef.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(el,
          { scale: 0, opacity: 0, x: 0, y: 0 },
          {
            scale: 1, opacity: 1,
            x: AVATARS[i].x, y: AVATARS[i].y,
            duration: 0.6, delay: 0.3 + i * 0.1,
            ease: 'back.out(1.7)',
          }
        );
        // Gentle float
        gsap.to(el, {
          y: AVATARS[i].y + gsap.utils.random(-6, 6),
          x: AVATARS[i].x + gsap.utils.random(-4, 4),
          duration: gsap.utils.random(2, 3),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1 + i * 0.15,
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative w-[280px] h-[280px] flex items-center justify-center">
      {/* Pulse rings */}
      <div ref={pulseRef} className="absolute inset-0 flex items-center justify-center">
        {[0, 1, 2].map(i => (
          <div key={i} className="pulse-ring absolute w-16 h-16 rounded-full border-2 border-primary/30" />
        ))}
      </div>

      {/* Center pin */}
      <div className="relative z-10 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-[hsl(211,100%,42%)] shadow-[0_4px_20px_hsl(211_100%_50%/0.4)] flex items-center justify-center">
        <span className="text-2xl">📍</span>
      </div>

      {/* Floating avatars */}
      {AVATARS.map((a, i) => (
        <div
          key={i}
          ref={el => { avatarsRef.current[i] = el; }}
          className="absolute z-10 flex items-center justify-center"
          style={{ left: 'calc(50% - 20px)', top: 'calc(50% - 20px)' }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-card"
            style={{ background: `${a.color}22` }}
          >
            <span className="text-lg">{a.emoji}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
