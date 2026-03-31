import { notFound } from "next/navigation";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { applyPhoneDiscount, formatINR } from "@/lib/utils";
import type { Listing } from "@/lib/types";

import ImageGallery from "@/components/property/ImageGallery";
import FloorPlansSection from "@/components/property/FloorPlansSection";
import EnquiryForm from "@/components/property/EnquiryForm";
import AgentContactCard from "@/components/property/AgentContactCard";
import StickyContactBar from "@/components/property/StickyContactBar";
import EMICalculator from "@/components/property/EMICalculator";
import SharePanel from "@/components/property/SharePanel";
import NeighbourhoodSection from "@/components/property/NeighbourhoodSection";
import ViewTracker from "@/components/property/ViewTracker";
import MapEmbed from "@/components/map/MapEmbed";

// ─── Property type label ──────────────────────────────────────────────────────

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  APARTMENT: "Apartment",
  VILLA: "Villa",
  PLOT: "Plot",
  COMMERCIAL: "Commercial",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Determine auth state for phone discount
  let phoneVerified = false;
  let userId: string | null = null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getServerSession } = require("next-auth");
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
    // Auth not configured — continue as guest
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
    notFound();
  }

  const constructionStatus =
    raw.yearBuilt != null
      ? ("READY_TO_MOVE" as const)
      : raw.possessionDate != null
      ? ("UNDER_CONSTRUCTION" as const)
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
    constructionStatus,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  };

  if (phoneVerified) {
    listing.discountedPrice = applyPhoneDiscount(raw.price);
  }

  // Build canonical URL for sharing
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const listingUrl = `${protocol}://${host}/listings/${listing.id}`;

  const constructionLabel =
    constructionStatus === "READY_TO_MOVE"
      ? "Ready to Move"
      : constructionStatus === "UNDER_CONSTRUCTION"
      ? "Under Construction"
      : null;

  return (
    <>
      {/* Record view in localStorage via client component */}
      <ViewTracker listingId={listing.id} />

      <main className="max-w-5xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* ── Image Gallery ── */}
        <section className="mb-8">
          <ImageGallery images={listing.images} title={listing.title} />
        </section>

        {/* ── Property Info ── */}
        <section className="mb-8" aria-labelledby="property-title">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
            <h1 id="property-title" className="text-2xl md:text-3xl font-bold text-black leading-tight">
              {listing.title}
            </h1>
            <SharePanel listingTitle={listing.title} listingUrl={listingUrl} />
          </div>

          {/* Price */}
          <div className="flex flex-wrap items-baseline gap-3 mb-4">
            <span className="text-2xl font-bold text-black">{formatINR(listing.price)}</span>
            {listing.discountedPrice != null && (
              <>
                <span className="text-base text-grey-500 line-through">{formatINR(listing.price)}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-grey-100 rounded text-sm font-semibold text-black">
                  {formatINR(listing.discountedPrice)}
                  <span className="text-xs font-normal text-grey-500">member price</span>
                </span>
              </>
            )}
            {!phoneVerified && (
              <span className="text-xs text-grey-500">
                Verify your phone to unlock a 1% member discount
              </span>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2 py-0.5 text-xs font-medium bg-black text-white rounded">
              {PROPERTY_TYPE_LABELS[listing.propertyType] ?? listing.propertyType}
            </span>
            {constructionLabel && (
              <span className="px-2 py-0.5 text-xs font-medium bg-grey-800 text-white rounded">
                {constructionLabel}
              </span>
            )}
            {listing.limitedOffer && (
              <span className="px-2 py-0.5 text-xs font-medium bg-grey-700 text-white rounded">
                Limited Offer
              </span>
            )}
            {listing.underrated && (
              <span className="px-2 py-0.5 text-xs font-medium border border-grey-400 text-grey-700 rounded">
                Underrated Pick
              </span>
            )}
          </div>

          {/* Address */}
          <p className="text-sm text-grey-600 mb-4">
            {listing.address}, {listing.area}, {listing.city}
          </p>

          {/* Key details grid */}
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {listing.bedrooms != null && (
              <div className="bg-grey-50 border border-grey-200 rounded-lg p-3">
                <dt className="text-xs text-grey-500 mb-0.5">Bedrooms</dt>
                <dd className="text-base font-semibold text-black">{listing.bedrooms}</dd>
              </div>
            )}
            {listing.bathrooms != null && (
              <div className="bg-grey-50 border border-grey-200 rounded-lg p-3">
                <dt className="text-xs text-grey-500 mb-0.5">Bathrooms</dt>
                <dd className="text-base font-semibold text-black">{listing.bathrooms}</dd>
              </div>
            )}
            {listing.yearBuilt != null && (
              <div className="bg-grey-50 border border-grey-200 rounded-lg p-3">
                <dt className="text-xs text-grey-500 mb-0.5">Year Built</dt>
                <dd className="text-base font-semibold text-black">{listing.yearBuilt}</dd>
              </div>
            )}
            {listing.possessionDate && (
              <div className="bg-grey-50 border border-grey-200 rounded-lg p-3">
                <dt className="text-xs text-grey-500 mb-0.5">Possession By</dt>
                <dd className="text-base font-semibold text-black">{listing.possessionDate}</dd>
              </div>
            )}
            {listing.builder && (
              <div className="bg-grey-50 border border-grey-200 rounded-lg p-3">
                <dt className="text-xs text-grey-500 mb-0.5">Builder</dt>
                <dd className="text-base font-semibold text-black">{listing.builder.name}</dd>
              </div>
            )}
          </dl>
        </section>

        {/* ── Description ── */}
        <section className="mb-8" aria-labelledby="description-heading">
          <h2 id="description-heading" className="text-xl font-semibold text-black mb-3">
            Description
          </h2>
          <p className="text-sm text-grey-700 leading-relaxed whitespace-pre-line">
            {listing.description}
          </p>
        </section>

        {/* ── Amenities ── */}
        {listing.amenities.length > 0 && (
          <section className="mb-8" aria-labelledby="amenities-heading">
            <h2 id="amenities-heading" className="text-xl font-semibold text-black mb-3">
              Amenities
            </h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {listing.amenities.map((amenity) => (
                <li key={amenity} className="flex items-center gap-2 text-sm text-grey-700">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                    className="w-4 h-4 flex-shrink-0 text-black" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {amenity}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── Floor Plans ── */}
        <div className="mb-8">
          <FloorPlansSection
            floorPlans={listing.floorPlans}
            constructionStatus={listing.constructionStatus}
          />
        </div>

        {/* ── Map ── */}
        {listing.lat != null && listing.lng != null && (
          <section className="mb-8" aria-labelledby="map-heading">
            <h2 id="map-heading" className="text-xl font-semibold text-black mb-3">
              Location
            </h2>
            <MapEmbed lat={listing.lat} lng={listing.lng} title={listing.title} height="350px" />
          </section>
        )}

        {/* ── Neighbourhood ── */}
        <div className="mb-8">
          <NeighbourhoodSection
            listingId={listing.id}
            lat={listing.lat}
            lng={listing.lng}
          />
        </div>

        {/* ── EMI Calculator ── */}
        <div className="mb-8">
          <EMICalculator propertyPrice={listing.price} />
        </div>

        {/* ── Enquiry Form ── */}
        <div className="mb-8">
          <EnquiryForm listingId={listing.id} listingTitle={listing.title} />
        </div>

        {/* ── Agent Contact Card ── */}
        <div className="mb-8">
          <AgentContactCard
            agentPhone={listing.agentPhone}
            agentWhatsApp={listing.agentWhatsApp}
            listingTitle={listing.title}
            listingUrl={listingUrl}
          />
        </div>
      </main>

      {/* ── Sticky Contact Bar (mobile only) ── */}
      <StickyContactBar
        agentPhone={listing.agentPhone}
        agentWhatsApp={listing.agentWhatsApp}
        listingTitle={listing.title}
        listingUrl={listingUrl}
      />
    </>
  );
}
