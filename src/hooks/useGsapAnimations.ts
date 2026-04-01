import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function useStaggerReveal<T extends HTMLElement>(
  deps: React.DependencyList = []
) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const children = containerRef.current.children;
    
    gsap.fromTo(
      children,
      {
        opacity: 0,
        y: 30,
        scale: 0.95,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power3.out',
      }
    );
  }, deps);

  return containerRef;
}

export function useFadeIn<T extends HTMLElement>(
  options: { delay?: number; duration?: number; y?: number } = {}
) {
  const ref = useRef<T>(null);
  const { delay = 0, duration = 0.6, y = 20 } = options;

  useEffect(() => {
    if (!ref.current) return;

    gsap.fromTo(
      ref.current,
      { opacity: 0, y },
      { opacity: 1, y: 0, duration, delay, ease: 'power2.out' }
    );
  }, [delay, duration, y]);

  return ref;
}

export function useScaleIn<T extends HTMLElement>(
  options: { delay?: number; duration?: number } = {}
) {
  const ref = useRef<T>(null);
  const { delay = 0, duration = 0.5 } = options;

  useEffect(() => {
    if (!ref.current) return;

    gsap.fromTo(
      ref.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration, delay, ease: 'back.out(1.7)' }
    );
  }, [delay, duration]);

  return ref;
}

export function usePulse<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;

    gsap.to(ref.current, {
      scale: 1.1,
      opacity: 0.7,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    });
  }, []);

  return ref;
}

export function useFloating<T extends HTMLElement>(intensity: number = 8) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;

    gsap.to(ref.current, {
      y: -intensity,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    });
  }, [intensity]);

  return ref;
}

export function useSlideUp<T extends HTMLElement>(
  options: { delay?: number; duration?: number } = {}
) {
  const ref = useRef<T>(null);
  const { delay = 0, duration = 0.6 } = options;

  useEffect(() => {
    if (!ref.current) return;

    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 40, clipPath: 'inset(0 0 100% 0)' },
      { 
        opacity: 1, 
        y: 0, 
        clipPath: 'inset(0 0 0% 0)',
        duration, 
        delay, 
        ease: 'power3.out' 
      }
    );
  }, [delay, duration]);

  return ref;
}

// Imperative animation functions
export const gsapAnimations = {
  buttonPress: (element: HTMLElement) => {
    gsap.to(element, {
      scale: 0.95,
      duration: 0.1,
      ease: 'power2.out',
      onComplete: () => {
        gsap.to(element, {
          scale: 1,
          duration: 0.2,
          ease: 'elastic.out(1, 0.5)',
        });
      },
    });
  },

  cardHover: (element: HTMLElement, isEntering: boolean) => {
    gsap.to(element, {
      y: isEntering ? -4 : 0,
      boxShadow: isEntering 
        ? '0 12px 40px -8px rgba(0, 0, 0, 0.15)' 
        : '0 4px 24px -4px rgba(0, 0, 0, 0.06)',
      duration: 0.3,
      ease: 'power2.out',
    });
  },

  successPop: (element: HTMLElement) => {
    gsap.fromTo(
      element,
      { scale: 0, opacity: 0 },
      { 
        scale: 1, 
        opacity: 1, 
        duration: 0.5, 
        ease: 'elastic.out(1, 0.4)' 
      }
    );
  },

  shake: (element: HTMLElement) => {
    gsap.fromTo(
      element,
      { x: 0 },
      {
        x: 8,
        duration: 0.08,
        repeat: 5,
        yoyo: true,
        ease: 'power2.inOut',
      }
    );
  },

  ripple: (element: HTMLElement, x: number, y: number) => {
    const ripple = document.createElement('div');
    ripple.className = 'absolute rounded-full bg-white/30 pointer-events-none';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.transform = 'translate(-50%, -50%)';
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);

    gsap.fromTo(
      ripple,
      { width: 0, height: 0, opacity: 1 },
      {
        width: 200,
        height: 200,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => ripple.remove(),
      }
    );
  },

  counter: (element: HTMLElement, start: number, end: number, duration: number = 1) => {
    const obj = { value: start };
    gsap.to(obj, {
      value: end,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        element.textContent = Math.round(obj.value).toString();
      },
    });
  },
};
