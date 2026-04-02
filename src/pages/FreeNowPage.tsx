import { useNavigate } from 'react-router-dom';
import { PageTransition } from '@/components/layout/PageTransition';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { AppIcon } from '@/components/icons/AppIcon';
import { SelectionChip } from '@/components/ui/SelectionChip';
import { useState } from 'react';

const categories = ['☕ Coffee', '🚶 Walk', '🍕 Food', '🧭 Explore', '🤝 Networking', '😎 Chill'];

const FreeNowPage = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleCategory = (cat: string) => {
    setSelected(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24 text-center">
          {/* Hero */}
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <AppIcon name="tw:sparkles" size={40} />
          </div>
          <h1 className="text-2xl font-bold mb-2">I'm Free Now!</h1>
          <p className="text-muted-foreground text-sm mb-8 max-w-xs">
            Tell us what you're in the mood for and we'll find nearby plans — or help you start one.
          </p>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selected.includes(cat)
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="w-full max-w-xs space-y-3">
            <Button className="w-full" size="lg" onClick={() => navigate('/home')}>
              Find Plans Nearby
            </Button>
            <Button variant="outline" className="w-full" size="lg" onClick={() => navigate('/create')}>
              Create a Quick Plan
            </Button>
          </div>
        </div>

        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default FreeNowPage;
