import { useState } from 'react';
import { FeatureShell, PrototypeBanner } from './_FeatureShell';
import { Button } from '@/components/ui/button';
import { AppIcon } from '@/components/icons/AppIcon';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const SAMPLE_PHOTOS = [
  { id: 1, gradient: 'from-rose-300 to-orange-300',  caption: 'Sunset chai at Carter Road',     likes: 14, plan: 'Coffee meet' },
  { id: 2, gradient: 'from-sky-300 to-indigo-300',   caption: 'Marine Drive walk',              likes: 22, plan: 'Evening walk' },
  { id: 3, gradient: 'from-emerald-300 to-teal-300', caption: 'Badminton crew',                 likes: 31, plan: 'Sports' },
  { id: 4, gradient: 'from-amber-300 to-pink-300',   caption: 'Brunch hangout',                 likes: 18, plan: 'Food' },
  { id: 5, gradient: 'from-violet-300 to-fuchsia-300', caption: 'Art district stroll',          likes: 9,  plan: 'Explore' },
  { id: 6, gradient: 'from-lime-300 to-emerald-300', caption: 'Trek summit view',               likes: 47, plan: 'Adventure' },
];

export default function PhotosPage() {
  const user = useAppStore((s) => s.user);
  const [photos, setPhotos] = useState(SAMPLE_PHOTOS);
  const [open, setOpen] = useState<number | null>(null);

  const toggleLike = (id: number) =>
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));

  return (
    <FeatureShell
      title="Photo Gallery"
      hero={{ icon: 'tw:camera', label: `${user?.firstName || 'Your'} memories`, sub: `${photos.length} moments from your meetups`, tone: 'primary' }}
    >
      <PrototypeBanner />

      <div className="grid grid-cols-3 gap-1.5">
        {photos.map((p) => (
          <button
            key={p.id}
            onClick={() => setOpen(p.id)}
            className={cn('aspect-square rounded-xl bg-gradient-to-br tap-scale relative overflow-hidden', p.gradient)}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <div className="absolute bottom-1 left-1.5 right-1.5 flex items-center gap-1">
              <AppIcon name="fc:like" size={9} />
              <span className="text-[9px] font-bold text-white tabular-nums">{p.likes}</span>
            </div>
          </button>
        ))}
      </div>

      <Button className="w-full h-11 mt-2" onClick={() => alert('Photo upload — coming in v2')}>
        <AppIcon name="tw:camera" size={16} /> <span className="ml-2">Add new photo</span>
      </Button>

      {open !== null && (() => {
        const photo = photos.find(p => p.id === open);
        if (!photo) return null;
        return (
          <div className="fixed inset-0 z-modal flex items-end" onClick={() => setOpen(null)}>
            <div className="absolute inset-0 bg-foreground/40 backdrop-blur-md" />
            <div className="relative w-full max-w-md mx-auto rounded-t-[28px] liquid-glass-heavy p-5 pb-8" onClick={(e) => e.stopPropagation()}>
              <div className={cn('w-full aspect-[4/5] rounded-2xl bg-gradient-to-br mb-4', photo.gradient)} />
              <p className="text-[14px] font-bold text-foreground mb-1">{photo.caption}</p>
              <p className="text-[11px] text-muted-foreground mb-4">From: {photo.plan}</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => toggleLike(photo.id)}>
                  <AppIcon name="fc:like" size={14} /> <span className="ml-2">{photo.likes}</span>
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setOpen(null)}>Close</Button>
              </div>
            </div>
          </div>
        );
      })()}
    </FeatureShell>
  );
}