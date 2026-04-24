import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// ── PWA service worker registration ──
// Only register in production builds AND outside of Lovable preview/iframe contexts.
// In editor preview, unregister any existing SW to avoid stale-cache issues.
(() => {
  if (!("serviceWorker" in navigator)) return;

  const isInIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  const host = window.location.hostname;
  const isPreviewHost =
    host.includes("lovableproject.com") ||
    host.includes("lovable.app") && host.includes("id-preview--");

  if (import.meta.env.DEV || isInIframe || isPreviewHost) {
    // Clean up any previously-registered worker so the preview stays fresh.
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    });
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("SW registration failed:", err);
    });
  });
})();
