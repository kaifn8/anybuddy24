import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, X, Play, Square, RotateCcw } from 'lucide-react';

export type ChurnMultiplier = 0 | 1 | 2 | 4 | 8;

interface PerfOverlayProps {
  /** Number of times the parent component has rendered. */
  renderCount: number;
  /** Timestamp (ms) of the last feed refresh tick. */
  lastRefreshAt: number | null;
  /** Configured base refresh interval in ms. */
  refreshIntervalMs: number;
  /** Current churn multiplier (extra refreshes per base window). */
  churn: ChurnMultiplier;
  /** Setter for churn multiplier. Parent owns the simulator. */
  onChurnChange: (next: ChurnMultiplier) => void;
  /** Label shown in the header. */
  label?: string;
}

interface Sample {
  churn: ChurnMultiplier;
  durationS: number;
  avgFps: number;
  minFps: number;
  p1Fps: number; // 1st-percentile (worst-1%) fps
  renders: number;
  refreshes: number;
  ts: number;
}

const CHURN_OPTIONS: ChurnMultiplier[] = [0, 1, 2, 4, 8];

/**
 * Dev perf HUD with churn simulator + auto-recorded benchmark samples.
 * - Toggle: Shift+P
 * - Pick a churn level, hit Record, let it run a few seconds, hit Stop.
 * - The recording captures FPS distribution + render/refresh counts so
 *   you can compare smoothness across churn levels in the table below.
 */
