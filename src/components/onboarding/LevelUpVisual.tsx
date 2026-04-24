import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const TIERS = [
  { label: 'Seed', color: 'hsl(152 52% 52%)', height: 74 },
  { label: 'Solid', color: 'hsl(195 72% 58%)', height: 106 },
  { label: 'Trusted', color: 'hsl(36 88% 58%)', height: 140 },
  { label: 'Anchor', color: 'hsl(265 28% 86%)', height: 172 },
] as const;

export default function LevelUpVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const pillarRefs = useRef<(HTMLDivElement | null)[]>([]);
  const markerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        plateRef.current,
        { opacity: 0, scale: 0.95, y: 8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: 'power3.out' }
      );

      pillarRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: 18, scaleY: 0.8 },
          {
            opacity: 1,
            y: 0,
            scaleY: 1,
            duration: 0.5,
            delay: 0.22 + i * 0.08,
            ease: 'back.out(1.25)',
            transformOrigin: 'bottom',
          }
        );
      });

      gsap.fromTo(
        markerRef.current,
        { opacity: 0, y: -16, scale: 0.72 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, delay: 0.68, ease: 'back.out(1.8)' }
      );

      gsap.to(markerRef.current, {
        y: -4,
        duration: 2.3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.2,
      });

      gsap.to(glowRef.current, {
        opacity: 0.72,
        scale: 1.12,
        duration: 2.1,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.8,
      });

      if (pathRef.current) {
        const len = pathRef.current.getTotalLength();
        gsap.set(pathRef.current, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
        gsap.to(pathRef.current, {
          strokeDashoffset: 0,
          opacity: 1,
          duration: 0.75,
          delay: 0.9,
          ease: 'power2.out',
        });
      }

      gsap.fromTo(
        fillRef.current,
        { scaleX: 0 },
        {
          scaleX: 0.7,
          duration: 0.9,
          delay: 1,
          ease: 'power2.out',
          transformOrigin: 'left',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-[290px] aspect-square mx-auto flex items-center justify-center">
      <div
        className="absolute inset-0 rounded-[40px]"
        style={{
          background: 'radial-gradient(circle at 50% 50%, hsl(var(--accent) / 0.22) 0%, transparent 70%)',
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
            background: 'radial-gradient(circle at 50% 40%, hsl(var(--accent) / 0.15) 0%, transparent 66%)',
          }}
        />

        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 260 260" fill="none">
          <path d="M22 196 H238" stroke="hsl(36 40% 28%)" strokeWidth="1" strokeDasharray="2 8" />
          <path d="M22 170 H238" stroke="hsl(36 40% 28%)" strokeWidth="0.75" strokeDasharray="1 9" />
          <path d="M22 144 H238" stroke="hsl(36 40% 28%)" strokeWidth="0.75" strokeDasharray="1 9" />
        </svg>

        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 260 260" fill="none">
          <path
            ref={pathRef}
            d="M 56 176 Q 88 156 100 144 T 142 116 T 184 84 T 216 58"
            stroke="hsl(36 86% 48% / 0.6)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div className="absolute inset-x-0 bottom-[46px] top-[28px] px-6 flex items-end justify-between">
          {TIERS.map((tier, i) => {
            const isCurrent = i === 2;
            const isFuture = i === 3;

            return (
              <div key={tier.label} className="relative flex flex-col items-center justify-end h-full" style={{ width: 44 }}>
                {isCurrent && (
                  <div
                    ref={markerRef}
                    className="absolute z-30 left-1/2 -translate-x-1/2"
                    style={{ bottom: tier.height + 12 }}
                  >
                    <div
                      ref={glowRef}
                      className="absolute -inset-3 rounded-full opacity-50"
                      style={{
                        background: 'radial-gradient(circle, hsl(var(--accent) / 0.45) 0%, transparent 72%)',
                        filter: 'blur(10px)',
                      }}
                    />
                    <div
                      className="relative w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-bold text-white"
                      style={{
                        background: 'linear-gradient(135deg, hsl(265 70% 62%), hsl(220 80% 55%))',
                        boxShadow: [
                          '0 8px 16px hsl(220 70% 35% / 0.38)',
                          'inset 0 1.5px 0 hsl(0 0% 100% / 0.42)',
                          '0 0 0 2px hsl(0 0% 100%)',
                        ].join(', '),
                      }}
                    >
                      S
                    </div>
                  </div>
                )}

                <div
                  ref={(el) => {
                    pillarRefs.current[i] = el;
                  }}
                  className="relative w-full rounded-t-[14px] overflow-hidden"
                  style={{
                    height: tier.height,
                    background: isFuture
                      ? 'linear-gradient(180deg, hsl(36 20% 90%), hsl(36 18% 84%))'
                      : `linear-gradient(180deg, ${tier.color}, ${tier.color.replace('%)', '% / 0.82)')})`,
                    boxShadow: isFuture
                      ? 'inset 0 1.5px 0 hsl(0 0% 100% / 0.68), inset 0 -8px 12px hsl(36 24% 62% / 0.18), 0 10px 18px hsl(36 26% 28% / 0.08)'
                      : `0 12px 22px ${tier.color.replace('%)', '% / 0.22)')}, inset 0 1.5px 0 hsl(0 0% 100% / 0.38), inset 0 -10px 16px hsl(0 0% 0% / 0.14)`,
                  }}
                >
                  <div className="absolute inset-x-0 top-0 h-5" style={{ background: 'linear-gradient(180deg, hsl(0 0% 100% / 0.2), transparent)' }} />
                  <div className="absolute left-1.5 top-0 bottom-0 w-1 opacity-35" style={{ background: 'linear-gradient(180deg, hsl(0 0% 100% / 0.7), transparent)' }} />
                  {isFuture && <div className="absolute top-3 left-0 right-0 text-center text-[14px] opacity-45">♛</div>}
                </div>

                <div
                  className="mt-2 text-[9px] font-bold uppercase tracking-[0.14em] whitespace-nowrap"
                  style={{ color: isFuture ? 'hsl(36 14% 56%)' : isCurrent ? 'hsl(36 58% 28%)' : 'hsl(160 20% 36%)' }}
                >
                  {tier.label}
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-3 left-5 right-5 z-10">
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-foreground/80">Next: Anchor</span>
            <span className="text-[9px] font-medium text-muted-foreground">850 / 1000 XP</span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden relative"
            style={{
              background: 'hsl(36 24% 85%)',
              boxShadow: 'inset 0 1px 2px hsl(36 30% 30% / 0.18), inset 0 -1px 0 hsl(0 0% 100% / 0.5)',
            }}
          >
            <div
              ref={fillRef}
              className="h-full rounded-full relative overflow-hidden"
              style={{
                background: 'linear-gradient(90deg, hsl(36 92% 55%), hsl(28 88% 56%), hsl(265 62% 64%))',
                transformOrigin: 'left',
                boxShadow: '0 0 10px hsl(36 92% 55% / 0.35), inset 0 1px 0 hsl(0 0% 100% / 0.38)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-[shimmer_2.5s_infinite]" style={{ backgroundSize: '200% 100%' }} />
            </div>
          </div>
        </div>

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
