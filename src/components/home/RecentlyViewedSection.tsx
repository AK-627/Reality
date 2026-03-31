"use client";

import { useEffect, useState } from "react";
import ListingCard from "@/components/listings/ListingCard";
import { ListingCardSkeleton } from "@/components/listings/ListingCard";
import type { Listing } from "@/lib/types";

const STORAGE_KEY = "uk_realty_recently_viewed";

function getStoredIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function RecentlyViewedSection() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const stored = getStoredIds();
    setIds(stored);

    if (stored.length === 0) {
      setLoading(false);
      return;
    }

    // Fetch each listing individually
    Promise.all(
      stored.map((id) =>
        fetch(`/api/listings/${id}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => data?.listing ?? null)
          .catch(() => null)
      )
    )
      .then((results) => {
        setListings(results.filter((l): l is Listing => l !== null));
      })
      .finally(() => setLoading(false));
  }, []);

  function handleClear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setIds([]);
    setListings([]);
  }

  // Hidden when no IDs stored and not loading
  if (!loading && ids.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-black">Recently Viewed</h2>
            <p className="text-grey-500 text-sm mt-1">Properties you&apos;ve browsed recently</p>
          </div>
          {!loading && listings.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="text-sm text-grey-500 hover:text-black underline underline-offset-4 transition-colors min-h-[44px] px-2"
            >
              Clear
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: Math.min(ids.length || 3, 3) }).map((_, i) => (
                <ListingCardSkeleton key={i} />
              ))
            : listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
        </div>
      </div>
    </section>
  );
}
