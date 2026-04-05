import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function isAdmin(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return !!user;
}

// DELETE /api/admin/listings/[id]/floor-plans/[planId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; planId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: "Unauthorised", code: "UNAUTHORISED" }, { status: 401 });
    }

    const { id, planId } = await params;
    await prisma.floorPlan.deleteMany({
      where: { id: planId, listingId: id },
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("[DELETE /api/admin/listings/[id]/floor-plans/[planId]]", error);
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
