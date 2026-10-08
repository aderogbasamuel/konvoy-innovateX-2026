"use client";

import { useEffect } from "react";

// Registers the offline-fallback service worker (production only)
export default function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* the app works without it */
    });
  }, []);
  return null;
}