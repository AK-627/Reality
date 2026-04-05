import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";
import AdminEnquiriesClient from "./AdminEnquiriesClient";

export default async function AdminEnquiriesPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const raw = await prisma.enquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        select: {
          title: true,
          agentPhone: true,
          agentWhatsApp: true,
        },
      },
    },
  });

  const enquiries = raw.map((e) => ({
    ...e,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }));

  return <AdminEnquiriesClient enquiries={enquiries} />;
}