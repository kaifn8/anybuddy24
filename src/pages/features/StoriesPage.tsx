import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FeatureShell, PrototypeBanner } from './_FeatureShell';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AppIcon } from '@/components/icons/AppIcon';

const STORY_NAMES = ['Priya', 'Arjun', 'Maya', 'Rohan', 'Zara', 'Aditya', 'Neha'];
const STORY_BG = [
  'from-rose-400 to-orange-400',
  'from-violet-400 to-fuchsia-400',
  'from-sky-400 to-cyan-400',
  'from-emerald-400 to-lime-400',
  'from-amber-400 to-pink-400',
  'from-indigo-400 to-blue-400',
  'from-teal-400 to-emerald-400',
];
const STORY_CAPTIONS = [
  'Just finished a great chai 🍵',
  'Marine drive walk with new friends',
  'Found my new favourite cafe ✨',
  'Trek vibes 🏔️',
  'Brunch crew assembled',
  'Powai sunset 🌅',
  'Cricket nets again 🏏',
];

export default function StoriesPage() {
  const user = useAppStore((s) => s.user);
  const navigate = useNavigate();
  const [active, setActive] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (active === null) return;
    setProgress(0);
    const start = Date.now();
    const t = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / 4000);
      setProgress(p);
      if (p >= 1) {
        if (active < STORY_NAMES.length - 1) {
          setActive(active + 1);
        } else {
          setActive(null);
        }
      }
    }, 40);
    return () => clearInterval(t);
  }, [active]);

  return (
    <FeatureShell
      title="Stories"
      hero={{ icon: 'fc:news', label: '24-hour highlights', sub: 'Posts disappear after a day · stay ephemeral', tone: 'accent' }}
    >
      <PrototypeBanner />

      <div className="liquid-glass-heavy p-4 rounded-[1.25rem]">
        <p className="section-label mb-3">Your circle today</p>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {/* Your story */}
          <button onClick={() => alert('Camera — coming in v2')} className="flex flex-col items-center gap-1.5 shrink-0 tap-scale">
            <div className="relative">
              <GradientAvatar name={user?.firstName || 'You'} size={64} />
              <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary border-2 border-background flex items-center justify-center text-white text-[10px] font-bold">+</span>
            </div>
            <p className="text-[10px] font-semibold">Your story</p>
          </button>

          {STORY_NAMES.map((name, i) => (
            <button key={name} onClick={() => setActive(i)} className="flex flex-col items-center gap-1.5 shrink-0 tap-scale">
              <div className="p-[2px] rounded-full bg-gradient-to-br from-primary via-accent to-primary">
                <div className="bg-background p-[2px] rounded-full">
                  <GradientAvatar name={name} size={60} />
                </div>
              </div>
              <p className="text-[10px] font-semibold max-w-[64px] truncate">{name}</p>
            </button>
          ))}
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={() => navigate('/chats')}>
        Open chats →
      </Button>

      {active !== null && (
        <div className="fixed inset-0 z-modal bg-black flex items-center justify-center">
          {/* Progress bars */}
          <div className="absolute top-3 left-3 right-3 flex gap-1">
            {STORY_NAMES.map((_, i) => (
              <div key={i} className="flex-1 h-[3px] rounded-full bg-white/20 overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all"
                  style={{ width: i < active ? '100%' : i === active ? `${progress * 100}%` : '0%' }} />
              </div>
            ))}
          </div>
          {/* Header */}
          <div className="absolute top-8 left-3 right-3 flex items-center gap-2 z-10">
            <GradientAvatar name={STORY_NAMES[active]} size={36} />
            <div className="flex-1">
              <p className="text-[13px] font-bold text-white">{STORY_NAMES[active]}</p>
              <p className="text-[10px] text-white/60">{Math.floor(Math.random() * 12 + 1)}h ago</p>
            </div>
            <button onClick={() => setActive(null)} className="text-white/80 text-2xl leading-none">×</button>
          </div>
          {/* Tap zones */}
          <button onClick={() => setActive(active > 0 ? active - 1 : null)} className="absolute inset-y-0 left-0 w-1/3 z-0" />
          <button onClick={() => setActive(active < STORY_NAMES.length - 1 ? active + 1 : null)} className="absolute inset-y-0 right-0 w-1/3 z-0" />
          {/* Story image */}
          <div className={cn('w-full max-w-md aspect-[9/16] bg-gradient-to-br flex items-end p-6', STORY_BG[active])}>
            <p className="text-white text-[18px] font-bold drop-shadow-lg leading-snug">
              {STORY_CAPTIONS[active]}
            </p>
          </div>
          <div className="absolute bottom-6 left-3 right-3 z-10">
            <input
              placeholder={`Reply to ${STORY_NAMES[active]}…`}
              onClick={(e) => e.stopPropagation()}
              className="w-full h-11 bg-white/10 border border-white/20 rounded-full px-4 text-[13px] text-white placeholder:text-white/50 outline-none backdrop-blur-md"
            />
          </div>
        </div>
      )}
    </FeatureShell>
  );
}