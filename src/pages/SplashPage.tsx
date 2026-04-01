import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import gsap from 'gsap';

export default function SplashPage() {
  const navigate = useNavigate();
  const { user, isOnboarded } = useAppStore();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  
  useEffect(() => {
    const tl = gsap.timeline();
    gsap.set([logoRef.current, taglineRef.current], { opacity: 0 });
    
    tl.fromTo(logoRef.current, 
      { opacity: 0, scale: 0.85, y: 10 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power3.out' }
    )
    .fromTo(taglineRef.current,
      { opacity: 0, y: 8 },
      { opacity: 0.5, y: 0, duration: 0.4, ease: 'power2.out' },
      '-=0.15'
    );
    
    const timer = setTimeout(() => {
      gsap.to(containerRef.current, {
        opacity: 0, duration: 0.3, ease: 'power2.in',
        onComplete: () => navigate(user && isOnboarded ? '/home' : '/onboarding'),
      });
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [navigate, user, isOnboarded]);
  
  return (
    <div 
      ref={containerRef}
      className="mobile-container flex flex-col items-center justify-center min-h-screen bg-ambient relative overflow-hidden"
    >
      {/* Ambient gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-secondary/10 blur-3xl" />
      
      <div className="flex flex-col items-center relative z-10">
        <div ref={logoRef}>
          <span 
            className="text-[36px] text-foreground"
            style={{ fontFamily: "'Pacifico', cursive" }}
          >
            any<span className="text-primary">buddy</span>
          </span>
        </div>
        <p ref={taglineRef} className="text-[13px] text-muted-foreground mt-2 font-medium tracking-wide">
          someone's always nearby
        </p>
      </div>
    </div>
  );
}
