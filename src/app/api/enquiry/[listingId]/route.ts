import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEnquiryNotification, sendEnquiryConfirmation } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const { listingId } = await params;
    console.log("[Enquiry] POST received for listingId:", listingId);
    console.log("[Enquiry] ENV check — RESEND_API_KEY set:", !!process.env.RESEND_API_KEY, "| ADMIN_EMAIL:", process.env.ADMIN_EMAIL);
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

    // Store enquiry in database
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

    // Send email notifications — await so errors show in terminal
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
    } else {
      console.log("[Enquiry] Admin notification sent OK");
    }
    if (confirmResult.status === "rejected") {
      console.error("[Enquiry] Customer confirmation failed:", confirmResult.reason);
    } else {
      console.log("[Enquiry] Customer confirmation sent OK");
    }

    console.log("[Enquiry Created]", {
      id: enquiry.id,
      listingId,
      name: enquiry.name,
      email: enquiry.email,
      phone: enquiry.phone,
      message: enquiry.message,
      createdAt: enquiry.createdAt,
    });

    return NextResponse.json({ 
      message: "Enquiry received. We will get back to you shortly.",
      enquiryId: enquiry.id 
    });
  } catch (error) {
    console.error("[POST /api/enquiry/[listingId]]", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
