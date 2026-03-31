"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatINR } from "@/lib/utils";

interface Builder { id: string; name: string; slug: string; }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Listing = any;

const EMPTY_FORM = {
  title: "", description: "", price: "", propertyType: "APARTMENT",
  bedrooms: "", bathrooms: "", address: "", area: "", city: "Bangalore",
  lat: "", lng: "", images: "", amenities: "", agentPhone: "", agentWhatsApp: "",
  builderId: "", featured: false, available: true, limitedOffer: false,
  underrated: false, yearBuilt: "", possessionDate: "",
};

export default function AdminListingsClient({
  listings: initial,
  builders,
}: {
  listings: Listing[];
  builders: Builder[];
}) {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
      images: listing.images?.join(", ") ?? "",
      amenities: listing.amenities?.join(", ") ?? "",
      agentPhone: listing.agentPhone,
      agentWhatsApp: listing.agentWhatsApp,
      builderId: listing.builderId ?? "",
      featured: listing.featured,
      available: listing.available,
      limitedOffer: listing.limitedOffer,
      underrated: listing.underrated,
      yearBuilt: listing.yearBuilt != null ? String(listing.yearBuilt) : "",
      possessionDate: listing.possessionDate ?? "",
    });
    setEditId(listing.id);
    setShowForm(true);
    setError("");
  }

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
      amenities: form.amenities.split(",").map((s) => s.trim()).filter(Boolean),
    };

    const url = editId ? `/api/admin/listings/${editId}` : "/api/admin/listings";
    const method = editId ? "PUT" : "POST";

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
    // Refresh listings
    const listRes = await fetch("/api/admin/listings");
    if (listRes.ok) {
      const data = await listRes.json();
      setListings(data.listings);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    await fetch(`/api/admin/listings/${id}`, { method: "DELETE" });
    setListings((prev) => prev.filter((l) => l.id !== id));
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen bg-grey-50">
      {/* Header */}
      <div className="bg-white border-b border-grey-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-black">UK Realty — Admin</h1>
        <div className="flex gap-3">
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
        {/* Listings table */}
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
                  <td className="px-4 py-3 text-grey-600">{l.builder?.name ?? "—"}</td>
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
                      <button
                        onClick={() => openEdit(l)}
                        className="text-xs text-black underline hover:no-underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(l.id)}
                        className="text-xs text-red-600 underline hover:no-underline"
                      >
                        Delete
                      </button>
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
              <button onClick={() => setShowForm(false)} className="text-grey-500 hover:text-black text-xl min-w-[44px] min-h-[44px] flex items-center justify-center">✕</button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}

              <Field label="Title *" value={form.title} onChange={(v) => update("title", v)} />
              <Field label="Description *" value={form.description} onChange={(v) => update("description", v)} multiline />
              <Field label="Price (₹) *" value={form.price} onChange={(v) => update("price", v)} type="number" />

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

              <Field label="Image URLs (comma separated)" value={form.images} onChange={(v) => update("images", v)} multiline />
              <Field label="Amenities (comma separated)" value={form.amenities} onChange={(v) => update("amenities", v)} multiline />

              <div className="grid grid-cols-2 gap-3">
                <Field label="Agent Phone *" value={form.agentPhone} onChange={(v) => update("agentPhone", v)} />
                <Field label="Agent WhatsApp *" value={form.agentWhatsApp} onChange={(v) => update("agentWhatsApp", v)} />
              </div>

              <div>
                <label className="block text-xs font-medium text-grey-700 mb-1">Builder</label>
                <select
                  value={form.builderId}
                  onChange={(e) => update("builderId", e.target.value)}
                  className="w-full px-3 py-2.5 border border-grey-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black min-h-[44px]"
                >
                  <option value="">No builder</option>
                  {builders.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Year Built" value={form.yearBuilt} onChange={(v) => update("yearBuilt", v)} type="number" />
                <Field label="Possession Date (e.g. March 2026)" value={form.possessionDate} onChange={(v) => update("possessionDate", v)} />
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
                  {saving ? "Saving…" : editId ? "Update Listing" : "Create Listing"}
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
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={cls + " resize-none"}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
        />
      )}
    </div>
  );
}
