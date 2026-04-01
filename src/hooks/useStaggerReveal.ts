import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function useStaggerReveal<T extends HTMLElement>(deps: unknown[] = []) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const children = el.children;
    if (children.length === 0) return;

    gsap.fromTo(
      children,
      { opacity: 0, y: 18, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        ease: 'power2.out',
        stagger: 0.06,
        clearProps: 'transform',
      }
    );
  }, deps);

  return containerRef;
}
