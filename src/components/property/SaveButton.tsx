"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const SESSION_KEY = "uk_realty_saved";

function readSaved(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function writeSaved(ids: Set<string>) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(Array.from(ids)));
  } catch { /* storage unavailable */ }
}

export default function SaveButton({
  listingId,
  initialSaved,
}: {
  listingId: string;
  initialSaved: boolean;
}) {
  const { status } = useSession();
  const isAuth = status === "authenticated";

  // Always start with initialSaved to match server render, then sync
  // sessionStorage on the client after mount to avoid hydration mismatch.
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initialSaved && status !== "authenticated") {
      setSaved(readSaved().has(listingId));
    }
  }, [listingId, initialSaved, status]);

  async function toggle() {
    if (loading) return;
    setLoading(true);
    const next = !saved;
    setSaved(next);

    if (isAuth) {
      try {
        await fetch(`/api/saved/${listingId}`, { method: next ? "POST" : "DELETE" });
      } catch {
        setSaved(!next); // revert
      }
    } else {
      const ids = readSaved();
      next ? ids.add(listingId) : ids.delete(listingId);
      writeSaved(ids);
    }
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? "Remove from saved" : "Save property"}
      aria-pressed={saved}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 min-h-[44px] ${
        saved
          ? "bg-black text-white border-black hover:bg-grey-800"
          : "bg-white text-grey-700 border-grey-300 hover:border-black hover:text-black"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {saved ? "Saved" : "Save"}
    </button>
  );
}
