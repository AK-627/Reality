"use client";

import { useFilterStore } from "@/store/filterStore";
import { formatINR } from "@/lib/utils";

const SORT_LABELS: Record<string, string> = {
  price_asc: "Price: Low to High",
  price_desc: "Price: High to Low",
  limited_offers: "Limited Offers",
  underrated: "Underrated",
};

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: "Apartment",
  VILLA: "Villa",
  PLOT: "Plot",
  COMMERCIAL: "Commercial",
};

export default function ActiveFilterIndicators() {
  const { filters, setFilter, clearFilters } = useFilterStore();

  const badges: { label: string; onRemove: () => void }[] = [];

  if (filters.query) {
    badges.push({ label: `"${filters.query}"`, onRemove: () => setFilter("query", "") });
  }
  filters.propertyType.forEach((t) => {
    badges.push({
      label: TYPE_LABELS[t] ?? t,
      onRemove: () => setFilter("propertyType", filters.propertyType.filter((x) => x !== t)),
    });
  });
  if (filters.minPrice != null) {
    badges.push({ label: `Min ${formatINR(filters.minPrice)}`, onRemove: () => setFilter("minPrice", null) });
  }
  if (filters.maxPrice != null) {
    badges.push({ label: `Max ${formatINR(filters.maxPrice)}`, onRemove: () => setFilter("maxPrice", null) });
  }
  if (filters.bedrooms != null) {
    badges.push({ label: `${filters.bedrooms}+ Beds`, onRemove: () => setFilter("bedrooms", null) });
  }
  if (filters.bathrooms != null) {
    badges.push({ label: `${filters.bathrooms}+ Baths`, onRemove: () => setFilter("bathrooms", null) });
  }
  if (filters.location) {
    badges.push({ label: filters.location, onRemove: () => setFilter("location", "") });
  }
  if (filters.builder) {
    badges.push({ label: `Builder: ${filters.builder}`, onRemove: () => setFilter("builder", "") });
  }
  if (filters.constructionStatus) {
    const label = filters.constructionStatus === "READY_TO_MOVE" ? "Ready to Move" : "Under Construction";
    badges.push({ label, onRemove: () => setFilter("constructionStatus", "") });
  }
  if (filters.sort && filters.sort !== "newest") {
    badges.push({ label: SORT_LABELS[filters.sort] ?? filters.sort, onRemove: () => setFilter("sort", "newest") });
  }

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" role="list" aria-label="Active filters">
      {badges.map((badge, i) => (
        <span
          key={i}
          role="listitem"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-grey-100 text-black rounded-full border border-grey-200"
        >
          {badge.label}
          <button
            type="button"
            onClick={badge.onRemove}
            aria-label={`Remove filter: ${badge.label}`}
            className="text-grey-500 hover:text-black transition-colors"
          >
            ✕
          </button>
        </span>
      ))}
      {badges.length > 1 && (
        <button
          type="button"
          onClick={clearFilters}
          className="text-xs text-grey-500 hover:text-black underline transition-colors min-h-[44px] flex items-center"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
