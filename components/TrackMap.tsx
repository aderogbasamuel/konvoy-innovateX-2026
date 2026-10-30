"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type LatLng = { lat: number; lng: number };

type Props = {
  origin: LatLng;
  destination: LatLng;
  /** Last known position of the trip, or null if no fix yet. */
  position: LatLng | null;
  /** Optional road geometry; falls back to a straight line origin -> destination. */
  route?: LatLng[];
  stale: boolean;
  arrived: boolean;
  fromLabel: string;
  toLabel: string;
  ariaLabel: string;
};

const toTuple = (p: LatLng): [number, number] => [p.lat, p.lng];

function pulseIcon(stale: boolean, arrived: boolean) {
  const live = !stale && !arrived;
  const html = `
    <span class="relative flex h-6 w-6">
      ${live ? '<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FFC20E] opacity-40 motion-reduce:animate-none"></span>' : ""}
      <span class="relative inline-flex h-6 w-6 rounded-full border-[2.5px] border-[#241A00] ${stale ? "border-dashed bg-white" : "bg-[#FFC20E]"}"></span>
    </span>`;
  return L.divIcon({ html, className: "", iconSize: [24, 24], iconAnchor: [12, 12] });
}

export default function TrackMap({
  origin,
  destination,
  position,
  route,
  stale,
  arrived,
  fromLabel,
  toLabel,
  ariaLabel,
}: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const fittedRef = useRef(false);

  // Create the map and the static layers (tiles, route, start and end points).
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const map = L.map(el, { scrollWheelZoom: false }).setView(toTuple(origin), 12);
    mapRef.current = map;

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);

    const line = (route && route.length > 1 ? route : [origin, destination]).map(toTuple);
    L.polyline(line, { color: "#11603A", weight: 5, opacity: 0.8, dashArray: route ? undefined : "2 10", lineCap: "round" }).addTo(map);

    L.circleMarker(toTuple(origin), { radius: 8, color: "#fff", weight: 2, fillColor: "#11603A", fillOpacity: 1 })
      .bindTooltip(fromLabel, { permanent: true, direction: "bottom", offset: [0, 8] })
      .addTo(map);
    L.circleMarker(toTuple(destination), { radius: 8, color: "#11603A", weight: 4, fillColor: "#fff", fillOpacity: 1 })
      .bindTooltip(toLabel, { permanent: true, direction: "top", offset: [0, -8] })
      .addTo(map);

    map.fitBounds(L.latLngBounds([toTuple(origin), toTuple(destination)]), { padding: [32, 32] });

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      fittedRef.current = false;
    };
    // route is intentionally excluded: pass a stable value or remount via key if it changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin.lat, origin.lng, destination.lat, destination.lng, fromLabel, toLabel]);

  // Move the live marker whenever a new fix arrives (polling updates).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!position) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    const latlng = toTuple(position);
    if (!markerRef.current) {
      markerRef.current = L.marker(latlng, { icon: pulseIcon(stale, arrived), keyboard: false, zIndexOffset: 1000 }).addTo(map);
    } else {
      markerRef.current.setLatLng(latlng);
      markerRef.current.setIcon(pulseIcon(stale, arrived));
    }

    // Frame everything once on the first fix, then just keep the marker in view.
    if (!fittedRef.current) {
      map.fitBounds(L.latLngBounds([toTuple(origin), toTuple(destination), latlng]), { padding: [32, 32] });
      fittedRef.current = true;
    } else if (!map.getBounds().contains(latlng)) {
      map.panTo(latlng, { animate: true });
    }
  }, [position?.lat, position?.lng, stale, arrived, origin.lat, origin.lng, destination.lat, destination.lng]);

  return (
    <div
      ref={elRef}
      role="img"
      aria-label={ariaLabel}
      className="isolate z-0 mt-4 h-72 w-full overflow-hidden rounded-2xl bg-[#E6EEE6]"
    />
  );
}