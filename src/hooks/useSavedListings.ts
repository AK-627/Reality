"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

const SESSION_KEY = "uk_realty_saved";

function readSessionStorage(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeSessionStorage(ids: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // storage unavailable
  }
}

export function useSavedListings() {
  const { data: session, status } = useSession();
  const isAuth = status === "authenticated" && !!session?.user;

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Initialise from sessionStorage for guests; for auth users we rely on
  // isSaved flags coming from the API (listings already carry this info).
  useEffect(() => {
    if (!isAuth) {
      setSavedIds(readSessionStorage());
    }
  }, [isAuth]);

  const toggleSave = useCallback(
    async (listingId: string) => {
      if (isAuth) {
        const currentlySaved = savedIds.has(listingId);
        // Optimistic update
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (currentlySaved) {
            next.delete(listingId);
          } else {
            next.add(listingId);
          }
          return next;
        });

        try {
          const method = currentlySaved ? "DELETE" : "POST";
          await fetch(`/api/saved/${listingId}`, { method });
        } catch {
          // Revert on failure
          setSavedIds((prev) => {
            const next = new Set(prev);
            if (currentlySaved) {
              next.add(listingId);
            } else {
              next.delete(listingId);
            }
            return next;
          });
        }
      } else {
        // Guest: persist to sessionStorage
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (next.has(listingId)) {
            next.delete(listingId);
          } else {
            next.add(listingId);
          }
          writeSessionStorage(next);
          return next;
        });
      }
    },
    [isAuth, savedIds]
  );

  const isSaved = useCallback(
    (listingId: string) => savedIds.has(listingId),
    [savedIds]
  );

  /**
   * Seed the savedIds set from listing isSaved flags (used by listing pages
   * to initialise auth-user state without a separate API call).
   */
  const seedFromListings = useCallback(
    (listings: { id: string; isSaved: boolean }[]) => {
      if (!isAuth) return;
      setSavedIds((prev) => {
        const next = new Set(prev);
        for (const l of listings) {
          if (l.isSaved) {
            next.add(l.id);
          }
        }
        return next;
      });
    },
    [isAuth]
  );

  return { savedIds, toggleSave, isSaved, seedFromListings };
}
