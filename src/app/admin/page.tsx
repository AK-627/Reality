import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";
import AdminListingsClient from "./AdminListingsClient";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    include: { builder: { select: { name: true } } },
  });

  const builders = await prisma.builder.findMany({ orderBy: { name: "asc" } });

  return <AdminListingsClient listings={listings} builders={builders} />;
}
