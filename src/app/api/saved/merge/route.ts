import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorised", code: "UNAUTHORISED" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json(
        { error: "User not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const listingIds: string[] = Array.isArray(body?.listingIds) ? body.listingIds : [];

    if (listingIds.length === 0) {
      return NextResponse.json({ merged: 0 });
    }

    // Verify listings exist
    const existingListings = await prisma.listing.findMany({
      where: { id: { in: listingIds } },
      select: { id: true },
    });
    const validIds = existingListings.map((l: { id: string }) => l.id);

    let merged = 0;
    for (const listingId of validIds) {
      await prisma.savedListing.upsert({
        where: { userId_listingId: { userId: user.id, listingId } },
        create: { userId: user.id, listingId },
        update: {},
      });
      merged++;
    }

    return NextResponse.json({ merged });
  } catch (error) {
    console.error("[POST /api/saved/merge]", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
