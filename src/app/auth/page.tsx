"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Tab = "login" | "register";

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  general?: string;
}

function AuthPageInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [tab, setTab] = useState<Tab>("login");

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  if (status === "loading" || session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-grey-300 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grey-50 dark:bg-grey-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold tracking-tight text-black">
            UK Realty
          </Link>
          <p className="mt-2 text-sm text-grey-500">
            {tab === "login" ? "Sign in to your account" : "Create a new account"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border border-grey-200 rounded-lg overflow-hidden mb-6 bg-white">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 py-3 text-sm font-medium transition-colors min-h-[44px] ${
              tab === "login"
                ? "bg-black text-white"
                : "text-grey-600 hover:text-black hover:bg-grey-50"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setTab("register")}
            className={`flex-1 py-3 text-sm font-medium transition-colors min-h-[44px] ${
              tab === "register"
                ? "bg-black text-white"
                : "text-grey-600 hover:text-black hover:bg-grey-50"
            }`}
          >
            Register
          </button>
        </div>

        <div className="bg-white border border-grey-200 rounded-lg p-6 shadow-sm">
          {tab === "login" ? (
            <LoginForm callbackUrl={callbackUrl} />
          ) : (
            <RegisterForm callbackUrl={callbackUrl} onSwitchToLogin={() => setTab("login")} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-grey-50 dark:bg-grey-900" />}>
      <AuthPageInner />
    </Suspense>
  );
}

function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setErrors({ general: "Invalid email or password" });
    } else {
      router.replace(callbackUrl);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {errors.general && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {errors.general}
        </p>
      )}

      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-grey-700 mb-1">
          Email address
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2.5 border border-grey-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent min-h-[44px]"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="login-password" className="block text-sm font-medium text-grey-700">
            Password
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-xs text-grey-500 hover:text-black transition-colors"
          >
            Forgot Password?
          </Link>
        </div>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2.5 border border-grey-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent min-h-[44px]"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-black text-white text-sm font-semibold rounded hover:bg-grey-800 transition-colors disabled:opacity-60 min-h-[44px]"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

function RegisterForm({
  callbackUrl,
  onSwitchToLogin,
}: {
  callbackUrl: string;
  onSwitchToLogin: () => void;
}) {
  const router = useRouter();
  // step: "form" → fill details, "otp" → verify email, "done"
  const [step, setStep] = useState<"form" | "otp">("form");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", phone: "" });
  const [otp, setOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      // If email changes after OTP sent, reset verification
      if (field === "email") setEmailVerified(false);
    };
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    // Validate form fields first
    const newErrors: FieldErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = "A valid email address is required";
    }
    if (form.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/email-otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) setErrors({ email: data.error });
        else setErrors({ general: data.error || "Failed to send code" });
      } else {
        setStep("otp");
      }
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
    }
    setLoading(false);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    if (!/^\d{6}$/.test(otp.trim())) {
      setErrors({ general: "Enter the 6-digit code sent to your email" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/email-otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim().toLowerCase(), otp: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ general: data.error || "Invalid code" });
      } else {
        setEmailVerified(true);
        await handleRegister();
      }
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
    }
    setLoading(false);
  }

  async function handleRegister() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          confirmPassword: form.confirmPassword,
          phone: form.phone.trim() || undefined,
          emailVerified: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ general: data.error || "Registration failed" });
        setLoading(false);
        return;
      }
      const signInResult = await signIn("credentials", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        redirect: false,
      });
      setLoading(false);
      if (signInResult?.error) { onSwitchToLogin(); }
      else { router.replace(callbackUrl); router.refresh(); }
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
      setLoading(false);
    }
  }

  // ── OTP step ──
  if (step === "otp") {
    return (
      <form onSubmit={handleVerifyOtp} noValidate className="space-y-4">
        <div className="text-center mb-2">
          <p className="text-sm text-grey-600">
            We sent a 6-digit code to <span className="font-semibold text-black">{form.email}</span>
          </p>
        </div>
        {errors.general && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{errors.general}</p>
        )}
        <div>
          <label htmlFor="reg-otp" className="block text-sm font-medium text-grey-700 mb-1">Verification code</label>
          <input
            id="reg-otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setErrors({}); }}
            placeholder="123456"
            className="w-full px-3 py-2.5 border border-grey-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black min-h-[44px] tracking-widest text-center text-lg"
          />
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-3 bg-black text-white text-sm font-semibold rounded hover:bg-grey-800 transition-colors disabled:opacity-60 min-h-[44px]">
          {loading ? "Verifying\u2026" : "Verify & Create Account"}
        </button>
        <button type="button" onClick={() => { setStep("form"); setOtp(""); setErrors({}); }}
          className="w-full py-2 text-sm text-grey-500 hover:text-black transition-colors">
          &larr; Back / change email
        </button>
        <button type="button" disabled={loading} onClick={handleSendOtp}
          className="w-full py-2 text-sm text-grey-500 hover:text-black transition-colors">
          Resend code
        </button>
      </form>
    );
  }

  // ── Form step ──
  return (
    <form onSubmit={handleSendOtp} noValidate className="space-y-4">
      {errors.general && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{errors.general}</p>
      )}
      <div>
        <label htmlFor="reg-name" className="block text-sm font-medium text-grey-700 mb-1">Full name</label>
        <input id="reg-name" type="text" autoComplete="name" value={form.name} onChange={update("name")} required
          className={`w-full px-3 py-2.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-black min-h-[44px] ${errors.name ? "border-red-400" : "border-grey-300"}`}
          placeholder="Jane Smith" />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="reg-email" className="block text-sm font-medium text-grey-700 mb-1">Email address</label>
        <input id="reg-email" type="email" autoComplete="email" value={form.email} onChange={update("email")} required
          className={`w-full px-3 py-2.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-black min-h-[44px] ${errors.email ? "border-red-400" : "border-grey-300"}`}
          placeholder="you@example.com" />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
      </div>
      <div>
        <label htmlFor="reg-password" className="block text-sm font-medium text-grey-700 mb-1">Password</label>
        <input id="reg-password" type="password" autoComplete="new-password" value={form.password} onChange={update("password")} required
          className={`w-full px-3 py-2.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-black min-h-[44px] ${errors.password ? "border-red-400" : "border-grey-300"}`}
          placeholder="Min. 8 characters" />
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
      </div>
      <div>
        <label htmlFor="reg-confirm" className="block text-sm font-medium text-grey-700 mb-1">Confirm password</label>
        <input id="reg-confirm" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={update("confirmPassword")} required
          className={`w-full px-3 py-2.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-black min-h-[44px] ${errors.confirmPassword ? "border-red-400" : "border-grey-300"}`}
          placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" />
        {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
      </div>
      <div>
        <label htmlFor="reg-phone" className="block text-sm font-medium text-grey-700 mb-1">
          Phone <span className="text-grey-400 font-normal">(optional)</span>
        </label>
        <input id="reg-phone" type="tel" autoComplete="tel" value={form.phone} onChange={update("phone")}
          className="w-full px-3 py-2.5 border border-grey-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black min-h-[44px]"
          placeholder="+91 98765 43210" />
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-3 bg-black text-white text-sm font-semibold rounded hover:bg-grey-800 transition-colors disabled:opacity-60 min-h-[44px]">
        {loading ? "Sending code\u2026" : "Send verification code"}
      </button>
    </form>
  );
}
