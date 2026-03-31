"use client";

import { useEffect, useState } from "react";

interface POI {
  name: string;
  category: string;
  distance: number;
}

interface NeighbourhoodSectionProps {
  listingId: string;
  lat?: number;
  lng?: number;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  school: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      className="w-5 h-5" aria-hidden="true">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  ),
  hospital: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      className="w-5 h-5" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  metro: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      className="w-5 h-5" aria-hidden="true">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="9" y1="22" x2="15" y2="22" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  supermarket: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      className="w-5 h-5" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  restaurant: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      className="w-5 h-5" aria-hidden="true">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  ),
};

const CATEGORY_LABELS: Record<string, string> = {
  school: "School",
  hospital: "Hospital",
  metro: "Metro Station",
  supermarket: "Supermarket",
  restaurant: "Restaurant",
};

function formatDistance(metres: number): string {
  if (metres < 1000) return `${metres}m`;
  return `${(metres / 1000).toFixed(1)}km`;
}

export default function NeighbourhoodSection({ listingId, lat, lng }: NeighbourhoodSectionProps) {
  const [pois, setPois] = useState<POI[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!lat || !lng) return;

    setLoading(true);
    fetch(`/api/listings/${listingId}/pois`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.pois)) setPois(data.pois);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [listingId, lat, lng]);

  // Hidden when no coordinates
  if (!lat || !lng) return null;

  return (
    <section aria-labelledby="neighbourhood-heading">
      <h2 id="neighbourhood-heading" className="text-xl font-semibold text-black mb-4">
        Neighbourhood
      </h2>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-grey-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : pois.length === 0 ? (
        <p className="text-sm text-grey-500">No nearby points of interest found.</p>
      ) : (
        <ul className="space-y-2">
          {pois.map((poi, idx) => (
            <li key={idx} className="flex items-center gap-3 p-3 bg-grey-50 border border-grey-200 rounded-lg">
              <span className="flex-shrink-0 text-grey-600">
                {CATEGORY_ICONS[poi.category] ?? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={1.5} className="w-5 h-5" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                )}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black truncate">{poi.name}</p>
                <p className="text-xs text-grey-500">{CATEGORY_LABELS[poi.category] ?? poi.category}</p>
              </div>
              <span className="text-xs font-medium text-grey-600 flex-shrink-0">
                {formatDistance(poi.distance)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
