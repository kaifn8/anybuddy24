import { useEffect, useRef, useState } from 'react';
import { Activity, X } from 'lucide-react';

interface PerfOverlayProps {
  /** Number of times the parent component has rendered. */
  renderCount: number;
  /** Timestamp (ms) of the last feed refresh tick. */
  lastRefreshAt: number | null;
  /** Configured refresh interval in ms (for display). */
  refreshIntervalMs: number;
  /** Label shown in the header. */
  label?: string;
}

/**
 * Lightweight client-side perf HUD.
 * - FPS sampled every second via requestAnimationFrame
 * - Last paint duration via PerformanceObserver('paint')
 * - JS heap (when available)
 * - Re-render count of the parent feed
 * - Time since last refresh tick + countdown to next
 *
 * Toggle with Shift+P. Persists open/closed in localStorage.
 */
export function PerfOverlay({
  renderCount,
  lastRefreshAt,
  refreshIntervalMs,
  label = 'Perf',
}: PerfOverlayProps) {
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('perf-overlay-open') === '1';
  });
  const [fps, setFps] = useState(0);
  const [minFps, setMinFps] = useState<number | null>(null);
  const [paintMs, setPaintMs] = useState<number | null>(null);
  const [heapMb, setHeapMb] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

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

  // FPS sampler — always running while overlay is open
  useEffect(() => {
    if (!open) return;
    let raf = 0;
    let frames = 0;
    let last = performance.now();
    const tick = () => {
      frames++;
      const t = performance.now();
      if (t - last >= 1000) {
        const sampled = Math.round((frames * 1000) / (t - last));
        setFps(sampled);
        setMinFps(prev => (prev === null ? sampled : Math.min(prev, sampled)));
        frames = 0;
        last = t;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open]);

  // Paint timing
  useEffect(() => {
    if (!open) return;
    if (typeof PerformanceObserver === 'undefined') return;
    try {
      const obs = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) setPaintMs(Math.round(last.startTime));
      });
      obs.observe({ type: 'paint', buffered: true });
      return () => obs.disconnect();
    } catch {
      // ignore
    }
  }, [open]);

  // Heap + clock tick (1Hz) for the countdown
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
  const nextInMs = lastRefreshAt
    ? Math.max(0, refreshIntervalMs - (now - lastRefreshAt))
    : refreshIntervalMs;

  const fpsColor =
    fps >= 55 ? 'text-emerald-400' : fps >= 40 ? 'text-amber-400' : 'text-red-400';

  return (
    <div
      className="fixed bottom-24 right-3 z-[9999] w-[210px] rounded-2xl liquid-glass p-3 text-[11px] font-mono leading-tight text-foreground/90 shadow-xl"
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
      <Row label="Min FPS" value={minFps ?? '—'} />
      <Row label="First paint" value={paintMs !== null ? `${paintMs} ms` : '—'} />
      <Row label="JS heap" value={heapMb !== null ? `${heapMb} MB` : 'n/a'} />
      <div className="my-2 h-px bg-foreground/10" />
      <Row label="Renders" value={renderCount} />
      <Row
        label="Last refresh"
        value={sinceRefresh !== null ? `${(sinceRefresh / 1000).toFixed(1)}s ago` : '—'}
      />
      <Row label="Next in" value={`${(nextInMs / 1000).toFixed(1)}s`} />

      <div className="mt-2 text-[9px] text-foreground/50">Shift+P to toggle</div>
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