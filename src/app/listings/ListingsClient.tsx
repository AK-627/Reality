"use client";

import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { useFilterStore } from "@/store/filterStore";
import { useFilterSync } from "@/hooks/useFilterSync";
import FilterPanel from "@/components/listings/FilterPanel";
import MobileFilterSheet from "@/components/listings/MobileFilterSheet";
import ActiveFilterIndicators from "@/components/listings/ActiveFilterIndicators";
import ViewToggle, { ViewMode } from "@/components/listings/ViewToggle";
import { ListingGrid, ListingList } from "@/components/listings/ListingGrid";
import type { Listing, ListingListResponse } from "@/lib/types";

const MapView = lazy(() => import("@/components/map/MapView"));

const PAGE_SIZE = 12;

interface ListingsClientProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default function ListingsClient({ searchParams }: ListingsClientProps) {
  useFilterSync();

  const { filters, toSearchParams } = useFilterStore();
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("grid");

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = toSearchParams();
      const res = await fetch(`/api/listings?${params.toString()}`);
      if (res.ok) {
        const data: ListingListResponse = await res.json();
        setListings(data.listings);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch {
      // network error — keep previous state
    } finally {
      setLoading(false);
    }
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const { setFilter } = useFilterStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop sidebar filter */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-20 border border-grey-200 rounded-lg overflow-hidden">
            <FilterPanel />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              {/* Mobile filter trigger */}
              <div className="lg:hidden">
                <MobileFilterSheet />
              </div>
              <p className="text-sm text-grey-500">
                {loading ? "Loading..." : `${total} propert${total === 1 ? "y" : "ies"} found`}
              </p>
            </div>
            <ViewToggle view={view} onChange={setView} />
          </div>

          {/* Active filter badges */}
          <div className="mb-4">
            <ActiveFilterIndicators />
          </div>

          {/* Listings */}
          {!loading && listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-lg font-semibold text-black mb-2">No properties found</p>
              <p className="text-sm text-grey-500 mb-6">Try adjusting your filters to see more results.</p>
              <button
                type="button"
                onClick={() => useFilterStore.getState().clearFilters()}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-black rounded hover:bg-grey-800 transition-colors min-h-[44px]"
              >
                Clear all filters
              </button>
            </div>
          ) : view === "map" ? (
            <Suspense fallback={<div className="h-[600px] bg-grey-100 rounded-lg animate-pulse" />}>
              <MapView listings={listings} height="600px" />
            </Suspense>
          ) : view === "list" ? (
            <ListingList listings={listings} loading={loading} />
          ) : (
            <ListingGrid listings={listings} loading={loading} />
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                type="button"
                disabled={filters.page <= 1}
                onClick={() => setFilter("page", filters.page - 1)}
                className="px-4 py-2 text-sm font-medium border border-grey-300 rounded hover:border-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
              >
                Previous
              </button>
              <span className="text-sm text-grey-600">
                Page {filters.page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={filters.page >= totalPages}
                onClick={() => setFilter("page", filters.page + 1)}
                className="px-4 py-2 text-sm font-medium border border-grey-300 rounded hover:border-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
