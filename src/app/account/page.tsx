"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type OtpStep = "idle" | "sent" | "verified";

interface FieldError {
  phone?: string;
  otp?: string;
  general?: string;
}

export default function AccountPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth?callbackUrl=/account");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-grey-300 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-grey-50 dark:bg-grey-900">
      {/* Header */}
      <header className="bg-white border-b border-grey-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-black">
            UK Realty
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm text-grey-500 hover:text-black transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* Profile section */}
        <section className="bg-white border border-grey-200 rounded-lg p-6">
          <h1 className="text-lg font-semibold text-black mb-4">Account Profile</h1>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-grey-500 uppercase tracking-wide mb-0.5">Name</p>
              <p className="text-sm font-medium text-black">{session.user.name}</p>
            </div>
            <div>
              <p className="text-xs text-grey-500 uppercase tracking-wide mb-0.5">Email</p>
              <p className="text-sm font-medium text-black">{session.user.email}</p>
            </div>
          </div>
        </section>

        {/* Phone verification section */}
        <PhoneVerificationSection
          initialVerified={session.user.phoneVerified}
          onVerified={() => update()}
        />
      </main>
    </div>
  );
}

function PhoneVerificationSection({
  initialVerified,
  onVerified,
}: {
  initialVerified: boolean;
  onVerified: () => void;
}) {
  const { data: session } = useSession();
  const [step, setStep] = useState<OtpStep>(initialVerified ? "verified" : "idle");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState<FieldError>({});
  const [loading, setLoading] = useState(false);

  // Sync if session updates
  useEffect(() => {
    if (session?.user?.phoneVerified) {
      setStep("verified");
    }
  }, [session?.user?.phoneVerified]);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const E164_REGEX = /^\+[1-9]\d{6,14}$/;
    if (!E164_REGEX.test(phone.trim())) {
      setErrors({ phone: "Enter a valid international phone number (e.g. +919876543210)" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ phone: data.error || "Failed to send OTP. Please try again." });
      } else {
        setStep("sent");
      }
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    if (!/^\d{6}$/.test(otp.trim())) {
      setErrors({ otp: "Enter the 6-digit code sent to your phone" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "OTP_EXPIRED") {
          setErrors({ otp: data.error });
          setStep("idle");
        } else {
          setErrors({ otp: data.error || "Invalid code. Please try again." });
        }
      } else {
        setStep("verified");
        onVerified();
      }
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setOtp("");
    setErrors({});
    setStep("idle");
  }

  return (
    <section className="bg-white border border-grey-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-black mb-1">Phone Verification</h2>

      {step !== "verified" && (
        <p className="text-sm text-grey-500 mb-5">
          Verify your phone number to confirm your identity.
        </p>
      )}

      {step === "verified" && (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm font-medium text-black">Phone verified</span>
          <span className="text-green-600 text-base">&#10003;</span>
        </div>
      )}

      {step === "idle" && (
        <form onSubmit={handleSendOtp} noValidate className="space-y-4">
          {errors.general && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {errors.general}
            </p>
          )}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-grey-700 mb-1">
              Phone number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              placeholder="+919876543210"
              className={`w-full px-3 py-2.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent min-h-[44px] ${
                errors.phone ? "border-red-400" : "border-grey-300"
              }`}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
            <p className="mt-1 text-xs text-grey-400">
              Include country code, e.g. +44 for UK, +91 for India
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white text-sm font-semibold rounded hover:bg-grey-800 transition-colors disabled:opacity-60 min-h-[44px]"
          >
            {loading ? "Sending…" : "Send OTP"}
          </button>
        </form>
      )}

      {step === "sent" && (
        <form onSubmit={handleVerifyOtp} noValidate className="space-y-4">
          {errors.general && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {errors.general}
            </p>
          )}
          <p className="text-sm text-grey-600">
            A 6-digit code was sent to <span className="font-medium text-black">{phone}</span>.
            Enter it below.
          </p>
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-grey-700 mb-1">
              Verification code
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ""));
                setErrors((prev) => ({ ...prev, otp: undefined }));
              }}
              placeholder="123456"
              className={`w-full px-3 py-2.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent min-h-[44px] tracking-widest ${
                errors.otp ? "border-red-400" : "border-grey-300"
              }`}
            />
            {errors.otp && <p className="mt-1 text-xs text-red-600">{errors.otp}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white text-sm font-semibold rounded hover:bg-grey-800 transition-colors disabled:opacity-60 min-h-[44px]"
          >
            {loading ? "Verifying…" : "Verify"}
          </button>
          <button
            type="button"
            onClick={handleResend}
            className="w-full py-2 text-sm text-grey-500 hover:text-black transition-colors min-h-[44px]"
          >
            Resend code
          </button>
        </form>
      )}
    </section>
  );
}
