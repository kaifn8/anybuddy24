import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { BottomNav } from '@/components/layout/BottomNav';
import { JoinConfirmDialog } from '@/components/JoinConfirmDialog';
import { useAppStore } from '@/store/useAppStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { CategoryIcon, getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { AppIcon } from '@/components/icons/AppIcon';
import { UrgencyBadge } from '@/components/ui/UrgencyBadge';
import { TrustBadge } from '@/components/ui/TrustBadge';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { cn } from '@/lib/utils';
import { formatWalkTime } from '@/components/LocationMap';
import type { Category, Request } from '@/types/anybuddy';
import { Button } from '@/components/ui/button';

const MUMBAI_CENTER: [number, number] = [19.0760, 72.8777];
const CLUSTER_RADIUS_KM = 0.3;

// ── Plan bubble marker ──
function createPlanBubble(req: Request, isSelected = false) {
  const emoji = getCategoryEmoji(req.category);
  const seatsLeft = req.seatsTotal - req.seatsTaken;
  const isUrgent = req.urgency === 'now';
  const isFull = seatsLeft <= 0;

  return L.divIcon({
    html: `<div style="
      display: flex; align-items: center; gap: 5px;
      padding: ${isSelected ? '7px 12px' : '6px 10px'};
      border-radius: 22px;
      background: ${isSelected ? 'hsl(213, 94%, 50%)' : 'rgba(255,255,255,0.95)'};
      border: ${isSelected ? '2.5px solid hsla(213, 94%, 75%, 0.9)' : '1.5px solid rgba(0,0,0,0.06)'};
      box-shadow: 0 3px 16px rgba(0,0,0,${isSelected ? '0.22' : '0.12'}), 0 1px 4px rgba(0,0,0,0.06)${isUrgent && !isSelected ? ', 0 0 0 3px hsla(25, 95%, 53%, 0.35)' : ''};
      transform: ${isSelected ? 'scale(1.12) translateY(-4px)' : 'scale(1)'};
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      cursor: pointer;
      white-space: nowrap;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    ">
      <span style="font-size: 16px; line-height: 1;">${emoji}</span>
      <span style="font-size: 12px; font-weight: 800; color: ${isSelected ? '#fff' : isFull ? '#999' : '#1a1a1a'}; letter-spacing: -0.02em;">
        ${isFull ? 'Full' : `${seatsLeft} left`}
      </span>
    </div>`,
    className: 'plan-bubble-marker',
    iconSize: [0, 0],
    iconAnchor: [isSelected ? 55 : 48, isSelected ? 20 : 16],
  });
}

