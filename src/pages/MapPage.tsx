import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAppStore } from '@/store/useAppStore';
import { getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { AppIcon } from '@/components/icons/AppIcon';
import { cn } from '@/lib/utils';
import { formatWalkTime } from '@/components/LocationMap';
import type { Request } from '@/types/anybuddy';
import { Button } from '@/components/ui/button';

const MUMBAI_CENTER: [number, number] = [19.0760, 72.8777];

// ── Simple pin marker ──
function createPinIcon(req: Request) {
  const emoji = getCategoryEmoji(req.category);
  return L.divIcon({
    html: `<div style="
      width: 36px; height: 36px; border-radius: 50%;
      background: hsl(213, 94%, 55%);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 10px rgba(59,130,246,0.4);
      font-size: 16px; line-height: 1;
    ">${emoji}</div>`,
    className: 'leaflet-div-icon-transparent',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
}

const userIcon = L.divIcon({
  html: `<div style="
    width: 24px; height: 24px; border-radius: 50%;
    background: hsla(213, 94%, 55%, 0.18);
    border: 1.5px solid hsla(213, 94%, 55%, 0.5);
    display: flex; align-items: center; justify-content: center;
  "><div style="width: 10px; height: 10px; border-radius: 50%; background: hsl(213, 94%, 55%); box-shadow: 0 0 8px hsla(213, 94%, 55%, 0.5);"></div></div>`,
  className: 'leaflet-div-icon-transparent',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// ── Haversine for heat zone grouping ──
function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

// ── Heat zones: highlight areas with multiple plans ──
function getHeatZones(reqs: Request[]): { center: [number, number]; radius: number; intensity: number }[] {
  if (reqs.length < 2) return [];
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
        radius: Math.max(250, nearby.length * 130),
        intensity: Math.min(nearby.length / 5, 1),
      });
      nearby.forEach(r => used.add(r.id));
    }
  }
  return zones;
}

// ── Map controller ──
function MapController({ requests }: { requests: Request[] }) {
  const map = useMap();

  useEffect(() => {
    const valid = requests.filter(r => r.location.coords);
    if (valid.length === 0) { map.setView(MUMBAI_CENTER, 13); return; }
    if (valid.length === 1) {
      const c = valid[0].location.coords!;
      map.flyTo([c.lat, c.lng], 14, { duration: 0.5 });
      return;
    }
    const bounds = L.latLngBounds(valid.map(r => [r.location.coords!.lat, r.location.coords!.lng] as [number, number]));
    bounds.extend(MUMBAI_CENTER);
    map.flyToBounds(bounds, { padding: [40, 40], duration: 0.5, maxZoom: 14 });
  }, [requests, map]);

  return null;
}

function LocateControl({ mapRef }: { mapRef: React.MutableRefObject<any> }) {
  const map = useMap();
  useEffect(() => { mapRef.current = map; }, [map, mapRef]);
  return null;
}

export default function MapPage() {
  const mapRef = useRef<any>(null);
  const navigate = useNavigate();
  const { requests } = useAppStore();
  const [userPos, setUserPos] = useState<[number, number]>(MUMBAI_CENTER);

  const activeRequests = useMemo(() =>
    requests
      .filter(r => r.status === 'active' && new Date(r.expiresAt) > new Date())
      .filter(r => r.location.coords),
    [requests]
  );

  const heatZones = useMemo(() => getHeatZones(activeRequests), [activeRequests]);

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
      <header className="sticky top-0 z-40 liquid-glass-heavy">
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
          <MapController requests={activeRequests} />
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
                fillOpacity: 0.08 + zone.intensity * 0.12,
                weight: 1,
                opacity: 0.2,
                dashArray: '4 6',
              }}
            />
          ))}

          {/* Plan markers */}
          {activeRequests.map((req) => {
            if (!req.location.coords) return null;
            return (
              <Marker
                key={req.id}
                position={[req.location.coords.lat, req.location.coords.lng]}
                icon={createPinIcon(req)}
                eventHandlers={{ click: () => navigate(`/request/${req.id}`) }}
              />
            );
          })}
        </MapContainer>

        {/* Empty state */}
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

      <BottomNav />
    </div>
  );
}
