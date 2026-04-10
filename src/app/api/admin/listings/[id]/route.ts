import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

function normalizeBlueprintVariants(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.reduce((acc: Array<{
    id: string;
    bhk?: string;
    layoutName?: string;
    area?: number;
    areaUnit?: "sqft" | "sqm";
    imageUrl: string;
  }>, item, index) => {
      if (!item || typeof item !== "object") return acc;
      const row = item as Record<string, unknown>;
      const imageUrl = typeof row.imageUrl === "string" ? row.imageUrl.trim() : "";
      if (!imageUrl) return acc;
      const bhk = typeof row.bhk === "string" ? row.bhk.trim() : "";
      const layoutName = typeof row.layoutName === "string" ? row.layoutName.trim() : "";
      const areaRaw = row.area;
      const area =
        typeof areaRaw === "number"
          ? areaRaw
          : typeof areaRaw === "string" && areaRaw.trim()
          ? Number(areaRaw)
          : undefined;
      const areaUnit = row.areaUnit === "sqm" ? "sqm" : row.areaUnit === "sqft" ? "sqft" : undefined;
      acc.push({
        id: typeof row.id === "string" && row.id.trim() ? row.id.trim() : `bp_${index + 1}`,
        bhk: bhk || undefined,
        layoutName: layoutName || undefined,
        area: Number.isFinite(area as number) ? area : undefined,
        areaUnit,
        imageUrl,
      });
      return acc;
    }, []);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const {
    title, description, price, propertyType, bedrooms, bathrooms,
    address, area, city, lat, lng, images, amenities,
    agentPhone, agentWhatsApp, builderId,
    featured, available, limitedOffer, underrated,
    yearBuilt, possessionDate, blueprintUrl, bhkOptions, blueprintVariants, size, sizeUnit,
  } = body;

  if (!title || !description || !price || !propertyType || !address || !area || !agentPhone || !agentWhatsApp) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const cleanBlueprintVariants = normalizeBlueprintVariants(blueprintVariants);
  const derivedBhkOptions = Array.from(new Set(cleanBlueprintVariants.map((row) => row.bhk).filter((v): v is string => Boolean(v))));
  const derivedPrimaryBlueprintUrl = cleanBlueprintVariants[0]?.imageUrl;

  try {
    // Ensure images is always a clean array of strings
    let cleanImages: string[] = [];
    if (Array.isArray(images)) {
      cleanImages = images.map((img) => String(img).replace(/^"|"$/g, '').trim()).filter(Boolean);
    } else if (typeof images === 'string') {
      cleanImages = [images.replace(/^"|"$/g, '').trim()].filter(Boolean);
    }

    const listing = await prisma.listing.update({
      where: { id },
      data: {
        title, description,
        price: parseInt(price, 10),
        propertyType,
        bedrooms: bedrooms ? parseInt(bedrooms, 10) : null,
        bathrooms: bathrooms ? parseInt(bathrooms, 10) : null,
        address, area,
        city: city || "Bangalore",
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        images: JSON.stringify(cleanImages),
        amenities: JSON.stringify(Array.isArray(amenities) ? amenities : amenities ? amenities.split(",").map((a: string) => a.trim()).filter(Boolean) : []),
        agentPhone, agentWhatsApp,
        builderId: builderId || null,
        featured: !!featured,
        available: available !== false,
        limitedOffer: !!limitedOffer,
        underrated: !!underrated,
        yearBuilt: yearBuilt ? parseInt(yearBuilt, 10) : null,
        possessionDate: possessionDate || null,
        blueprintUrl: blueprintUrl || derivedPrimaryBlueprintUrl || null,
        bhkOptions: JSON.stringify(
          derivedBhkOptions.length > 0
            ? derivedBhkOptions
            : Array.isArray(bhkOptions)
            ? bhkOptions
            : bhkOptions
            ? bhkOptions.split(",").map((b: string) => b.trim()).filter(Boolean)
            : []
        ),
        blueprintVariants: JSON.stringify(cleanBlueprintVariants),
        size: size ? parseFloat(size) : null,
        sizeUnit: sizeUnit || "sqft",
      } as any,
    });
    return NextResponse.json({ listing });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  const { id } = await params;
  try {
    // Delete related records first to avoid FK constraint errors
    await prisma.$transaction([
      prisma.floorPlan.deleteMany({ where: { listingId: id } }),
      prisma.savedListing.deleteMany({ where: { listingId: id } }),
      prisma.enquiry.deleteMany({ where: { listingId: id } }),
      prisma.listing.delete({ where: { id } }),
    ]);
    return NextResponse.json({ deleted: true });
  } catch (e) {
    console.error("[DELETE listing]", e);
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
  }
}
