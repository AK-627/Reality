"use client";

import { useEffect, useRef } from "react";
import type { Listing } from "@/lib/types";
import { formatINR } from "@/lib/utils";

interface MapViewProps {
  listings: Listing[];
  height?: string;
}

// Dynamically import Leaflet only on client to avoid SSR issues
export default function MapView({ listings, height = "600px" }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamically import leaflet
    import("leaflet").then((L) => {
      // Guard against double-init (React strict mode / hot reload)
      if (mapInstanceRef.current) return;
      if ((mapRef.current as HTMLElement & { _leaflet_id?: number })._leaflet_id) return;
      // Fix default marker icon paths for Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Centre on Bangalore
      const map = L.map(mapRef.current!).setView([12.9716, 77.5946], 11);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Add markers
      listings
        .filter((l) => l.lat != null && l.lng != null)
        .forEach((listing) => {
          const popup = `
            <div style="min-width:200px;font-family:system-ui,sans-serif">
              ${listing.images[0] ? `<img src="${listing.images[0]}" alt="${listing.title}" style="width:100%;height:120px;object-fit:cover;border-radius:4px;margin-bottom:8px" />` : ""}
              <p style="font-size:13px;font-weight:600;margin:0 0 4px">${listing.title}</p>
              <p style="font-size:14px;font-weight:700;margin:0 0 6px">${formatINR(listing.price)}</p>
              <a href="/listings/${listing.id}" style="font-size:12px;color:#000;text-decoration:underline">View details →</a>
            </div>
          `;
          L.marker([listing.lat!, listing.lng!])
            .addTo(map)
            .bindPopup(popup);
        });
    });

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update markers when listings change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    import("leaflet").then((L) => {
      // Remove existing markers
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) map.removeLayer(layer);
      });

      // Re-add filtered markers
      listings
        .filter((l) => l.lat != null && l.lng != null)
        .forEach((listing) => {
          const popup = `
            <div style="min-width:200px;font-family:system-ui,sans-serif">
              ${listing.images[0] ? `<img src="${listing.images[0]}" alt="${listing.title}" style="width:100%;height:120px;object-fit:cover;border-radius:4px;margin-bottom:8px" />` : ""}
              <p style="font-size:13px;font-weight:600;margin:0 0 4px">${listing.title}</p>
              <p style="font-size:14px;font-weight:700;margin:0 0 6px">${formatINR(listing.price)}</p>
              <a href="/listings/${listing.id}" style="font-size:12px;color:#000;text-decoration:underline">View details →</a>
            </div>
          `;
          L.marker([listing.lat!, listing.lng!])
            .addTo(map)
            .bindPopup(popup);
        });
    });
  }, [listings]);

  return (
    <div
      ref={mapRef}
      style={{ height, width: "100%" }}
      className="rounded-lg overflow-hidden border border-grey-200 z-0"
      aria-label="Property map"
    />
  );
}
