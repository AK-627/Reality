import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Simple admin check — in production, add a proper role field to User
async function isAdmin(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return !!user; // For now any authenticated user can manage floor plans
}

// POST /api/admin/listings/[id]/floor-plans — add a floor plan image URL
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: "Unauthorised", code: "UNAUTHORISED" }, { status: 401 });
    }

    const { id: listingId } = await params;
    const body = await req.json();
    const { imageUrl, order } = body;

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "imageUrl is required", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const floorPlan = await prisma.floorPlan.create({
      data: {
        listingId,
        imageUrl,
        order: typeof order === "number" ? order : 0,
      },
    });

    return NextResponse.json({ floorPlan }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/listings/[id]/floor-plans]", error);
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}

// GET /api/admin/listings/[id]/floor-plans — list floor plans for a listing
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: "Unauthorised", code: "UNAUTHORISED" }, { status: 401 });
    }

    const { id } = await params;
    const floorPlans = await prisma.floorPlan.findMany({
      where: { listingId: id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ floorPlans });
  } catch (error) {
    console.error("[GET /api/admin/listings/[id]/floor-plans]", error);
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
