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

const CATEGORY_CONFIG: Record<string, { label: string; emoji: string }> = {
  school:      { label: "Schools",       emoji: "🏫" },
  hospital:    { label: "Hospitals",     emoji: "🏥" },
  cafe:        { label: "Cafes",         emoji: "☕" },
  metro:       { label: "Metro / Rail",  emoji: "🚇" },
  supermarket: { label: "Supermarkets",  emoji: "🛒" },
  restaurant:  { label: "Restaurants",   emoji: "🍽️" },
  park:        { label: "Parks",         emoji: "🌳" },
  bank:        { label: "Banks / ATMs",  emoji: "🏦" },
};

const DISPLAY_ORDER = ["school", "hospital", "cafe", "metro", "supermarket", "restaurant", "park", "bank"];

function formatDistance(m: number): string {
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`;
}

export default function NeighbourhoodSection({ listingId, lat, lng }: NeighbourhoodSectionProps) {
  const [pois, setPois] = useState<POI[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!lat || !lng) return;
    setLoading(true);
    fetch(`/api/listings/${listingId}/pois`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data.pois)) setPois(data.pois); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [listingId, lat, lng]);

  if (!lat || !lng) return null;

  // Group by category
  const grouped: Record<string, POI[]> = {};
  for (const poi of pois) {
    if (!grouped[poi.category]) grouped[poi.category] = [];
    grouped[poi.category].push(poi);
  }

  const hasData = Object.keys(grouped).length > 0;

  return (
    <section aria-labelledby="neighbourhood-heading">
      <h2 id="neighbourhood-heading" className="text-xl font-semibold text-black mb-4">
        Nearby Places
      </h2>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-grey-100 rounded animate-pulse" />
          ))}
        </div>
      ) : !hasData ? (
        <p className="text-sm text-grey-500">No nearby places found for this location.</p>
      ) : (
        <div className="border border-grey-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-grey-50 border-b border-grey-200">
                <th className="text-left px-4 py-2.5 font-semibold text-grey-700 w-1/3">Category</th>
                <th className="text-left px-4 py-2.5 font-semibold text-grey-700">Name</th>
                <th className="text-right px-4 py-2.5 font-semibold text-grey-700 w-24">Distance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey-100">
              {DISPLAY_ORDER.flatMap((cat) => {
                const items = grouped[cat];
                if (!items || items.length === 0) return [];
                const config = CATEGORY_CONFIG[cat] ?? { label: cat, emoji: "📍" };
                return items.map((poi, idx) => (
                  <tr key={`${cat}-${idx}`} className="hover:bg-grey-50 transition-colors">
                    <td className="px-4 py-2.5 text-grey-600">
                      {idx === 0 ? (
                        <span className="flex items-center gap-1.5">
                          <span>{config.emoji}</span>
                          <span className="font-medium text-grey-700">{config.label}</span>
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2.5 text-black">{poi.name}</td>
                    <td className="px-4 py-2.5 text-right text-grey-500 tabular-nums">
                      {formatDistance(poi.distance)}
                    </td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
