/**
 * Tests for <ListingCard>
 *
 * Property 1: Listing cards contain all required fields
 * Validates: Requirements 1.2
 */

import fc from "fast-check";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ListingCard, { ListingCardSkeleton } from "../ListingCard";
import type { Listing } from "@/lib/types";

// ─── Arbitrary for a valid Listing ───────────────────────────────────────────

const propertyTypes = ["APARTMENT", "VILLA", "PLOT", "COMMERCIAL"] as const;

function makeListing(overrides: Partial<Listing> = {}): Listing {
  return {
    id: "listing-1",
    title: "Spacious 3BHK in Koramangala",
    description: "A beautiful apartment with great amenities.",
    price: 8500000,
    propertyType: "APARTMENT",
    bedrooms: 3,
    bathrooms: 2,
    address: "123 Main St, Koramangala",
    area: "Koramangala",
    city: "Bangalore",
    images: ["https://example.com/image.jpg"],
    amenities: ["Gym", "Pool"],
    agentPhone: "+919876543210",
    agentWhatsApp: "+919876543210",
    available: true,
    featured: false,
    isSaved: false,
    limitedOffer: false,
    underrated: false,
    floorPlans: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// ─── Unit tests ───────────────────────────────────────────────────────────────

describe("ListingCard — unit tests", () => {
  it("renders the property title", () => {
    render(<ListingCard listing={makeListing()} />);
    expect(screen.getByText("Spacious 3BHK in Koramangala")).toBeInTheDocument();
  });

  it("renders the formatted price", () => {
    render(<ListingCard listing={makeListing({ price: 8500000 })} />);
    // formatINR(8500000) → ₹85,00,000
    expect(screen.getAllByText(/85,00,000/).length).toBeGreaterThan(0);
  });

  it("renders location (area and city)", () => {
    render(<ListingCard listing={makeListing()} />);
    expect(screen.getByText(/Koramangala.*Bangalore/)).toBeInTheDocument();
  });

  it("renders bedrooms count", () => {
    render(<ListingCard listing={makeListing({ bedrooms: 3 })} />);
    expect(screen.getByText(/3 Beds/)).toBeInTheDocument();
  });

  it("renders bathrooms count", () => {
    render(<ListingCard listing={makeListing({ bathrooms: 2 })} />);
    expect(screen.getByText(/2 Baths/)).toBeInTheDocument();
  });

  it("renders property type badge", () => {
    render(<ListingCard listing={makeListing({ propertyType: "VILLA" })} />);
    expect(screen.getByText("Villa")).toBeInTheDocument();
  });

  it("renders Ready to Move badge when yearBuilt is set", () => {
    render(
      <ListingCard
        listing={makeListing({ yearBuilt: 2022, constructionStatus: "READY_TO_MOVE" })}
      />
    );
    expect(screen.getByText("Ready to Move")).toBeInTheDocument();
  });

  it("renders Under Construction badge when possessionDate is set", () => {
    render(
      <ListingCard
        listing={makeListing({
          possessionDate: "March 2026",
          constructionStatus: "UNDER_CONSTRUCTION",
        })}
      />
    );
    expect(screen.getByText("Under Construction")).toBeInTheDocument();
  });

  it("renders save icon in outline state when not saved", () => {
    render(<ListingCard listing={makeListing({ isSaved: false })} />);
    expect(screen.getByRole("button", { name: /save property/i })).toBeInTheDocument();
  });

  it("renders save icon in filled state when saved", () => {
    render(<ListingCard listing={makeListing({ isSaved: true })} />);
    expect(screen.getByRole("button", { name: /remove from saved/i })).toBeInTheDocument();
  });

  it("renders compare checkbox", () => {
    render(<ListingCard listing={makeListing()} />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("renders discounted price badge when discountedPrice is provided", () => {
    render(
      <ListingCard
        listing={makeListing({ price: 8500000, discountedPrice: 8415000 })}
      />
    );
    expect(screen.getByText(/member/i)).toBeInTheDocument();
  });

  it("renders image fallback when images array is empty", () => {
    render(<ListingCard listing={makeListing({ images: [] })} />);
    // No img element with src — fallback SVG is shown
    const images = document.querySelectorAll("img");
    expect(images.length).toBe(0);
  });

  it("links to the correct detail page", () => {
    render(<ListingCard listing={makeListing({ id: "abc123" })} />);
    const links = screen.getAllByRole("link");
    expect(links.some((l) => l.getAttribute("href") === "/listings/abc123")).toBe(true);
  });
});

// ─── Property 1: Listing cards contain all required fields ────────────────────

// Feature: uk-realty-website, Property 1: Listing cards contain all required fields
// **Validates: Requirements 1.2**

// Use printable ASCII words to avoid whitespace-only titles
const wordArb = fc.stringMatching(/^[A-Za-z0-9]{1,15}$/);
const titleArb = fc
  .array(wordArb, { minLength: 1, maxLength: 5 })
  .map((words) => words.join(" "));

const listingArb = fc.record<Listing>({
  id: fc.uuid(),
  title: titleArb,
  description: titleArb,
  price: fc.integer({ min: 100000, max: 500000000 }),
  propertyType: fc.constantFrom(...propertyTypes),
  bedrooms: fc.option(fc.integer({ min: 1, max: 10 }), { nil: undefined }),
  bathrooms: fc.option(fc.integer({ min: 1, max: 8 }), { nil: undefined }),
  address: titleArb,
  area: fc.constantFrom("Koramangala", "Whitefield", "Indiranagar", "HSR Layout"),
  city: fc.constant("Bangalore"),
  lat: fc.option(fc.float({ min: Math.fround(12.8), max: Math.fround(13.1) }), { nil: undefined }),
  lng: fc.option(fc.float({ min: Math.fround(77.5), max: Math.fround(77.8) }), { nil: undefined }),
  images: fc.array(fc.webUrl(), { minLength: 0, maxLength: 5 }),
  amenities: fc.array(wordArb, { minLength: 0, maxLength: 5 }),
  agentPhone: fc.constant("+919876543210"),
  agentWhatsApp: fc.constant("+919876543210"),
  builder: fc.option(
    fc.record({
      id: fc.uuid(),
      name: titleArb,
      slug: wordArb,
      logoUrl: fc.option(fc.webUrl(), { nil: undefined }),
    }),
    { nil: undefined }
  ),
  floorPlans: fc.array(
    fc.record({ id: fc.uuid(), imageUrl: fc.webUrl(), order: fc.integer({ min: 0, max: 10 }) }),
    { minLength: 0, maxLength: 3 }
  ),
  available: fc.constant(true),
  featured: fc.boolean(),
  isSaved: fc.boolean(),
  limitedOffer: fc.boolean(),
  offerExpiresAt: fc.option(fc.constant(new Date().toISOString()), { nil: undefined }),
  underrated: fc.boolean(),
  yearBuilt: fc.option(fc.integer({ min: 2000, max: 2024 }), { nil: undefined }),
  possessionDate: fc.option(fc.constant("March 2026"), { nil: undefined }),
  constructionStatus: fc.option(
    fc.constantFrom("READY_TO_MOVE" as const, "UNDER_CONSTRUCTION" as const),
    { nil: undefined }
  ),
  discountedPrice: fc.option(fc.integer({ min: 100000, max: 500000000 }), { nil: undefined }),
  createdAt: fc.constant(new Date().toISOString()),
  updatedAt: fc.constant(new Date().toISOString()),
});

describe("Property 1: Listing cards contain all required fields", () => {
  it("renders title, price, location, and property type for any listing", () => {
    fc.assert(
      fc.property(listingArb, (listing) => {
        const { unmount } = render(<ListingCard listing={listing} />);

        // Title must be present (use getAllByText to handle duplicate titles across runs)
        expect(screen.getAllByText(listing.title).length).toBeGreaterThan(0);

        // Price must be present — at least one element contains the ₹ symbol
        const priceElements = document.querySelectorAll("span");
        const hasPriceElement = Array.from(priceElements).some((el) =>
          el.textContent?.includes("₹")
        );
        expect(hasPriceElement).toBe(true);

        // Location (area) must be present
        expect(screen.getAllByText(new RegExp(listing.area)).length).toBeGreaterThan(0);

        // Property type badge must be present
        const typeLabels: Record<string, string> = {
          APARTMENT: "Apartment",
          VILLA: "Villa",
          PLOT: "Plot",
          COMMERCIAL: "Commercial",
        };
        expect(screen.getAllByText(typeLabels[listing.propertyType]).length).toBeGreaterThan(0);

        // Beds must be shown when present
        if (listing.bedrooms != null) {
          expect(screen.getAllByText(new RegExp(`${listing.bedrooms}`)).length).toBeGreaterThan(0);
        }

        // Baths must be shown when present
        if (listing.bathrooms != null) {
          expect(screen.getAllByText(new RegExp(`${listing.bathrooms}`)).length).toBeGreaterThan(0);
        }

        unmount();
      }),
      { numRuns: 100 }
    );
  });
});

// ─── ListingCardSkeleton ──────────────────────────────────────────────────────

describe("ListingCardSkeleton", () => {
  it("renders with aria-busy=true", () => {
    render(<ListingCardSkeleton />);
    expect(screen.getByRole("generic", { busy: true })).toBeInTheDocument();
  });

  it("renders without crashing", () => {
    const { container } = render(<ListingCardSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });
});
