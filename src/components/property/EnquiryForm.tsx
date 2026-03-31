"use client";

import { useState } from "react";

interface EnquiryFormProps {
  listingId: string;
  listingTitle: string;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

function validate(values: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = "Name is required";
  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email address";
  }
  if (!values.phone.trim()) errors.phone = "Phone number is required";
  if (!values.message.trim()) errors.message = "Message is required";
  return errors;
}

export default function EnquiryForm({ listingId, listingTitle }: EnquiryFormProps) {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    message: `I'm interested in: ${listingTitle}`,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch(`/api/enquiry/${listingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setServerError(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <section aria-labelledby="enquiry-heading">
        <h2 id="enquiry-heading" className="text-xl font-semibold text-black mb-4">
          Enquire About This Property
        </h2>
        <div className="bg-grey-50 border border-grey-200 rounded-lg p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            className="w-10 h-10 mx-auto mb-3 text-black" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <p className="font-semibold text-black">Enquiry sent!</p>
          <p className="text-sm text-grey-600 mt-1">
            We&apos;ll get back to you as soon as possible.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="enquiry-heading">
      <h2 id="enquiry-heading" className="text-xl font-semibold text-black mb-4">
        Enquire About This Property
      </h2>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="enquiry-name" className="block text-sm font-medium text-black mb-1">
            Name <span aria-hidden="true">*</span>
          </label>
          <input
            id="enquiry-name"
            name="name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            aria-required="true"
            aria-describedby={errors.name ? "enquiry-name-error" : undefined}
            aria-invalid={!!errors.name}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black ${
              errors.name ? "border-red-500" : "border-grey-300"
            }`}
          />
          {errors.name && (
            <p id="enquiry-name-error" role="alert" className="mt-1 text-xs text-red-600">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="enquiry-email" className="block text-sm font-medium text-black mb-1">
            Email <span aria-hidden="true">*</span>
          </label>
          <input
            id="enquiry-email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            aria-required="true"
            aria-describedby={errors.email ? "enquiry-email-error" : undefined}
            aria-invalid={!!errors.email}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black ${
              errors.email ? "border-red-500" : "border-grey-300"
            }`}
          />
          {errors.email && (
            <p id="enquiry-email-error" role="alert" className="mt-1 text-xs text-red-600">
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="enquiry-phone" className="block text-sm font-medium text-black mb-1">
            Phone <span aria-hidden="true">*</span>
          </label>
          <input
            id="enquiry-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={handleChange}
            aria-required="true"
            aria-describedby={errors.phone ? "enquiry-phone-error" : undefined}
            aria-invalid={!!errors.phone}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black ${
              errors.phone ? "border-red-500" : "border-grey-300"
            }`}
          />
          {errors.phone && (
            <p id="enquiry-phone-error" role="alert" className="mt-1 text-xs text-red-600">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Message */}
        <div>
          <label htmlFor="enquiry-message" className="block text-sm font-medium text-black mb-1">
            Message <span aria-hidden="true">*</span>
          </label>
          <textarea
            id="enquiry-message"
            name="message"
            rows={4}
            value={form.message}
            onChange={handleChange}
            aria-required="true"
            aria-describedby={errors.message ? "enquiry-message-error" : undefined}
            aria-invalid={!!errors.message}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none ${
              errors.message ? "border-red-500" : "border-grey-300"
            }`}
          />
          {errors.message && (
            <p id="enquiry-message-error" role="alert" className="mt-1 text-xs text-red-600">
              {errors.message}
            </p>
          )}
        </div>

        {serverError && (
          <p role="alert" className="text-sm text-red-600">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full min-h-[44px] bg-black text-white text-sm font-semibold rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Send Enquiry"}
        </button>
      </form>
    </section>
  );
}
