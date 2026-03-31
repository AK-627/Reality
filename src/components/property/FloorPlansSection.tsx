"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import type { FloorPlan } from "@/lib/types";

interface FloorPlansSectionProps {
  floorPlans: FloorPlan[];
  constructionStatus?: "READY_TO_MOVE" | "UNDER_CONSTRUCTION";
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className="w-6 h-6" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className="w-6 h-6" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className="w-6 h-6" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

interface LightboxModalProps {
  floorPlans: FloorPlan[];
  initialIndex: number;
  onClose: () => void;
}

function LightboxModal({ floorPlans, initialIndex, onClose }: LightboxModalProps) {
  const [current, setCurrent] = useState(initialIndex);
  const overlayRef = useRef<HTMLDivElement>(null);
  const hasMultiple = floorPlans.length > 1;

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + floorPlans.length) % floorPlans.length);
  }, [floorPlans.length]);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % floorPlans.length);
  }, [floorPlans.length]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasMultiple) prev();
      if (e.key === "ArrowRight" && hasMultiple) next();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, prev, next, hasMultiple]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Floor plan lightbox"
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="relative max-w-3xl w-full bg-white rounded-lg overflow-hidden">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close lightbox"
          className="absolute top-3 right-3 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center bg-white/90 rounded-full hover:bg-grey-100 transition-colors"
        >
          <CloseIcon />
        </button>

        {/* Image */}
        <div className="relative w-full aspect-[4/3] bg-grey-100">
          <Image
            src={floorPlans[current].imageUrl}
            alt={`Floor plan ${current + 1} of ${floorPlans.length}`}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-contain"
          />
        </div>

        {/* Navigation controls — only when >1 floor plan */}
        {hasMultiple && (
          <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-grey-200">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous floor plan"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded hover:bg-grey-100 transition-colors"
            >
              <ChevronLeftIcon />
            </button>
            <span className="text-sm text-grey-600">
              {current + 1} / {floorPlans.length}
            </span>
            <button
              type="button"
              onClick={next}
              aria-label="Next floor plan"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded hover:bg-grey-100 transition-colors"
            >
              <ChevronRightIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FloorPlansSection({ floorPlans, constructionStatus }: FloorPlansSectionProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Hidden when no floor plans and not under construction
  if (floorPlans.length === 0 && constructionStatus !== "UNDER_CONSTRUCTION") {
    return null;
  }

  return (
    <section aria-labelledby="floor-plans-heading">
      <h2 id="floor-plans-heading" className="text-xl font-semibold text-black mb-4">
        Floor Plans
      </h2>

      {floorPlans.length === 0 ? (
        // Placeholder for under-construction listings with no floor plans yet
        <div className="flex flex-col items-center justify-center py-12 bg-grey-50 rounded-lg border border-grey-200 text-grey-500">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={1.5} className="w-12 h-12 mb-3 text-grey-300" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
          <p className="text-sm font-medium">Floor plan coming soon</p>
          <p className="text-xs mt-1">Plans will be available once finalised</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {floorPlans.map((fp, idx) => (
            <button
              key={fp.id}
              type="button"
              onClick={() => setLightboxIndex(idx)}
              aria-label={`View floor plan ${idx + 1}`}
              className="relative aspect-[4/3] bg-grey-100 rounded-lg overflow-hidden border border-grey-200 hover:border-grey-400 transition-colors"
            >
              <Image
                src={fp.imageUrl}
                alt={`Floor plan ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <LightboxModal
          floorPlans={floorPlans}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </section>
  );
}
