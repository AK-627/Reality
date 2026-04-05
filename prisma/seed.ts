import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Builders ──────────────────────────────────────────────────────────────
  const prestige = await prisma.builder.upsert({
    where: { slug: 'prestige' },
    update: {},
    create: {
      name: 'Prestige Group',
      slug: 'prestige',
      logoUrl: 'https://res.cloudinary.com/demo/image/upload/prestige-logo.png',
    },
  });

  const sobha = await prisma.builder.upsert({
    where: { slug: 'sobha' },
    update: {},
    create: {
      name: 'Sobha Realty',
      slug: 'sobha',
      logoUrl: 'https://res.cloudinary.com/demo/image/upload/sobha-logo.png',
    },
  });

  const brigade = await prisma.builder.upsert({
    where: { slug: 'brigade' },
    update: {},
    create: {
      name: 'Brigade Group',
      slug: 'brigade',
      logoUrl: 'https://res.cloudinary.com/demo/image/upload/brigade-logo.png',
    },
  });

  const godrej = await prisma.builder.upsert({
    where: { slug: 'godrej' },
    update: {},
    create: {
      name: 'Godrej Properties',
      slug: 'godrej',
      logoUrl: 'https://res.cloudinary.com/demo/image/upload/godrej-logo.png',
    },
  });

  console.log('✅ Builders created');

  // ── Listings ───────────────────────────────────────────────────────────────

  // 1. APARTMENT – featured, limited offer, with floor plans, Whitefield
  const apt1 = await prisma.listing.create({
    data: {
      title: 'Prestige Lakeside Habitat – 3 BHK',
      description:
        'Spacious 3-bedroom apartment in the heart of Whitefield with panoramic lake views, premium fittings, and world-class amenities. Ready to move in.',
      price: 12500000,
      propertyType: 'APARTMENT',
      bedrooms: 3,
      bathrooms: 2,
      address: 'Varthur Road, Whitefield',
      area: 'Whitefield',
      city: 'Bangalore',
      lat: 12.9698,
      lng: 77.7499,
      images: JSON.stringify([
        'https://res.cloudinary.com/demo/image/upload/apt1-main.jpg',
        'https://res.cloudinary.com/demo/image/upload/apt1-living.jpg',
        'https://res.cloudinary.com/demo/image/upload/apt1-kitchen.jpg',
      ]),
      amenities: JSON.stringify(['Swimming Pool', 'Gym', 'Clubhouse', 'Children Play Area', '24/7 Security', 'Power Backup']),
      agentPhone: '+919876543210',
      agentWhatsApp: '919876543210',
      builderId: prestige.id,
      featured: true,
      limitedOffer: true,
      offerExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      yearBuilt: 2022,
      possessionDate: 'December 2022',
      blueprintUrl: 'https://res.cloudinary.com/demo/image/upload/apt1-blueprint.jpg',
      bhkOptions: JSON.stringify(['2BHK', '3BHK', '4BHK']),
      size: 1500,
      sizeUnit: 'sqft',
    },
  });

  await prisma.floorPlan.createMany({
    data: [
      { listingId: apt1.id, imageUrl: 'https://res.cloudinary.com/demo/image/upload/apt1-fp-1.jpg', order: 0 },
      { listingId: apt1.id, imageUrl: 'https://res.cloudinary.com/demo/image/upload/apt1-fp-2.jpg', order: 1 },
    ],
  });

  // 2. APARTMENT – underrated, Sarjapur Road
  const apt2 = await prisma.listing.create({
    data: {
      title: 'Sobha Dream Acres – 2 BHK',
      description:
        'Affordable 2-bedroom apartment in a gated community near Sarjapur Road. Excellent connectivity to Electronic City and Whitefield IT corridors.',
      price: 6800000,
      propertyType: 'APARTMENT',
      bedrooms: 2,
      bathrooms: 2,
      address: 'Panathur Road, Sarjapur',
      area: 'Sarjapur Road',
      city: 'Bangalore',
      lat: 12.9010,
      lng: 77.6960,
      images: JSON.stringify([
        'https://res.cloudinary.com/demo/image/upload/apt2-main.jpg',
        'https://res.cloudinary.com/demo/image/upload/apt2-bedroom.jpg',
      ]),
      amenities: JSON.stringify(['Gym', 'Jogging Track', 'Children Play Area', 'Visitor Parking']),
      agentPhone: '+919876543211',
      agentWhatsApp: '919876543211',
      builderId: sobha.id,
      underrated: true,
      possessionDate: 'June 2025',
      bhkOptions: JSON.stringify(['2BHK', '3BHK']),
      size: 1200,
      sizeUnit: 'sqft',
    },
  });

  // 3. APARTMENT – featured, under construction, Hebbal
  await prisma.listing.create({
    data: {
      title: 'Brigade Cornerstone Utopia – 4 BHK Penthouse',
      description:
        'Luxury penthouse with private terrace and stunning views of Hebbal Lake. Premium specifications throughout with Italian marble flooring.',
      price: 28000000,
      propertyType: 'APARTMENT',
      bedrooms: 4,
      bathrooms: 4,
      address: 'Outer Ring Road, Hebbal',
      area: 'Hebbal',
      city: 'Bangalore',
      lat: 13.0358,
      lng: 77.5970,
      images: JSON.stringify([
        'https://res.cloudinary.com/demo/image/upload/apt3-main.jpg',
        'https://res.cloudinary.com/demo/image/upload/apt3-terrace.jpg',
        'https://res.cloudinary.com/demo/image/upload/apt3-living.jpg',
      ]),
      amenities: JSON.stringify(['Private Terrace', 'Swimming Pool', 'Concierge', 'Gym', 'Spa', 'Valet Parking']),
      agentPhone: '+919876543212',
      agentWhatsApp: '919876543212',
      builderId: brigade.id,
      featured: true,
      possessionDate: 'March 2026',
    },
  });

  // 4. VILLA – featured, with floor plans, Devanahalli
  const villa1 = await prisma.listing.create({
    data: {
      title: 'Prestige Golfshire – 5 BHK Villa',
      description:
        'Exclusive villa on a championship golf course near Devanahalli. Sprawling 6,000 sq ft with private pool, landscaped garden, and butler service.',
      price: 75000000,
      propertyType: 'VILLA',
      bedrooms: 5,
      bathrooms: 5,
      address: 'Nandi Hills Road, Devanahalli',
      area: 'Devanahalli',
      city: 'Bangalore',
      lat: 13.2257,
      lng: 77.7173,
      images: JSON.stringify([
        'https://res.cloudinary.com/demo/image/upload/villa1-main.jpg',
        'https://res.cloudinary.com/demo/image/upload/villa1-pool.jpg',
        'https://res.cloudinary.com/demo/image/upload/villa1-garden.jpg',
      ]),
      amenities: JSON.stringify(['Private Pool', 'Golf Course Access', 'Butler Service', 'Home Theatre', 'Wine Cellar', 'Gym']),
      agentPhone: '+919876543213',
      agentWhatsApp: '919876543213',
      builderId: prestige.id,
      featured: true,
      yearBuilt: 2021,
    },
  });

  await prisma.floorPlan.createMany({
    data: [
      { listingId: villa1.id, imageUrl: 'https://res.cloudinary.com/demo/image/upload/villa1-fp-gf.jpg', order: 0 },
      { listingId: villa1.id, imageUrl: 'https://res.cloudinary.com/demo/image/upload/villa1-fp-ff.jpg', order: 1 },
      { listingId: villa1.id, imageUrl: 'https://res.cloudinary.com/demo/image/upload/villa1-fp-sf.jpg', order: 2 },
    ],
  });

  // 5. VILLA – underrated, limited offer, Kanakapura Road
  await prisma.listing.create({
    data: {
      title: 'Godrej Woodland – 3 BHK Row Villa',
      description:
        'Charming row villa surrounded by 30 acres of forest. Ideal for families seeking a serene lifestyle with easy access to Kanakapura Road.',
      price: 18500000,
      propertyType: 'VILLA',
      bedrooms: 3,
      bathrooms: 3,
      address: 'Kanakapura Road, Jigani',
      area: 'Kanakapura Road',
      city: 'Bangalore',
      lat: 12.7969,
      lng: 77.5530,
      images: JSON.stringify([
        'https://res.cloudinary.com/demo/image/upload/villa2-main.jpg',
        'https://res.cloudinary.com/demo/image/upload/villa2-garden.jpg',
      ]),
      amenities: JSON.stringify(['Forest View', 'Clubhouse', 'Swimming Pool', 'Jogging Track', 'Children Play Area']),
      agentPhone: '+919876543214',
      agentWhatsApp: '919876543214',
      builderId: godrej.id,
      underrated: true,
      limitedOffer: true,
      offerExpiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
      possessionDate: 'September 2025',
    },
  });

  // 6. PLOT – Yelahanka
  await prisma.listing.create({
    data: {
      title: 'Brigade Meadows – Residential Plot 1200 sqft',
      description:
        'BBMP-approved residential plot in a gated layout with underground utilities, wide roads, and landscaped parks. Ideal for custom home construction.',
      price: 9600000,
      propertyType: 'PLOT',
      address: 'Yelahanka New Town, Yelahanka',
      area: 'Yelahanka',
      city: 'Bangalore',
      lat: 13.1007,
      lng: 77.5963,
      images: JSON.stringify([
        'https://res.cloudinary.com/demo/image/upload/plot1-main.jpg',
        'https://res.cloudinary.com/demo/image/upload/plot1-layout.jpg',
      ]),
      amenities: JSON.stringify(['Gated Community', 'Underground Utilities', 'Wide Roads', 'Landscaped Parks', 'Security']),
      agentPhone: '+919876543215',
      agentWhatsApp: '919876543215',
      builderId: brigade.id,
      featured: true,
    },
  });

  // 7. PLOT – underrated, Hosur Road
  await prisma.listing.create({
    data: {
      title: 'Sobha Hartland – Corner Plot 2400 sqft',
      description:
        'Premium corner plot with extra frontage in a fully developed layout. RERA registered, clear title, and immediate registration available.',
      price: 14400000,
      propertyType: 'PLOT',
      address: 'Electronic City Phase 2, Hosur Road',
      area: 'Hosur Road',
      city: 'Bangalore',
      lat: 12.8399,
      lng: 77.6770,
      images: JSON.stringify([
        'https://res.cloudinary.com/demo/image/upload/plot2-main.jpg',
      ]),
      amenities: JSON.stringify(['Corner Plot', 'RERA Registered', 'Clear Title', 'Gated Layout', 'Street Lighting']),
      agentPhone: '+919876543216',
      agentWhatsApp: '919876543216',
      builderId: sobha.id,
      underrated: true,
    },
  });

  // 8. COMMERCIAL – Koramangala, featured
  const comm1 = await prisma.listing.create({
    data: {
      title: 'Prestige Tech Park – Grade A Office Space 5000 sqft',
      description:
        'Premium Grade A office space in the heart of Koramangala. Floor-to-ceiling glass, raised flooring, 100% power backup, and dedicated parking.',
      price: 45000000,
      propertyType: 'COMMERCIAL',
      address: '80 Feet Road, Koramangala',
      area: 'Koramangala',
      city: 'Bangalore',
      lat: 12.9352,
      lng: 77.6245,
      images: JSON.stringify([
        'https://res.cloudinary.com/demo/image/upload/comm1-main.jpg',
        'https://res.cloudinary.com/demo/image/upload/comm1-interior.jpg',
        'https://res.cloudinary.com/demo/image/upload/comm1-lobby.jpg',
      ]),
      amenities: JSON.stringify(['Grade A Office', 'Raised Flooring', '100% Power Backup', 'Dedicated Parking', 'Cafeteria', 'Conference Rooms']),
      agentPhone: '+919876543217',
      agentWhatsApp: '919876543217',
      builderId: prestige.id,
      featured: true,
      yearBuilt: 2020,
    },
  });

  await prisma.floorPlan.create({
    data: {
      listingId: comm1.id,
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/comm1-fp.jpg',
      order: 0,
    },
  });

  // 9. COMMERCIAL – limited offer, Indiranagar
  await prisma.listing.create({
    data: {
      title: 'Brigade Gateway – Retail Shop 800 sqft',
      description:
        'High-footfall retail space on the ground floor of Brigade Gateway mall. Ideal for F&B, fashion, or lifestyle brands. Immediate possession.',
      price: 16000000,
      propertyType: 'COMMERCIAL',
      address: '26/1 Dr Rajkumar Road, Indiranagar',
      area: 'Indiranagar',
      city: 'Bangalore',
      lat: 12.9784,
      lng: 77.6408,
      images: JSON.stringify([
        'https://res.cloudinary.com/demo/image/upload/comm2-main.jpg',
        'https://res.cloudinary.com/demo/image/upload/comm2-frontage.jpg',
      ]),
      amenities: JSON.stringify(['Ground Floor', 'High Footfall', 'Ample Parking', 'Power Backup', 'CCTV']),
      agentPhone: '+919876543218',
      agentWhatsApp: '919876543218',
      builderId: brigade.id,
      limitedOffer: true,
      offerExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      possessionDate: 'Immediate',
    },
  });

  // 10. APARTMENT – 1 BHK, budget, Electronic City
  await prisma.listing.create({
    data: {
      title: 'Godrej Nurture – 1 BHK Studio',
      description:
        'Compact and efficient 1-bedroom studio apartment perfect for young professionals working in Electronic City. Fully furnished option available.',
      price: 3900000,
      propertyType: 'APARTMENT',
      bedrooms: 1,
      bathrooms: 1,
      address: 'Electronic City Phase 1',
      area: 'Electronic City',
      city: 'Bangalore',
      lat: 12.8456,
      lng: 77.6603,
      images: JSON.stringify([
        'https://res.cloudinary.com/demo/image/upload/apt4-main.jpg',
        'https://res.cloudinary.com/demo/image/upload/apt4-studio.jpg',
      ]),
      amenities: JSON.stringify(['Gym', 'Rooftop Garden', 'Co-working Space', 'Laundry', 'Visitor Parking']),
      agentPhone: '+919876543219',
      agentWhatsApp: '919876543219',
      builderId: godrej.id,
      underrated: true,
      possessionDate: 'January 2026',
    },
  });

  // 11. VILLA – no builder, independent, Bannerghatta Road
  await prisma.listing.create({
    data: {
      title: 'Independent Villa – 4 BHK, Bannerghatta Road',
      description:
        'Standalone 4-bedroom villa on a 3600 sqft plot with a private garden and covered car park. No maintenance charges. Freehold property.',
      price: 32000000,
      propertyType: 'VILLA',
      bedrooms: 4,
      bathrooms: 3,
      address: 'JP Nagar 7th Phase, Bannerghatta Road',
      area: 'Bannerghatta Road',
      city: 'Bangalore',
      lat: 12.8731,
      lng: 77.5921,
      images: JSON.stringify([
        'https://res.cloudinary.com/demo/image/upload/villa3-main.jpg',
        'https://res.cloudinary.com/demo/image/upload/villa3-garden.jpg',
      ]),
      amenities: JSON.stringify(['Private Garden', 'Covered Car Park', 'Freehold', 'Bore Well', 'Solar Panels']),
      agentPhone: '+919876543220',
      agentWhatsApp: '919876543220',
      featured: false,
      yearBuilt: 2019,
    },
  });

  // 12. PLOT – large, North Bangalore, no builder
  await prisma.listing.create({
    data: {
      title: 'NA Converted Agricultural Plot – 1 Acre, Doddaballapur',
      description:
        'NA-converted 1-acre plot on the Doddaballapur Road with excellent road frontage. Suitable for farmhouse, resort, or residential development.',
      price: 22000000,
      propertyType: 'PLOT',
      address: 'Doddaballapur Road, Rajanukunte',
      area: 'Doddaballapur',
      city: 'Bangalore',
      lat: 13.1650,
      lng: 77.5370,
      images: JSON.stringify([
        'https://res.cloudinary.com/demo/image/upload/plot3-main.jpg',
      ]),
      amenities: JSON.stringify(['NA Converted', 'Road Frontage', 'Clear Title', 'Bore Well']),
      agentPhone: '+919876543221',
      agentWhatsApp: '919876543221',
      limitedOffer: false,
      underrated: false,
    },
  });

  console.log('✅ Listings and floor plans created');
  console.log(`   apt1 id: ${apt1.id}`);
  console.log(`   apt2 id: ${apt2.id}`);
  console.log(`   villa1 id: ${villa1.id}`);
  console.log(`   comm1 id: ${comm1.id}`);
  console.log('🌱 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
