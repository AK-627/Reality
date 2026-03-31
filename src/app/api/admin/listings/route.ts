import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    include: { builder: { select: { name: true, slug: true } } },
  });
  return NextResponse.json({ listings });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const {
      title, description, price, propertyType, bedrooms, bathrooms,
      address, area, city, lat, lng, images, amenities,
      agentPhone, agentWhatsApp, builderId,
      featured, available, limitedOffer, underrated,
      yearBuilt, possessionDate,
    } = body;

    if (!title || !description || !price || !propertyType || !address || !area || !agentPhone || !agentWhatsApp) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price: parseInt(price, 10),
        propertyType,
        bedrooms: bedrooms ? parseInt(bedrooms, 10) : null,
        bathrooms: bathrooms ? parseInt(bathrooms, 10) : null,
        address,
        area,
        city: city || "Bangalore",
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        images: Array.isArray(images) ? images : images ? [images] : [],
        amenities: Array.isArray(amenities) ? amenities : amenities ? amenities.split(",").map((a: string) => a.trim()).filter(Boolean) : [],
        agentPhone,
        agentWhatsApp,
        builderId: builderId || null,
        featured: !!featured,
        available: available !== false,
        limitedOffer: !!limitedOffer,
        underrated: !!underrated,
        yearBuilt: yearBuilt ? parseInt(yearBuilt, 10) : null,
        possessionDate: possessionDate || null,
      },
    });
    return NextResponse.json({ listing }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}
