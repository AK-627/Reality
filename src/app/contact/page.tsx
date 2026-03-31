"use client";

import { useState } from "react";

// ── Icons ────────────────────────────────────────────────────────────────────

function WhatsAppIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
      className="w-5 h-5" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className="w-5 h-5" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className="w-5 h-5 shrink-0" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className="w-5 h-5 shrink-0" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

// ── Contact Form ─────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
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
  if (!values.subject.trim()) errors.subject = "Subject is required";
  if (!values.message.trim()) errors.message = "Message is required";
  return errors;
}

function ContactForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      const res = await fetch("/api/contact", {
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
      <div className="bg-grey-50 border border-grey-200 rounded-xl p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          className="w-12 h-12 mx-auto mb-4 text-black" aria-hidden="true">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <p className="text-lg font-semibold text-black">Message sent!</p>
        <p className="text-sm text-grey-600 mt-2">
          Thank you for reaching out. We&apos;ll get back to you as soon as possible.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Name */}
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-black mb-1">
          Name <span aria-hidden="true">*</span>
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          value={form.name}
          onChange={handleChange}
          aria-required="true"
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          aria-invalid={!!errors.name}
          className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black min-h-[44px] ${
            errors.name ? "border-red-500" : "border-grey-300"
          }`}
        />
        {errors.name && (
          <p id="contact-name-error" role="alert" className="mt-1 text-xs text-red-600">
            {errors.name}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-black mb-1">
          Email <span aria-hidden="true">*</span>
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          aria-required="true"
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          aria-invalid={!!errors.email}
          className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black min-h-[44px] ${
            errors.email ? "border-red-500" : "border-grey-300"
          }`}
        />
        {errors.email && (
          <p id="contact-email-error" role="alert" className="mt-1 text-xs text-red-600">
            {errors.email}
          </p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="contact-phone" className="block text-sm font-medium text-black mb-1">
          Phone <span aria-hidden="true">*</span>
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={form.phone}
          onChange={handleChange}
          aria-required="true"
          aria-describedby={errors.phone ? "contact-phone-error" : undefined}
          aria-invalid={!!errors.phone}
          className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black min-h-[44px] ${
            errors.phone ? "border-red-500" : "border-grey-300"
          }`}
        />
        {errors.phone && (
          <p id="contact-phone-error" role="alert" className="mt-1 text-xs text-red-600">
            {errors.phone}
          </p>
        )}
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="contact-subject" className="block text-sm font-medium text-black mb-1">
          Subject <span aria-hidden="true">*</span>
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          value={form.subject}
          onChange={handleChange}
          aria-required="true"
          aria-describedby={errors.subject ? "contact-subject-error" : undefined}
          aria-invalid={!!errors.subject}
          className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black min-h-[44px] ${
            errors.subject ? "border-red-500" : "border-grey-300"
          }`}
        />
        {errors.subject && (
          <p id="contact-subject-error" role="alert" className="mt-1 text-xs text-red-600">
            {errors.subject}
          </p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-black mb-1">
          Message <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          value={form.message}
          onChange={handleChange}
          aria-required="true"
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          aria-invalid={!!errors.message}
          className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none ${
            errors.message ? "border-red-500" : "border-grey-300"
          }`}
        />
        {errors.message && (
          <p id="contact-message-error" role="alert" className="mt-1 text-xs text-red-600">
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
        {submitting ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

const AGENCY_PHONE = "+91 99999 99999";
const AGENCY_PHONE_RAW = "+919999999999";
const AGENCY_WA_NUMBER = "919999999999";
const AGENCY_EMAIL = "hello@ukrealty.in";
const WA_MESSAGE = encodeURIComponent("Hi, I'd like to enquire about a property with UK Realty.");

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Page header */}
      <section className="border-b border-grey-200 bg-grey-50 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-medium text-grey-500 uppercase tracking-widest mb-2">
            Get in touch
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-black">Contact Us</h1>
          <p className="mt-3 text-grey-600 max-w-xl">
            Have a question about a property or want to schedule a visit? We&apos;re here to help.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* ── Left: Agency info ── */}
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-black mb-5">Agency Details</h2>

            <ul className="space-y-4 text-sm text-grey-700">
              {/* Address */}
              <li className="flex items-start gap-3">
                <MapPinIcon />
                <div>
                  <p className="font-medium text-black">UK Realty</p>
                  <p>123 MG Road, Indiranagar</p>
                  <p>Bangalore, Karnataka 560038</p>
                </div>
              </li>

              {/* Phone */}
              <li className="flex items-center gap-3">
                <PhoneIcon />
                <a
                  href={`tel:${AGENCY_PHONE_RAW}`}
                  className="hover:text-black transition-colors"
                >
                  {AGENCY_PHONE}
                </a>
              </li>

              {/* Email */}
              <li className="flex items-center gap-3">
                <MailIcon />
                <a
                  href={`mailto:${AGENCY_EMAIL}`}
                  className="hover:text-black transition-colors"
                >
                  {AGENCY_EMAIL}
                </a>
              </li>

              {/* Hours */}
              <li className="flex items-center gap-3">
                <ClockIcon />
                <span>Mon – Sat, 9:00 AM – 7:00 PM IST</span>
              </li>
            </ul>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`https://wa.me/${AGENCY_WA_NUMBER}?text=${WA_MESSAGE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 min-h-[44px] flex-1 bg-black text-white text-sm font-semibold rounded-lg hover:bg-accent-hover transition-colors px-4"
            >
              <WhatsAppIcon />
              WhatsApp Us
            </a>

            <a
              href={`tel:${AGENCY_PHONE_RAW}`}
              className="flex items-center justify-center gap-2 min-h-[44px] flex-1 border border-black text-black text-sm font-semibold rounded-lg hover:bg-grey-100 transition-colors px-4"
            >
              <PhoneIcon />
              Call Now
            </a>
          </div>

          {/* Divider */}
          <hr className="border-grey-200" />

          {/* Map embed placeholder */}
          <div className="rounded-xl overflow-hidden border border-grey-200 aspect-video bg-grey-100 flex items-center justify-center">
            <iframe
              title="UK Realty office location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.9!2d77.6408!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU4JzE3LjgiTiA3N8KwMzgnMjYuOSJF!5e0!3m2!1sen!2sin!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>
        </div>

        {/* ── Right: Contact form ── */}
        <div>
          <h2 className="text-xl font-semibold text-black mb-5">Send Us a Message</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
