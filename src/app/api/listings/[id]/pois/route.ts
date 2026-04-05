import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface POI {
  name: string;
  category: string;
  distance: number;
}

// Categories we want, in display order, with max results per category
const CATEGORIES: { key: string; tags: Record<string, string>[]; limit: number }[] = [
  { key: "school",      tags: [{ amenity: "school" }],                                          limit: 2 },
  { key: "hospital",    tags: [{ amenity: "hospital" }, { amenity: "clinic" }],                 limit: 2 },
  { key: "cafe",        tags: [{ amenity: "cafe" }],                                             limit: 2 },
  { key: "metro",       tags: [{ station: "subway" }, { railway: "station" }],                  limit: 2 },
  { key: "supermarket", tags: [{ amenity: "supermarket" }, { shop: "supermarket" }],            limit: 2 },
  { key: "restaurant",  tags: [{ amenity: "restaurant" }, { amenity: "fast_food" }],            limit: 2 },
  { key: "park",        tags: [{ leisure: "park" }],                                             limit: 1 },
  { key: "bank",        tags: [{ amenity: "bank" }, { amenity: "atm" }],                        limit: 1 },
];

function buildOverpassQuery(lat: number, lng: number, radius = 2000): string {
  const nodes = CATEGORIES.flatMap(({ tags }) =>
    tags.map((t) => {
      const filter = Object.entries(t).map(([k, v]) => `["${k}"="${v}"]`).join("");
      return `node${filter}(around:${radius},${lat},${lng});`;
    })
  ).join("\n  ");
  return `[out:json][timeout:10];\n(\n  ${nodes}\n);\nout body;`;
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function classifyNode(tags: Record<string, string>): string | null {
  if (tags.amenity === "school") return "school";
  if (tags.amenity === "hospital" || tags.amenity === "clinic") return "hospital";
  if (tags.amenity === "cafe") return "cafe";
  if (tags.station === "subway" || tags.railway === "station") return "metro";
  if (tags.amenity === "supermarket" || tags.shop === "supermarket") return "supermarket";
  if (tags.amenity === "restaurant" || tags.amenity === "fast_food") return "restaurant";
  if (tags.leisure === "park") return "park";
  if (tags.amenity === "bank" || tags.amenity === "atm") return "bank";
  return null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { lat: true, lng: true },
    });

    if (!listing || listing.lat == null || listing.lng == null) {
      return NextResponse.json({ pois: [] });
    }

    const { lat, lng } = listing;
    const query = buildOverpassQuery(lat, lng);

    let pois: POI[] = [];

    try {
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(12000),
      });

      if (res.ok) {
        const data = await res.json();
        const elements: Array<{ lat: number; lon: number; tags?: Record<string, string> }> =
          data.elements ?? [];

        // Group by category, keep closest N per category
        const buckets: Record<string, POI[]> = {};
        const seen = new Set<string>();

        for (const el of elements) {
          const tags = el.tags ?? {};
          const name = tags.name;
          if (!name) continue;
          const category = classifyNode(tags);
          if (!category) continue;
          const key = `${category}:${name.toLowerCase()}`;
          if (seen.has(key)) continue;
          seen.add(key);
          const distance = haversineDistance(lat, lng, el.lat, el.lon);
          if (!buckets[category]) buckets[category] = [];
          buckets[category].push({ name, category, distance });
        }

        // Sort each bucket by distance, take limit, then flatten in display order
        for (const { key, limit } of CATEGORIES) {
          const bucket = (buckets[key] ?? []).sort((a, b) => a.distance - b.distance).slice(0, limit);
          pois.push(...bucket);
        }
      }
    } catch {
      // Overpass unavailable
    }

    return NextResponse.json({ pois });
  } catch (error) {
    console.error("[GET /api/listings/[id]/pois]", error);
    return NextResponse.json({ pois: [] });
  }
}
