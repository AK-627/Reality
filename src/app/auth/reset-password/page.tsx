"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface FieldErrors {
  password?: string;
  confirmPassword?: string;
  general?: string;
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [tokenInvalid, setTokenInvalid] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenInvalid(true);
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const newErrors: FieldErrors = {};
    if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 422) {
          setTokenInvalid(true);
        } else if (data.field) {
          setErrors({ [data.field]: data.error });
        } else {
          setErrors({ general: data.error || "Something went wrong. Please try again." });
        }
        setLoading(false);
        return;
      }

      // Success — redirect to login with success message
      router.replace("/auth?reset=success");
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
      setLoading(false);
    }
  }

  if (tokenInvalid) {
    return (
      <div className="min-h-screen bg-grey-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-bold tracking-tight text-black">
              UK Realty
            </Link>
          </div>

          <div className="bg-white border border-grey-200 rounded-lg p-6 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 bg-grey-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-grey-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-black">Link invalid or expired</h2>
            <p className="text-sm text-grey-500">
              This password reset link is invalid or has already been used. Reset links expire after 1 hour.
            </p>
            <Link
              href="/auth/forgot-password"
              className="inline-block w-full py-3 bg-black text-white text-sm font-semibold rounded hover:bg-grey-800 transition-colors min-h-[44px] text-center"
            >
              Request a new reset link
            </Link>
          </div>

          <p className="text-center mt-6 text-sm text-grey-500">
            <Link href="/auth" className="text-black font-medium hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grey-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold tracking-tight text-black">
            UK Realty
          </Link>
          <p className="mt-2 text-sm text-grey-500">Choose a new password</p>
        </div>

        <div className="bg-white border border-grey-200 rounded-lg p-6 shadow-sm">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {errors.general && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {errors.general}
              </p>
            )}

            <div>
              <label htmlFor="rp-password" className="block text-sm font-medium text-grey-700 mb-1">
                New password
              </label>
              <input
                id="rp-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                required
                className={`w-full px-3 py-2.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent min-h-[44px] ${
                  errors.password ? "border-red-400" : "border-grey-300"
                }`}
                placeholder="Min. 8 characters"
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="rp-confirm" className="block text-sm font-medium text-grey-700 mb-1">
                Confirm new password
              </label>
              <input
                id="rp-confirm"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: undefined })); }}
                required
                className={`w-full px-3 py-2.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent min-h-[44px] ${
                  errors.confirmPassword ? "border-red-400" : "border-grey-300"
                }`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white text-sm font-semibold rounded hover:bg-grey-800 transition-colors disabled:opacity-60 min-h-[44px]"
            >
              {loading ? "Updating password…" : "Update password"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-grey-500">
          <Link href="/auth" className="text-black font-medium hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-grey-50" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
