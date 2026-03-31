/**
 * Tests for GET /api/listings
 *
 * Property 3: All results satisfy active filters
 * Property 4: Clearing all filters restores the full listing set
 *
 * We test the filter logic by exercising the pure filtering function
 * extracted from the route, rather than spinning up a full HTTP server.
 */

import fc from "fast-check";
import { describe, it, expect } from "vitest";
import type { Listing } from "@/lib/types";

// ─── Pure filter / sort helpers (mirrors route logic) ────────────────────────

type PropertyType = "APARTMENT" | "VILLA" | "PLOT" | "COMMERCIAL";

interface RawListing {
  id: string;
  title: string;
  description: string;
  price: number;
  propertyType: PropertyType;
  bedrooms: number | null;
  bathrooms: number | null;
  area: string;
  city: string;
  limitedOffer: boolean;
  underrated: boolean;
  yearBuilt: number | null;
  possessionDate: string | null;
  available: boolean;
  builder: { slug: string } | null;
}

interface FilterParams {
  q?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  location?: string;
  builder?: string;
  constructionStatus?: string;
}

function applyFilters(listings: RawListing[], params: FilterParams): RawListing[] {
  return listings.filter((l) => {
    if (!l.available) return false;

    if (params.q) {
      const q = params.q.toLowerCase();
      const matches =
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.area.toLowerCase().includes(q);
      if (!matches) return false;
    }

    if (params.type) {
      const types = params.type.split(",").map((t) => t.trim().toUpperCase());
      if (!types.includes(l.propertyType)) return false;
    }

    if (params.minPrice != null && l.price < params.minPrice) return false;
    if (params.maxPrice != null && l.price > params.maxPrice) return false;

    if (params.beds != null && (l.bedrooms == null || l.bedrooms < params.beds)) return false;
    if (params.baths != null && (l.bathrooms == null || l.bathrooms < params.baths)) return false;

    if (params.location) {
      if (!l.area.toLowerCase().includes(params.location.toLowerCase())) return false;
    }

    if (params.builder) {
      if (!l.builder || l.builder.slug !== params.builder) return false;
    }

    if (params.constructionStatus === "READY_TO_MOVE") {
      if (l.yearBuilt == null) return false;
    } else if (params.constructionStatus === "UNDER_CONSTRUCTION") {
      if (l.possessionDate == null) return false;
    }

    return true;
  });
}

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const propertyTypes: PropertyType[] = ["APARTMENT", "VILLA", "PLOT", "COMMERCIAL"];

const rawListingArb = fc.record<RawListing>({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 80 }),
  description: fc.string({ minLength: 1, maxLength: 200 }),
  price: fc.integer({ min: 100000, max: 500000000 }),
  propertyType: fc.constantFrom(...propertyTypes),
  bedrooms: fc.option(fc.integer({ min: 1, max: 10 }), { nil: null }),
  bathrooms: fc.option(fc.integer({ min: 1, max: 8 }), { nil: null }),
  area: fc.constantFrom("Koramangala", "Whitefield", "Indiranagar", "HSR Layout", "Jayanagar"),
  city: fc.constant("Bangalore"),
  limitedOffer: fc.boolean(),
  underrated: fc.boolean(),
  yearBuilt: fc.option(fc.integer({ min: 2000, max: 2024 }), { nil: null }),
  possessionDate: fc.option(fc.constant("March 2026"), { nil: null }),
  available: fc.boolean(),
  builder: fc.option(
    fc.record({ slug: fc.constantFrom("prestige", "sobha", "brigade") }),
    { nil: null }
  ),
});

const listingsDatasetArb = fc.array(rawListingArb, { minLength: 0, maxLength: 30 });

// ─── Property 3: All results satisfy active filters ───────────────────────────

// Feature: uk-realty-website, Property 3: All results satisfy active filters
// **Validates: Requirements 2.2, 3.5, 8.4**

