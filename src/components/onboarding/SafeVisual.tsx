import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const SIGNALS = [
  {
    id: 'verified',
    title: 'Verified ID',
    value: 'Checked',
    accent: 'hsl(211 100% 50%)',
    x: 8,
    y: 18,
    width: 88,
    path: 'M 110 116 Q 82 92 54 70',
  },
  {
    id: 'public',
    title: 'Public meetup',
    value: 'Safer',
    accent: 'hsl(152 55% 44%)',
    x: 58,
    y: 18,
    width: 92,
    path: 'M 150 116 Q 176 92 204 70',
  },
  {
    id: 'rating',
    title: 'Rated by users',
    value: '4.9 / 5',
    accent: 'hsl(36 92% 55%)',
    x: 28,
    y: 74,
    width: 110,
    path: 'M 130 146 Q 116 170 102 194',
  },
] as const;

export default function SafeVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const shieldRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<SVGPathElement>(null);
  const signalRefs = useRef<(HTMLDivElement | null)[]>([]);
  const linesRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        plateRef.current,
        { opacity: 0, scale: 0.95, y: 8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: 'power3.out' }
      );

      gsap.fromTo(
        shieldRef.current,
        { opacity: 0, y: 16, scale: 0.84, rotate: -6 },
        { opacity: 1, y: 0, scale: 1, rotate: 0, duration: 0.65, delay: 0.18, ease: 'back.out(1.35)' }
      );

      gsap.to(auraRef.current, {
        scale: 1.08,
        opacity: 0.72,
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.7,
      });

      if (checkRef.current) {
        const len = checkRef.current.getTotalLength();
        gsap.set(checkRef.current, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(checkRef.current, {
          strokeDashoffset: 0,
          duration: 0.45,
          delay: 0.52,
          ease: 'power2.out',
        });
      }

      if (linesRef.current) {
        linesRef.current.querySelectorAll('path').forEach((path, i) => {
          const len = (path as SVGPathElement).getTotalLength();
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
          gsap.to(path, {
            strokeDashoffset: 0,
            opacity: 1,
            duration: 0.55,
            delay: 0.48 + i * 0.1,
            ease: 'power2.out',
          });
        });
      }

      signalRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: 10, scale: 0.94 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.42,
            delay: 0.62 + i * 0.1,
            ease: 'power3.out',
          }
        );
        gsap.to(el, {
          y: gsap.utils.random(-2, -5),
          duration: gsap.utils.random(2.5, 3.4),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1.15 + i * 0.12,
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
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 44%, hsl(var(--success) / 0.08) 0%, transparent 64%)',
          }}
        />

        <svg className="absolute inset-0 w-full h-full opacity-[0.08]" viewBox="0 0 260 260" fill="none">
          <circle cx="130" cy="130" r="58" stroke="hsl(160 32% 35%)" strokeWidth="1" strokeDasharray="2 7" />
          <circle cx="130" cy="130" r="86" stroke="hsl(160 32% 35%)" strokeWidth="0.75" strokeDasharray="1 9" />
        </svg>

        <svg
          ref={linesRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 260 260"
          fill="none"
        >
          {SIGNALS.map((signal) => (
            <path
              key={signal.id}
              d={signal.path}
              stroke={signal.accent.replace(')', ' / 0.32)')}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="3 6"
            />
          ))}
        </svg>

        <div ref={shieldRef} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[52%] z-20">
          <div
            ref={auraRef}
            className="absolute -inset-10 rounded-full opacity-50"
            style={{
              background: 'radial-gradient(circle, hsl(var(--success) / 0.42) 0%, hsl(var(--success) / 0.14) 42%, transparent 74%)',
              filter: 'blur(18px)',
            }}
          />
          <div
            className="absolute -inset-4 rounded-full opacity-35"
            style={{
              border: '1px solid hsl(var(--success) / 0.22)',
            }}
          />

          <div
            className="relative w-[102px] h-[118px] flex items-center justify-center"
            style={{
              background: 'linear-gradient(160deg, hsl(152 64% 58%) 0%, hsl(var(--success)) 52%, hsl(166 48% 33%) 100%)',
              borderRadius: '28px 28px 50px 50px / 28px 28px 62px 62px',
              boxShadow: [
                '0 20px 34px hsl(var(--success) / 0.28)',
                'inset 0 1.5px 0 hsl(0 0% 100% / 0.46)',
                'inset 0 -10px 18px hsl(166 46% 22% / 0.24)',
                '0 0 0 2px hsl(0 0% 100% / 0.86)',
              ].join(', '),
            }}
          >
            <div
              className="absolute inset-[4px]"
              style={{
                borderRadius: '24px 24px 46px 46px / 24px 24px 58px 58px',
                border: '1px solid hsl(0 0% 100% / 0.28)',
              }}
            />
            <div
              className="absolute top-2 left-3 right-3 h-9 opacity-55"
              style={{
                background: 'radial-gradient(ellipse at center top, hsl(0 0% 100% / 0.72), transparent 72%)',
                borderRadius: '22px 22px 36px 36px',
              }}
            />
            <svg width="46" height="46" viewBox="0 0 46 46" fill="none" className="relative z-10">
              <path
                ref={checkRef}
                d="M12 24 L20 32 L34 16"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: 'drop-shadow(0 3px 8px hsl(160 55% 16% / 0.35))' }}
              />
            </svg>
          </div>
        </div>

        {SIGNALS.map((signal, i) => (
          <div
            key={signal.id}
            ref={(el) => {
              signalRefs.current[i] = el;
            }}
            className="absolute z-10"
            style={{ left: `${signal.x}%`, top: `${signal.y}%` }}
          >
            <div
              className="rounded-[18px] px-3 py-2"
              style={{
                width: signal.width,
                background: 'linear-gradient(160deg, hsl(0 0% 100% / 0.95), hsl(0 0% 98% / 0.9))',
                backdropFilter: 'blur(10px)',
                boxShadow: [
                  '0 10px 22px hsl(160 25% 20% / 0.12)',
                  '0 1px 3px hsl(0 0% 0% / 0.05)',
                  'inset 0 1px 0 hsl(0 0% 100%)',
                  '0 0 0 1px hsl(0 0% 100% / 0.72)',
                ].join(', '),
              }}
            >
              <div className="flex items-start gap-2">
                <div
                  className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: `radial-gradient(circle at 32% 26%, ${signal.accent.replace(')', ' / 0.72)')}, ${signal.accent})`,
                    boxShadow: `0 4px 10px ${signal.accent.replace(')', ' / 0.24)')}`,
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-white/95" />
                </div>
                <div className="min-w-0">
                  <div className="text-[7px] font-semibold uppercase tracking-[0.18em] text-muted-foreground whitespace-nowrap">
                    {signal.title}
                  </div>
                  <div className="text-[10px] font-bold text-foreground whitespace-nowrap leading-tight mt-0.5">
                    {signal.value}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

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
