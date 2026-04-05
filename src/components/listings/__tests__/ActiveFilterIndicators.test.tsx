/**
 * Tests for <ActiveFilterIndicators>
 *
 * Property 5: Non-empty filter state renders at least one indicator badge per active dimension
 * Validates: Requirements 2.4
 */

import fc from "fast-check";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ActiveFilterIndicators from "../ActiveFilterIndicators";
import { useFilterStore } from "@/store/filterStore";

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
  page: fc.constant(1),
});

// ─── Property 5: Non-empty filter state renders at least one indicator badge per active dimension ────────────────────

// Feature: uk-realty-website, Property 5: Non-empty filter state renders at least one indicator badge per active dimension
// **Validates: Requirements 2.4**

describe("Property 5: Active filter indicators", () => {
  it("renders at least one badge per active filter dimension", () => {
    fc.assert(
      fc.property(filterStateArb, (filters) => {
        // Set the filter state
        useFilterStore.setState({ filters });

        const { unmount } = render(<ActiveFilterIndicators />);

        // Count active dimensions
        let activeCount = 0;
        if (filters.query) activeCount++;
        activeCount += filters.propertyType.length;
        if (filters.minPrice != null) activeCount++;
        if (filters.maxPrice != null) activeCount++;
        if (filters.bedrooms != null) activeCount++;
        if (filters.bathrooms != null) activeCount++;
        if (filters.location) activeCount++;
        if (filters.builder) activeCount++;
        if (filters.constructionStatus) activeCount++;
        if (filters.sort && filters.sort !== "newest") activeCount++;

        if (activeCount === 0) {
          // No active filters, component should return null
          expect(screen.queryByRole("list")).not.toBeInTheDocument();
        } else {
          // Should have a list
          const list = screen.getByRole("list");
          expect(list).toBeInTheDocument();

          // Should have at least as many badges as active dimensions
          const badges = screen.getAllByRole("listitem");
          expect(badges.length).toBeGreaterThanOrEqual(activeCount);
        }

        unmount();
      }),
      { numRuns: 100 }
    );
  });
});