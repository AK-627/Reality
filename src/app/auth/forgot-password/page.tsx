"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      // Always show success regardless of response
      setSubmitted(true);
    } catch {
      setSubmitted(true); // Still show success to prevent enumeration
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-grey-50 dark:bg-grey-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold tracking-tight text-black">
            UK Realty
          </Link>
          <p className="mt-2 text-sm text-grey-500">Reset your password</p>
        </div>

        <div className="bg-white border border-grey-200 rounded-lg p-6 shadow-sm">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-grey-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-grey-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-black">Check your inbox</h2>
              <p className="text-sm text-grey-500">
                If that email address is registered with UK Realty, you will receive a password reset link shortly.
              </p>
              <p className="text-xs text-grey-400">
                Didn&apos;t receive an email? Check your spam folder or{" "}
                <button
                  onClick={() => { setSubmitted(false); setEmail(""); }}
                  className="text-black underline hover:no-underline"
                >
                  try again
                </button>
                .
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <p className="text-sm text-grey-600">
                Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
              </p>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {error}
                </p>
              )}

              <div>
                <label htmlFor="fp-email" className="block text-sm font-medium text-grey-700 mb-1">
                  Email address
                </label>
                <input
                  id="fp-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  required
                  className="w-full px-3 py-2.5 border border-grey-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent min-h-[44px]"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black text-white text-sm font-semibold rounded hover:bg-grey-800 transition-colors disabled:opacity-60 min-h-[44px]"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-6 text-sm text-grey-500">
          Remember your password?{" "}
          <Link href="/auth" className="text-black font-medium hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
