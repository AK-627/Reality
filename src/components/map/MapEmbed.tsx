"use client";

import { useEffect, useRef } from "react";

interface MapEmbedProps {
  lat: number;
  lng: number;
  title: string;
  height?: string;
}

export default function MapEmbed({ lat, lng, title, height = "350px" }: MapEmbedProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 15);
      return;
    }
    // Guard against double-init (React strict mode)
    if ((mapRef.current as HTMLElement & { _leaflet_id?: number })._leaflet_id) return;

    import("leaflet").then((L) => {
      if (!mapRef.current) return;
      if ((mapRef.current as HTMLElement & { _leaflet_id?: number })._leaflet_id) return;

      // Fix default marker icons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current, {
        zoomControl: true,       // show +/- zoom buttons
        scrollWheelZoom: true,
        doubleClickZoom: true,
        dragging: true,
      }).setView([lat, lng], 15);

      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      L.marker([lat, lng]).addTo(map).bindPopup(title).openPopup();

      // Force a size recalculation after mount — fixes the "chunk of pixels" issue
      setTimeout(() => map.invalidateSize(), 100);
    });

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update view if coords change without remounting
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([lat, lng], 15);
  }, [lat, lng]);

  return (
    <div className="relative rounded-lg overflow-hidden border border-grey-200" style={{ height }}>
      <div
        ref={mapRef}
        style={{ height: "100%", width: "100%" }}
        aria-label={`Map showing location of ${title}`}
      />
      {/* "Open in Google Maps" link */}
      <a
        href={`https://www.google.com/maps?q=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 z-[1000] bg-white text-xs font-medium text-grey-700 border border-grey-300 rounded px-2 py-1 hover:border-black hover:text-black transition-colors shadow-sm"
      >
        Open in Google Maps ↗
      </a>
    </div>
  );
}
