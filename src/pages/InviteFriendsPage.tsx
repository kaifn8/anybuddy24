import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { ShareSheet } from '@/components/ShareSheet';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/hooks/use-toast';
import { AppIcon } from '@/components/icons/AppIcon';

export default function InviteFriendsPage() {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  
  const inviteCode = user?.id ? `${user.id.slice(0, 8)}` : 'ANYBUDDY';
  const inviteLink = `https://anybuddy.app/join/${inviteCode}`;
  const inviteMessage = `Yo! I found people to hang with through this app. Join me: ${inviteLink}`;
  const invitesLeft = 3;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast({ title: "Link copied!", description: "Share it with your friends" });
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="mobile-container min-h-screen bg-ambient pb-24">
      <TopBar showBack title="Invite Friends" />
      
      <div className="px-5 pt-5 space-y-5">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <AppIcon name="fc:invite" size={52} />
          </div>
          <h2 className="text-xl font-bold mb-2">Your friends are missing out</h2>
          <p className="text-sm text-muted-foreground">
            Every friend you invite = 1 free credit for you both
          </p>
        </div>
        
        {/* Invites remaining */}
        <div className="liquid-glass-heavy p-4 rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Invites left this week</p>
              <p className="text-2xs text-muted-foreground mt-0.5">Use them or lose them 👀</p>
            </div>
            <div className="text-3xl font-bold text-primary">{invitesLeft}</div>
          </div>
        </div>
        
        {/* QR Code */}
        <div className="liquid-glass-heavy p-6 rounded-3xl">
          <h3 className="text-xs font-semibold text-muted-foreground mb-4 text-center">SCAN QR CODE</h3>
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-2xl shadow-lg">
              <QRCodeSVG value={inviteLink} size={200} level="H" includeMargin={false} />
            </div>
          </div>
          <p className="text-2xs text-muted-foreground text-center mt-4">
            Ask your friend to scan this code with their camera
          </p>
        </div>
        
        {/* Invite Link */}
        <div className="liquid-glass-heavy p-4 rounded-3xl">
          <h3 className="text-xs font-semibold text-muted-foreground mb-3">YOUR INVITE LINK</h3>
          <div className="liquid-glass-subtle p-3 rounded-xl flex items-center justify-between gap-3 mb-3">
            <code className="text-xs font-mono text-foreground flex-1 overflow-x-auto whitespace-nowrap">
              {inviteLink}
            </code>
            <Button onClick={handleCopyLink} variant="ghost" size="icon" className="w-9 h-9 rounded-lg liquid-glass">
              <AppIcon name={copied ? 'fc:checkmark' : 'fc:share'} size={18} />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={handleCopyLink} className="w-full gap-2">
              <AppIcon name={copied ? 'fc:checkmark' : 'fc:share'} size={15} />
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button variant="default" onClick={() => setShareOpen(true)} className="w-full gap-2">
              <AppIcon name="fc:share" size={15} />
              Share Link
            </Button>
          </div>
        </div>
        
        {/* Invite Code */}
        <div className="liquid-glass p-4 rounded-3xl">
          <h3 className="text-xs font-semibold text-muted-foreground mb-2">YOUR INVITE CODE</h3>
          <div className="text-center">
            <div className="liquid-glass-subtle inline-block px-6 py-3 rounded-xl">
              <code className="text-2xl font-bold tracking-wider text-primary">{inviteCode}</code>
            </div>
          </div>
          <p className="text-2xs text-muted-foreground text-center mt-3">
            Friends can enter this code when signing up
          </p>
        </div>
        
        {/* Rewards info */}
        <div className="liquid-glass-heavy p-4 rounded-3xl border border-primary/20">
          <h3 className="text-xs font-semibold text-primary mb-3 flex items-center gap-1.5">
            <AppIcon name="fc:rating" size={14} /> REFERRAL REWARDS
          </h3>
          <div className="space-y-2">
            {[
              { icon: 'se:sparkles' as const,   text: 'You get 10 credits for each friend who joins' },
              { icon: 'se:trophy-1' as const,    text: 'Your friend gets 5 bonus credits to start' },
              { icon: 'fc:like' as const,        text: 'Unlock special badges with 5+ referrals' },
            ].map((reward, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <AppIcon name={reward.icon} size={18} className="shrink-0 mt-px" />
                <span className="text-muted-foreground">{reward.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <BottomNav />
      
      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title="Join me on AnyBuddy!"
        text={inviteMessage}
      />
    </div>
  );
}
