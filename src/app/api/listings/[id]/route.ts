import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { applyPhoneDiscount } from "@/lib/utils";
import type { Listing, ListingDetailResponse } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
      createdAt: raw.createdAt.toISOString(),
      updatedAt: raw.updatedAt.toISOString(),
    };

    if (phoneVerified) {
      listing.discountedPrice = applyPhoneDiscount(raw.price);
    }

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
