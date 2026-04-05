import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get("q") ?? "";

    if (q.length < 3) {
      return NextResponse.json({ suggestions: [] });
    }

    const listings = await prisma.listing.findMany({
      where: {
        available: true,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { area: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true, area: true, city: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    });

    const suggestions = listings.map((l: { id: string; title: string; area: string; city: string }) => ({
      id: l.id,
      title: l.title,
      area: l.area,
      city: l.city,
    }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("[GET /api/listings/search]", error);
    return NextResponse.json({ suggestions: [] });
  }
}
