"use client";

import ListingCard, { ListingCardSkeleton } from "./ListingCard";
import type { Listing } from "@/lib/types";
import { useComparisonStore } from "@/store/comparisonStore";

interface ListingGridProps {
  listings: Listing[];
  loading?: boolean;
  onSaveToggle?: (id: string, saved: boolean) => void;
}

export function ListingGrid({ listings, loading, onSaveToggle }: ListingGridProps) {
  const { selectedListings, add, remove } = useComparisonStore();
  const compareSelectedIds = selectedListings.map((l) => l.id);

  function handleCompareToggle(id: string, selected: boolean) {
    if (selected) {
      const listing = listings.find((l) => l.id === id);
      if (listing) add(listing);
    } else {
      remove(id);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          onSaveToggle={onSaveToggle}
          onCompareToggle={handleCompareToggle}
          compareSelected={compareSelectedIds.includes(listing.id)}
        />
      ))}
    </div>
  );
}

export function ListingList({ listings, loading, onSaveToggle }: ListingGridProps) {
  const { selectedListings, add, remove } = useComparisonStore();
  const compareSelectedIds = selectedListings.map((l) => l.id);

  function handleCompareToggle(id: string, selected: boolean) {
    if (selected) {
      const listing = listings.find((l) => l.id === id);
      if (listing) add(listing);
    } else {
      remove(id);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          onSaveToggle={onSaveToggle}
          onCompareToggle={handleCompareToggle}
          compareSelected={compareSelectedIds.includes(listing.id)}
        />
      ))}
    </div>
  );
}
