import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import type { Listing, ListingDetailResponse } from "@/lib/types";

function parseJsonSafe<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value !== "string") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function parseStringArraySafe(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value !== "string") return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  if (!trimmed.startsWith("[")) return [trimmed.replace(/^"|"$/g, "").trim()].filter(Boolean);
  return parseJsonSafe<string[]>(trimmed, [])
    .map((v) => String(v).trim())
    .filter(Boolean);
}

function normalizeBlueprintVariants(value: unknown): Listing["blueprintVariants"] {
  const rows = Array.isArray(value) ? value : parseJsonSafe<unknown[]>(value, []);
  return rows.reduce<NonNullable<Listing["blueprintVariants"]>>((acc, item, index) => {
      if (!item || typeof item !== "object") return acc;
      const row = item as Record<string, unknown>;
      const imageUrl = typeof row.imageUrl === "string" ? row.imageUrl.trim() : "";
      if (!imageUrl) return acc;
      const areaRaw = row.area;
      const area =
        typeof areaRaw === "number"
          ? areaRaw
          : typeof areaRaw === "string" && areaRaw.trim()
          ? Number(areaRaw)
          : undefined;
      acc.push({
        id: typeof row.id === "string" && row.id.trim() ? row.id.trim() : `bp_${index + 1}`,
        bhk: typeof row.bhk === "string" && row.bhk.trim() ? row.bhk.trim() : undefined,
        layoutName:
          typeof row.layoutName === "string" && row.layoutName.trim()
            ? row.layoutName.trim()
            : undefined,
        area: Number.isFinite(area as number) ? area : undefined,
        areaUnit: row.areaUnit === "sqm" ? "sqm" : row.areaUnit === "sqft" ? "sqft" : undefined,
        imageUrl,
      });
      return acc;
    }, []);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Determine auth state
    let userId: string | null = null;

    try {
      const session = await getServerSession();
      if (session?.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true, phoneVerified: true },
        });
        if (user) {
          userId = user.id;
        }
      }
    } catch {
      // Auth not configured yet — continue as guest
    }

    const raw = await prisma.listing.findUnique({
      where: { id },
      include: {
        builder: true,
        floorPlans: { orderBy: { order: "asc" } },
        savedBy: userId ? { where: { userId }, select: { userId: true } } : false,
      },
    });

    if (!raw) {
      return NextResponse.json(
        { error: "Listing not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const constructionStatus =
      raw.yearBuilt != null
        ? "READY_TO_MOVE"
        : raw.possessionDate != null
        ? "UNDER_CONSTRUCTION"
        : undefined;

    const isSaved = userId
      ? (raw.savedBy ?? []).some((s: { userId: string }) => s.userId === userId)
      : false;

    const listing: Listing = {
      id: raw.id,
      title: raw.title,
      description: raw.description,
      price: raw.price,
      propertyType: raw.propertyType as "APARTMENT" | "VILLA" | "PLOT" | "COMMERCIAL",
      bedrooms: raw.bedrooms ?? undefined,
      bathrooms: raw.bathrooms ?? undefined,
      address: raw.address,
      area: raw.area,
      city: raw.city,
      lat: raw.lat ?? undefined,
      lng: raw.lng ?? undefined,
      images: parseStringArraySafe(raw.images),
      amenities: parseStringArraySafe(raw.amenities),
      agentPhone: raw.agentPhone,
      agentWhatsApp: raw.agentWhatsApp,
      builder: raw.builder
        ? {
            id: raw.builder.id,
            name: raw.builder.name,
            slug: raw.builder.slug,
            logoUrl: raw.builder.logoUrl ?? undefined,
          }
        : undefined,
      floorPlans: (raw.floorPlans ?? []).map((fp: { id: string; imageUrl: string; order: number }) => ({
        id: fp.id,
        imageUrl: fp.imageUrl,
        order: fp.order,
      })),
      available: raw.available,
      featured: raw.featured,
      isSaved,
      limitedOffer: raw.limitedOffer,
      offerExpiresAt: raw.offerExpiresAt?.toISOString(),
      underrated: raw.underrated,
      yearBuilt: raw.yearBuilt ?? undefined,
      possessionDate: raw.possessionDate ?? undefined,
      constructionStatus: constructionStatus as Listing["constructionStatus"],
      blueprintUrl: raw.blueprintUrl ?? undefined,
      bhkOptions: parseStringArraySafe(raw.bhkOptions),
      blueprintVariants: normalizeBlueprintVariants((raw as any).blueprintVariants),
      size: raw.size ?? undefined,
      sizeUnit: (raw.sizeUnit as "sqft" | "acre") ?? undefined,
      createdAt: raw.createdAt.toISOString(),
      updatedAt: raw.updatedAt.toISOString(),
    };

    const response: ListingDetailResponse = { listing };
    return NextResponse.json(response);
  } catch (error) {
    console.error("[GET /api/listings/[id]]", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
