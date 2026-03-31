"use client";

import Link from "next/link";
import Image from "next/image";
import { useComparisonStore } from "@/store/comparisonStore";
import type { Listing } from "@/lib/types";
import { formatINR } from "@/lib/utils";

// ─── Row definitions ──────────────────────────────────────────────────────────

type RowKey =
  | "price"
  | "propertyType"
  | "bedrooms"
  | "bathrooms"
  | "location"
  | "builder"
  | "amenities"
  | "possessionOrYear";

const ROWS: { key: RowKey; label: string }[] = [
  { key: "price", label: "Price" },
  { key: "propertyType", label: "Property Type" },
  { key: "bedrooms", label: "Bedrooms" },
  { key: "bathrooms", label: "Bathrooms" },
  { key: "location", label: "Location" },
  { key: "builder", label: "Builder" },
  { key: "amenities", label: "Amenities" },
  { key: "possessionOrYear", label: "Possession / Year Built" },
];

function getCellValue(listing: Listing, key: RowKey): React.ReactNode {
  switch (key) {
    case "price":
      return (
        <span className="font-semibold">
          {formatINR(listing.price)}
          {listing.discountedPrice && (
            <span className="block text-xs text-grey-500 font-normal line-through">
              {formatINR(listing.discountedPrice)}
            </span>
          )}
        </span>
      );
    case "propertyType":
      return listing.propertyType.charAt(0) + listing.propertyType.slice(1).toLowerCase();
    case "bedrooms":
      return listing.bedrooms != null ? listing.bedrooms : "—";
    case "bathrooms":
      return listing.bathrooms != null ? listing.bathrooms : "—";
    case "location":
      return `${listing.area}, ${listing.city}`;
    case "builder":
      return listing.builder?.name ?? "—";
    case "amenities":
      return listing.amenities.length > 0 ? (
        <ul className="list-disc list-inside space-y-0.5 text-left">
          {listing.amenities.map((a) => (
            <li key={a} className="text-xs">
              {a}
            </li>
          ))}
        </ul>
      ) : (
        "—"
      );
    case "possessionOrYear":
      if (listing.possessionDate) return `Possession by ${listing.possessionDate}`;
      if (listing.yearBuilt) return `Built in ${listing.yearBuilt}`;
      return "—";
    default:
      return "—";
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ComparePage() {
  const { selectedListings, remove } = useComparisonStore();

  // Empty state
  if (selectedListings.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-black mb-3">No properties selected</h1>
        <p className="text-grey-500 mb-8">
          Add up to 3 properties to compare them side by side.
        </p>
        <Link
          href="/listings"
          className="inline-block px-6 py-3 text-sm font-semibold text-white bg-black rounded hover:bg-grey-800 transition-colors min-h-[44px]"
        >
          Browse listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-black">Compare Properties</h1>
        <div className="flex items-center gap-4">
          {selectedListings.length < 3 && (
            <Link
              href="/listings"
              className="text-sm font-medium text-grey-600 hover:text-black underline transition-colors"
            >
              + Add more
            </Link>
          )}
        </div>
      </div>

      {/* Comparison table — horizontal scroll on mobile */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              {/* Row label column */}
              <th className="w-36 sm:w-44 bg-grey-50 border border-grey-200 px-4 py-3 text-left text-xs font-semibold text-grey-500 uppercase tracking-wide align-bottom">
                &nbsp;
              </th>

              {/* Property columns */}
              {selectedListings.map((listing) => {
                const img = listing.images?.[0] ?? null;
                return (
                  <th
                    key={listing.id}
                    className="min-w-[200px] border border-grey-200 px-4 py-3 text-left align-top bg-white"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-full aspect-[4/3] rounded overflow-hidden bg-grey-100 mb-3">
                      {img ? (
                        <Image
                          src={img}
                          alt={listing.title}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1}
                            className="w-10 h-10 text-grey-300"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Title + link */}
                    <Link
                      href={`/listings/${listing.id}`}
                      className="block text-sm font-semibold text-black hover:underline leading-snug mb-2"
                    >
                      {listing.title}
                    </Link>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => remove(listing.id)}
                      className="text-xs text-grey-400 hover:text-black underline transition-colors"
                      aria-label={`Remove ${listing.title} from comparison`}
                    >
                      Remove
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {ROWS.map(({ key, label }) => (
              <tr key={key} className="even:bg-grey-50">
                {/* Row label */}
                <td className="border border-grey-200 px-4 py-3 text-xs font-semibold text-grey-500 uppercase tracking-wide whitespace-nowrap bg-grey-50">
                  {label}
                </td>

                {/* Values */}
                {selectedListings.map((listing) => (
                  <td
                    key={listing.id}
                    className="border border-grey-200 px-4 py-3 text-sm text-grey-800 align-top"
                  >
                    {getCellValue(listing, key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add more CTA when fewer than 3 */}
      {selectedListings.length < 3 && (
        <div className="mt-8 text-center">
          <Link
            href="/listings"
            className="inline-block px-6 py-3 text-sm font-semibold border border-grey-300 rounded hover:border-black transition-colors min-h-[44px]"
          >
            + Add another property
          </Link>
        </div>
      )}
    </div>
  );
}
