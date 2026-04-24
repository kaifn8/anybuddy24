import { useNavigate } from 'react-router-dom';
import { FeatureShell, PrototypeBanner } from './_FeatureShell';
import { useAppStore } from '@/store/useAppStore';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import { Button } from '@/components/ui/button';
import { AppIcon } from '@/components/icons/AppIcon';

export default function SavedPlansPage() {
  const navigate = useNavigate();
  const { user, requests, savePlan, unsavePlan } = useAppStore();
  const saved = requests.filter(r => user?.savedPlans?.includes(r.id));

  return (
    <FeatureShell
      title="Saved Plans"
      hero={{ icon: 'fc:bookmark', label: `${saved.length} bookmarked`, sub: 'Plans you tagged to revisit later', tone: 'primary' }}
    >
      <PrototypeBanner />

      {saved.length === 0 ? (
        <div className="text-center py-16 liquid-glass-heavy rounded-[1.25rem] p-8">
          <AppIcon name="fc:bookmark" size={36} className="mx-auto mb-3 opacity-50" />
          <p className="text-[15px] font-bold mb-1">Nothing saved yet</p>
          <p className="text-[12px] text-muted-foreground mb-5">Tap the bookmark on any plan to add it here</p>
          <Button onClick={() => navigate('/home')}>Browse plans</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {saved.map((r) => (
            <div key={r.id} className="liquid-glass-interactive p-3.5 flex items-center gap-3">
              <button onClick={() => navigate(`/request/${r.id}`)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                <CategoryIcon category={r.category} size="sm" className="liquid-glass shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold truncate">{r.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">📍 {r.location.name} · by {r.userName}</p>
                </div>
              </button>
              <button
                onClick={() => user?.savedPlans?.includes(r.id) ? unsavePlan(r.id) : savePlan(r.id)}
                className="w-9 h-9 rounded-full liquid-glass flex items-center justify-center tap-scale shrink-0"
              >
                <AppIcon name="fc:bookmark" size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </FeatureShell>
  );
}