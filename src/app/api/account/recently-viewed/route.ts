import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MAX_AUTH = 20;

// PATCH — prepend a listing ID to the user's recently viewed list
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorised", code: "UNAUTHORISED" }, { status: 401 });
    }

    const body = await req.json();
    const { listingId } = body;

    if (!listingId || typeof listingId !== "string") {
      return NextResponse.json(
        { error: "listingId is required", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, recentlyViewed: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found", code: "NOT_FOUND" }, { status: 404 });
    }

    const existing: string[] = user.recentlyViewed ? JSON.parse(user.recentlyViewed) : [];
    const updated = [listingId, ...existing.filter((id) => id !== listingId)].slice(0, MAX_AUTH);

    await prisma.user.update({
      where: { id: user.id },
      data: { recentlyViewed: JSON.stringify(updated) },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[PATCH /api/account/recently-viewed]", error);
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}

// DELETE — clear the user's recently viewed list
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorised", code: "UNAUTHORISED" }, { status: 401 });
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: { recentlyViewed: JSON.stringify([]) },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/account/recently-viewed]", error);
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
