import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const pinIcon = L.divIcon({
  html: `<div style="width:32px;height:32px;border-radius:50%;background:hsl(213,94%,55%);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(59,130,246,0.4);">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
  </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function formatWalkTime(distanceKm: number): string {
  const minutes = Math.round(distanceKm * 12); // ~5 km/h walking
  if (minutes < 1) return '< 1 min walk';
  if (minutes < 60) return `${minutes} min walk`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m walk` : `${hrs}h walk`;
}

interface ClickableMapProps {
  onLocationSelect: (coords: { lat: number; lng: number }) => void;
}

function ClickableMap({ onLocationSelect }: ClickableMapProps) {
  useMapEvents({
    click(e) {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function FlyToCenter({ coords }: { coords: [number, number] }) {
  const map = useMap();
  map.flyTo(coords, 15, { duration: 0.5 });
  return null;
}

// ─── Display-only mini map ───
interface LocationMapPreviewProps {
  coords: { lat: number; lng: number };
  locationName: string;
  distance?: number;
  className?: string;
  height?: string;
  showOpenInMaps?: boolean;
}

export function LocationMapPreview({
  coords,
  locationName,
  distance,
  className,
  height = '160px',
  showOpenInMaps = true,
}: LocationMapPreviewProps) {
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;

  return (
    <div className={cn('rounded-2xl overflow-hidden border border-border/10 bg-muted/30', className)}>
      <div className="relative" style={{ height }}>
        <MapContainer
          center={[coords.lat, coords.lng]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[coords.lat, coords.lng]} icon={pinIcon} />
        </MapContainer>

        {/* Location label overlay */}
        <div className="absolute bottom-2 left-2 right-2 z-[1000] pointer-events-none">
          <div className="bg-background/80 backdrop-blur-md rounded-lg px-2.5 py-1.5 border border-border/20">
            <p className="text-[11px] font-semibold truncate">{locationName}</p>
            {distance != null && (
              <p className="text-[10px] text-muted-foreground">
                {distance} km · {formatWalkTime(distance)}
              </p>
            )}
          </div>
        </div>
      </div>

      {showOpenInMaps && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-primary tap-scale hover:bg-muted/20 transition-colors"
        >
          <Navigation size={15} /> Open in Maps
        </a>
      )}
    </div>
  );
}

// ─── Interactive map picker ───
interface LocationMapPickerProps {
  coords: { lat: number; lng: number };
  onCoordsChange: (coords: { lat: number; lng: number }) => void;
  className?: string;
  height?: string;
}

export function LocationMapPicker({
  coords,
  onCoordsChange,
  className,
  height = '180px',
}: LocationMapPickerProps) {
  return (
    <div className={cn('rounded-2xl overflow-hidden border border-border/10 bg-muted/30', className)}>
      <div className="relative" style={{ height }}>
        <MapContainer
          center={[coords.lat, coords.lng]}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[coords.lat, coords.lng]} icon={pinIcon} />
          <ClickableMap onLocationSelect={onCoordsChange} />
          <FlyToCenter coords={[coords.lat, coords.lng]} />
        </MapContainer>

        {/* Hint overlay */}
        <div className="absolute top-2 left-2 right-2 z-[1000] pointer-events-none">
          <div className="bg-background/70 backdrop-blur-md rounded-lg px-2.5 py-1 border border-border/20 text-center">
            <p className="text-[10px] text-muted-foreground font-medium">Tap to set location</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Distance badge helper ───
interface DistanceBadgeProps {
  distance: number;
  className?: string;
}

export function DistanceBadge({ distance, className }: DistanceBadgeProps) {
  return (
    <span className={cn('text-muted-foreground', className)}>
      📍 {distance} km · {formatWalkTime(distance)}
    </span>
  );
}

export { formatWalkTime };