// ── Cluster bubble ──
function createClusterBubble(count: number, categories: Category[]) {
  const topEmoji = getCategoryEmoji(categories[0]);
  const secondEmoji = categories.length > 1 ? getCategoryEmoji(categories[1]) : '';
  return L.divIcon({
    html: `<div style="
      display: flex; align-items: center; gap: 4px;
      padding: 8px 12px;
      border-radius: 24px;
      background: rgba(255,255,255,0.95);
      border: 2px solid hsla(213, 94%, 55%, 0.25);
      box-shadow: 0 4px 20px rgba(59,130,246,0.18), 0 1px 4px rgba(0,0,0,0.06);
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    ">
      <span style="font-size: 14px;">${topEmoji}${secondEmoji ? secondEmoji : ''}</span>
      <span style="font-size: 13px; font-weight: 900; color: hsl(213, 94%, 45%); letter-spacing: -0.02em;">
        ${count}
      </span>
    </div>`,
    className: 'leaflet-div-icon-transparent',
    iconSize: [0, 0],
    iconAnchor: [36, 16],
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

// ── Clustering logic ──
interface Cluster {
  id: string;
  center: { lat: number; lng: number };
  requests: Request[];
}

function clusterRequests(reqs: Request[], zoomLevel: number): (Cluster | Request)[] {
  // At high zoom, don't cluster
  if (zoomLevel >= 15) return reqs;

  const clusters: Cluster[] = [];
  const assigned = new Set<string>();
  const radiusScale = Math.max(0.15, CLUSTER_RADIUS_KM * Math.pow(2, 13 - zoomLevel));

  for (const req of reqs) {
    if (assigned.has(req.id) || !req.location.coords) continue;

    const nearby = reqs.filter(r =>
      !assigned.has(r.id) && r.location.coords &&
      haversine(req.location.coords!, r.location.coords!) < radiusScale
    );

    if (nearby.length > 1) {
      const lat = nearby.reduce((s, r) => s + r.location.coords!.lat, 0) / nearby.length;
      const lng = nearby.reduce((s, r) => s + r.location.coords!.lng, 0) / nearby.length;
      clusters.push({
        id: `cluster-${req.id}`,
        center: { lat, lng },
        requests: nearby,
      });
      nearby.forEach(r => assigned.add(r.id));
    }
  }

  const singles = reqs.filter(r => !assigned.has(r.id));
  return [...clusters, ...singles];
}

function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

// ── Heat zones: areas with high plan density ──
function getHeatZones(reqs: Request[]): { center: [number, number]; radius: number; intensity: number }[] {
  if (reqs.length < 3) return [];
  const zones: { center: [number, number]; radius: number; intensity: number }[] = [];
  const used = new Set<string>();

  for (const req of reqs) {
    if (used.has(req.id) || !req.location.coords) continue;
    const nearby = reqs.filter(r =>
      r.location.coords && !used.has(r.id) &&
      haversine(req.location.coords!, r.location.coords!) < 1.0
    );
    if (nearby.length >= 2) {
      const lat = nearby.reduce((s, r) => s + r.location.coords!.lat, 0) / nearby.length;
      const lng = nearby.reduce((s, r) => s + r.location.coords!.lng, 0) / nearby.length;
      zones.push({
        center: [lat, lng],
        radius: Math.max(200, nearby.length * 120),
        intensity: Math.min(nearby.length / 5, 1),
      });
      nearby.forEach(r => used.add(r.id));
    }
  }
  return zones;
}

// ── Map control components ──
function MapController({ requests, selectedId, onZoomChange }: {
  requests: Request[];
  selectedId: string | null;
  onZoomChange: (z: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const handler = () => onZoomChange(map.getZoom());
    map.on('zoomend', handler);
    return () => { map.off('zoomend', handler); };
  }, [map, onZoomChange]);

  useEffect(() => {
    if (selectedId) {
      const selected = requests.find(r => r.id === selectedId);
      if (selected?.location.coords) {
        map.flyTo([selected.location.coords.lat, selected.location.coords.lng], 16, { duration: 0.5 });
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
  { id: 'all', label: 'All' },
  { id: 'chai', label: 'Chai' },
  { id: 'sports', label: 'Sports' },
  { id: 'food', label: 'Food' },
  { id: 'explore', label: 'Explore' },
  { id: 'walk', label: 'Walk' },
  { id: 'work', label: 'Work' },
];

export default function MapPage() {
  const mapRef = useRef<any>(null);
  const navigate = useNavigate();
  const { requests, joinRequest, updateCredits } = useAppStore();
  const { addXP, recordActivity, progressQuest } = useGamificationStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [confirmRequest, setConfirmRequest] = useState<Request | null>(null);
  const [userPos, setUserPos] = useState<[number, number]>(MUMBAI_CENTER);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [sheetExpanded, setSheetExpanded] = useState(false);

  const activeRequests = useMemo(() =>
    requests
      .filter(r => r.status === 'active' && new Date(r.expiresAt) > new Date())
      .filter(r => filter === 'all' || r.category === filter)
      .filter(r => r.location.coords),
    [requests, filter]
  );

  const selected = activeRequests.find(r => r.id === selectedId);
  const clustered = useMemo(() => clusterRequests(activeRequests, zoomLevel), [activeRequests, zoomLevel]);
  const heatZones = useMemo(() => getHeatZones(activeRequests), [activeRequests]);

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

  const handleClusterClick = (cluster: Cluster) => {
    const map = mapRef.current;
    if (!map) return;
    const bounds = L.latLngBounds(cluster.requests.map(r => [r.location.coords!.lat, r.location.coords!.lng] as [number, number]));
    map.flyToBounds(bounds, { padding: [60, 60], maxZoom: 16, duration: 0.5 });
  };

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
              : <CategoryIcon category={f.id as Category} size="sm" className="!w-4 !h-4 !rounded-md bg-transparent" />
            }
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* ── Full-height map ── */}
      <div className="flex-1 relative">
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
          <MapController requests={activeRequests} selectedId={selectedId} onZoomChange={setZoomLevel} />
          <Marker position={userPos} icon={userIcon} />
          <LocateControl mapRef={mapRef} />

          {/* Heat zones */}
          {heatZones.map((zone, i) => (
            <Circle
              key={`heat-${i}`}
              center={zone.center}
              radius={zone.radius}
              pathOptions={{
                color: 'hsl(213, 94%, 55%)',
                fillColor: 'hsl(213, 94%, 60%)',
                fillOpacity: 0.1 + zone.intensity * 0.12,
                weight: 1,
                opacity: 0.25,
                dashArray: '4 6',
              }}
            />
          ))}

          {/* Plan bubbles & clusters */}
          {clustered.map((item) => {
            if ('requests' in item) {
              // Cluster
              const cluster = item as Cluster;
              return (
                <Marker
                  key={cluster.id}
                  position={[cluster.center.lat, cluster.center.lng]}
                  icon={createClusterBubble(cluster.requests.length, cluster.requests.map(r => r.category))}
                  eventHandlers={{ click: () => handleClusterClick(cluster) }}
                />
              );
            }
            // Single plan bubble
            const req = item as Request;
            if (!req.location.coords) return null;
            return (
              <Marker
                key={req.id}
                position={[req.location.coords.lat, req.location.coords.lng]}
                icon={createPlanBubble(req, selectedId === req.id)}
                eventHandlers={{ click: () => setSelectedId(selectedId === req.id ? null : req.id) }}
              />
            );
          })}
        </MapContainer>

        {/* Empty state overlay */}
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

      {/* ── Bottom sheet ── */}
      <div
        className={cn(
          'absolute left-0 right-0 z-[600] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]',
        )}
        style={{
          bottom: '72px', // above BottomNav
          maxHeight: sheetExpanded ? '55vh' : selected ? '200px' : '160px',
          pointerEvents: 'auto',
        }}
      >
        <div className="mx-2 rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(40px) saturate(200%)',
            WebkitBackdropFilter: 'blur(40px) saturate(200%)',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 -2px 24px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.05)',
          }}
        >
          {/* Handle */}
          <button
            className="w-full pt-2 pb-1 flex justify-center"
            onClick={() => setSheetExpanded(!sheetExpanded)}
          >
            <div className="w-10 h-1 rounded-full bg-foreground/15" />
          </button>

          {/* Selected plan preview */}
          {selected && !sheetExpanded && (
            <div className="px-3.5 pb-3">
              <div className="flex items-start gap-3">
                <CategoryIcon category={selected.category} size="md" className="shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold truncate leading-tight">{selected.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    📍 {selected.location.name} · {formatWalkTime(selected.location.distance)}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <GradientAvatar name={selected.userName} size={20} showInitials={false} />
                    <span className="text-[11px] font-semibold">{selected.userName}</span>
                    <TrustBadge level={selected.userTrust} size="sm" showLabel={false} />
                    {selected.userReliability && (
                      <span className="text-[10px] text-muted-foreground">✅ {selected.userReliability}%</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2.5 pt-2.5" style={{ borderTop: '0.5px solid rgba(0,0,0,0.06)' }}>
                <div className="flex items-center gap-1.5 flex-1">
                  <UrgencyBadge urgency={selected.urgency} />
                  <span className="text-[10px] text-muted-foreground font-medium">
                    👥 {selected.seatsTotal - selected.seatsTaken} spot{selected.seatsTotal - selected.seatsTaken !== 1 ? 's' : ''} left
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/request/${selected.id}`)}
                  className="text-[11px] text-muted-foreground font-semibold tap-scale px-2.5 py-1.5 rounded-lg hover:bg-muted/30"
                >
                  Details
                </button>
                <Button size="sm" className="h-8 px-4 text-[11px] rounded-xl"
                  onClick={() => navigate(`/join/${selected.id}`)}>
                  {selected.joinMode === 'approval' ? '✋ Request' : '⚡ Join'}
                </Button>
              </div>
            </div>
          )}

          {/* Plan list */}
          {(!selected || sheetExpanded) && (
            <div className={cn(
              'overflow-y-auto px-2.5 pb-2.5',
              sheetExpanded ? 'max-h-[45vh]' : 'max-h-[110px]'
            )}>
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider px-1.5 mb-1.5">
                {activeRequests.length} nearby
              </p>
              <div className="space-y-1">
                {activeRequests.map((req) => {
                  const seatsLeft = req.seatsTotal - req.seatsTaken;
                  return (
                    <button
                      key={req.id}
                      className={cn(
                        'w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left tap-scale transition-all',
                        selectedId === req.id ? 'bg-primary/8 ring-1 ring-primary/15' : 'hover:bg-muted/20'
                      )}
                      onClick={() => {
                        setSelectedId(req.id);
                        setSheetExpanded(false);
                      }}
                    >
                      <CategoryIcon category={req.category} size="sm" className="shrink-0 !w-8 !h-8" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold truncate">{req.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <UrgencyBadge urgency={req.urgency} />
                          <span className="text-[9px] text-muted-foreground font-medium">
                            {req.location.distance}km · {seatsLeft} left
                          </span>
                        </div>
                      </div>
                      <div className="flex -space-x-1.5 shrink-0">
                        {[req.userName, ...req.participants.map(p => p.name)].slice(0, 3).map((name, i) => (
                          <GradientAvatar key={i} name={name} size={18} showInitials={false} className="border-[1.5px] border-white" />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
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

      <BottomNav />
    </div>
  );
}
