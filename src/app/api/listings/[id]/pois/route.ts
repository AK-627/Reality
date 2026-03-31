import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface POI {
  name: string;
  category: string;
  distance: number;
}

// Overpass API query builder for nearby amenities
function buildOverpassQuery(lat: number, lng: number, radius = 2000): string {
  return `
[out:json][timeout:10];
(
  node["amenity"="school"](around:${radius},${lat},${lng});
  node["amenity"="hospital"](around:${radius},${lat},${lng});
  node["amenity"="clinic"](around:${radius},${lat},${lng});
  node["station"="subway"](around:${radius},${lat},${lng});
  node["railway"="station"](around:${radius},${lat},${lng});
  node["amenity"="supermarket"](around:${radius},${lat},${lng});
  node["shop"="supermarket"](around:${radius},${lat},${lng});
  node["amenity"="restaurant"](around:${radius},${lat},${lng});
  node["amenity"="fast_food"](around:${radius},${lat},${lng});
);
out body;
`.trim();
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // metres
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
  if (tags.station === "subway" || tags.railway === "station") return "metro";
  if (tags.amenity === "supermarket" || tags.shop === "supermarket") return "supermarket";
  if (tags.amenity === "restaurant" || tags.amenity === "fast_food") return "restaurant";
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

    // Query Overpass API
    const query = buildOverpassQuery(lat, lng);
    const overpassUrl = "https://overpass-api.de/api/interpreter";

    let pois: POI[] = [];

    try {
      const res = await fetch(overpassUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(12000),
      });

      if (res.ok) {
        const data = await res.json();
        const elements: Array<{ lat: number; lon: number; tags?: Record<string, string> }> =
          data.elements ?? [];

        const seen = new Set<string>();

        for (const el of elements) {
          const tags = el.tags ?? {};
          const name = tags.name;
          if (!name) continue;

          const category = classifyNode(tags);
          if (!category) continue;

          const key = `${category}:${name}`;
          if (seen.has(key)) continue;
          seen.add(key);

          const distance = haversineDistance(lat, lng, el.lat, el.lon);
          pois.push({ name, category, distance });
        }

        // Sort by distance, cap at 20
        pois.sort((a, b) => a.distance - b.distance);
        pois = pois.slice(0, 20);
      }
    } catch {
      // Overpass unavailable — return empty
    }

    return NextResponse.json({ pois });
  } catch (error) {
    console.error("[GET /api/listings/[id]/pois]", error);
    return NextResponse.json({ pois: [] });
  }
}
