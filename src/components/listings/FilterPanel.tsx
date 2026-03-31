"use client";

import { useFilterStore } from "@/store/filterStore";

const PROPERTY_TYPES = ["APARTMENT", "VILLA", "PLOT", "COMMERCIAL"];
const PROPERTY_TYPE_LABELS: Record<string, string> = {
  APARTMENT: "Apartment",
  VILLA: "Villa",
  PLOT: "Plot",
  COMMERCIAL: "Commercial",
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "limited_offers", label: "Limited Offers" },
  { value: "underrated", label: "Underrated" },
];

interface FilterPanelProps {
  builders?: { id: string; name: string; slug: string }[];
  onClose?: () => void;
}

export default function FilterPanel({ builders = [], onClose }: FilterPanelProps) {
  const { filters, setFilter, setFilters, clearFilters } = useFilterStore();

  function togglePropertyType(type: string) {
    const current = filters.propertyType;
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    setFilter("propertyType", next);
  }

  const hasActiveFilters =
    filters.query ||
    filters.propertyType.length > 0 ||
    filters.minPrice != null ||
    filters.maxPrice != null ||
    filters.bedrooms != null ||
    filters.bathrooms != null ||
    filters.location ||
    filters.builder ||
    filters.constructionStatus ||
    (filters.sort && filters.sort !== "newest");

  return (
    <div className="flex flex-col gap-6 p-4 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-black uppercase tracking-wider">Filters</h2>
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-grey-500 hover:text-black underline transition-colors"
            >
              Clear all
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-grey-500 hover:text-black"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-xs font-medium text-grey-600 mb-2 uppercase tracking-wider">Sort By</label>
        <select
          value={filters.sort}
          onChange={(e) => setFilter("sort", e.target.value)}
          className="w-full border border-grey-300 rounded px-3 py-2 text-sm text-black bg-white focus:outline-none focus:border-black min-h-[44px]"
          aria-label="Sort listings"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Property Type */}
      <div>
        <p className="text-xs font-medium text-grey-600 mb-2 uppercase tracking-wider">Property Type</p>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => togglePropertyType(type)}
              className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors min-h-[44px] ${
                filters.propertyType.includes(type)
                  ? "bg-black text-white border-black"
                  : "bg-white text-grey-700 border-grey-300 hover:border-black"
              }`}
            >
              {PROPERTY_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <p className="text-xs font-medium text-grey-600 mb-2 uppercase tracking-wider">Price Range (₹)</p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min price"
            value={filters.minPrice ?? ""}
            onChange={(e) => setFilter("minPrice", e.target.value ? parseInt(e.target.value, 10) : null)}
            className="w-full border border-grey-300 rounded px-3 py-2 text-sm text-black focus:outline-none focus:border-black min-h-[44px]"
            aria-label="Minimum price"
            min={0}
          />
          <input
            type="number"
            placeholder="Max price"
            value={filters.maxPrice ?? ""}
            onChange={(e) => setFilter("maxPrice", e.target.value ? parseInt(e.target.value, 10) : null)}
            className="w-full border border-grey-300 rounded px-3 py-2 text-sm text-black focus:outline-none focus:border-black min-h-[44px]"
            aria-label="Maximum price"
            min={0}
          />
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <p className="text-xs font-medium text-grey-600 mb-2 uppercase tracking-wider">Bedrooms</p>
        <div className="flex gap-2 flex-wrap">
          {[null, 1, 2, 3, 4, 5].map((n) => (
            <button
              key={n ?? "any"}
              type="button"
              onClick={() => setFilter("bedrooms", n)}
              className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors min-h-[44px] min-w-[44px] ${
                filters.bedrooms === n
                  ? "bg-black text-white border-black"
                  : "bg-white text-grey-700 border-grey-300 hover:border-black"
              }`}
            >
              {n == null ? "Any" : `${n}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Bathrooms */}
      <div>
        <p className="text-xs font-medium text-grey-600 mb-2 uppercase tracking-wider">Bathrooms</p>
        <div className="flex gap-2 flex-wrap">
          {[null, 1, 2, 3, 4].map((n) => (
            <button
              key={n ?? "any"}
              type="button"
              onClick={() => setFilter("bathrooms", n)}
              className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors min-h-[44px] min-w-[44px] ${
                filters.bathrooms === n
                  ? "bg-black text-white border-black"
                  : "bg-white text-grey-700 border-grey-300 hover:border-black"
              }`}
            >
              {n == null ? "Any" : `${n}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-medium text-grey-600 mb-2 uppercase tracking-wider">Location / Area</label>
        <input
          type="text"
          placeholder="e.g. Whitefield, Koramangala"
          value={filters.location}
          onChange={(e) => setFilter("location", e.target.value)}
          className="w-full border border-grey-300 rounded px-3 py-2 text-sm text-black focus:outline-none focus:border-black min-h-[44px]"
          aria-label="Location or area"
        />
      </div>

      {/* Builder */}
      {builders.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-grey-600 mb-2 uppercase tracking-wider">Builder</label>
          <select
            value={filters.builder}
            onChange={(e) => setFilter("builder", e.target.value)}
            className="w-full border border-grey-300 rounded px-3 py-2 text-sm text-black bg-white focus:outline-none focus:border-black min-h-[44px]"
            aria-label="Filter by builder"
          >
            <option value="">All Builders</option>
            {builders.map((b) => (
              <option key={b.id} value={b.slug}>{b.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Construction Status */}
      <div>
        <p className="text-xs font-medium text-grey-600 mb-2 uppercase tracking-wider">Status</p>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "", label: "All" },
            { value: "READY_TO_MOVE", label: "Ready to Move" },
            { value: "UNDER_CONSTRUCTION", label: "Under Construction" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilter("constructionStatus", opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors min-h-[44px] ${
                filters.constructionStatus === opt.value
                  ? "bg-black text-white border-black"
                  : "bg-white text-grey-700 border-grey-300 hover:border-black"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
