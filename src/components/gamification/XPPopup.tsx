import { useEffect, useRef } from 'react';
import { useGamificationStore } from '@/store/useGamificationStore';
import gsap from 'gsap';

function XPPopupItem({ id, amount, label }: { id: string; amount: number; label: string }) {
  const clearXPPopup = useGamificationStore((s) => s.clearXPPopup);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 0, scale: 0.8 },
      {
        opacity: 1, y: -32, scale: 1,
        duration: 0.35, ease: 'back.out(1.5)',
        onComplete: () => {
          gsap.to(ref.current, {
            opacity: 0, y: -56,
            duration: 0.4, delay: 1.2, ease: 'power2.in',
            onComplete: () => clearXPPopup(id),
          });
        },
      }
    );
  }, [id, clearXPPopup]);

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-1 rounded-full text-primary-foreground text-[11px] font-bold whitespace-nowrap"
      style={{
        background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))',
        boxShadow: '0 4px 12px hsl(var(--primary) / 0.4)',
      }}
    >
      ⚡ +{amount} XP
    </div>
  );
}

export function XPPopupLayer() {
  const xpPopups = useGamificationStore((s) => s.xpPopups);

  if (xpPopups.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[998] pointer-events-none">
      {xpPopups.map((popup) => (
        <div key={popup.id} className="absolute bottom-32 left-1/2 -translate-x-1/2">
          <XPPopupItem {...popup} />
        </div>
      ))}
    </div>
  );
}
