import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import prisma from "@/lib/prisma";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SAME_RESPONSE = NextResponse.json(
  { message: "If that email is registered, you will receive a reset link shortly." },
  { status: 200 }
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      // Still return same response to prevent enumeration
      return NextResponse.json(
        { message: "If that email is registered, you will receive a reset link shortly." },
        { status: 200 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      return SAME_RESPONSE;
    }

    // Generate token
    const plainToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = await bcrypt.hash(plainToken, 10);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/auth/reset-password?token=${plainToken}`;

    const apiKey = process.env.RESEND_API_KEY;
    const isPlaceholder = !apiKey || apiKey === "your_resend_api_key" || apiKey.startsWith("re_placeholder");

    if (isPlaceholder) {
      console.log(`[Password Reset] Reset link for ${normalizedEmail}: ${resetLink}`);
    } else {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: "UK Realty <noreply@ukrealty.com>",
        to: normalizedEmail,
        subject: "Reset your UK Realty password",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #171717;">
            <h1 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Reset your password</h1>
            <p style="color: #525252; margin-bottom: 24px;">
              We received a request to reset the password for your UK Realty account.
              Click the button below to choose a new password. This link expires in 1 hour.
            </p>
            <a href="${resetLink}"
               style="display: inline-block; background: #000; color: #fff; text-decoration: none;
                      padding: 12px 24px; border-radius: 4px; font-weight: 600; font-size: 14px;">
              Reset Password
            </a>
            <p style="margin-top: 24px; font-size: 12px; color: #a3a3a3;">
              If you did not request a password reset, you can safely ignore this email.
            </p>
          </div>
        `,
      });
    }

    return SAME_RESPONSE;
  } catch {
    // Always return same response to prevent enumeration
    return NextResponse.json(
      { message: "If that email is registered, you will receive a reset link shortly." },
      { status: 200 }
    );
  }
}
