import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { VerificationStatus } from '@/types/anybuddy';

const STATUS_CONFIG: Record<VerificationStatus, {
  emoji: string;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}> = {
  unverified: {
    emoji: '📸',
    title: 'Get verified',
    description: 'Upload a selfie to verify your identity. Builds trust.',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
  },
  pending: {
    emoji: '⏳',
    title: 'Verification pending',
    description: 'Your selfie is under review. We\'ll notify you.',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  verified: {
    emoji: '🔵',
    title: 'Verified',
    description: 'Identity confirmed via selfie verification.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  failed: {
    emoji: '⚠️',
    title: 'Verification failed',
    description: 'Please try again with a clear photo.',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
};

export function VerificationCard() {
  const { user, submitVerificationSelfie } = useAppStore();
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const status = user.verificationStatus || 'unverified';
  const config = STATUS_CONFIG[status];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setPreview(url);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!preview) return;
    submitVerificationSelfie(preview);
    setPreview(null);
  };

  const showUpload = status === 'unverified' || status === 'failed';

  return (
    <div className="liquid-glass-heavy p-4 transition-all">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={cn('w-9 h-9 rounded-xl liquid-glass flex items-center justify-center shrink-0', config.color)} style={{ borderRadius: '0.625rem' }}>
          <span className="text-base">{config.emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-[13px] font-semibold', status === 'verified' ? 'text-primary' : 'text-foreground')}>
            {config.title}
          </p>
          <p className="text-[10.5px] text-muted-foreground leading-snug mt-0.5">
            {config.description}
          </p>
        </div>
      </div>

      {/* Selfie preview (pending state) */}
      {status === 'pending' && user.verificationSelfie && (
        <div className="mt-3 flex items-center gap-3 p-2.5 liquid-glass" style={{ borderRadius: '0.75rem' }}>
          <img src={user.verificationSelfie} alt="Verification selfie" className="w-10 h-10 rounded-lg object-cover" />
          <p className="text-[11px] text-muted-foreground">Selfie submitted for review</p>
        </div>
      )}

      {/* Upload area */}
      {showUpload && !preview && (
        <>
          <input ref={fileRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleFileChange} />
          <Button
            variant="secondary"
            size="sm"
            className="mt-3 w-full h-9 text-[12px]"
            onClick={() => fileRef.current?.click()}
          >
            📸 {status === 'failed' ? 'Try again' : 'Take a selfie'}
          </Button>
        </>
      )}

      {/* Preview + confirm */}
      {showUpload && preview && (
        <div className="mt-3 space-y-2.5">
          <div className="flex items-center gap-3 p-2.5 liquid-glass" style={{ borderRadius: '0.75rem' }}>
            <img src={preview} alt="Selfie preview" className="w-12 h-12 rounded-lg object-cover" />
            <p className="text-[11px] text-muted-foreground flex-1">Looking good! Used only for verification.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="flex-1 h-9 text-[12px]" onClick={() => setPreview(null)}>
              Retake
            </Button>
            <Button size="sm" className="flex-1 h-9 text-[12px]" onClick={handleSubmit}>
              🛡️ Submit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
