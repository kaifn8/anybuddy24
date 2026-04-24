import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Trust scene: three verified user avatars arranged in a soft arc
 * around a central handshake/meeting point. Each avatar has a
 * verified tick. A subtle rating row sits beneath. Tells the
 * "real, verified, trusted people" story visually.
 */

const PEOPLE = [
  {
    id: 'm',
    initial: 'M',
    bg: 'linear-gradient(135deg, hsl(265 70% 62%), hsl(220 80% 55%))',
    ring: 'hsl(265 70% 62%)',
    x: 18,
    y: 30,
    size: 56,
    rating: 5,
  },
  {
    id: 'a',
    initial: 'A',
    bg: 'linear-gradient(135deg, hsl(36 92% 60%), hsl(20 88% 56%))',
    ring: 'hsl(36 92% 55%)',
    x: 50,
    y: 18,
    size: 64,
    rating: 5,
  },
  {
    id: 's',
    initial: 'S',
    bg: 'linear-gradient(135deg, hsl(330 75% 62%), hsl(280 70% 55%))',
    ring: 'hsl(330 75% 60%)',
    x: 82,
    y: 30,
    size: 56,
    rating: 5,
  },
] as const;

export default function SafeVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const peopleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const checkRefs = useRef<(SVGPathElement | null)[]>([]);
  const meetupRef = useRef<HTMLDivElement>(null);
  const meetupGlowRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<SVGSVGElement>(null);
  const ratingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        plateRef.current,
        { opacity: 0, scale: 0.95, y: 8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: 'power3.out' }
      );

      // Convergence lines draw in first
      if (linesRef.current) {
        linesRef.current.querySelectorAll('path').forEach((path, i) => {
          const len = (path as SVGPathElement).getTotalLength();
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
          gsap.to(path, {
            strokeDashoffset: 0,
            opacity: 1,
            duration: 0.55,
            delay: 0.25 + i * 0.08,
            ease: 'power2.out',
          });
        });
      }

      // Avatars come in
      peopleRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: 14, scale: 0.7 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.55,
            delay: 0.35 + i * 0.1,
            ease: 'back.out(1.6)',
          }
        );
        // Idle bob
        gsap.to(el, {
          y: gsap.utils.random(-3, -6),
          duration: gsap.utils.random(2.4, 3.2),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1.4 + i * 0.15,
        });
      });

      // Verified ticks draw in
      checkRefs.current.forEach((el, i) => {
        if (!el) return;
        const len = el.getTotalLength();
        gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(el, {
          strokeDashoffset: 0,
          duration: 0.35,
          delay: 0.7 + i * 0.1,
          ease: 'power2.out',
        });
      });

      // Center meetup spot
      gsap.fromTo(
        meetupRef.current,
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.5, delay: 0.85, ease: 'back.out(2)' }
      );
      gsap.to(meetupGlowRef.current, {
        scale: 1.15,
        opacity: 0.7,
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.2,
      });

      // Rating row
      gsap.fromTo(
        ratingRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.5, delay: 1, ease: 'power3.out' }
      );
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
          background: 'linear-gradient(135deg, hsl(150 36% 97%) 0%, hsl(158 28% 93%) 100%)',
          boxShadow: [
            '0 20px 50px -12px hsl(160 50% 30% / 0.22)',
            '0 8px 20px -8px hsl(160 50% 30% / 0.12)',
            'inset 0 1.5px 0 hsl(0 0% 100% / 0.9)',
            '0 0 0 1px hsl(150 25% 88%)',
          ].join(', '),
        }}
      >
        {/* Soft inner radial wash */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 60%, hsl(var(--success) / 0.10) 0%, transparent 64%)',
          }}
        />

        {/* Concentric trust rings */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.10]" viewBox="0 0 260 260" fill="none">
          <circle cx="130" cy="156" r="44" stroke="hsl(160 36% 32%)" strokeWidth="1" strokeDasharray="2 6" />
          <circle cx="130" cy="156" r="68" stroke="hsl(160 36% 32%)" strokeWidth="0.75" strokeDasharray="2 8" />
          <circle cx="130" cy="156" r="92" stroke="hsl(160 36% 32%)" strokeWidth="0.5" strokeDasharray="1 10" />
        </svg>

        {/* Convergence lines from each avatar to the center meetup */}
        <svg ref={linesRef} className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 260 260" fill="none">
          {/* Center meetup ~ (130, 156) */}
          <path d="M 56 100 Q 90 130 124 152" stroke="hsl(var(--success) / 0.4)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 5" />
          <path d="M 130 70 Q 130 110 130 148" stroke="hsl(var(--success) / 0.5)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 5" />
          <path d="M 204 100 Q 170 130 136 152" stroke="hsl(var(--success) / 0.4)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 5" />
        </svg>

        {/* Three avatars in arc */}
        {PEOPLE.map((p, i) => (
          <div
            key={p.id}
            ref={(el) => {
              peopleRefs.current[i] = el;
            }}
            className="absolute z-10"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="relative">
              {/* Soft glow under avatar */}
              <div
                className="absolute -inset-2 rounded-full opacity-50 blur-md"
                style={{ background: p.ring }}
              />
              {/* Avatar */}
              <div
                className="relative rounded-full flex items-center justify-center font-bold text-white"
                style={{
                  width: p.size,
                  height: p.size,
                  fontSize: p.size * 0.4,
                  background: p.bg,
                  boxShadow: [
                    `0 10px 22px ${p.ring.replace(')', ' / 0.45)')}`,
                    'inset 0 1.5px 0 hsl(0 0% 100% / 0.45)',
                    'inset 0 -3px 6px hsl(0 0% 0% / 0.18)',
                    '0 0 0 3px hsl(0 0% 100%)',
                  ].join(', '),
                }}
              >
                {p.initial}
                {/* Specular highlight */}
                <div
                  className="absolute top-1.5 left-2.5 w-3 h-1.5 rounded-full opacity-65"
                  style={{
                    background: 'radial-gradient(ellipse, hsl(0 0% 100% / 0.9), transparent 70%)',
                  }}
                />
              </div>
              {/* Verified tick badge */}
              <div
                className="absolute -bottom-0.5 -right-0.5 rounded-full flex items-center justify-center"
                style={{
                  width: p.size * 0.36,
                  height: p.size * 0.36,
                  background: 'radial-gradient(circle at 32% 26%, hsl(211 100% 65%), hsl(211 100% 48%))',
                  boxShadow: '0 3px 8px hsl(211 100% 40% / 0.55), 0 0 0 2.5px hsl(0 0% 100%)',
                }}
              >
                <svg width={p.size * 0.22} height={p.size * 0.22} viewBox="0 0 14 14" fill="none">
                  <path
                    ref={(el) => {
                      checkRefs.current[i] = el;
                    }}
                    d="M3 7.4 L6 10.2 L11 4.6"
                    stroke="white"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}

        {/* Center meetup point */}
        <div
          ref={meetupRef}
          className="absolute z-20"
          style={{ left: '50%', top: '60%', transform: 'translate(-50%, -50%)' }}
        >
          <div className="relative flex items-center justify-center">
            <div
              ref={meetupGlowRef}
              className="absolute -inset-4 rounded-full opacity-50"
              style={{
                background: 'radial-gradient(circle, hsl(var(--success) / 0.55) 0%, transparent 72%)',
                filter: 'blur(10px)',
              }}
            />
            <div
              className="relative w-12 h-12 rounded-full flex items-center justify-center text-[20px]"
              style={{
                background: 'linear-gradient(160deg, hsl(152 64% 58%) 0%, hsl(var(--success)) 55%, hsl(166 48% 36%) 100%)',
                boxShadow: [
                  '0 12px 24px hsl(var(--success) / 0.45)',
                  'inset 0 1.5px 0 hsl(0 0% 100% / 0.45)',
                  'inset 0 -3px 6px hsl(166 50% 22% / 0.35)',
                  '0 0 0 3px hsl(0 0% 100%)',
                ].join(', '),
              }}
            >
              <span style={{ filter: 'drop-shadow(0 1.5px 2px hsl(160 50% 16% / 0.5))' }}>🤝</span>
            </div>
          </div>
        </div>

        {/* Rating row beneath the meetup */}
        <div
          ref={ratingRef}
          className="absolute z-20 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1.5 rounded-full"
          style={{
            top: '82%',
            background: 'linear-gradient(160deg, hsl(0 0% 100% / 0.95), hsl(0 0% 98% / 0.9))',
            backdropFilter: 'blur(10px)',
            boxShadow: [
              '0 8px 20px hsl(160 25% 20% / 0.12)',
              'inset 0 1px 0 hsl(0 0% 100%)',
              '0 0 0 1px hsl(150 25% 86%)',
            ].join(', '),
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="text-[12px] leading-none"
              style={{
                color: 'hsl(36 92% 55%)',
                filter: 'drop-shadow(0 1px 2px hsl(36 92% 40% / 0.4))',
              }}
            >
              ★
            </span>
          ))}
          <span className="text-[10px] font-bold text-foreground ml-1 leading-none">
            4.9
          </span>
          <span className="text-[9px] font-medium text-muted-foreground leading-none">
            · 1.2k reviews
          </span>
        </div>

        {/* Subtle vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, transparent 56%, hsl(160 30% 20% / 0.08) 100%)',
          }}
        />
      </div>
    </div>
  );
}
