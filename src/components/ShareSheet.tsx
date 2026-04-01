import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AppIcon } from '@/components/icons/AppIcon';
import type { Request } from '@/types/anybuddy';

interface ShareSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  text?: string;
  request?: Request;
}

export function ShareSheet({ open, onClose, title, text }: ShareSheetProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = window.location.href;
  const shareText = text || title;

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`, '_blank');
    onClose();
  };

  const handleInstagram = () => {
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => { setCopied(false); onClose(); }, 1500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url: shareUrl });
        onClose();
      } catch {}
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="liquid-glass-heavy border-border/20 max-w-[340px] rounded-2xl p-5">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold">Invite friends to join</DialogTitle>
          <DialogDescription className="text-2xs text-muted-foreground line-clamp-1">{title}</DialogDescription>
        </DialogHeader>
        
        {/* Message preview */}
        <div className="liquid-glass-subtle p-3 rounded-lg mt-1">
          <p className="text-xs text-foreground whitespace-pre-line leading-relaxed">{shareText}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-3">
          <Button onClick={handleWhatsApp} variant="ghost" className="flex flex-col items-center gap-2 p-3 h-auto rounded-xl liquid-glass">
            <AppIcon name="tw:chat" size={32} />
            <span className="text-2xs font-semibold">WhatsApp</span>
          </Button>
          <Button onClick={handleInstagram} variant="ghost" className="flex flex-col items-center gap-2 p-3 h-auto rounded-xl liquid-glass">
            <AppIcon name="tw:megaphone" size={32} />
            <span className="text-2xs font-semibold">Instagram</span>
          </Button>
          {navigator.share ? (
            <Button onClick={handleNativeShare} variant="ghost" className="flex flex-col items-center gap-2 p-3 h-auto rounded-xl liquid-glass">
              <AppIcon name="fc:share" size={32} />
              <span className="text-2xs font-semibold">More</span>
            </Button>
          ) : (
            <Button onClick={handleCopyLink} variant="ghost" className="flex flex-col items-center gap-2 p-3 h-auto rounded-xl liquid-glass">
              {copied ? <AppIcon name="tw:check" size={32} /> : <AppIcon name="fc:bookmark" size={32} />}
              <span className="text-2xs font-semibold">{copied ? 'Copied!' : 'Copy Link'}</span>
            </Button>
          )}
        </div>
        {navigator.share && (
          <Button onClick={handleCopyLink} variant="secondary" className="w-full mt-2 h-auto py-2.5 rounded-xl text-xs gap-1.5">
            {copied ? <><AppIcon name="tw:check" size={14} /> Copied!</> : <><AppIcon name="fc:bookmark" size={14} /> Copy Link</>}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
