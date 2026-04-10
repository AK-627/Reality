import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEnquiryNotification, sendEnquiryConfirmation } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const { listingId } = await params;
    const body = await request.json().catch(() => ({}));

    const { name, email, phone, message } = body as Record<string, string>;

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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format", code: "VALIDATION_ERROR", field: "email" },
        { status: 400 }
      );
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        listingId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: message.trim(),
      },
      include: {
        listing: {
          select: {
            title: true,
            agentPhone: true,
            agentWhatsApp: true,
          },
        },
      },
    });

    const [notifyResult, confirmResult] = await Promise.allSettled([
      sendEnquiryNotification({
        name: enquiry.name,
        email: enquiry.email,
        phone: enquiry.phone,
        message: enquiry.message,
        listingTitle: enquiry.listing.title,
        listingId,
      }),
      sendEnquiryConfirmation(enquiry.email, enquiry.name, enquiry.listing.title),
    ]);

    if (notifyResult.status === "rejected") {
      console.error("[Enquiry] Admin notification failed:", notifyResult.reason);
    }
    if (confirmResult.status === "rejected") {
      console.error("[Enquiry] Customer confirmation failed:", confirmResult.reason);
    }

    return NextResponse.json({
      message: "Enquiry received. We will get back to you shortly.",
      enquiryId: enquiry.id,
    });
  } catch (error) {
    console.error("[POST /api/enquiry/[listingId]]", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
