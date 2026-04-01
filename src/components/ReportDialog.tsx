import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const REPORT_REASONS = [
  { id: 'inappropriate', label: 'Inappropriate behavior', emoji: '🚫' },
  { id: 'noshow', label: 'No-show', emoji: '👻' },
  { id: 'spam', label: 'Spam', emoji: '📢' },
  { id: 'fake', label: 'Fake profile', emoji: '🎭' },
  { id: 'harassment', label: 'Harassment', emoji: '⚠️' },
  { id: 'misleading', label: 'Misleading description', emoji: '❌' },
  { id: 'unsafe', label: 'Unsafe location/situation', emoji: '🚨' },
  { id: 'other', label: 'Other', emoji: '📝' },
];

interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
  targetId: string;
  targetName: string;
  targetType: 'user' | 'plan';
}

export function ReportDialog({ open, onClose, targetId, targetName, targetType }: ReportDialogProps) {
  const { submitReport } = useAppStore();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  const handleSubmit = () => {
    if (!selectedReason) return;
    const reason = REPORT_REASONS.find(r => r.id === selectedReason);
    submitReport({
      targetId,
      targetName,
      targetType,
      reason: reason?.label || selectedReason,
      description: description.trim(),
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSelectedReason(null);
      setDescription('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-background rounded-t-3xl sm:rounded-3xl border border-border/30 shadow-xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/15">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center">
              <span className="text-base">⚠️</span>
            </div>
            <div>
              <h3 className="text-sm font-bold">Report {targetType === 'user' ? 'User' : 'Plan'}</h3>
              <p className="text-[10px] text-muted-foreground">{targetName}</p>
            </div>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon" className="w-8 h-8 rounded-full">
            <span className="text-lg">✕</span>
          </Button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <span className="text-4xl block mb-3">✅</span>
            <p className="text-sm font-semibold">Report submitted</p>
            <p className="text-xs text-muted-foreground mt-1">We'll review this shortly. Thanks for keeping anybuddy safe.</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Reason selection */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">What's the issue?</p>
              <div className="grid grid-cols-2 gap-1.5">
                {REPORT_REASONS.map((reason) => (
                  <button
                    key={reason.id}
                    onClick={() => setSelectedReason(reason.id)}
                    className={cn(
                      'flex items-center gap-2 p-2.5 rounded-xl text-left tap-scale transition-all text-xs font-medium',
                      selectedReason === reason.id
                        ? 'bg-destructive/10 border border-destructive/30 text-destructive'
                        : 'border border-border/20 bg-background/60 text-foreground hover:border-border/40'
                    )}
                  >
                    <span>{reason.emoji}</span>
                    <span className="leading-tight">{reason.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Details (optional)</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                placeholder="Tell us more about what happened..."
                rows={3}
                className="w-full rounded-xl border border-border/30 bg-background/60 p-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-destructive/30 resize-none"
              />
              <p className="text-[9px] text-muted-foreground text-right mt-0.5">{description.length}/500</p>
            </div>

            {/* Submit */}
            <Button
              variant="destructive"
              className="w-full"
              disabled={!selectedReason}
              onClick={handleSubmit}
            >
              ⚠️ Submit Report
            </Button>

            <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
              Reports are reviewed by our team. False reports may affect your trust level.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
