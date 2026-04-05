import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";
import AdminListingsClient from "./AdminListingsClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const rawListings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    include: { builder: { select: { name: true } } },
  });

  const listings = rawListings.map((l) => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
    offerExpiresAt: l.offerExpiresAt?.toISOString() ?? null,
  }));

  const builders = await prisma.builder.findMany({ orderBy: { name: "asc" } });

  return <AdminListingsClient listings={listings} builders={builders} />;
}
