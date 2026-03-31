import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";

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
    yearBuilt, possessionDate,
  } = body;

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
      images: Array.isArray(images) ? images : images ? [images] : [],
      amenities: Array.isArray(amenities) ? amenities : amenities ? amenities.split(",").map((a: string) => a.trim()).filter(Boolean) : [],
      agentPhone, agentWhatsApp,
      builderId: builderId || null,
      featured: !!featured,
      available: available !== false,
      limitedOffer: !!limitedOffer,
      underrated: !!underrated,
      yearBuilt: yearBuilt ? parseInt(yearBuilt, 10) : null,
      possessionDate: possessionDate || null,
    },
  });
  return NextResponse.json({ listing });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.listing.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
