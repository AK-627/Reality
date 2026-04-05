import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  try {
    const { name, logoUrl } = await req.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Builder name is required" }, { status: 400 });
    }
    const slug = slugify(name.trim());
    const builder = await prisma.builder.create({
      data: { name: name.trim(), slug, logoUrl: logoUrl?.trim() || null },
    });
    return NextResponse.json({ builder }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "A builder with that name already exists" }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to create builder" }, { status: 500 });
  }
}
