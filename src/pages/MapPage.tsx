import { useState, useEffect, useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { BottomNav } from '@/components/layout/BottomNav';
import { JoinConfirmDialog } from '@/components/JoinConfirmDialog';
import { ShareSheet } from '@/components/ShareSheet';
import { useAppStore } from '@/store/useAppStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { CategoryIcon, getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { AppIcon } from '@/components/icons/AppIcon';
import { UrgencyBadge } from '@/components/ui/UrgencyBadge';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { cn } from '@/lib/utils';
import type { Category, Request } from '@/types/anybuddy';
import { Button } from '@/components/ui/button';

const MUMBAI_CENTER: [number, number] = [19.0760, 72.8777];

function createEmojiIcon(emoji: string, isSelected = false) {
  return L.divIcon({
    html: `<div style="
      width: ${isSelected ? '44px' : '34px'};
      height: ${isSelected ? '44px' : '34px'};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${isSelected ? '20px' : '15px'};
      background: ${isSelected ? 'hsla(213, 94%, 55%, 0.92)' : 'hsla(0, 0%, 100%, 0.75)'};
      backdrop-filter: blur(16px);
      border: ${isSelected ? '2px solid hsla(213, 94%, 70%, 0.9)' : '1px solid hsla(0, 0%, 100%, 0.55)'};
      box-shadow: 0 4px 20px rgba(0,0,0,${isSelected ? '0.25' : '0.10'}), inset 0 0.5px 0 rgba(255,255,255,0.7);
      transition: all 0.2s cubic-bezier(0.25,1,0.5,1);
      transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'};
    ">${emoji}</div>`,
    className: '',
    iconSize: [isSelected ? 44 : 34, isSelected ? 44 : 34],
    iconAnchor: [isSelected ? 22 : 17, isSelected ? 22 : 17],
  });
}

const userIcon = L.divIcon({
  html: `<div style="
    width: 26px; height: 26px; border-radius: 50%;
    background: hsla(213, 94%, 55%, 0.18);
    backdrop-filter: blur(8px);
    border: 1.5px solid hsla(213, 94%, 55%, 0.4);
    display: flex; align-items: center; justify-content: center;
  "><div style="width: 10px; height: 10px; border-radius: 50%; background: hsl(213, 94%, 55%); box-shadow: 0 0 10px hsla(213, 94%, 55%, 0.6);"></div></div>`,
  className: '',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

function FitBounds({ requests, selectedId }: { requests: Request[]; selectedId: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedId) {
      const selected = requests.find(r => r.id === selectedId);
      if (selected?.location.coords) {
        map.flyTo([selected.location.coords.lat, selected.location.coords.lng], 15, { duration: 0.5 });
      }
      return;
    }
    const valid = requests.filter(r => r.location.coords);
    if (valid.length === 0) { map.setView(MUMBAI_CENTER, 13); return; }
    if (valid.length === 1) {
      const c = valid[0].location.coords!;
      map.flyTo([c.lat, c.lng], 14, { duration: 0.5 }); return;
    }
    const bounds = L.latLngBounds(valid.map(r => [r.location.coords!.lat, r.location.coords!.lng] as [number, number]));
    bounds.extend(MUMBAI_CENTER);
    map.flyToBounds(bounds, { padding: [40, 40], duration: 0.5, maxZoom: 14 });
  }, [requests, selectedId, map]);
  return null;
}

function LocateControl({ mapRef }: { mapRef: React.MutableRefObject<any> }) {
  const map = useMap();
  useEffect(() => { mapRef.current = map; }, [map, mapRef]);
  return null;
}

const FILTERS: { id: Category | 'all'; label: string }[] = [
  { id: 'all',     label: 'All'     },
  { id: 'chai',    label: 'Chai'    },
  { id: 'sports',  label: 'Sports'  },
  { id: 'food',    label: 'Food'    },
  { id: 'explore', label: 'Explore' },
  { id: 'walk',    label: 'Walk'    },
  { id: 'work',    label: 'Work'    },
];

export default function MapPage() {
  const mapRef = useRef<any>(null);
  const navigate = useNavigate();
  const { requests, joinRequest, updateCredits } = useAppStore();
  const { addXP, recordActivity, progressQuest } = useGamificationStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [confirmRequest, setConfirmRequest] = useState<Request | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [shareRequest, setShareRequest] = useState<Request | null>(null);
  const [userPos, setUserPos] = useState<[number, number]>(MUMBAI_CENTER);

  const activeRequests = requests
    .filter(r => r.status === 'active' && new Date(r.expiresAt) > new Date())
    .filter(r => filter === 'all' || r.category === filter)
    .filter(r => r.location.coords);

  const selected = activeRequests.find(r => r.id === selectedId);

  const handleJoinFromMap = (req: Request) => setConfirmRequest(req);

  const handleConfirmJoin = () => {
    if (!confirmRequest) return;
    joinRequest(confirmRequest.id);
    updateCredits(0.5, 'Joined a request');
    addXP('join_hangout', 'Joined a hangout');
    recordActivity();
    progressQuest('join_1_activity');
    setConfirmRequest(null);
    navigate(`/request/${confirmRequest.id}`);
  };

  const handleShare = (req: Request) => { setShareRequest(req); setShowShare(true); };

  const locateMe = useCallback(() => {
    const map = mapRef.current;
    if (!map || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(latlng);
        map.flyTo(latlng, 15, { duration: 0.8 });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  return (
    <div className="mobile-container bg-background flex flex-col" style={{ height: '100dvh' }}>
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40"
        style={{
          background: 'hsla(var(--glass-bg) / 0.35)',
          backdropFilter: 'blur(var(--glass-blur-heavy)) saturate(220%)',
          WebkitBackdropFilter: 'blur(var(--glass-blur-heavy)) saturate(220%)',
          borderBottom: '0.5px solid hsla(var(--glass-border) / 0.4)',
        }}>
        <div className="flex items-center justify-between h-[48px] px-4">
          <span className="text-[17px] font-bold text-foreground tracking-tight">Nearby</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground">
              {activeRequests.length} plan{activeRequests.length !== 1 ? 's' : ''}
            </span>
            <button onClick={locateMe}
              className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center tap-scale ml-1">
              <AppIcon name="fc:globe" size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Category filters ── */}
      <div className="flex gap-1.5 px-4 py-2 overflow-x-auto scrollbar-hide shrink-0">
        {FILTERS.map((f) => (
          <button key={f.id} onClick={() => { setFilter(f.id); setSelectedId(null); }}
            className={cn(
              'h-8 px-3 rounded-full flex items-center gap-1.5 tap-scale text-[11px] font-semibold transition-all whitespace-nowrap shrink-0',
              filter === f.id ? 'glass-pill-active' : 'glass-pill-inactive'
            )}>
            {f.id === 'all'
              ? <AppIcon name="tw:fire" size={13} />
              : <CategoryIcon category={f.id as import('@/types/anybuddy').Category} size="sm" className="!w-4 !h-4 !rounded-md bg-transparent" />
            }
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* ── Map ── */}
      <div className="relative mx-4 rounded-[1.25rem] overflow-hidden shrink-0" style={{ height: '240px' }}>
        <MapContainer
          center={MUMBAI_CENTER}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <FitBounds requests={activeRequests} selectedId={selectedId} />
          <Marker position={userPos} icon={userIcon} />
          <LocateControl mapRef={mapRef} />
          {activeRequests.map((req) => {
            if (!req.location.coords) return null;
            return (
              <Marker
                key={req.id}
                position={[req.location.coords.lat, req.location.coords.lng]}
                icon={createEmojiIcon(getCategoryEmoji(req.category), selectedId === req.id)}
                eventHandlers={{ click: () => setSelectedId(selectedId === req.id ? null : req.id) }}
              />
            );
          })}
        </MapContainer>

        {activeRequests.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-[500] pointer-events-none">
            <div className="text-center liquid-glass-heavy px-6 py-5 pointer-events-auto" style={{ borderRadius: '1.25rem' }}>
              <AppIcon name="tw:map" size={32} className="mx-auto mb-2" />
              <p className="text-[14px] font-bold text-foreground mb-1">No plans nearby</p>
              <p className="text-[11px] text-muted-foreground mb-3">Be the first to post one</p>
              <Button onClick={() => navigate('/create')} size="sm" className="text-[11px] h-8 px-4 rounded-full">
                Post a plan
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Selected plan quick info ── */}
      {selected && (
        <div className="mx-4 mt-2 shrink-0">
          <div className="liquid-glass-heavy p-3.5 flex items-center gap-3 relative" style={{ borderRadius: '1.25rem' }}>
            <CategoryIcon category={selected.category} size="sm" className="liquid-glass shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-foreground truncate">{selected.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">📍 {selected.location.name} · {selected.location.distance}km</p>
            </div>
            <Button size="sm" className="h-8 px-3 text-[12px] shrink-0"
              onClick={() => handleJoinFromMap(selected)}>Join</Button>
            <button onClick={() => setSelectedId(null)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-muted flex items-center justify-center tap-scale">
              <X size={10} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

      {/* ── Plans list ── */}
      <div className="flex-1 overflow-y-auto px-4 mt-2 pb-28">
        {/* List header */}
        <div className="flex items-center justify-between py-1.5 mb-1">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {selectedId ? 'Selected plan' : `${activeRequests.length} nearby`}
          </p>
          {selectedId && (
            <button onClick={() => setSelectedId(null)} className="text-[11px] text-primary font-semibold tap-scale">
              Show all
            </button>
          )}
        </div>

        <div className="space-y-2 pb-2">
          {(selectedId ? activeRequests.filter(r => r.id === selectedId) : activeRequests).map((req) => (
            <div
              key={req.id}
              className={cn(
                'liquid-glass-interactive p-3.5 transition-all',
                selectedId === req.id && 'ring-1 ring-primary/30'
              )}
              onClick={() => setSelectedId(selectedId === req.id ? null : req.id)}
            >
              <div className="flex items-center gap-3">
                <CategoryIcon category={req.category} size="sm" className="liquid-glass shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-[13px] font-semibold text-foreground truncate leading-tight">{req.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <UrgencyBadge urgency={req.urgency} />
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <AppIcon name="fc:globe" size={10} /> {req.location.distance}km
                    </span>
                  </div>
                </div>
                <Button
                  onClick={(e) => { e.stopPropagation(); handleJoinFromMap(req); }}
                  size="sm"
                  className="shrink-0 h-8 px-3 text-[12px]"
                >
                  Join
                </Button>
              </div>

              <div className="flex items-center justify-between mt-2.5 pt-2.5" style={{ borderTop: '0.5px solid hsla(var(--glass-border))' }}>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    {[req.userName, ...req.participants.map(p => p.name)].slice(0, 3).map((name, i) => (
                      <GradientAvatar key={i} name={name} size={18} showInitials={false} className="border border-background" />
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {req.seatsTotal - req.seatsTaken} spot{req.seatsTotal - req.seatsTaken !== 1 ? 's' : ''} left
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    <AppIcon name="fc:rating" size={10} /> {req.userReliability}%
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleShare(req); }}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground tap-scale"
                  >
                    <AppIcon name="fc:share" size={10} /> Share
                  </button>
                </div>
              </div>
            </div>
          ))}

          {activeRequests.length === 0 && (
            <div className="text-center py-10">
              <AppIcon name="fc:globe" size={28} className="mx-auto opacity-30 mb-3" />
              <p className="text-[13px] text-muted-foreground font-medium mb-1">No plans nearby</p>
              <p className="text-[11px] text-muted-foreground/60 mb-5">Try a different filter or post one yourself</p>
              <Button size="sm" variant="outline" onClick={() => navigate('/create')}>Post a plan</Button>
            </div>
          )}
        </div>
      </div>

      {confirmRequest && (
        <JoinConfirmDialog
          open={!!confirmRequest}
          onClose={() => setConfirmRequest(null)}
          onConfirm={handleConfirmJoin}
          request={confirmRequest}
        />
      )}

      {showShare && shareRequest && (
        <ShareSheet open={showShare} onClose={() => { setShowShare(false); setShareRequest(null); }} title={shareRequest.title} />
      )}

      <BottomNav />
    </div>
  );
}
