import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password, confirmPassword } = body;

    // Validate inputs
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing token.", code: "INVALID_TOKEN" },
        { status: 422 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters.", code: "VALIDATION_ERROR", field: "password" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match.", code: "VALIDATION_ERROR", field: "confirmPassword" },
        { status: 400 }
      );
    }

    // Find all unused, unexpired reset records and compare token hash
    const records = await prisma.passwordReset.findMany({
      where: {
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
      take: 20, // limit scan
    });

    let matchedRecord: (typeof records)[number] | null = null;
    for (const record of records) {
      const isMatch = await bcrypt.compare(token, record.tokenHash);
      if (isMatch) {
        matchedRecord = record;
        break;
      }
    }

    if (!matchedRecord) {
      // Also check if token exists but is expired/used (for better error messaging)
      return NextResponse.json(
        { error: "This reset link is invalid or has expired.", code: "INVALID_TOKEN" },
        { status: 422 }
      );
    }

    // Hash new password and update user
    const newPasswordHash = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: matchedRecord.userId },
        data: { passwordHash: newPasswordHash },
      }),
      prisma.passwordReset.update({
        where: { id: matchedRecord.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json(
      { message: "Password updated successfully." },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
