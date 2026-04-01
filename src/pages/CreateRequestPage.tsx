import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useAppStore } from '@/store/useAppStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import type { Category, Urgency } from '@/types/anybuddy';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AppIcon } from '@/components/icons/AppIcon';
import { LocationMapPicker } from '@/components/LocationMap';

// ── Template data ──────────────────────────────────────────────
interface QuickTemplate {
  emoji: string;
  label: string;
  category: Category;
  titleFn: (zone: string) => string;
  defaultMinutes: number;
  seats: number;
}

const TEMPLATES: QuickTemplate[] = [
  { emoji: '', label: 'Coffee',   category: 'chai',     titleFn: z => `Coffee near ${z}`,    defaultMinutes: 20, seats: 2 },
  { emoji: '', label: 'Food',     category: 'food',     titleFn: z => `Grab food in ${z}`,   defaultMinutes: 30, seats: 2 },
  { emoji: '', label: 'Sports',   category: 'sports',   titleFn: z => `Badminton in ${z}`,   defaultMinutes: 45, seats: 3 },
  { emoji: '', label: 'Walk',     category: 'walk',     titleFn: z => `Walk around ${z}`,    defaultMinutes: 15, seats: 2 },
  { emoji: '', label: 'Explore',  category: 'explore',  titleFn: z => `Explore ${z}`,        defaultMinutes: 30, seats: 2 },
  { emoji: '', label: 'Work',     category: 'work',     titleFn: z => `Co-work in ${z}`,     defaultMinutes: 60, seats: 2 },
  { emoji: '', label: 'Shopping', category: 'shopping', titleFn: z => `Shopping in ${z}`,    defaultMinutes: 45, seats: 2 },
  { emoji: '', label: 'Casual',   category: 'casual',   titleFn: z => `Hangout in ${z}`,     defaultMinutes: 20, seats: 2 },
];

const QUICK_STARTS = [
  { text: 'Coffee in 20 min', category: 'chai'   as Category, minutes: 20,  seats: 2 },
  { text: 'Badminton tonight', category: 'sports' as Category, minutes: 180, seats: 4 },
  { text: 'Walk nearby',       category: 'walk'   as Category, minutes: 10,  seats: 2 },
  { text: 'Dinner nearby',     category: 'food'   as Category, minutes: 60,  seats: 3 },
];

const TIME_OPTIONS = [
  { label: '⚡ Now', minutes: 0, urgency: 'now' as Urgency },
  { label: '15 min', minutes: 15, urgency: 'now' as Urgency },
  { label: '30 min', minutes: 30, urgency: 'now' as Urgency },
  { label: '1 hour', minutes: 60, urgency: 'today' as Urgency },
  { label: 'Tonight', minutes: 240, urgency: 'today' as Urgency },
];

const SEAT_OPTIONS = [1, 2, 3, 4];

type Step = 'pick' | 'customize' | 'preview';

// Popular places for quick selection
const POPULAR_PLACES = [
  { name: 'Carter Road', area: 'Bandra West', lat: 19.0596, lng: 72.8295 },
  { name: 'Marine Drive', area: 'Churchgate', lat: 19.0748, lng: 72.8234 },
  { name: 'Powai Lake', area: 'Powai', lat: 19.1272, lng: 72.9070 },
  { name: 'Juhu Beach', area: 'Juhu', lat: 19.0988, lng: 72.8267 },
  { name: 'Linking Road', area: 'Bandra', lat: 19.0620, lng: 72.8365 },
  { name: 'Colaba Causeway', area: 'Colaba', lat: 18.9220, lng: 72.8327 },
  { name: 'Andheri Station', area: 'Andheri', lat: 19.1197, lng: 72.8464 },
  { name: 'BKC', area: 'Bandra East', lat: 19.0660, lng: 72.8694 },
];

interface LocationSearchFieldProps {
  location: string;
  setLocation: (val: string) => void;
  locationCoords: { lat: number; lng: number };
  setLocationCoords: (val: { lat: number; lng: number }) => void;
  editing: boolean;
  setEditing: (val: boolean) => void;
}

