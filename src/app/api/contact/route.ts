import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const { name, email, phone, subject, message } = body as Record<string, string>;

    // Validate required fields
    const missing: string[] = [];
    if (!name?.trim()) missing.push("name");
    if (!email?.trim()) missing.push("email");
    if (!phone?.trim()) missing.push("phone");
    if (!subject?.trim()) missing.push("subject");
    if (!message?.trim()) missing.push("message");

    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required fields: ${missing.join(", ")}`,
          code: "VALIDATION_ERROR",
          fields: missing,
        },
        { status: 400 }
      );
    }

    // Email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format", code: "VALIDATION_ERROR", field: "email" },
        { status: 400 }
      );
    }

    // Log the contact submission
    console.log("[Contact]", {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      subject: subject.trim(),
      message: message.trim(),
      receivedAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: "Thank you for reaching out. We will get back to you shortly." });
  } catch (error) {
    console.error("[POST /api/contact]", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
