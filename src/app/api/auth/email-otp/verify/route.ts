import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP required", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const record = await (prisma as any).emailVerification.findFirst({
      where: { email: normalizedEmail, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return NextResponse.json({ error: "Code expired or not found. Request a new one.", code: "OTP_EXPIRED" }, { status: 400 });
    }

    const valid = await bcrypt.compare(String(otp).trim(), record.otpHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid code. Please try again.", code: "OTP_INVALID" }, { status: 400 });
    }

    // Mark as used
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).emailVerification.update({ where: { id: record.id }, data: { used: true } });

    return NextResponse.json({ ok: true, verified: true });
  } catch (e) {
    console.error("[email-otp/verify]", e);
    return NextResponse.json({ error: "Verification failed", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