function LocationSearchField({ location, setLocation, locationCoords, setLocationCoords, editing, setEditing }: LocationSearchFieldProps) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ name: string; area: string; lat: number; lng: number }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchLocation = useCallback(async (q: string) => {
    if (q.length < 2) { setSearchResults([]); setShowResults(false); return; }
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q + ' Mumbai')}&limit=5&addressdetails=1`
      );
      const data = await res.json();
      const results = data.map((item: any) => ({
        name: item.address?.road || item.address?.suburb || item.display_name.split(',')[0],
        area: item.address?.suburb || item.address?.city_district || item.address?.city || '',
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      }));
      setSearchResults(results);
      setShowResults(true);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchLocation(val), 400);
  };

  const selectPlace = (place: { name: string; area: string; lat: number; lng: number }) => {
    setLocation(place.area ? `${place.name}, ${place.area}` : place.name);
    setLocationCoords({ lat: place.lat, lng: place.lng });
    setShowResults(false);
    setQuery('');
    setEditing(false);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocationCoords({ lat: latitude, lng: longitude });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await res.json();
          const name = data.address?.road || data.address?.suburb || 'Your location';
          const area = data.address?.suburb || data.address?.city_district || '';
          setLocation(area ? `${name}, ${area}` : name);
        } catch {
          setLocation('Your location');
        }
        setIsLocating(false);
        setEditing(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const filteredPopular = query.length > 0
    ? POPULAR_PLACES.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.area.toLowerCase().includes(query.toLowerCase()))
    : POPULAR_PLACES;

  if (!editing) {
    return (
      <button onClick={() => { setEditing(true); setTimeout(() => inputRef.current?.focus(), 100); }}
        className="w-full flex items-center gap-3 p-3.5 rounded-xl liquid-glass tap-scale">
        <span className="text-lg">📍</span>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-foreground">{location}</p>
          <p className="text-[10px] text-muted-foreground">Tap to change location</p>
        </div>
        <AppIcon name="fc:bookmark" size={14} className="text-muted-foreground shrink-0 opacity-60" />
      </button>
    );
  }

  return (
    <div className="space-y-2.5">
      {/* Search input */}
      <div className="flex items-center gap-2.5 p-3 rounded-xl liquid-glass">
        <AppIcon name="fc:search" size={16} className="text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          autoFocus
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="flex-1 bg-transparent text-sm font-medium focus:outline-none placeholder:text-muted-foreground/50"
          placeholder="Search for a place..."
        />
        {isSearching && <span className="w-3.5 h-3.5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin shrink-0" />}
      </div>

      {/* Auto-detect button */}
      <button onClick={detectLocation} disabled={isLocating}
        className="w-full flex items-center gap-2.5 p-3 rounded-xl liquid-glass tap-scale text-left">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          {isLocating ? <span className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : <AppIcon name="fc:globe" size={14} />}
        </div>
        <div>
          <p className="text-[12px] font-semibold text-foreground">{isLocating ? 'Detecting...' : 'Use current location'}</p>
          <p className="text-[10px] text-muted-foreground">Auto-detect via GPS</p>
        </div>
      </button>

      {/* Search results */}
      {showResults && searchResults.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1">Results</p>
          {searchResults.map((place, i) => (
            <button key={i} onClick={() => selectPlace(place)}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-lg tap-scale text-left hover:bg-muted/30 transition-colors">
              <AppIcon name="fc:globe" size={14} className="shrink-0" />
              <div>
                <p className="text-[12px] font-semibold text-foreground">{place.name}</p>
                {place.area && <p className="text-[10px] text-muted-foreground">{place.area}</p>}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Popular places */}
      {(!showResults || searchResults.length === 0) && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1">Popular spots</p>
          <div className="grid grid-cols-2 gap-1.5">
            {filteredPopular.slice(0, 6).map((place) => (
              <button key={place.name} onClick={() => selectPlace(place)}
                className="flex items-center gap-2 p-2.5 rounded-lg liquid-glass tap-scale text-left">
                <AppIcon name="fc:globe" size={12} className="shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-foreground truncate">{place.name}</p>
                  <p className="text-[9px] text-muted-foreground">{place.area}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Map picker */}
      <LocationMapPicker
        coords={locationCoords}
        onCoordsChange={(coords) => {
          setLocationCoords(coords);
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&addressdetails=1`)
            .then(r => r.json())
            .then(data => {
              const name = data.address?.road || data.address?.suburb || 'Selected location';
              const area = data.address?.suburb || data.address?.city_district || '';
              setLocation(area ? `${name}, ${area}` : name);
            })
            .catch(() => setLocation('Selected location'));
        }}
        height="140px"
      />

      <Button onClick={() => setEditing(false)} variant="link" className="w-full text-xs">
        Done
      </Button>
    </div>
  );
}

