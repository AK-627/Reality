"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ListingGrid } from "@/components/listings/ListingGrid";
import ActiveFilterIndicators from "@/components/listings/ActiveFilterIndicators";
import { useFilterStore } from "@/store/filterStore";
import type { Listing, ListingListResponse } from "@/lib/types";

interface Builder {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

interface BuilderListingsClientProps {
  builder: Builder;
}

export default function BuilderListingsClient({ builder }: BuilderListingsClientProps) {
  const { setFilters } = useFilterStore();
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pre-set builder filter
    setFilters({ builder: builder.slug });

    fetch(`/api/listings?builder=${encodeURIComponent(builder.slug)}&page=1`)
      .then((r) => r.json())
      .then((data: ListingListResponse) => {
        setListings(data.listings ?? []);
        setTotal(data.total ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [builder.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-grey-500 mb-6" aria-label="Breadcrumb">
        <Link href="/builders" className="hover:text-black transition-colors">Builders</Link>
        <span className="mx-2">/</span>
        <span className="text-black font-medium">{builder.name}</span>
      </nav>

      <h1 className="text-2xl font-bold text-black mb-1">{builder.name}</h1>
      <p className="text-grey-500 text-sm mb-6">
        {loading ? "Loading…" : `${total} propert${total === 1 ? "y" : "ies"} found`}
      </p>

      {/* Active filter indicator */}
      <div className="mb-4">
        <ActiveFilterIndicators />
      </div>

      {!loading && listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-lg font-semibold text-black mb-2">
            No properties found for {builder.name}
          </p>
          <p className="text-sm text-grey-500 mb-6">
            Check back later or browse all listings.
          </p>
          <Link
            href="/listings"
            className="px-6 py-2.5 text-sm font-semibold text-white bg-black rounded hover:bg-grey-800 transition-colors min-h-[44px] inline-flex items-center"
          >
            Browse all listings
          </Link>
        </div>
      ) : (
        <ListingGrid listings={listings} loading={loading} />
      )}
    </div>
  );
}
