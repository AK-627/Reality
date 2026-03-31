import fc from "fast-check";
import { describe, it, expect } from "vitest";
import { applyPhoneDiscount, formatINR } from "../utils";

// Feature: uk-realty-website, Property 27: Phone discount is calculated as price × 0.99 rounded to nearest integer
// **Validates: Requirements 10.9, 10.11**

describe("applyPhoneDiscount", () => {
  it("Property 27: Phone discount is price * 0.99 rounded to nearest integer", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100000, max: 1_000_000_000 }), // realistic INR price range
        (price) => {
          const discounted = applyPhoneDiscount(price);
          expect(discounted).toBe(Math.round(price * 0.99));
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns a value less than the original price for any positive price", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1_000_000_000 }),
        (price) => {
          const discounted = applyPhoneDiscount(price);
          expect(discounted).toBeLessThanOrEqual(price);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns an integer (no fractional rupees)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100000, max: 1_000_000_000 }),
        (price) => {
          const discounted = applyPhoneDiscount(price);
          expect(Number.isInteger(discounted)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("formatINR", () => {
  it("formats a known value correctly", () => {
    // 500000 → ₹5,00,000 in Indian numbering
    const result = formatINR(500000);
    expect(result).toContain("5,00,000");
  });

  it("always includes the ₹ symbol", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000_000 }),
        (amount) => {
          const result = formatINR(amount);
          expect(result).toContain("₹");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("produces no decimal places for whole numbers", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000_000 }),
        (amount) => {
          const result = formatINR(amount);
          expect(result).not.toMatch(/\.\d/);
        }
      ),
      { numRuns: 100 }
    );
  });
});