export default function CreateRequestPage() {
  const navigate = useNavigate();
  const { user, createRequest, updateCredits } = useAppStore();
  const { addXP, recordActivity, progressQuest } = useGamificationStore();
  const zone = user?.zone || user?.city || 'Bandra';

  const [step, setStep] = useState<Step>('pick');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('chai');
  const [timeMinutes, setTimeMinutes] = useState(20);
  const [urgency, setUrgency] = useState<Urgency>('now');
  const [seats, setSeats] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPosted, setIsPosted] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
  const [location, setLocation] = useState(zone);
  const [locationCoords, setLocationCoords] = useState({ lat: 19.0596, lng: 72.8295 });
  const [description, setDescription] = useState('');
  const [postedRequestId, setPostedRequestId] = useState<string | null>(null);

  const pageRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const creditCost = useMemo(() => {
    let cost = 1;
    if (urgency === 'now') cost += 0.5;
    if (urgency === 'today') cost += 0.25;
    if (category === 'help') cost -= 0.25;
    if (user?.trustLevel === 'trusted' || user?.trustLevel === 'anchor') cost -= 0.25;
    return Math.max(1, Math.round(cost * 10) / 10);
  }, [urgency, category, user?.trustLevel]);

  const canPost = title.trim().length > 0 && (user?.credits ?? 0) >= creditCost;

  // Animate step transitions
  useEffect(() => {
    if (pageRef.current?.children) {
      gsap.fromTo(pageRef.current.children, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.03, ease: 'power2.out' });
    }
  }, [step]);

  useEffect(() => {
    if (isPosted && successRef.current) {
      gsap.fromTo(successRef.current, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' });
    }
  }, [isPosted]);

  const selectTemplate = (t: QuickTemplate) => {
    setCategory(t.category);
    setTitle(t.titleFn(zone));
    setTimeMinutes(t.defaultMinutes);
    setUrgency(t.defaultMinutes <= 30 ? 'now' : 'today');
    setSeats(t.seats);
    setStep('customize');
  };

  const selectQuickStart = (qs: typeof QUICK_STARTS[number]) => {
    setCategory(qs.category);
    setTitle(qs.text);
    setTimeMinutes(qs.minutes);
    setUrgency(qs.minutes <= 30 ? 'now' : 'today');
    setSeats(qs.seats);
    setStep('preview');
  };

  const selectTime = (opt: typeof TIME_OPTIONS[number]) => {
    setTimeMinutes(opt.minutes);
    setUrgency(opt.urgency);
  };

  const handleSubmit = () => {
    if (!canPost || !user) return;
    setIsSubmitting(true);
    const now = new Date();
    const when = new Date(now.getTime() + timeMinutes * 60000);
    const expiresAt = new Date(when.getTime() + (urgency === 'now' ? 60 * 60000 : 4 * 3600000));

    createRequest({
      userId: user.id, userName: user.firstName, userTrust: user.trustLevel,
      userAvatar: user.avatar, userReliability: user.reliabilityScore,
      userHostRating: user.hostRating, title: title.trim(),
      category, urgency, when,
      location: { name: location, distance: 0, coords: locationCoords },
      seatsTotal: seats, seatsTaken: 0, expiresAt,
      liveShare: false, status: 'active', joinMode: 'auto', visibility: 'public', pendingJoinRequests: [],
    });
    updateCredits(-creditCost, 'Posted a plan');
    addXP('post_hangout', 'Posted a hangout');
    recordActivity();
    progressQuest('post_a_hangout');

    // Find the newly created request id
    const latestId = `req_${Date.now()}`;
    setPostedRequestId(latestId);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsPosted(true);
    }, 400);
  };

  const timeLabel = timeMinutes === 0 ? 'Right now' : timeMinutes < 60 ? `In ${timeMinutes} min` : timeMinutes < 120 ? 'In 1 hour' : 'Later today';

  // ── Posted success screen ──
  if (isPosted) {
    return (
      <div className="mobile-container min-h-screen bg-ambient flex items-center justify-center px-8">
        <div ref={successRef} className="text-center">
          <span className="text-6xl block mb-4"><AppIcon name="tw:party" size={64} /></span>
          <h2 className="text-xl font-bold mb-1">Your plan is live!</h2>
          <p className="text-sm text-muted-foreground mb-6">People nearby can now join</p>
          <div className="liquid-glass p-4 rounded-2xl mb-6 text-left">
            <div className="flex items-center gap-2 mb-2">
              <CategoryIcon category={category} size="sm" />
              <h3 className="text-sm font-bold">{title}</h3>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><AppIcon name="tw:pin" size={12} /> {location}</span>
              <span className="flex items-center gap-1"><AppIcon name="tw:clock" size={12} /> {timeLabel}</span>
              <span className="flex items-center gap-1"><AppIcon name="tw:people" size={12} /> Need {seats} {seats === 1 ? 'person' : 'people'}</span>
            </div>
          </div>
          <Button className="w-full h-12" onClick={() => navigate('/home')}>
            Go to feed
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container min-h-screen bg-ambient flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-2">
        <button onClick={() => step === 'pick' ? navigate(-1) : setStep(step === 'preview' ? 'customize' : 'pick')}
          className="w-8 h-8 rounded-full flex items-center justify-center tap-scale hover:bg-muted/50">
          <span className="text-lg font-medium">←</span>
        </button>
        <h1 className="text-lg font-bold">
          {step === 'pick' ? 'New Plan' : step === 'customize' ? 'Customize' : 'Ready?'}
        </h1>
        {step === 'customize' && (
            <Button onClick={() => setStep('preview')} variant="link" size="sm" className="ml-auto text-xs">
            Preview →
          </Button>
        )}
      </div>

      <div ref={pageRef} className="flex-1 px-5 pb-28 overflow-y-auto">

        {/* ── STEP 1: Pick activity ── */}
        {step === 'pick' && (
          <>
            {/* Quick starts — one-tap plans */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5"><AppIcon name="tw:lightning" size={13} /> Quick start</p>
              <div className="space-y-2">
                {QUICK_STARTS.map((qs, i) => (
                  <button key={i} onClick={() => selectQuickStart(qs)}
                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl liquid-glass tap-scale text-left transition-all hover:shadow-md active:scale-[0.98]">
                    <CategoryIcon category={qs.category} size="sm" className="liquid-glass shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{qs.text}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1"><AppIcon name="tw:pin" size={10} /> {location} · <AppIcon name="tw:people" size={10} /> {qs.seats} people</p>
                    </div>
                    <span className="text-xs text-primary font-semibold">Go →</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Activity grid */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Or pick an activity</p>
              <div className="grid grid-cols-4 gap-2.5">
                {TEMPLATES.map((t) => (
                  <button key={t.category} onClick={() => selectTemplate(t)}
                    className="flex flex-col items-center gap-1.5 py-4 px-2 rounded-2xl liquid-glass tap-scale transition-all hover:shadow-md active:scale-[0.96]">
                    <CategoryIcon category={t.category} size="sm" />
                    <span className="text-[11px] font-medium text-foreground">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── STEP 2: Customize (only 4 fields) ── */}
        {step === 'customize' && (
          <div className="space-y-5">
            {/* Editable title */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <CategoryIcon category={category} size="sm" />
                <label className="text-xs font-medium text-muted-foreground">Activity</label>
              </div>
              {editingTitle ? (
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 80))}
                  onBlur={() => setEditingTitle(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
                  className="w-full h-11 px-4 rounded-xl border border-primary/30 bg-background text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              ) : (
                <button onClick={() => setEditingTitle(true)}
                  className="w-full flex items-center justify-between h-11 px-4 rounded-xl liquid-glass tap-scale">
                  <span className="text-sm font-semibold truncate">{title}</span>
                  <AppIcon name="fc:bookmark" size={14} className="opacity-50 shrink-0" />
                </button>
              )}
            </div>

            {/* Location */}
            <LocationSearchField
              location={location}
              setLocation={setLocation}
              locationCoords={locationCoords}
              setLocationCoords={setLocationCoords}
              editing={editingLocation}
              setEditing={setEditingLocation}
            />

            {/* Time — big tappable pills */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2.5 block">⏰ When?</label>
              <div className="flex gap-2 flex-wrap">
                {TIME_OPTIONS.map((opt) => (
                  <button key={opt.label} onClick={() => selectTime(opt)}
                    className={cn(
                      'h-10 px-4 rounded-full text-sm font-medium tap-scale transition-all',
                      timeMinutes === opt.minutes
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'liquid-glass text-foreground'
                    )}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional description */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">📝 Details <span className="text-muted-foreground/40">(optional)</span></label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 200))}
                placeholder="Any extra info — meeting spot, what to bring, etc."
                rows={2}
                className="w-full rounded-xl bg-muted/30 px-4 py-3 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/40 leading-relaxed"
              />
              {description.length > 0 && (
                <p className="text-[9px] text-muted-foreground/40 text-right mt-0.5">{description.length}/200</p>
              )}
            </div>

            {/* Seats — big numbered buttons */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2.5 block">👥 How many people?</label>
              <div className="flex gap-3">
                {SEAT_OPTIONS.map((n) => (
                  <button key={n} onClick={() => setSeats(n)}
                    className={cn(
                      'flex-1 h-14 rounded-2xl text-lg font-bold tap-scale transition-all',
                      seats === n
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'liquid-glass text-foreground'
                    )}>
                    {n}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                {seats === 1 ? 'Looking for 1 buddy' : `Need ${seats} people`}
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 3: Preview ── */}
        {step === 'preview' && (
          <div className="space-y-5 pt-2">
            <div className="liquid-glass-heavy p-5 rounded-3xl">
              <div className="flex items-center gap-3 mb-4">
                <CategoryIcon category={category} size="lg" />
                <div>
                  <h2 className="text-[15px] font-bold leading-tight">{title}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">by {user?.firstName || 'You'}</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-sm">
                  <span>📍</span>
                  <span className="font-medium">{location}</span>
                  <span className="text-[10px] text-muted-foreground">Your area</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <span>⏰</span>
                  <span className="font-medium">{timeLabel}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <span>👥</span>
                  <span className="font-medium">Need {seats} {seats === 1 ? 'person' : 'people'}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/15 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">💰</span>
                  <span className="text-xs text-muted-foreground">Cost: <span className="font-bold text-foreground">{creditCost} credit{creditCost !== 1 ? 's' : ''}</span></span>
                </div>
                <span className="text-[10px] text-muted-foreground">Balance: {user?.credits ?? 0}</span>
              </div>
            </div>

            <Button onClick={() => setStep('customize')} variant="link" className="w-full text-xs">
              ← Edit details
            </Button>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      {step !== 'pick' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 liquid-glass-nav">
          <div className="max-w-md mx-auto">
            {step === 'customize' ? (
              <Button className="w-full h-12" onClick={() => setStep('preview')}>
                Preview Plan →
              </Button>
            ) : (
              <Button className="w-full h-12" onClick={handleSubmit} disabled={!canPost || isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Posting...
                  </span>
                ) : '🚀 Post Plan'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
