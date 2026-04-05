/**
 * Tests for filterStore
 *
 * Property 6: Filter state serialises to URL and parses back to equivalent state
 * Validates: Requirements 2.5, 8.5
 */

import fc from "fast-check";
import { describe, it, expect } from "vitest";
import { useFilterStore } from "../filterStore";

// ─── Arbitrary for FilterState ───────────────────────────────────────────────

const filterStateArb = fc.record({
  query: fc.string({ minLength: 0, maxLength: 20 }),
  propertyType: fc.array(fc.constantFrom("APARTMENT", "VILLA", "PLOT", "COMMERCIAL"), { minLength: 0, maxLength: 4 }),
  minPrice: fc.option(fc.integer({ min: 100000, max: 100000000 }), { nil: null }),
  maxPrice: fc.option(fc.integer({ min: 100000, max: 100000000 }), { nil: null }),
  bedrooms: fc.option(fc.integer({ min: 1, max: 10 }), { nil: null }),
  bathrooms: fc.option(fc.integer({ min: 1, max: 8 }), { nil: null }),
  location: fc.string({ minLength: 0, maxLength: 20 }),
  builder: fc.string({ minLength: 0, maxLength: 20 }),
  sort: fc.constantFrom("newest", "price_asc", "price_desc", "limited_offers", "underrated"),
  constructionStatus: fc.constantFrom("", "READY_TO_MOVE", "UNDER_CONSTRUCTION"),
  page: fc.integer({ min: 1, max: 100 }),
});

// ─── Property 6: Filter state URL serialisation round-trip ────────────────────

// Feature: uk-realty-website, Property 6: Filter state serialises to URL and parses back to equivalent state
// **Validates: Requirements 2.5, 8.5**

describe("Property 6: Filter state URL serialisation round-trip", () => {
  it("serialises to URL and parses back to equivalent state", () => {
    fc.assert(
      fc.property(filterStateArb, (originalFilters) => {
        // Set the original filters
        useFilterStore.setState({ filters: originalFilters });

        // Serialise to URL params
        const params = useFilterStore.getState().toSearchParams();

        // Create a new store instance or reset
        useFilterStore.setState({ filters: {
          query: "",
          propertyType: [],
          minPrice: null,
          maxPrice: null,
          bedrooms: null,
          bathrooms: null,
          location: "",
          builder: "",
          sort: "newest",
          constructionStatus: "",
          page: 1,
        } });

        // Parse back from URL params
        useFilterStore.getState().fromSearchParams(params);

        // Get the parsed filters
        const parsedFilters = useFilterStore.getState().filters;

        // Should be equivalent
        expect(parsedFilters).toEqual(originalFilters);
      }),
      { numRuns: 100 }
    );
  });
});