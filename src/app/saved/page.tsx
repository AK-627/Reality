"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import ListingCard from "@/components/listings/ListingCard";
import { ListingCardSkeleton } from "@/components/listings/ListingCard";
import type { Listing } from "@/lib/types";

const SESSION_KEY = "uk_realty_saved";

function readGuestIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ─── Unavailable overlay ──────────────────────────────────────────────────────

function UnavailableCard({ listing }: { listing: Listing }) {
  return (
    <div className="relative bg-white border border-grey-200 rounded-lg overflow-hidden">
      <div className="aspect-[4/3] bg-grey-100 flex items-center justify-center">
        <span className="text-xs text-grey-400 font-medium uppercase tracking-wide">
          No image
        </span>
      </div>
      <div className="p-4">
        <p className="text-sm font-semibold text-black line-clamp-2 mb-1">{listing.title}</p>
        <p className="text-xs text-grey-500 mb-3">
          {listing.area}, {listing.city}
        </p>
        <div className="flex items-center gap-2 px-3 py-2 bg-grey-100 rounded text-xs text-grey-600 font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="w-4 h-4 flex-shrink-0"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          This property is no longer available
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        className="w-16 h-16 text-grey-300 mb-4"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <h2 className="text-lg font-semibold text-black mb-2">No saved properties yet</h2>
      <p className="text-sm text-grey-500 mb-6 max-w-xs">
        Browse listings and tap the heart icon to save properties you are interested in.
      </p>
      <Link
        href="/listings"
        className="inline-flex items-center justify-center px-5 py-2.5 bg-black text-white text-sm font-semibold rounded hover:bg-grey-800 transition-colors min-h-[44px]"
      >
        Browse listings
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SavedPage() {
  const { data: session, status } = useSession();
  const isAuth = status === "authenticated" && !!session?.user;
  const isLoading = status === "loading";

  const [listings, setListings] = useState<Listing[]>([]);
  const [fetching, setFetching] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const fetchAuthSaved = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/saved");
      if (res.ok) {
        const data = await res.json();
        const items: Listing[] = data.listings ?? [];
        setListings(items);
        setSavedIds(new Set(items.map((l) => l.id)));
      }
    } catch {
      // silently fail
    } finally {
      setFetching(false);
    }
  }, []);

  const fetchGuestSaved = useCallback(async () => {
    setFetching(true);
    const ids = readGuestIds();
    if (ids.length === 0) {
      setListings([]);
      setFetching(false);
      return;
    }
    try {
      const results = await Promise.allSettled(
        ids.map((id) =>
          fetch(`/api/listings/${id}`).then((r) => (r.ok ? r.json() : null))
        )
      );
      const fetched: Listing[] = results
        .filter(
          (r): r is PromiseFulfilledResult<{ listing: Listing }> =>
            r.status === "fulfilled" && r.value?.listing != null
        )
        .map((r) => ({ ...r.value.listing, isSaved: true }));
      setListings(fetched);
      setSavedIds(new Set(fetched.map((l) => l.id)));
    } catch {
      // silently fail
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (isAuth) {
      fetchAuthSaved();
    } else {
      fetchGuestSaved();
    }
  }, [isAuth, isLoading, fetchAuthSaved, fetchGuestSaved]);

  function handleSaveToggle(listingId: string, saved: boolean) {
    if (saved) {
      setSavedIds((prev) => new Set([...Array.from(prev), listingId]));
    } else {
      // Remove from list when unsaved
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(listingId);
        return next;
      });
      setListings((prev) => prev.filter((l) => l.id !== listingId));

      if (isAuth) {
        fetch(`/api/saved/${listingId}`, { method: "DELETE" }).catch(() => {});
      } else {
        // Update sessionStorage
        const ids = readGuestIds().filter((id) => id !== listingId);
        try {
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(ids));
        } catch {
          // ignore
        }
      }
    }
  }

  const showSkeletons = isLoading || fetching;

  return (
    <div className="min-h-screen bg-grey-50 dark:bg-grey-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-black">Saved Properties</h1>
          {!showSkeletons && listings.length > 0 && (
            <p className="text-sm text-grey-500 mt-1">
              {listings.length} {listings.length === 1 ? "property" : "properties"} saved
            </p>
          )}
        </div>

        {/* Guest login prompt */}
        {!isAuth && !isLoading && (
          <div className="mb-6 flex items-start gap-3 bg-white border border-grey-200 rounded-lg px-4 py-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-5 h-5 text-grey-500 flex-shrink-0 mt-0.5"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            <p className="text-sm text-grey-600">
              <Link href="/auth" className="font-semibold text-black underline underline-offset-2">
                Log in
              </Link>{" "}
              to permanently save your selections to your account.
            </p>
          </div>
        )}

        {/* Skeleton grid */}
        {showSkeletons && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!showSkeletons && listings.length === 0 && <EmptyState />}

        {/* Listings grid */}
        {!showSkeletons && listings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) =>
              !listing.available ? (
                <UnavailableCard key={listing.id} listing={listing} />
              ) : (
                <ListingCard
                  key={listing.id}
                  listing={{ ...listing, isSaved: savedIds.has(listing.id) }}
                  onSaveToggle={handleSaveToggle}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
