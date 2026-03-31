import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { BuilderListResponse } from "@/lib/types";

export async function GET() {
  try {
    const builders = await prisma.builder.findMany({
      orderBy: { name: "asc" },
    });

    const response: BuilderListResponse = {
      builders: builders.map((b: { id: string; name: string; slug: string; logoUrl: string | null }) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        logoUrl: b.logoUrl ?? undefined,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[GET /api/builders]", error);
    return NextResponse.json({ builders: [] } satisfies BuilderListResponse);
  }
}
