"use client";

import { create } from "zustand";
import type { FilterState } from "@/lib/types";

const DEFAULT_FILTER: FilterState = {
  query: "",
  propertyType: [],
  minPrice: null,
  maxPrice: null,
  bedrooms: null,
  bathrooms: null,
  location: "",
  builder: "",
  sort: "newest",
  constructionStatus: "",
  page: 1,
};

interface FilterStore {
  filters: FilterState;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  setFilters: (partial: Partial<FilterState>) => void;
  clearFilters: () => void;
  fromSearchParams: (params: URLSearchParams) => void;
  toSearchParams: () => URLSearchParams;
}

export const useFilterStore = create<FilterStore>((set, get) => ({
  filters: { ...DEFAULT_FILTER },

  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value, page: key === "page" ? (value as number) : 1 } })),

  setFilters: (partial) =>
    set((state) => ({ filters: { ...state.filters, ...partial, page: 1 } })),

  clearFilters: () => set({ filters: { ...DEFAULT_FILTER } }),

  fromSearchParams: (params) => {
    const f: FilterState = { ...DEFAULT_FILTER };
    if (params.get("q")) f.query = params.get("q")!;
    if (params.get("type")) f.propertyType = params.get("type")!.split(",").filter(Boolean);
    if (params.get("minPrice")) f.minPrice = parseInt(params.get("minPrice")!, 10);
    if (params.get("maxPrice")) f.maxPrice = parseInt(params.get("maxPrice")!, 10);
    if (params.get("beds")) f.bedrooms = parseInt(params.get("beds")!, 10);
    if (params.get("baths")) f.bathrooms = parseInt(params.get("baths")!, 10);
    if (params.get("location")) f.location = params.get("location")!;
    if (params.get("builder")) f.builder = params.get("builder")!;
    if (params.get("sort")) f.sort = params.get("sort")!;
    if (params.get("constructionStatus")) f.constructionStatus = params.get("constructionStatus")!;
    if (params.get("page")) f.page = Math.max(1, parseInt(params.get("page")!, 10));
    set({ filters: f });
  },

  toSearchParams: () => {
    const f = get().filters;
    const p = new URLSearchParams();
    if (f.query) p.set("q", f.query);
    if (f.propertyType.length) p.set("type", f.propertyType.join(","));
    if (f.minPrice != null) p.set("minPrice", String(f.minPrice));
    if (f.maxPrice != null) p.set("maxPrice", String(f.maxPrice));
    if (f.bedrooms != null) p.set("beds", String(f.bedrooms));
    if (f.bathrooms != null) p.set("baths", String(f.bathrooms));
    if (f.location) p.set("location", f.location);
    if (f.builder) p.set("builder", f.builder);
    if (f.sort && f.sort !== "newest") p.set("sort", f.sort);
    if (f.constructionStatus) p.set("constructionStatus", f.constructionStatus);
    if (f.page > 1) p.set("page", String(f.page));
    return p;
  },
}));