export function PerfOverlay({
  renderCount,
  lastRefreshAt,
  refreshIntervalMs,
  churn,
  onChurnChange,
  label = 'Perf',
}: PerfOverlayProps) {
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('perf-overlay-open') === '1';
  });
  const [fps, setFps] = useState(0);
  const [paintMs, setPaintMs] = useState<number | null>(null);
  const [heapMb, setHeapMb] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // Recording state
  const [recording, setRecording] = useState(false);
  const recordStartRef = useRef<number>(0);
  const fpsBufferRef = useRef<number[]>([]);
  const startRendersRef = useRef<number>(0);
  const refreshesDuringRef = useRef<number>(0);
  const lastRefreshSeenRef = useRef<number | null>(null);
  const [samples, setSamples] = useState<Sample[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('perf-samples') || '[]');
    } catch {
      return [];
    }
  });

  // Persist samples
  useEffect(() => {
    localStorage.setItem('perf-samples', JSON.stringify(samples));
  }, [samples]);

  // Toggle hotkey
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        setOpen(o => {
          const next = !o;
          localStorage.setItem('perf-overlay-open', next ? '1' : '0');
          return next;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Track refreshes during a recording window
  useEffect(() => {
    if (!recording) {
      lastRefreshSeenRef.current = lastRefreshAt;
      return;
    }
    if (lastRefreshAt && lastRefreshAt !== lastRefreshSeenRef.current) {
      refreshesDuringRef.current += 1;
      lastRefreshSeenRef.current = lastRefreshAt;
    }
  }, [lastRefreshAt, recording]);

  // FPS sampler (runs while overlay is open OR while recording)
  useEffect(() => {
    if (!open && !recording) return;
    let raf = 0;
    let frames = 0;
    let last = performance.now();
    const tick = () => {
      frames++;
      const t = performance.now();
      if (t - last >= 1000) {
        const sampled = Math.round((frames * 1000) / (t - last));
        setFps(sampled);
        if (recording) fpsBufferRef.current.push(sampled);
        frames = 0;
        last = t;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, recording]);

  // Paint timing
  useEffect(() => {
    if (!open) return;
    if (typeof PerformanceObserver === 'undefined') return;
    try {
      const obs = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) setPaintMs(Math.round(lastEntry.startTime));
      });
      obs.observe({ type: 'paint', buffered: true });
      return () => obs.disconnect();
    } catch {
      /* ignore */
    }
  }, [open]);

  // Heap + clock tick
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => {
      setNow(Date.now());
      // @ts-expect-error non-standard chrome perf memory
      const mem = performance.memory;
      if (mem?.usedJSHeapSize) {
        setHeapMb(Math.round(mem.usedJSHeapSize / (1024 * 1024)));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [open]);

  const startRecording = () => {
    fpsBufferRef.current = [];
    refreshesDuringRef.current = 0;
    lastRefreshSeenRef.current = lastRefreshAt;
    startRendersRef.current = renderCount;
    recordStartRef.current = performance.now();
    setRecording(true);
  };

  const stopRecording = () => {
    const buf = fpsBufferRef.current;
    const durationS = Math.max(1, Math.round((performance.now() - recordStartRef.current) / 1000));
    if (buf.length > 0) {
      const sorted = [...buf].sort((a, b) => a - b);
      const avg = Math.round(buf.reduce((a, b) => a + b, 0) / buf.length);
      const min = sorted[0];
      const p1 = sorted[Math.max(0, Math.floor(sorted.length * 0.01))];
      const sample: Sample = {
        churn,
        durationS,
        avgFps: avg,
        minFps: min,
        p1Fps: p1,
        renders: renderCount - startRendersRef.current,
        refreshes: refreshesDuringRef.current,
        ts: Date.now(),
      };
      setSamples(prev => [sample, ...prev].slice(0, 8));
    }
    setRecording(false);
  };

  const clearSamples = () => setSamples([]);

  const recordElapsedS = recording
    ? Math.max(0, (now - (recordStartRef.current + (Date.now() - now))) / 1000)
    : 0;

  const churnHz = useMemo(() => {
    // Effective refresh rate including extras (per second)
    const baseHz = 1000 / refreshIntervalMs;
    return baseHz * (1 + churn);
  }, [churn, refreshIntervalMs]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          localStorage.setItem('perf-overlay-open', '1');
        }}
        className="fixed bottom-24 right-3 z-[9999] w-9 h-9 rounded-full liquid-glass flex items-center justify-center text-foreground/70 hover:text-foreground"
        aria-label="Open performance overlay"
        title="Perf (Shift+P)"
      >
        <Activity className="w-4 h-4" />
      </button>
    );
  }

  const sinceRefresh = lastRefreshAt ? Math.max(0, now - lastRefreshAt) : null;
  const fpsColor =
    fps >= 55 ? 'text-emerald-400' : fps >= 40 ? 'text-amber-400' : 'text-red-400';

  return (
    <div
      className="fixed bottom-24 right-3 z-[9999] w-[260px] rounded-2xl liquid-glass p-3 text-[11px] font-mono leading-tight text-foreground/90 shadow-xl"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 font-semibold tracking-wide uppercase text-[10px] text-foreground/70">
          <Activity className="w-3 h-3" /> {label}
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            localStorage.setItem('perf-overlay-open', '0');
          }}
          className="w-5 h-5 rounded-full flex items-center justify-center text-foreground/60 hover:text-foreground"
          aria-label="Close performance overlay"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      <Row label="FPS" value={<span className={fpsColor}>{fps}</span>} />
      <Row label="First paint" value={paintMs !== null ? `${paintMs} ms` : '—'} />
      <Row label="JS heap" value={heapMb !== null ? `${heapMb} MB` : 'n/a'} />
      <Row label="Renders" value={renderCount} />
      <Row
        label="Last refresh"
        value={sinceRefresh !== null ? `${(sinceRefresh / 1000).toFixed(1)}s ago` : '—'}
      />
      <Row label="Effective rate" value={`${churnHz.toFixed(2)}/s`} />

      <div className="my-2 h-px bg-foreground/10" />

      {/* Churn simulator */}
      <div className="text-[10px] uppercase tracking-wide text-foreground/60 mb-1">Churn ×</div>
      <div className="flex gap-1 mb-2">
        {CHURN_OPTIONS.map(c => (
          <button
            key={c}
            type="button"
            onClick={() => onChurnChange(c)}
            className={
              'flex-1 h-6 rounded-md text-[10px] font-semibold transition-colors ' +
              (c === churn
                ? 'bg-primary text-primary-foreground'
                : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10')
            }
            aria-pressed={c === churn}
          >
            {c === 0 ? 'off' : `${c}×`}
          </button>
        ))}
      </div>

      {/* Record controls */}
      <div className="flex items-center gap-1 mb-2">
        {!recording ? (
          <button
            type="button"
            onClick={startRecording}
            className="flex-1 h-7 rounded-md bg-emerald-500/90 hover:bg-emerald-500 text-white text-[10px] font-semibold flex items-center justify-center gap-1"
          >
            <Play className="w-3 h-3" /> Record
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="flex-1 h-7 rounded-md bg-red-500/90 hover:bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center gap-1"
          >
            <Square className="w-3 h-3" /> Stop ({recordElapsedS.toFixed(0)}s)
          </button>
        )}
        <button
          type="button"
          onClick={clearSamples}
          disabled={samples.length === 0}
          title="Clear samples"
          className="h-7 w-7 rounded-md bg-foreground/5 hover:bg-foreground/10 text-foreground/70 flex items-center justify-center disabled:opacity-30"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      {/* Samples table */}
      {samples.length > 0 && (
        <div className="mt-1">
          <div className="grid grid-cols-[28px_1fr_1fr_1fr_28px] gap-1 text-[9px] uppercase tracking-wide text-foreground/50 mb-1 px-1">
            <span>×</span>
            <span>avg</span>
            <span>min</span>
            <span>p1</span>
            <span className="text-right">re</span>
          </div>
          <div className="max-h-[120px] overflow-y-auto pr-0.5">
            {samples.map((s, i) => {
              const c =
                s.avgFps >= 55
                  ? 'text-emerald-400'
                  : s.avgFps >= 40
                    ? 'text-amber-400'
                    : 'text-red-400';
              return (
                <div
                  key={s.ts + '-' + i}
                  className="grid grid-cols-[28px_1fr_1fr_1fr_28px] gap-1 px-1 py-0.5 rounded hover:bg-foreground/5 tabular-nums"
                >
                  <span className="text-foreground/60">{s.churn === 0 ? 'off' : `${s.churn}×`}</span>
                  <span className={c}>{s.avgFps}</span>
                  <span>{s.minFps}</span>
                  <span>{s.p1Fps}</span>
                  <span className="text-right text-foreground/60">{s.renders}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-2 text-[9px] text-foreground/50">Shift+P · pick churn → Record</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-foreground/60">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}