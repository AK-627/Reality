import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "UK Realty <onboarding@resend.dev>";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: "Valid email required", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if already registered
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "This email is already registered", code: "EMAIL_TAKEN" }, { status: 409 });
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate previous OTPs for this email
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).emailVerification.deleteMany({ where: { email: normalizedEmail } });

    // Store new OTP
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).emailVerification.create({
      data: { email: normalizedEmail, otpHash, expiresAt },
    });

    // Send OTP email
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: FROM,
        to: normalizedEmail,
        subject: "Your UK Realty verification code",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#111">
            <h2 style="border-bottom:2px solid #000;padding-bottom:8px">Verify your email</h2>
            <p>Use the code below to complete your registration. It expires in 10 minutes.</p>
            <div style="font-size:36px;font-weight:700;letter-spacing:8px;text-align:center;padding:24px;background:#f5f5f5;border-radius:8px;margin:24px 0">
              ${otp}
            </div>
            <p style="color:#555;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });
    } else {
      console.log(`[Email OTP] Code for ${normalizedEmail}: ${otp}`);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[email-otp/send]", e);
    return NextResponse.json({ error: "Failed to send OTP", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
