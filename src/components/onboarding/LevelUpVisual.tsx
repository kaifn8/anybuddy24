import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Trust journey scene: a staircase of four trust tiers
 * (Seed → Solid → Trusted → Anchor) with the user avatar
 * standing on the third step. Same plate aesthetic as
 * DiscoverVisual / SafeVisual.
 */

const STEPS = [
  { label: 'Seed', emoji: '🌱', color: 'hsl(152 55% 50%)' },
  { label: 'Solid', emoji: '🤝', color: 'hsl(195 80% 55%)' },
  { label: 'Trusted', emoji: '⭐', color: 'hsl(36 92% 55%)' },
  { label: 'Anchor', emoji: '👑', color: 'hsl(265 65% 62%)' },
];

const SPARKS = Array.from({ length: 8 }, (_, i) => ({
  angle: (i / 8) * Math.PI * 2 + gsap.utils.random(-0.2, 0.2),
  dist: gsap.utils.random(38, 62, 1),
  size: gsap.utils.random(3, 6, 1),
  color: ['hsl(36 92% 60%)', 'hsl(45 95% 65%)', 'hsl(28 90% 58%)'][i % 3],
  delay: gsap.utils.random(0, 0.3),
}));

export default function LevelUpVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);
  const avatarRef = useRef<HTMLDivElement>(null);
  const sparksRef = useRef<(HTMLDivElement | null)[]>([]);
  const arrowRef = useRef<SVGSVGElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  // User is currently on step index 2 ("Trusted"); next step is "Anchor".
  const currentStep = 2;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        plateRef.current,
        { opacity: 0, scale: 0.94, y: 8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: 'power3.out' }
      );

      // Steps rise sequentially
      stepsRef.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: 16, scale: 0.85 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.45,
            delay: 0.25 + i * 0.1,
            ease: 'back.out(1.6)',
          }
        );
      });

      // Avatar drops onto current step
      gsap.fromTo(
        avatarRef.current,
        { opacity: 0, y: -22, scale: 0.6 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          delay: 0.7,
          ease: 'back.out(2)',
        }
      );
      // Gentle bob
      gsap.to(avatarRef.current, {
        y: -3,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.3,
      });

      // Spark burst around avatar
      sparksRef.current.forEach((el, i) => {
        if (!el) return;
        const s = SPARKS[i];
        gsap.fromTo(
          el,
          { x: 0, y: 0, opacity: 1, scale: 0 },
          {
            x: Math.cos(s.angle) * s.dist,
            y: Math.sin(s.angle) * s.dist,
            opacity: 0,
            scale: 1,
            duration: 1,
            delay: 0.85 + s.delay,
            ease: 'power2.out',
          }
        );
      });

      // Arrow pointing to next step
      if (arrowRef.current) {
        const path = arrowRef.current.querySelector('path');
        if (path) {
          const len = (path as SVGPathElement).getTotalLength();
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
          gsap.to(path, {
            strokeDashoffset: 0,
            opacity: 1,
            duration: 0.6,
            delay: 1.1,
            ease: 'power2.out',
          });
        }
        // Subtle pulse
        gsap.to(arrowRef.current, {
          opacity: 0.55,
          duration: 1.4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1.8,
        });
      }

      // Progress bar fill (toward next tier)
      gsap.fromTo(
        fillRef.current,
        { scaleX: 0 },
        {
          scaleX: 0.7,
          duration: 0.9,
          delay: 0.95,
          ease: 'power2.out',
          transformOrigin: 'left',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[290px] aspect-square mx-auto flex items-center justify-center"
    >
      {/* Ambient backdrop glow */}
      <div
        className="absolute inset-0 rounded-[40px]"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, hsl(var(--accent) / 0.22) 0%, transparent 70%)',
          filter: 'blur(8px)',
        }}
      />

      {/* Plate */}
      <div
        ref={plateRef}
        className="relative w-[90%] aspect-square rounded-[32px] overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, hsl(40 50% 97%) 0%, hsl(36 45% 93%) 100%)',
          boxShadow: [
            '0 20px 50px -12px hsl(36 60% 30% / 0.25)',
            '0 8px 20px -8px hsl(36 60% 30% / 0.15)',
            'inset 0 1.5px 0 hsl(0 0% 100% / 0.9)',
            '0 0 0 1px hsl(36 30% 88%)',
          ].join(', '),
        }}
      >
        {/* Soft inner radial wash */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 42%, hsl(var(--accent) / 0.16) 0%, transparent 65%)',
          }}
        />

        {/* Subtle grid texture */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 260 260">
          <defs>
            <pattern id="lvl-dots" width="18" height="18" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="hsl(36 60% 25%)" />
            </pattern>
          </defs>
          <rect width="260" height="260" fill="url(#lvl-dots)" />
        </svg>

        {/* Staircase area */}
        <div className="absolute inset-0 flex flex-col justify-end px-5 pb-12">
          <div className="flex items-end justify-center gap-1.5 h-[60%]">
            {STEPS.map((step, i) => {
              const isPast = i < currentStep;
              const isCurrent = i === currentStep;
              const isFuture = i > currentStep;
              // Heights ascend
              const heightPct = 28 + i * 18;
              return (
                <div
                  key={step.label}
                  ref={(el) => {
                    stepsRef.current[i] = el;
                  }}
                  className="relative flex flex-col items-center"
                  style={{ width: 44 }}
                >
                  {/* Avatar sits on current step */}
                  {isCurrent && (
                    <div
                      ref={avatarRef}
                      className="absolute left-1/2 -translate-x-1/2 z-30"
                      style={{ bottom: `calc(${heightPct}% + 4px)` }}
                    >
                      <div className="relative">
                        {/* Sparks */}
                        {SPARKS.map((s, si) => (
                          <div
                            key={si}
                            ref={(el) => {
                              sparksRef.current[si] = el;
                            }}
                            className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
                            style={{
                              width: s.size,
                              height: s.size,
                              marginLeft: -s.size / 2,
                              marginTop: -s.size / 2,
                              background: s.color,
                              boxShadow: `0 0 8px ${s.color}`,
                            }}
                          />
                        ))}
                        {/* Glow under avatar */}
                        <div
                          className="absolute -inset-2 rounded-full blur-md"
                          style={{ background: 'hsl(var(--accent) / 0.45)' }}
                        />
                        <div
                          className="relative w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-bold text-white"
                          style={{
                            background:
                              'linear-gradient(135deg, hsl(265 70% 62%), hsl(220 80% 55%))',
                            boxShadow:
                              '0 6px 12px hsl(220 70% 35% / 0.5), inset 0 1.5px 0 hsl(0 0% 100% / 0.45), 0 0 0 2px hsl(0 0% 100%)',
                          }}
                        >
                          S
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Arrow from current step to next step */}
                  {i === currentStep + 1 && (
                    <svg
                      ref={arrowRef}
                      className="absolute z-20 pointer-events-none"
                      width="44"
                      height="36"
                      viewBox="0 0 44 36"
                      style={{ bottom: `calc(${heightPct}% + 6px)`, left: -22 }}
                      fill="none"
                    >
                      <path
                        d="M 4 28 Q 22 4 38 18 L 34 12 M 38 18 L 32 22"
                        stroke="hsl(36 90% 45%)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}

                  {/* Step pillar */}
                  <div
                    className="w-full rounded-t-xl rounded-b-md relative overflow-hidden"
                    style={{
                      height: `${heightPct}%`,
                      minHeight: 38,
                      background: isFuture
                        ? 'linear-gradient(180deg, hsl(36 25% 88%), hsl(36 25% 82%))'
                        : `linear-gradient(180deg, ${step.color}, ${step.color.replace('%)', '% / 0.85)')})`,
                      boxShadow: isFuture
                        ? 'inset 0 1.5px 0 hsl(0 0% 100% / 0.7), inset 0 -2px 4px hsl(36 30% 60% / 0.3), 0 4px 8px hsl(36 40% 30% / 0.12)'
                        : `0 8px 16px ${step.color.replace('%)', '% / 0.35)')}, inset 0 1.5px 0 hsl(0 0% 100% / 0.4), inset 0 -3px 6px hsl(0 0% 0% / 0.18)`,
                      opacity: isFuture ? 0.85 : 1,
                    }}
                  >
                    {/* Top emoji on the step face */}
                    <div className="absolute top-1.5 left-0 right-0 flex justify-center">
                      <span
                        className="text-[14px] leading-none"
                        style={{
                          filter: isFuture
                            ? 'grayscale(0.6) opacity(0.7)'
                            : 'drop-shadow(0 1.5px 2px hsl(0 0% 0% / 0.35))',
                        }}
                      >
                        {step.emoji}
                      </span>
                    </div>
                    {/* Side bevel highlight */}
                    <div
                      className="absolute top-0 bottom-0 left-0 w-1 opacity-40"
                      style={{
                        background:
                          'linear-gradient(180deg, hsl(0 0% 100% / 0.7), transparent)',
                      }}
                    />
                  </div>

                  {/* Label */}
                  <div
                    className="mt-1.5 text-[9px] font-bold uppercase tracking-wider leading-none"
                    style={{
                      color: isFuture
                        ? 'hsl(36 15% 55%)'
                        : isCurrent
                          ? 'hsl(36 60% 28%)'
                          : 'hsl(160 25% 35%)',
                    }}
                  >
                    {step.label}
                  </div>

                  {/* Tiny check for past steps */}
                  {isPast && (
                    <div
                      className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                      style={{
                        background: 'hsl(152 55% 44%)',
                        boxShadow: '0 0 0 1.5px hsl(0 0% 100%), 0 2px 4px hsl(152 55% 30% / 0.4)',
                      }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom progress bar — XP toward next tier */}
        <div className="absolute bottom-3 left-5 right-5 z-10">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-foreground/80">
              Next: Anchor
            </span>
            <span className="text-[9px] font-medium text-muted-foreground">
              850 / 1000 XP
            </span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden relative"
            style={{
              background: 'hsl(36 25% 85%)',
              boxShadow:
                'inset 0 1px 2px hsl(36 30% 30% / 0.2), inset 0 -1px 0 hsl(0 0% 100% / 0.5)',
            }}
          >
            <div
              ref={fillRef}
              className="h-full rounded-full relative overflow-hidden"
              style={{
                background:
                  'linear-gradient(90deg, hsl(36 92% 55%), hsl(28 90% 55%), hsl(265 65% 62%))',
                transformOrigin: 'left',
                boxShadow:
                  '0 0 10px hsl(36 92% 55% / 0.5), inset 0 1px 0 hsl(0 0% 100% / 0.4)',
              }}
            >
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-[shimmer_2.5s_infinite]"
                style={{ backgroundSize: '200% 100%' }}
              />
            </div>
          </div>
        </div>

        {/* Subtle vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, transparent 55%, hsl(36 30% 20% / 0.08) 100%)',
          }}
        />
      </div>
    </div>
  );
}
