"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Suggestion {
  id: string;
  title: string;
  area: string;
  city: string;
}

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  placeholder = "Search by location, property name...",
  className = "",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 3) {
      setSuggestions([]);
      setOpen(false);
      setNoResults(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/listings/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      const items: Suggestion[] = data.suggestions ?? [];
      setSuggestions(items);
      setNoResults(items.length === 0);
      setOpen(true);
    } catch {
      setSuggestions([]);
      setNoResults(false);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setOpen(false);
    router.push(`/listings?q=${encodeURIComponent(query.trim())}`);
  }

  function handleSuggestionClick(suggestion: Suggestion) {
    setQuery(suggestion.title);
    setOpen(false);
    router.push(`/listings?q=${encodeURIComponent(suggestion.title)}`);
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} role="search" className="flex">
        <label htmlFor="hero-search" className="sr-only">
          Search properties
        </label>
        <input
          id="hero-search"
          type="search"
          value={query}
          onChange={handleChange}
          onFocus={() => query.length >= 3 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="flex-1 min-h-[44px] px-4 py-3 text-sm text-black bg-white border border-grey-300 rounded-l-lg focus:outline-none focus:border-black placeholder:text-grey-400"
        />
        <button
          type="submit"
          aria-label="Search"
          className="min-h-[44px] px-6 bg-black text-white text-sm font-medium rounded-r-lg hover:bg-grey-800 transition-colors whitespace-nowrap"
        >
          Search
        </button>
      </form>

      {/* Autocomplete dropdown */}
      {open && (
        <ul
          role="listbox"
          aria-label="Search suggestions"
          className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-grey-200 rounded-lg shadow-lg overflow-hidden"
        >
          {loading && (
            <li className="px-4 py-3 text-sm text-grey-500">Searching...</li>
          )}
          {!loading && noResults && (
            <li className="px-4 py-3 text-sm text-grey-500">No results found</li>
          )}
          {!loading &&
            suggestions.map((s) => (
              <li key={s.id} role="option" aria-selected={false}>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick(s)}
                  className="w-full text-left px-4 py-3 text-sm text-black hover:bg-grey-50 transition-colors"
                >
                  <span className="font-medium">{s.title}</span>
                  <span className="text-grey-500 ml-2 text-xs">
                    {s.area}, {s.city}
                  </span>
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
