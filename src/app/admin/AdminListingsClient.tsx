"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatINR } from "@/lib/utils";

interface Builder { id: string; name: string; slug: string; }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Listing = any;
type BlueprintVariantInput = {
  id: string;
  bhk: string;
  layoutName: string;
  area: string;
  areaUnit: "sqft" | "sqm";
  imageUrl: string;
};

function makeEmptyBlueprintVariant(): BlueprintVariantInput {
  return {
    id: `bp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    bhk: "",
    layoutName: "",
    area: "",
    areaUnit: "sqft",
    imageUrl: "",
  };
}

const EMPTY_FORM = {
  title: "", description: "", price: "", propertyType: "APARTMENT",
  bedrooms: "", bathrooms: "", address: "", area: "", city: "Bangalore",
  lat: "", lng: "", images: [] as string[], amenities: "", agentPhone: "", agentWhatsApp: "",
  builderId: "", featured: false, available: true, limitedOffer: false,
  underrated: false, yearBuilt: "", possessionDate: "",
  blueprintVariants: [] as BlueprintVariantInput[],
  size: "", sizeUnit: "sqft",
};

const EMPTY_BUILDER_FORM = { name: "", logoUrl: "" };

// Safely parse amenities from any shape (array, JSON string, or comma string)
function parseAmenitiesToString(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  // If it looks like a JSON array, parse it
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.join(", ");
    } catch {
      // fall through
    }
  }
  return trimmed;
}

export default function AdminListingsClient({
  listings: initial,
  builders: initialBuilders,
}: {
  listings: Listing[];
  builders: Builder[];
}) {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>(initial);
  const [builders, setBuilders] = useState<Builder[]>(initialBuilders);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // New builder inline form state
  const [showBuilderForm, setShowBuilderForm] = useState(false);
  const [builderForm, setBuilderForm] = useState({ ...EMPTY_BUILDER_FORM });
  const [savingBuilder, setSavingBuilder] = useState(false);
  const [builderError, setBuilderError] = useState("");

  function parseBlueprintVariantsForForm(listing: Listing): BlueprintVariantInput[] {
    const source = Array.isArray(listing.blueprintVariants)
      ? listing.blueprintVariants
      : typeof listing.blueprintVariants === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(listing.blueprintVariants);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })()
      : [];

    const normalized = source
      .map((row: unknown, index: number) => {
        if (!row || typeof row !== "object") return null;
        const item = row as Record<string, unknown>;
        const imageUrl = typeof item.imageUrl === "string" ? item.imageUrl.trim() : "";
        if (!imageUrl) return null;
        return {
          id:
            typeof item.id === "string" && item.id.trim()
              ? item.id.trim()
              : `bp_${Date.now()}_${index}`,
          bhk: typeof item.bhk === "string" ? item.bhk : "",
          layoutName: typeof item.layoutName === "string" ? item.layoutName : "",
          area:
            typeof item.area === "number"
              ? String(item.area)
              : typeof item.area === "string"
              ? item.area
              : "",
          areaUnit: item.areaUnit === "sqm" ? "sqm" : "sqft",
          imageUrl,
        } satisfies BlueprintVariantInput;
      })
      .filter(Boolean) as BlueprintVariantInput[];

    if (normalized.length > 0) return normalized;

    const fallbackBlueprintUrl = typeof listing.blueprintUrl === "string" ? listing.blueprintUrl.trim() : "";
    if (!fallbackBlueprintUrl) return [];

    const fallbackBhks = Array.isArray(listing.bhkOptions)
      ? listing.bhkOptions
      : typeof listing.bhkOptions === "string"
      ? listing.bhkOptions.split(",").map((v: string) => v.trim()).filter(Boolean)
      : [];

    if (fallbackBhks.length === 0) {
      return [{ ...makeEmptyBlueprintVariant(), imageUrl: fallbackBlueprintUrl }];
    }

    return fallbackBhks.map((bhk: string, index: number) => ({
      ...makeEmptyBlueprintVariant(),
      id: `bp_${Date.now()}_${index}`,
      bhk,
      imageUrl: fallbackBlueprintUrl,
    }));
  }

  function openNew() {
    setForm({ ...EMPTY_FORM });
    setEditId(null);
    setShowForm(true);
    setError("");
  }

  function openEdit(listing: Listing) {
    setForm({
      title: listing.title,
      description: listing.description,
      price: String(listing.price),
      propertyType: listing.propertyType,
      bedrooms: listing.bedrooms != null ? String(listing.bedrooms) : "",
      bathrooms: listing.bathrooms != null ? String(listing.bathrooms) : "",
      address: listing.address,
      area: listing.area,
      city: listing.city,
      lat: listing.lat != null ? String(listing.lat) : "",
      lng: listing.lng != null ? String(listing.lng) : "",
      images: Array.isArray(listing.images)
        ? listing.images
        : typeof listing.images === "string"
          ? listing.images.startsWith("[")
            ? (() => { try { return JSON.parse(listing.images); } catch { return [listing.images]; } })()
            : [listing.images]
          : [],
      // Always normalize amenities to a comma-separated string regardless of source shape
      amenities: parseAmenitiesToString(listing.amenities),
      agentPhone: listing.agentPhone,
      agentWhatsApp: listing.agentWhatsApp,
      builderId: listing.builderId ?? "",
      featured: listing.featured,
      available: listing.available,
      limitedOffer: listing.limitedOffer,
      underrated: listing.underrated,
      yearBuilt: listing.yearBuilt != null ? String(listing.yearBuilt) : "",
      possessionDate: listing.possessionDate ?? "",
      blueprintVariants: parseBlueprintVariantsForForm(listing),
      size: listing.size != null ? String(listing.size) : "",
      sizeUnit: listing.sizeUnit ?? "sqft",
    });
    setEditId(listing.id);
    setShowForm(true);
    setError("");
  }

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          setForm((prev) => ({ ...prev, images: [...prev.images, data.url] }));
        } else {
          setError("Failed to upload image");
        }
      } catch {
        setError("Upload error");
      }
    }
  }

  async function handleBlueprintVariantUpload(e: React.ChangeEvent<HTMLInputElement>, variantId: string) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setForm((prev) => ({
          ...prev,
          blueprintVariants: prev.blueprintVariants.map((v) =>
            v.id === variantId ? { ...v, imageUrl: data.url } : v
          ),
        }));
      } else {
        setError("Failed to upload blueprint");
      }
    } catch {
      setError("Upload error");
    }
  }

  function addBlueprintVariant() {
    setForm((prev) => ({ ...prev, blueprintVariants: [...prev.blueprintVariants, makeEmptyBlueprintVariant()] }));
  }

  function removeBlueprintVariant(variantId: string) {
    setForm((prev) => ({ ...prev, blueprintVariants: prev.blueprintVariants.filter((v) => v.id !== variantId) }));
  }

  function updateBlueprintVariant(variantId: string, field: keyof BlueprintVariantInput, value: string) {
    setForm((prev) => ({
      ...prev,
      blueprintVariants: prev.blueprintVariants.map((v) =>
        v.id === variantId ? { ...v, [field]: value } : v
      ),
    }));
  }

  async function handleSaveBuilder(e: React.FormEvent) {
    e.preventDefault();
    setSavingBuilder(true);
    setBuilderError("");
    try {
      const res = await fetch("/api/admin/builders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(builderForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setBuilderError(data.error ?? "Failed to create builder");
        setSavingBuilder(false);
        return;
      }
      setBuilders((prev) => [...prev, data.builder].sort((a, b) => a.name.localeCompare(b.name)));
      setForm((prev) => ({ ...prev, builderId: data.builder.id }));
      setBuilderForm({ ...EMPTY_BUILDER_FORM });
      setShowBuilderForm(false);
    } catch {
      setBuilderError("Network error");
    }
    setSavingBuilder(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      images: form.images,
      amenities: form.amenities.split(",").map((s) => s.trim()).filter(Boolean),
      blueprintVariants: form.blueprintVariants
        .map((v) => ({ ...v, bhk: v.bhk.trim(), layoutName: v.layoutName.trim(), area: v.area.trim(), imageUrl: v.imageUrl.trim() }))
        .filter((v) => v.imageUrl),
    };

    const url = editId ? `/api/admin/listings/${editId}` : "/api/admin/listings";
    const method = editId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSaving(false);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong");
        return;
      }
      setShowForm(false);
      router.refresh();
      const listRes = await fetch("/api/admin/listings");
      if (listRes.ok) {
        const data = await listRes.json();
        setListings(data.listings);
      }
    } catch {
      setSaving(false);
      setError("Network error. Please try again.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/listings/${id}`, { method: "DELETE" });
    if (res.ok) {
      setListings((prev) => prev.filter((l) => l.id !== id));
      router.refresh();
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen bg-grey-50">
      {/* Header */}
      <div className="bg-white border-b border-grey-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-black">UK Realty &ndash; Admin</h1>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/admin/enquiries")}
            className="px-4 py-2 text-sm font-semibold text-grey-700 bg-grey-100 rounded hover:bg-grey-200 transition-colors min-h-[44px]"
          >
            Enquiries
          </button>
          <button
            onClick={openNew}
            className="px-4 py-2 text-sm font-semibold text-white bg-black rounded hover:bg-grey-800 transition-colors min-h-[44px]"
          >
            + Add Listing
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-grey-500 hover:text-black border border-grey-300 rounded transition-colors min-h-[44px]"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white border border-grey-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-grey-200 text-sm">
            <thead className="bg-grey-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-grey-600">Title</th>
                <th className="px-4 py-3 text-left font-semibold text-grey-600">Type</th>
                <th className="px-4 py-3 text-left font-semibold text-grey-600">Price</th>
                <th className="px-4 py-3 text-left font-semibold text-grey-600">Area</th>
                <th className="px-4 py-3 text-left font-semibold text-grey-600">Builder</th>
                <th className="px-4 py-3 text-left font-semibold text-grey-600">Flags</th>
                <th className="px-4 py-3 text-left font-semibold text-grey-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey-100">
              {listings.map((l: Listing) => (
                <tr key={l.id} className="hover:bg-grey-50">
                  <td className="px-4 py-3 font-medium text-black max-w-[200px] truncate">{l.title}</td>
                  <td className="px-4 py-3 text-grey-600">{l.propertyType}</td>
                  <td className="px-4 py-3 text-grey-600">{formatINR(l.price)}</td>
                  <td className="px-4 py-3 text-grey-600">{l.area}</td>
                  <td className="px-4 py-3 text-grey-600">{l.builder?.name ?? "\u2014"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {l.featured && <span className="px-1.5 py-0.5 text-xs bg-black text-white rounded">Featured</span>}
                      {l.limitedOffer && <span className="px-1.5 py-0.5 text-xs bg-grey-700 text-white rounded">Offer</span>}
                      {l.underrated && <span className="px-1.5 py-0.5 text-xs border border-grey-400 text-grey-600 rounded">Underrated</span>}
                      {!l.available && <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded">Unavailable</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(l)} className="text-xs text-black underline hover:no-underline">Edit</button>
                      <button onClick={() => handleDelete(l.id)} className="text-xs text-red-600 underline hover:no-underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {listings.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-grey-500">
                    No listings yet. Click &quot;+ Add Listing&quot; to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-in form */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowForm(false)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-xl bg-white z-50 overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-grey-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-black">
                {editId ? "Edit Listing" : "New Listing"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-grey-500 hover:text-black text-xl min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}

              <Field label="Title *" value={form.title} onChange={(v) => update("title", v)} />
              <Field label="Description *" value={form.description} onChange={(v) => update("description", v)} multiline />
              <Field label="Price (\u20B9) *" value={form.price} onChange={(v) => update("price", v)} type="number" />

              <div>
                <label className="block text-xs font-medium text-grey-700 mb-1">Property Type *</label>
                <select
                  value={form.propertyType}
                  onChange={(e) => update("propertyType", e.target.value)}
                  className="w-full px-3 py-2.5 border border-grey-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black min-h-[44px]"
                >
                  {["APARTMENT", "VILLA", "PLOT", "COMMERCIAL"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Bedrooms" value={form.bedrooms} onChange={(v) => update("bedrooms", v)} type="number" />
                <Field label="Bathrooms" value={form.bathrooms} onChange={(v) => update("bathrooms", v)} type="number" />
              </div>

              <Field label="Address *" value={form.address} onChange={(v) => update("address", v)} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Area / Locality *" value={form.area} onChange={(v) => update("area", v)} />
                <Field label="City" value={form.city} onChange={(v) => update("city", v)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Latitude" value={form.lat} onChange={(v) => update("lat", v)} />
                <Field label="Longitude" value={form.lng} onChange={(v) => update("lng", v)} />
              </div>

              {/* Google Maps link — auto-extracts lat/lng */}
              <div>
                <label className="block text-xs font-medium text-grey-700 mb-1">
                  Google Maps Link (paste to auto-fill coordinates)
                </label>
                <input
                  type="url"
                  placeholder="https://maps.google.com/..."
                  className="w-full px-3 py-2.5 border border-grey-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black min-h-[44px]"
                  onChange={(e) => {
                    const url = e.target.value.trim();
                    if (!url) return;
                    // Match @lat,lng or ?q=lat,lng or ll=lat,lng patterns
                    const patterns = [
                      /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
                      /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
                      /[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
                      /\/(-?\d+\.?\d*),(-?\d+\.?\d*)/,
                    ];
                    for (const pattern of patterns) {
                      const match = url.match(pattern);
                      if (match) {
                        update("lat", match[1]);
                        update("lng", match[2]);
                        e.target.value = "";
                        e.target.placeholder = `✓ Extracted: ${match[1]}, ${match[2]}`;
                        break;
                      }
                    }
                  }}
                />
                <p className="mt-1 text-xs text-grey-400">
                  Open Google Maps → right-click the location → copy coordinates, or paste the share URL
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-grey-700 mb-1">Upload Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2.5 border border-grey-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black min-h-[44px]"
                />
                {form.images.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-grey-600 mb-1">Uploaded Images:</p>
                    <div className="flex flex-wrap gap-2">
                      {form.images.map((url, index) => (
                        <div key={index} className="relative">
                          <img src={url} alt={`Image ${index + 1}`} className="w-16 h-16 object-cover rounded" />
                          <button
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Field label="Amenities (comma separated)" value={form.amenities} onChange={(v) => update("amenities", v)} multiline />

              <div className="grid grid-cols-2 gap-3">
                <Field label="Agent Phone *" value={form.agentPhone} onChange={(v) => update("agentPhone", v)} />
                <Field label="Agent WhatsApp *" value={form.agentWhatsApp} onChange={(v) => update("agentWhatsApp", v)} />
              </div>

              <div>
                <label className="block text-xs font-medium text-grey-700 mb-1">Builder</label>
                <div className="flex gap-2">
                  <select
                    value={form.builderId}
                    onChange={(e) => update("builderId", e.target.value)}
                    className="flex-1 px-3 py-2.5 border border-grey-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black min-h-[44px]"
                  >
                    <option value="">No builder</option>
                    {builders.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => { setShowBuilderForm((v) => !v); setBuilderError(""); }}
                    className="px-3 py-2 text-xs font-semibold border border-grey-300 rounded hover:border-black whitespace-nowrap min-h-[44px]"
                  >
                    + New
                  </button>
                </div>
                {showBuilderForm && (
                  <div className="mt-2 p-3 border border-grey-200 rounded bg-grey-50 space-y-2">
                    <p className="text-xs font-semibold text-grey-700">Create New Builder</p>
                    {builderError && <p className="text-xs text-red-600">{builderError}</p>}
                    <input
                      type="text"
                      placeholder="Builder name *"
                      value={builderForm.name}
                      onChange={(e) => setBuilderForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-grey-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <input
                      type="text"
                      placeholder="Logo URL (optional)"
                      value={builderForm.logoUrl}
                      onChange={(e) => setBuilderForm((p) => ({ ...p, logoUrl: e.target.value }))}
                      className="w-full px-3 py-2 border border-grey-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSaveBuilder}
                        disabled={savingBuilder || !builderForm.name.trim()}
                        className="px-4 py-2 bg-black text-white text-xs font-semibold rounded hover:bg-grey-800 disabled:opacity-50"
                      >
                        {savingBuilder ? "Saving\u2026" : "Save Builder"}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowBuilderForm(false); setBuilderError(""); }}
                        className="px-4 py-2 border border-grey-300 text-xs rounded hover:border-black"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Year Built" value={form.yearBuilt} onChange={(v) => update("yearBuilt", v)} type="number" />
                <Field label="Possession Date (e.g. March 2026)" value={form.possessionDate} onChange={(v) => update("possessionDate", v)} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-grey-700">
                    Blueprint Variants (BHK, layout, size, image)
                  </label>
                  <button
                    type="button"
                    onClick={addBlueprintVariant}
                    className="px-3 py-1.5 text-xs font-semibold border border-grey-300 rounded hover:border-black"
                  >
                    + Add Blueprint
                  </button>
                </div>

                {form.blueprintVariants.length === 0 && (
                  <p className="text-xs text-grey-500">
                    Add one or more blueprint entries for 2BHK/3BHK variants and different area layouts.
                  </p>
                )}

                {form.blueprintVariants.map((variant, idx) => (
                  <div key={variant.id} className="border border-grey-200 rounded p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-grey-700">Blueprint #{idx + 1}</p>
                      <button type="button" onClick={() => removeBlueprintVariant(variant.id)} className="text-xs text-red-600 underline">
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Field label="BHK (e.g. 2BHK)" value={variant.bhk} onChange={(v) => updateBlueprintVariant(variant.id, "bhk", v)} />
                      <Field label="Layout Name (optional)" value={variant.layoutName} onChange={(v) => updateBlueprintVariant(variant.id, "layoutName", v)} />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Area" value={variant.area} onChange={(v) => updateBlueprintVariant(variant.id, "area", v)} type="number" />
                      <div>
                        <label className="block text-xs font-medium text-grey-700 mb-1">Area Unit</label>
                        <select
                          value={variant.areaUnit}
                          onChange={(e) => updateBlueprintVariant(variant.id, "areaUnit", e.target.value)}
                          className="w-full px-3 py-2.5 border border-grey-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black min-h-[44px]"
                        >
                          <option value="sqft">sqft</option>
                          <option value="sqm">sqm</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleBlueprintVariantUpload(e, variant.id)}
                          className="w-full px-3 py-2.5 border border-grey-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black min-h-[44px]"
                        />
                      </div>
                    </div>

                    {variant.imageUrl && (
                      <div className="relative inline-block">
                        <img src={variant.imageUrl} alt={`Blueprint ${idx + 1}`} className="w-40 h-28 object-cover rounded border" />
                        <button
                          type="button"
                          onClick={() => updateBlueprintVariant(variant.id, "imageUrl", "")}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center"
                        >
                          &times;
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Size" value={form.size} onChange={(v) => update("size", v)} type="number" />
                <div>
                  <label className="block text-xs font-medium text-grey-700 mb-1">Size Unit</label>
                  <select
                    value={form.sizeUnit}
                    onChange={(e) => update("sizeUnit", e.target.value)}
                    className="w-full px-3 py-2.5 border border-grey-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black min-h-[44px]"
                  >
                    <option value="sqft">sqft</option>
                    <option value="acre">acre</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                {[
                  { key: "featured", label: "Featured" },
                  { key: "available", label: "Available" },
                  { key: "limitedOffer", label: "Limited Offer" },
                  { key: "underrated", label: "Underrated" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer text-sm text-grey-700 min-h-[44px]">
                    <input
                      type="checkbox"
                      checked={form[key as keyof typeof form] as boolean}
                      onChange={(e) => update(key, e.target.checked)}
                      className="w-4 h-4 accent-black"
                    />
                    {label}
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-black text-white text-sm font-semibold rounded hover:bg-grey-800 transition-colors disabled:opacity-60 min-h-[44px]"
                >
                  {saving ? "Saving\u2026" : editId ? "Update Listing" : "Create Listing"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 border border-grey-300 text-sm rounded hover:border-black transition-colors min-h-[44px]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  multiline?: boolean;
}) {
  const cls = "w-full px-3 py-2.5 border border-grey-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black min-h-[44px]";
  return (
    <div>
      <label className="block text-xs font-medium text-grey-700 mb-1">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={cls + " resize-none"} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </div>
  );
}
