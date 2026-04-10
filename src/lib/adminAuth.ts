import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "admin_auth";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? process.env.NEXTAUTH_SECRET ?? "";
}

function sign(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function createAdminSessionToken(): string | null {
  const secret = getSessionSecret();
  if (!secret) return null;

  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const nonce = crypto.randomBytes(16).toString("hex");
  const payload = `${expiresAt}.${nonce}`;
  const signature = sign(payload, secret);
  return `${payload}.${signature}`;
}

export const adminCookieOptions = {
  httpOnly: true,
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;

  const [expiresAtRaw, nonce, signature] = token.split(".");
  const expiresAt = Number(expiresAtRaw);
  if (!expiresAtRaw || !nonce || !signature || !Number.isFinite(expiresAt)) return false;
  if (expiresAt <= Date.now()) return false;

  const secret = getSessionSecret();
  if (!secret) return false;

  const payload = `${expiresAtRaw}.${nonce}`;
  const expected = sign(payload, secret);
  return safeEqual(signature, expected);
}
