import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const E164_REGEX = /^\+[1-9]\d{6,14}$/;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required.", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { phone } = body;

    if (!phone || typeof phone !== "string" || !E164_REGEX.test(phone)) {
      return NextResponse.json(
        {
          error: "Invalid phone number format. Please use E.164 format (e.g. +919876543210).",
          code: "VALIDATION_ERROR",
          field: "phone",
        },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Invalidate any existing unused OTP records for this user
    await prisma.otpRecord.updateMany({
      where: { userId, used: false },
      data: { used: true },
    });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP
    const otpHash = await bcrypt.hash(otp, 10);

    // Store OTP record with 10-minute expiry
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.otpRecord.create({
      data: { userId, phone, otpHash, expiresAt },
    });

    // Send SMS via Twilio or log to console
    const sid = process.env.TWILIO_ACCOUNT_SID ?? "";
    const isRealTwilio = sid.startsWith("AC") && sid !== "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

    if (isRealTwilio) {
      const twilio = (await import("twilio")).default;
      const client = twilio(sid, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: `Your UK Realty verification code is: ${otp}. It expires in 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });
    } else {
      console.log(`[OTP] Code for ${phone}: ${otp}`);
    }

    return NextResponse.json({ message: "OTP sent" }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
