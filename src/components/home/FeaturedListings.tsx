import Link from "next/link";
import prisma from "@/lib/prisma";
import ListingCard from "@/components/listings/ListingCard";
import { ListingCardSkeleton } from "@/components/listings/ListingCard";
import type { Listing } from "@/lib/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawListing = any;

async function getFeaturedListings(): Promise<Listing[]> {
  try {
    const raw = await prisma.listing.findMany({
      where: { available: true, featured: true },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        builder: true,
        floorPlans: { orderBy: { order: "asc" } },
      },
    });

    return raw.map((l: RawListing) => ({
      id: l.id,
      title: l.title,
      description: l.description,
      price: l.price,
      propertyType: l.propertyType,
      bedrooms: l.bedrooms ?? undefined,
      bathrooms: l.bathrooms ?? undefined,
      address: l.address,
      area: l.area,
      city: l.city,
      lat: l.lat ?? undefined,
      lng: l.lng ?? undefined,
      images: l.images,
      amenities: l.amenities,
      agentPhone: l.agentPhone,
      agentWhatsApp: l.agentWhatsApp,
      builder: l.builder
        ? { id: l.builder.id, name: l.builder.name, slug: l.builder.slug, logoUrl: l.builder.logoUrl ?? undefined }
        : undefined,
      floorPlans: l.floorPlans.map((fp: { id: string; imageUrl: string; order: number }) => ({ id: fp.id, imageUrl: fp.imageUrl, order: fp.order })),
      available: l.available,
      featured: l.featured,
      isSaved: false,
      limitedOffer: l.limitedOffer,
      offerExpiresAt: l.offerExpiresAt?.toISOString(),
      underrated: l.underrated,
      yearBuilt: l.yearBuilt ?? undefined,
      possessionDate: l.possessionDate ?? undefined,
      constructionStatus: l.yearBuilt != null ? "READY_TO_MOVE" : l.possessionDate != null ? "UNDER_CONSTRUCTION" : undefined,
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export default async function FeaturedListings() {
  const listings = await getFeaturedListings();

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-black">Featured Properties</h2>
            <p className="text-grey-500 text-sm mt-1">Hand-picked premium listings</p>
          </div>
          <Link
            href="/listings"
            className="text-sm font-medium text-black underline underline-offset-4 hover:text-grey-700 transition-colors"
          >
            View all listings →
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
