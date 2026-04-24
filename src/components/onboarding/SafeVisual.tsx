import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const SIGNALS = [
  { id: 'verified', label: 'Verified', x: 12, y: 22, width: 84 },
  { id: 'public', label: 'Public', x: 62, y: 20, width: 76 },
  { id: 'rated', label: '4.9', x: 70, y: 74, width: 68 },
] as const;

export default function SafeVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const avatarsRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const signalRefs = useRef<(HTMLDivElement | null)[]>([]);
  const orbitRef = useRef<SVGSVGElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        plateRef.current,
        { opacity: 0, scale: 0.95, y: 10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: 'power3.out' }
      );

      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 16, rotateX: 8, scale: 0.96 },
        { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 0.6, delay: 0.12, ease: 'power3.out' }
      );

      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.38, delay: 0.26, ease: 'power2.out' }
      );

      gsap.fromTo(
        avatarsRef.current?.children || [],
        { opacity: 0, x: -10, scale: 0.88 },
        { opacity: 1, x: 0, scale: 1, duration: 0.42, delay: 0.34, stagger: 0.08, ease: 'back.out(1.4)' }
      );

      gsap.fromTo(
        listRef.current?.children || [],
        { opacity: 0, x: -8 },
        { opacity: 1, x: 0, duration: 0.4, delay: 0.42, stagger: 0.08, ease: 'power2.out' }
      );

      if (orbitRef.current) {
        orbitRef.current.querySelectorAll('path').forEach((path, i) => {
          const len = (path as SVGPathElement).getTotalLength();
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
          gsap.to(path, {
            strokeDashoffset: 0,
            opacity: 1,
            duration: 0.55,
            delay: 0.3 + i * 0.08,
            ease: 'power2.out',
          });
        });
      }

      signalRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: 10, scale: 0.92 },
          { opacity: 1, y: 0, scale: 1, duration: 0.42, delay: 0.54 + i * 0.09, ease: 'power3.out' }
        );

        gsap.to(el, {
          y: i % 2 === 0 ? -4 : -3,
          duration: 2.6 + i * 0.35,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1.1 + i * 0.08,
        });
      });

      gsap.to(glowRef.current, {
        opacity: 0.9,
        scale: 1.08,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.9,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-[290px] aspect-square mx-auto flex items-center justify-center">
      <div
        className="absolute inset-0 rounded-[40px]"
        style={{
          background: 'radial-gradient(circle at 50% 50%, hsl(var(--success) / 0.16) 0%, transparent 72%)',
          filter: 'blur(10px)',
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
            background: 'radial-gradient(circle at 50% 38%, hsl(var(--success) / 0.1) 0%, transparent 64%)',
          }}
        />

        <svg className="absolute inset-0 w-full h-full opacity-[0.12]" viewBox="0 0 260 260" fill="none">
          <rect x="22" y="22" width="216" height="216" rx="26" stroke="hsl(158 18% 60%)" strokeWidth="1" />
          <path d="M 40 72 H 220" stroke="hsl(158 18% 60%)" strokeWidth="1" strokeDasharray="2 7" />
          <path d="M 40 188 H 220" stroke="hsl(158 18% 60%)" strokeWidth="1" strokeDasharray="2 7" />
          <path d="M 84 40 V 220" stroke="hsl(158 18% 60%)" strokeWidth="1" strokeDasharray="2 7" />
          <path d="M 176 40 V 220" stroke="hsl(158 18% 60%)" strokeWidth="1" strokeDasharray="2 7" />
        </svg>

        <svg ref={orbitRef} className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 260 260" fill="none">
          <path d="M 60 72 Q 104 50 130 110" stroke="hsl(var(--success) / 0.28)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 6" />
          <path d="M 200 74 Q 158 50 130 110" stroke="hsl(var(--success) / 0.28)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 6" />
          <path d="M 190 196 Q 156 166 130 150" stroke="hsl(var(--success) / 0.28)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 6" />
        </svg>

        <div
          ref={glowRef}
          className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 w-[176px] h-[176px] rounded-full opacity-70"
          style={{
            background: 'radial-gradient(circle, hsl(var(--success) / 0.18) 0%, transparent 72%)',
            filter: 'blur(16px)',
          }}
        />

        <div
          ref={cardRef}
          className="absolute left-1/2 top-[54%] z-20 w-[172px] -translate-x-1/2 -translate-y-1/2 rounded-[26px] px-4 py-4"
          style={{
            background: 'linear-gradient(180deg, hsl(0 0% 100% / 0.97), hsl(150 18% 96% / 0.95))',
            backdropFilter: 'blur(14px)',
            boxShadow: [
              '0 18px 36px hsl(160 26% 20% / 0.16)',
              '0 4px 14px hsl(160 26% 20% / 0.08)',
              'inset 0 1px 0 hsl(0 0% 100%)',
              '0 0 0 1px hsl(150 18% 84%)',
            ].join(', '),
          }}
        >
          <div ref={headerRef} className="flex items-center justify-between">
            <div>
              <div className="h-2.5 w-12 rounded-full bg-foreground/85" />
              <div className="mt-2 h-2 w-16 rounded-full bg-muted-foreground/25" />
            </div>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl"
              style={{
                background: 'linear-gradient(160deg, hsl(153 66% 62%) 0%, hsl(var(--success)) 56%, hsl(164 44% 38%) 100%)',
                boxShadow: [
                  '0 10px 22px hsl(var(--success) / 0.34)',
                  'inset 0 1px 0 hsl(0 0% 100% / 0.45)',
                  'inset 0 -3px 6px hsl(165 44% 24% / 0.3)',
                ].join(', '),
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M9 1.8 14.8 4.1V8.7C14.8 12.2 12.4 15.2 9 16.3C5.6 15.2 3.2 12.2 3.2 8.7V4.1L9 1.8Z"
                  fill="hsl(0 0% 100% / 0.28)"
                  stroke="hsl(0 0% 100%)"
                  strokeWidth="1.2"
                />
                <path d="M5.6 9.2 7.8 11.2 12.5 6.6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div ref={avatarsRef} className="mt-4 flex items-center">
            {[
              'linear-gradient(135deg, hsl(220 85% 60%), hsl(248 80% 62%))',
              'linear-gradient(135deg, hsl(35 92% 60%), hsl(15 88% 58%))',
              'linear-gradient(135deg, hsl(324 78% 62%), hsl(282 72% 56%))',
            ].map((bg, i) => (
              <div
                key={i}
                className="relative -ml-1 first:ml-0 flex h-10 w-10 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{
                  background: bg,
                  boxShadow: '0 0 0 2px hsl(0 0% 100%), 0 6px 14px hsl(220 20% 30% / 0.14)',
                }}
              >
                {['M', 'A', 'S'][i]}
              </div>
            ))}

            <div className="ml-3 flex items-center gap-1.5 rounded-full px-2.5 py-1"
              style={{
                background: 'linear-gradient(160deg, hsl(150 26% 96%), hsl(150 20% 93%))',
                boxShadow: 'inset 0 1px 0 hsl(0 0% 100%), 0 0 0 1px hsl(150 16% 86%)',
              }}
            >
              {[0, 1, 2, 3, 4].map((star) => (
                <span key={star} className="text-[9px] leading-none" style={{ color: 'hsl(36 92% 55%)' }}>★</span>
              ))}
            </div>
          </div>

          <div ref={listRef} className="mt-4 space-y-2.5">
            {[82, 94, 70].map((width, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    background: i === 1 ? 'hsl(var(--primary))' : 'hsl(var(--success))',
                    boxShadow: i === 1 ? '0 0 0 4px hsl(var(--primary) / 0.10)' : '0 0 0 4px hsl(var(--success) / 0.10)',
                  }}
                />
                <div className="h-2 rounded-full bg-muted-foreground/18" style={{ width }} />
              </div>
            ))}
          </div>
        </div>

        {SIGNALS.map((signal, i) => (
          <div
            key={signal.id}
            ref={(el) => {
              signalRefs.current[i] = el;
            }}
            className="absolute z-30 rounded-full px-3 py-1.5"
            style={{
              left: `${signal.x}%`,
              top: `${signal.y}%`,
              width: signal.width,
              background: 'linear-gradient(160deg, hsl(0 0% 100% / 0.95), hsl(150 20% 96% / 0.92))',
              backdropFilter: 'blur(12px)',
              boxShadow: [
                '0 10px 24px hsl(160 24% 22% / 0.12)',
                'inset 0 1px 0 hsl(0 0% 100%)',
                '0 0 0 1px hsl(150 18% 86%)',
              ].join(', '),
            }}
          >
            <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  background: signal.id === 'public' ? 'hsl(var(--primary))' : 'hsl(var(--success))',
                  boxShadow: signal.id === 'public' ? '0 0 8px hsl(var(--primary) / 0.4)' : '0 0 8px hsl(var(--success) / 0.35)',
                }}
              />
              <span className="text-[10px] font-semibold text-foreground/90">{signal.label}</span>
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
