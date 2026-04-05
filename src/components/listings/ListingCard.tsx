"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatINR } from "@/lib/utils";
import type { Listing } from "@/lib/types";

// ─── Icons (inline SVG, no external deps) ────────────────────────────────────

function BedIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" />
      <path d="M2 14h20" />
      <path d="M7 14v-3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3" />
    </svg>
  );
}

function BathIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
      <line x1="10" y1="5" x2="8" y2="7" />
      <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4 flex-shrink-0"
      aria-hidden="true"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function HeartOutlineIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function HeartFilledIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

// ─── Property type label map ──────────────────────────────────────────────────

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  APARTMENT: "Apartment",
  VILLA: "Villa",
  PLOT: "Plot",
  COMMERCIAL: "Commercial",
};

// ─── ListingCard Props ────────────────────────────────────────────────────────

export interface ListingCardProps {
  listing: Listing;
  /** Called when the save icon is toggled. Parent is responsible for optimistic update. */
  onSaveToggle?: (listingId: string, saved: boolean) => void;
  /** Called when the compare checkbox changes. */
  onCompareToggle?: (listingId: string, selected: boolean) => void;
  /** Whether this listing is currently selected for comparison. */
  compareSelected?: boolean;
}

// ─── ListingCard ─────────────────────────────────────────────────────────────

export default function ListingCard({
  listing,
  onSaveToggle,
  onCompareToggle,
  compareSelected = false,
}: ListingCardProps) {
  const [saved, setSaved] = useState(listing.isSaved);
  const [imgError, setImgError] = useState(false);

  // Helper to check if a string is a valid image URL (http/https or local /images/)
  function isValidImageUrl(url: string | undefined): boolean {
    if (!url || typeof url !== "string") return false;
    const cleanUrl = url.replace(/^"|"$/g, '').trim();
    if (cleanUrl.startsWith("/images/")) return true;
    try {
      const u = new URL(cleanUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }

  // Find the first valid image URL (strip quotes if present)
  const validImage = !imgError && Array.isArray(listing.images)
    ? listing.images.map((img) => typeof img === 'string' ? img.replace(/^"|"$/g, '').trim() : '').find((img) => isValidImageUrl(img))
    : null;
  const primaryImage = validImage || null;

  function handleSaveClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !saved;
    setSaved(next);
    onSaveToggle?.(listing.id, next);
  }

  function handleCompareChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.stopPropagation();
    onCompareToggle?.(listing.id, e.target.checked);
  }

  const constructionLabel =
    listing.constructionStatus === "READY_TO_MOVE"
      ? "Ready to Move"
      : listing.constructionStatus === "UNDER_CONSTRUCTION"
      ? "Under Construction"
      : null;

  return (
    <article className="group relative bg-white border border-grey-200 rounded-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out">
      {/* Image */}
      <Link href={`/listings/${listing.id}`} className="block relative aspect-[4/3] bg-grey-100 overflow-hidden">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={() => setImgError(true)}
          />
        ) : (
          // Fallback placeholder
          <div className="absolute inset-0 flex items-center justify-center bg-grey-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              className="w-12 h-12 text-grey-300"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}

        {/* Property type badge */}
        <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-medium bg-black text-white rounded">
          {PROPERTY_TYPE_LABELS[listing.propertyType] ?? listing.propertyType}
        </span>

        {/* Construction status badge */}
        {constructionLabel && (
          <span className="absolute top-2 right-10 px-2 py-0.5 text-xs font-medium bg-grey-800 text-white rounded">
            {constructionLabel}
          </span>
        )}

        {/* Save icon — min 44×44 touch target */}
        <button
          type="button"
          onClick={handleSaveClick}
          aria-label={saved ? "Remove from saved" : "Save property"}
          aria-pressed={saved}
          className="absolute top-1 right-1 min-w-[44px] min-h-[44px] flex items-center justify-center text-white hover:text-grey-200 hover:scale-110 transition-all duration-200"
        >
          {saved ? <HeartFilledIcon /> : <HeartOutlineIcon />}
        </button>
      </Link>

      {/* Card body */}
      <Link href={`/listings/${listing.id}`} className="block p-4">
        {/* Price row */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-lg font-bold text-black">{formatINR(listing.price)}</span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-black leading-snug line-clamp-2 mb-2">
          {listing.title}
        </h3>

        {/* Location */}
        <p className="flex items-center gap-1 text-xs text-grey-500 mb-3">
          <LocationIcon />
          <span className="truncate">{listing.area}, {listing.city}</span>
        </p>

        {/* Beds / Baths */}
        {(listing.bedrooms != null || listing.bathrooms != null) && (
          <div className="flex items-center gap-4 text-xs text-grey-600">
            {listing.bedrooms != null && (
              <span className="flex items-center gap-1">
                <BedIcon />
                {listing.bedrooms} {listing.bedrooms === 1 ? "Bed" : "Beds"}
              </span>
            )}
            {listing.bathrooms != null && (
              <span className="flex items-center gap-1">
                <BathIcon />
                {listing.bathrooms} {listing.bathrooms === 1 ? "Bath" : "Baths"}
              </span>
            )}
          </div>
        )}
      </Link>

      {/* Compare checkbox — min 44×44 touch target */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <label className="flex items-center gap-2 cursor-pointer min-h-[44px] text-xs text-grey-500 select-none">
          <input
            type="checkbox"
            checked={compareSelected}
            onChange={handleCompareChange}
            className="w-4 h-4 accent-black cursor-pointer"
            aria-label={`Compare ${listing.title}`}
          />
          Compare
        </label>
      </div>
    </article>
  );
}

// ─── ListingCardSkeleton ──────────────────────────────────────────────────────

export function ListingCardSkeleton() {
  return (
    <div
      className="bg-white border border-grey-200 rounded-lg overflow-hidden"
      aria-busy="true"
      aria-label="Loading property"
    >
      {/* Image skeleton */}
      <div className="aspect-[4/3] bg-grey-200 animate-pulse" />

      {/* Body skeleton */}
      <div className="p-4 space-y-3">
        {/* Price */}
        <div className="h-6 w-32 bg-grey-200 rounded animate-pulse" />
        {/* Title */}
        <div className="space-y-1.5">
          <div className="h-4 w-full bg-grey-200 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-grey-200 rounded animate-pulse" />
        </div>
        {/* Location */}
        <div className="h-3 w-40 bg-grey-200 rounded animate-pulse" />
        {/* Beds/Baths */}
        <div className="flex gap-4">
          <div className="h-3 w-16 bg-grey-200 rounded animate-pulse" />
          <div className="h-3 w-16 bg-grey-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Compare row skeleton */}
      <div className="px-4 pb-3">
        <div className="h-4 w-20 bg-grey-200 rounded animate-pulse" />
      </div>
    </div>
  );
}
