import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  adminCookieOptions,
  createAdminSessionToken,
} from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = createAdminSessionToken();
  if (!token) {
    return NextResponse.json(
      { error: "Admin session is not configured on server." },
      { status: 500 }
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, adminCookieOptions);
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
