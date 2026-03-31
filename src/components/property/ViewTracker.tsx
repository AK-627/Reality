"use client";

import { useEffect } from "react";

interface ViewTrackerProps {
  listingId: string;
}

const MAX_RECENTLY_VIEWED = 10;
const STORAGE_KEY = "uk_realty_recently_viewed";

export default function ViewTracker({ listingId }: ViewTrackerProps) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      // Remove existing occurrence, prepend current
      const updated = [listingId, ...ids.filter((id) => id !== listingId)].slice(
        0,
        MAX_RECENTLY_VIEWED
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // localStorage unavailable
    }
  }, [listingId]);

  return null;
}
