import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
    const { otp } = body;

    if (!otp || typeof otp !== "string") {
      return NextResponse.json(
        { error: "OTP is required.", code: "VALIDATION_ERROR", field: "otp" },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Find the latest unused OTP record for this user
    const record = await prisma.otpRecord.findFirst({
      where: { userId, used: false },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return NextResponse.json(
        { error: "No pending OTP found", code: "NO_OTP" },
        { status: 422 }
      );
    }

    // Check expiry
    if (record.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one.", code: "OTP_EXPIRED" },
        { status: 422 }
      );
    }

    // Verify OTP
    const isMatch = await bcrypt.compare(otp, record.otpHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid OTP code", code: "INVALID_OTP", field: "otp" },
        { status: 400 }
      );
    }

    // Mark phone as verified and update user
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { phoneVerified: true, phone: record.phone },
      }),
      prisma.otpRecord.update({
        where: { id: record.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({ verified: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
