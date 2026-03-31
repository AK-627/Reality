import { notFound } from "next/navigation";
import { Suspense } from "react";
import prisma from "@/lib/prisma";
import BuilderListingsClient from "./BuilderListingsClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getBuilder(slug: string) {
  try {
    return await prisma.builder.findUnique({ where: { slug } });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const builder = await getBuilder(slug);
  return {
    title: builder ? `${builder.name} Properties | UK Realty` : "Builder | UK Realty",
  };
}

export default async function BuilderPage({ params }: PageProps) {
  const { slug } = await params;
  const builder = await getBuilder(slug);
  if (!builder) notFound();

  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <BuilderListingsClient builder={builder} />
    </Suspense>
  );
}
