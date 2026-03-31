import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { applyPhoneDiscount } from "@/lib/utils";
import type { Listing, ListingListResponse } from "@/lib/types";

const PAGE_SIZE = 12;

function mapListing(
  raw: {
    id: string;
    title: string;
    description: string;
    price: number;
    propertyType: "APARTMENT" | "VILLA" | "PLOT" | "COMMERCIAL";
    bedrooms: number | null;
    bathrooms: number | null;
    address: string;
    area: string;
    city: string;
    lat: number | null;
    lng: number | null;
    images: string[];
    amenities: string[];
    agentPhone: string;
    agentWhatsApp: string;
    available: boolean;
    featured: boolean;
    limitedOffer: boolean;
    offerExpiresAt: Date | null;
    underrated: boolean;
    yearBuilt: number | null;
    possessionDate: string | null;
    createdAt: Date;
    updatedAt: Date;
    builder?: { id: string; name: string; slug: string; logoUrl: string | null } | null;
    floorPlans?: { id: string; imageUrl: string; order: number }[];
    savedBy?: { userId: string }[];
  },
  phoneVerified: boolean,
  userId: string | null
): Listing {
  const constructionStatus =
    raw.yearBuilt != null
      ? "READY_TO_MOVE"
      : raw.possessionDate != null
      ? "UNDER_CONSTRUCTION"
      : undefined;

  const isSaved = userId
    ? (raw.savedBy ?? []).some((s) => s.userId === userId)
    : false;

  const listing: Listing = {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    price: raw.price,
    propertyType: raw.propertyType,
    bedrooms: raw.bedrooms ?? undefined,
    bathrooms: raw.bathrooms ?? undefined,
    address: raw.address,
    area: raw.area,
    city: raw.city,
    lat: raw.lat ?? undefined,
    lng: raw.lng ?? undefined,
    images: raw.images,
    amenities: raw.amenities,
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
    floorPlans: (raw.floorPlans ?? []).map((fp) => ({
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
    constructionStatus,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  };

  if (phoneVerified) {
    listing.discountedPrice = applyPhoneDiscount(raw.price);
  }

  return listing;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const q = searchParams.get("q") ?? "";
    const type = searchParams.get("type") ?? "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const beds = searchParams.get("beds");
    const baths = searchParams.get("baths");
    const location = searchParams.get("location") ?? "";
    const builder = searchParams.get("builder") ?? "";
    const sort = searchParams.get("sort") ?? "newest";
    const constructionStatus = searchParams.get("constructionStatus") ?? "";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));

    // Build Prisma where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = { available: true };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { area: { contains: q, mode: "insensitive" } },
      ];
    }

    if (type) {
      const types = type.split(",").map((t) => t.trim().toUpperCase());
      where.propertyType = { in: types };
    }

    if (minPrice) {
      where.price = { ...where.price, gte: parseInt(minPrice, 10) };
    }
    if (maxPrice) {
      where.price = { ...where.price, lte: parseInt(maxPrice, 10) };
    }

    if (beds) {
      where.bedrooms = { gte: parseInt(beds, 10) };
    }
    if (baths) {
      where.bathrooms = { gte: parseInt(baths, 10) };
    }

    if (location) {
      where.area = { contains: location, mode: "insensitive" };
    }

    if (builder) {
      where.builder = { slug: builder };
    }

    // constructionStatus filter
    if (constructionStatus === "READY_TO_MOVE") {
      where.yearBuilt = { not: null };
    } else if (constructionStatus === "UNDER_CONSTRUCTION") {
      where.possessionDate = { not: null };
    }

    // Sort options
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: Record<string, any> | Record<string, any>[] = { createdAt: "desc" };
    let limitedOffersOnly = false;
    let underratedOnly = false;

    switch (sort) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "limited_offers":
        limitedOffersOnly = true;
        orderBy = { offerExpiresAt: "asc" };
        break;
      case "underrated":
        underratedOnly = true;
        orderBy = { createdAt: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    if (limitedOffersOnly) {
      where.limitedOffer = true;
    }
    if (underratedOnly) {
      where.underrated = true;
    }

    // Determine auth state
    let phoneVerified = false;
    let userId: string | null = null;

    try {
      const session = await getServerSession();
      if (session?.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true, phoneVerified: true },
        });
        if (user) {
          phoneVerified = user.phoneVerified;
          userId = user.id;
        }
      }
    } catch {
      // Auth not configured yet — continue as guest
    }

    const skip = (page - 1) * PAGE_SIZE;

    const [rawListings, total] = await prisma.$transaction([
      prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take: PAGE_SIZE,
        include: {
          builder: true,
          floorPlans: { orderBy: { order: "asc" } },
          savedBy: userId ? { where: { userId }, select: { userId: true } } : false,
        },
      }),
      prisma.listing.count({ where }),
    ]);

    const listings = rawListings.map((l: Parameters<typeof mapListing>[0]) =>
      mapListing(l as Parameters<typeof mapListing>[0], phoneVerified, userId)
    );

    const response: ListingListResponse = {
      listings,
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(total / PAGE_SIZE),
    };

    return NextResponse.json(response);
  } catch (error) {
    // DB not connected or other error — return empty result gracefully
    console.error("[GET /api/listings]", error);
    const empty: ListingListResponse = {
      listings: [],
      total: 0,
      page: 1,
      pageSize: PAGE_SIZE,
      totalPages: 0,
    };
    return NextResponse.json(empty);
  }
}
