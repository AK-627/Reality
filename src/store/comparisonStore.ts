"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Listing } from "@/lib/types";

const MAX_COMPARE = 3;

interface ComparisonStore {
  selectedListings: Listing[];
  limitReached: boolean;
  add: (listing: Listing) => boolean;
  remove: (listingId: string) => void;
  clear: () => void;
  dismissLimit: () => void;
}

export const useComparisonStore = create<ComparisonStore>()(
  persist(
    (set, get) => ({
      selectedListings: [],
      limitReached: false,

      add: (listing) => {
        const { selectedListings } = get();
        if (selectedListings.length >= MAX_COMPARE) {
          set({ limitReached: true });
          return false;
        }
        if (selectedListings.some((l) => l.id === listing.id)) {
          return true;
        }
        set({ selectedListings: [...selectedListings, listing], limitReached: false });
        return true;
      },

      remove: (listingId) => {
        set((state) => ({
          selectedListings: state.selectedListings.filter((l) => l.id !== listingId),
          limitReached: false,
        }));
      },

      clear: () => set({ selectedListings: [], limitReached: false }),

      dismissLimit: () => set({ limitReached: false }),
    }),
    {
      name: "uk_realty_compare",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? sessionStorage : localStorage
      ),
    }
  )
);
