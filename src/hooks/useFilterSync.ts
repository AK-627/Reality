"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useFilterStore } from "@/store/filterStore";

/**
 * Syncs the Zustand filter store with URL query params.
 * - On mount: reads URL params and hydrates the store.
 * - On store change: pushes updated params to the URL.
 */
export function useFilterSync() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { filters, fromSearchParams, toSearchParams } = useFilterStore();
  const initialised = useRef(false);

  // Hydrate store from URL on first render
  useEffect(() => {
    if (!initialised.current) {
      fromSearchParams(new URLSearchParams(searchParams.toString()));
      initialised.current = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push filter changes to URL
  useEffect(() => {
    if (!initialised.current) return;
    const params = toSearchParams();
    const qs = params.toString();
    const newUrl = qs ? `${pathname}?${qs}` : pathname;
    router.replace(newUrl, { scroll: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);
}
