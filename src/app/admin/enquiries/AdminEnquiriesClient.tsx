"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Enquiry {
  id: string;
  listingId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  notes: string | null;
  createdAt: string;
  listing: {
    title: string;
    agentPhone: string;
    agentWhatsApp: string;
  };
}

const STATUS_OPTIONS = [
  { value: "new", label: "New", color: "bg-blue-100 text-blue-800" },
  { value: "contacted", label: "Contacted", color: "bg-yellow-100 text-yellow-800" },
  { value: "closed", label: "Closed", color: "bg-green-100 text-green-800" },
];

export default function AdminEnquiriesClient({
  enquiries: initial,
}: {
  enquiries: Enquiry[];
}) {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<Enquiry[]>(initial);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function updateStatus(enquiryId: string, status: string) {
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setEnquiries((prev) =>
          prev.map((e) => (e.id === enquiryId ? { ...e, status } : e))
        );
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  }

  async function updateNotes(enquiryId: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (res.ok) {
        setEnquiries((prev) =>
          prev.map((e) => (e.id === enquiryId ? { ...e, notes } : e))
        );
        setSelectedEnquiry(null);
        setNotes("");
      }
    } catch (error) {
      console.error("Failed to update notes:", error);
    } finally {
      setSaving(false);
    }
  }

  const newEnquiries = enquiries.filter((e) => e.status === "new");
  const contactedEnquiries = enquiries.filter((e) => e.status === "contacted");
  const closedEnquiries = enquiries.filter((e) => e.status === "closed");

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-black">Enquiries Management</h1>
        <button
          onClick={() => router.push("/admin")}
          className="px-4 py-2 bg-grey-100 text-grey-700 rounded hover:bg-grey-200 transition-colors"
        >
          Back to Listings
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{newEnquiries.length}</div>
          <div className="text-sm text-blue-600">New Enquiries</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">{contactedEnquiries.length}</div>
          <div className="text-sm text-yellow-600">Contacted</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{closedEnquiries.length}</div>
          <div className="text-sm text-green-600">Closed</div>
        </div>
      </div>

      {/* Enquiries List */}
      <div className="space-y-6">
        {["new", "contacted", "closed"].map((status) => {
          const statusEnquiries = enquiries.filter((e) => e.status === status);
          if (statusEnquiries.length === 0) return null;

          return (
            <div key={status} className="bg-white border border-grey-200 rounded-lg">
              <div className="px-6 py-4 border-b border-grey-200">
                <h2 className="text-xl font-semibold text-black capitalize">{status} Enquiries</h2>
              </div>
              <div className="divide-y divide-grey-100">
                {statusEnquiries.map((enquiry) => (
                  <div key={enquiry.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-black">{enquiry.name}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${STATUS_OPTIONS.find(s => s.value === enquiry.status)?.color}`}>
                            {STATUS_OPTIONS.find(s => s.value === enquiry.status)?.label}
                          </span>
                        </div>
                        <p className="text-sm text-grey-600 mb-1">
                          <strong>Property:</strong> {enquiry.listing.title}
                        </p>
                        <p className="text-sm text-grey-600 mb-1">
                          <strong>Email:</strong> {enquiry.email}
                        </p>
                        <p className="text-sm text-grey-600 mb-1">
                          <strong>Phone:</strong> {enquiry.phone}
                        </p>
                        <p className="text-sm text-grey-600 mb-2">
                          <strong>Received:</strong> {new Date(enquiry.createdAt).toLocaleString()}
                        </p>
                        <div className="bg-grey-50 rounded p-3 mb-3">
                          <p className="text-sm text-grey-700">{enquiry.message}</p>
                        </div>
                        {enquiry.notes && (
                          <div className="bg-blue-50 rounded p-3">
                            <p className="text-xs text-blue-600 mb-1"><strong>Admin Notes:</strong></p>
                            <p className="text-sm text-blue-700">{enquiry.notes}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <select
                          value={enquiry.status}
                          onChange={(e) => updateStatus(enquiry.id, e.target.value)}
                          className="px-3 py-1 border border-grey-300 rounded text-sm"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            setSelectedEnquiry(enquiry);
                            setNotes(enquiry.notes || "");
                          }}
                          className="px-3 py-1 bg-grey-100 text-grey-700 rounded text-sm hover:bg-grey-200 transition-colors"
                        >
                          {enquiry.notes ? "Edit Notes" : "Add Notes"}
                        </button>
                        <div className="text-xs text-grey-500 mt-2">
                          <p>📞 {enquiry.listing.agentPhone}</p>
                          <p>💬 {enquiry.listing.agentWhatsApp}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Notes Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-black mb-4">
              {selectedEnquiry.notes ? "Edit Notes" : "Add Notes"} for {selectedEnquiry.name}
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about this enquiry..."
              rows={4}
              className="w-full px-3 py-2 border border-grey-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => updateNotes(selectedEnquiry.id)}
                disabled={saving}
                className="flex-1 py-2 bg-black text-white text-sm font-semibold rounded hover:bg-grey-800 transition-colors disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save Notes"}
              </button>
              <button
                onClick={() => {
                  setSelectedEnquiry(null);
                  setNotes("");
                }}
                className="px-4 py-2 border border-grey-300 text-sm rounded hover:border-black transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}