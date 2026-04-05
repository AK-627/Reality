import fc from "fast-check";
import { describe, it, expect } from "vitest";
import { formatINR } from "../utils";

describe("formatINR", () => {
  it("formats a known value correctly", () => {
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
