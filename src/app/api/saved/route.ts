import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { Listing, SavedListingListResponse } from "@/lib/types";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorised", code: "UNAUTHORISED" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, phoneVerified: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const savedRecords = await prisma.savedListing.findMany({
      where: { userId: user.id },
      orderBy: { savedAt: "desc" },
      include: {
        listing: {
          include: {
            builder: true,
            floorPlans: { orderBy: { order: "asc" } },
          },
        },
      },
    });

    const listings: Listing[] = savedRecords.map(({ listing: raw }: { listing: typeof savedRecords[0]["listing"] }) => {
      const constructionStatus =
        raw.yearBuilt != null
          ? "READY_TO_MOVE"
          : raw.possessionDate != null
          ? "UNDER_CONSTRUCTION"
          : undefined;

      const listing: Listing = {
        id: raw.id,
        title: raw.title,
        description: raw.description,
        price: raw.price,
        propertyType: raw.propertyType as Listing["propertyType"],
        bedrooms: raw.bedrooms ?? undefined,
        bathrooms: raw.bathrooms ?? undefined,
        address: raw.address,
        area: raw.area,
        city: raw.city,
        lat: raw.lat ?? undefined,
        lng: raw.lng ?? undefined,
        images: typeof raw.images === "string" ? JSON.parse(raw.images) : raw.images,
        amenities: typeof raw.amenities === "string" ? JSON.parse(raw.amenities) : raw.amenities,
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
        isSaved: true,
        limitedOffer: raw.limitedOffer,
        offerExpiresAt: raw.offerExpiresAt?.toISOString(),
        underrated: raw.underrated,
        yearBuilt: raw.yearBuilt ?? undefined,
        possessionDate: raw.possessionDate ?? undefined,
        constructionStatus: constructionStatus as Listing["constructionStatus"],
        createdAt: raw.createdAt.toISOString(),
        updatedAt: raw.updatedAt.toISOString(),
      };

      return listing;
    });

    const response: SavedListingListResponse = { listings };
    return NextResponse.json(response);
  } catch (error) {
    console.error("[GET /api/saved]", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