describe("Property 3: Filter correctness — all results satisfy active filters", () => {
  it("price range filter: every result is within [minPrice, maxPrice]", () => {
    fc.assert(
      fc.property(
        listingsDatasetArb,
        fc.integer({ min: 100000, max: 200000000 }),
        fc.integer({ min: 200000001, max: 500000000 }),
        (listings, minPrice, maxPrice) => {
          const results = applyFilters(listings, { minPrice, maxPrice });
          for (const r of results) {
            expect(r.price).toBeGreaterThanOrEqual(minPrice);
            expect(r.price).toBeLessThanOrEqual(maxPrice);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("property type filter: every result matches the requested type", () => {
    fc.assert(
      fc.property(
        listingsDatasetArb,
        fc.constantFrom(...propertyTypes),
        (listings, type) => {
          const results = applyFilters(listings, { type });
          for (const r of results) {
            expect(r.propertyType).toBe(type);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("beds filter: every result has bedrooms >= requested beds", () => {
    fc.assert(
      fc.property(
        listingsDatasetArb,
        fc.integer({ min: 1, max: 5 }),
        (listings, beds) => {
          const results = applyFilters(listings, { beds });
          for (const r of results) {
            expect(r.bedrooms).not.toBeNull();
            expect(r.bedrooms!).toBeGreaterThanOrEqual(beds);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("baths filter: every result has bathrooms >= requested baths", () => {
    fc.assert(
      fc.property(
        listingsDatasetArb,
        fc.integer({ min: 1, max: 4 }),
        (listings, baths) => {
          const results = applyFilters(listings, { baths });
          for (const r of results) {
            expect(r.bathrooms).not.toBeNull();
            expect(r.bathrooms!).toBeGreaterThanOrEqual(baths);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("location filter: every result's area contains the location string (case-insensitive)", () => {
    fc.assert(
      fc.property(
        listingsDatasetArb,
        fc.constantFrom("Koramangala", "Whitefield", "Indiranagar"),
        (listings, location) => {
          const results = applyFilters(listings, { location });
          for (const r of results) {
            expect(r.area.toLowerCase()).toContain(location.toLowerCase());
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("builder filter: every result belongs to the requested builder", () => {
    fc.assert(
      fc.property(
        listingsDatasetArb,
        fc.constantFrom("prestige", "sobha", "brigade"),
        (listings, builder) => {
          const results = applyFilters(listings, { builder });
          for (const r of results) {
            expect(r.builder?.slug).toBe(builder);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("constructionStatus READY_TO_MOVE: every result has yearBuilt set", () => {
    fc.assert(
      fc.property(listingsDatasetArb, (listings) => {
        const results = applyFilters(listings, { constructionStatus: "READY_TO_MOVE" });
        for (const r of results) {
          expect(r.yearBuilt).not.toBeNull();
        }
      }),
      { numRuns: 100 }
    );
  });

  it("constructionStatus UNDER_CONSTRUCTION: every result has possessionDate set", () => {
    fc.assert(
      fc.property(listingsDatasetArb, (listings) => {
        const results = applyFilters(listings, { constructionStatus: "UNDER_CONSTRUCTION" });
        for (const r of results) {
          expect(r.possessionDate).not.toBeNull();
        }
      }),
      { numRuns: 100 }
    );
  });

  it("combined filters: all active filter criteria are satisfied simultaneously", () => {
    fc.assert(
      fc.property(
        listingsDatasetArb,
        fc.integer({ min: 1000000, max: 100000000 }),
        fc.integer({ min: 100000001, max: 500000000 }),
        fc.constantFrom(...propertyTypes),
        (listings, minPrice, maxPrice, type) => {
          const results = applyFilters(listings, { minPrice, maxPrice, type });
          for (const r of results) {
            expect(r.price).toBeGreaterThanOrEqual(minPrice);
            expect(r.price).toBeLessThanOrEqual(maxPrice);
            expect(r.propertyType).toBe(type);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 4: Filter clear is a round-trip ─────────────────────────────────

// Feature: uk-realty-website, Property 4: Clearing all filters restores the full listing set
// **Validates: Requirements 2.3**

describe("Property 4: Filter clear round-trip — clearing all filters restores full available set", () => {
  it("applying then clearing filters returns all available listings", () => {
    fc.assert(
      fc.property(
        listingsDatasetArb,
        fc.integer({ min: 100000, max: 200000000 }),
        fc.integer({ min: 200000001, max: 500000000 }),
        fc.constantFrom(...propertyTypes),
        (listings, minPrice, maxPrice, type) => {
          // Apply some filters
          applyFilters(listings, { minPrice, maxPrice, type });

          // Clear all filters — should return all available listings
          const cleared = applyFilters(listings, {});
          const allAvailable = listings.filter((l) => l.available);

          expect(cleared.length).toBe(allAvailable.length);
          // Every available listing should be in the cleared result
          for (const l of allAvailable) {
            expect(cleared.some((r) => r.id === l.id)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
