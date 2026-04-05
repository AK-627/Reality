// Shared TypeScript interfaces for UK Realty

export interface Builder {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
}

export interface FloorPlan {
  id: string;
  imageUrl: string;
  order: number;
}

export interface BlueprintVariant {
  id: string;
  bhk?: string;
  area?: number;
  areaUnit?: "sqft" | "sqm";
  layoutName?: string;
  imageUrl: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  propertyType: "APARTMENT" | "VILLA" | "PLOT" | "COMMERCIAL";
  bedrooms?: number;
  bathrooms?: number;
  address: string;
  area: string;
  city: string;
  lat?: number;
  lng?: number;
  images: string[];
  amenities: string[];
  agentPhone: string;
  agentWhatsApp: string;
  builder?: Builder;
  floorPlans: FloorPlan[];
  available: boolean;
  featured: boolean;
  isSaved: boolean; // resolved per-request for auth users
  limitedOffer: boolean;
  offerExpiresAt?: string;
  underrated: boolean;
  yearBuilt?: number;
  possessionDate?: string; // month-year string e.g. "March 2026"
  constructionStatus?: "READY_TO_MOVE" | "UNDER_CONSTRUCTION";
  blueprintUrl?: string;
  bhkOptions?: string[];
  blueprintVariants?: BlueprintVariant[];
  size?: number;
  sizeUnit?: "sqft" | "acre";
  createdAt: string;
  updatedAt: string;
}

export interface FilterState {
  query: string;
  propertyType: string[];
  minPrice: number | null;
  maxPrice: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  location: string;
  builder: string;
  sort: string;
  constructionStatus: string;
  page: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  phoneVerified: boolean;
}

export interface ApiError {
  error: string;   // human-readable message
  code: string;    // machine-readable error code
  field?: string;  // for validation errors, the offending field name
}

// API response shapes
export interface ListingListResponse {
  listings: Listing[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ListingDetailResponse {
  listing: Listing;
}

export interface BuilderListResponse {
  builders: Builder[];
}

export interface SavedListingListResponse {
  listings: Listing[];
}
