import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const { listingId } = await params;
    const body = await request.json().catch(() => ({}));

    const { name, email, phone, message } = body as Record<string, string>;

    // Validate required fields
    const missing: string[] = [];
    if (!name?.trim()) missing.push("name");
    if (!email?.trim()) missing.push("email");
    if (!phone?.trim()) missing.push("phone");
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

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format", code: "VALIDATION_ERROR", field: "email" },
        { status: 400 }
      );
    }

    // Log the enquiry (no actual email sending)
    console.log("[Enquiry]", {
      listingId,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: message.trim(),
      receivedAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: "Enquiry received. We will get back to you shortly." });
  } catch (error) {
    console.error("[POST /api/enquiry/[listingId]]", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
