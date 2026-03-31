"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useComparisonStore } from "@/store/comparisonStore";

export default function ComparisonBar() {
  const router = useRouter();
  const { selectedListings, remove, clear, limitReached, dismissLimit } =
    useComparisonStore();

  // Auto-dismiss the limit toast after 3 seconds
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (limitReached) {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => dismissLimit(), 3000);
    }
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [limitReached, dismissLimit]);

  if (selectedListings.length === 0 && !limitReached) return null;

  return (
    <>
      {/* Limit-reached toast */}
      {limitReached && (
        <div
          role="alert"
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-black text-white text-sm px-4 py-2.5 rounded shadow-lg whitespace-nowrap"
        >
          Maximum 3 properties can be compared at once.
          <button
            type="button"
            onClick={dismissLimit}
            className="ml-3 underline text-grey-300 hover:text-white"
            aria-label="Dismiss"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Sticky bar */}
      {selectedListings.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-grey-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4 flex-wrap">
            {/* Thumbnails */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {selectedListings.map((listing) => {
                const img = listing.images?.[0] ?? null;
                return (
                  <div
                    key={listing.id}
                    className="relative flex items-center gap-2 bg-grey-50 border border-grey-200 rounded px-2 py-1.5 min-w-0"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden bg-grey-100">
                      {img ? (
                        <Image
                          src={img}
                          alt={listing.title}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.5}
                            className="w-5 h-5 text-grey-400"
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

                    {/* Title */}
                    <span className="text-xs font-medium text-grey-800 truncate max-w-[100px] sm:max-w-[140px]">
                      {listing.title}
                    </span>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => remove(listing.id)}
                      className="ml-1 flex-shrink-0 text-grey-400 hover:text-black transition-colors"
                      aria-label={`Remove ${listing.title} from comparison`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4"
                        aria-hidden="true"
                      >
                        <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={clear}
                className="text-xs text-grey-500 hover:text-black underline transition-colors"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => router.push("/compare")}
                className="px-5 py-2 text-sm font-semibold text-white bg-black rounded hover:bg-grey-800 transition-colors min-h-[44px]"
              >
                Compare ({selectedListings.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
