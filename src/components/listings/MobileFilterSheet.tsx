"use client";

import { useState } from "react";
import FilterPanel from "./FilterPanel";

interface MobileFilterSheetProps {
  builders?: { id: string; name: string; slug: string }[];
}

export default function MobileFilterSheet({ builders }: MobileFilterSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-grey-300 rounded bg-white hover:border-black transition-colors min-h-[44px]"
        aria-label="Open filters"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4" aria-hidden="true">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="8" y1="12" x2="20" y2="12" />
          <line x1="12" y1="18" x2="20" y2="18" />
        </svg>
        Filters
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Bottom sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl max-h-[85vh] overflow-y-auto transform transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Filter properties"
      >
        <div className="sticky top-0 bg-white pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 bg-grey-300 rounded-full" />
        </div>
        <FilterPanel builders={builders} onClose={() => setOpen(false)} />
        <div className="p-4 border-t border-grey-200">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full py-3 text-sm font-semibold text-white bg-black rounded hover:bg-grey-800 transition-colors min-h-[44px]"
          >
            Show Results
          </button>
        </div>
      </div>
    </>
  );
}
