import { Suspense } from "react";
import ListingsClient from "./ListingsClient";

export const metadata = {
  title: "Properties in Bangalore | UK Realty",
  description: "Browse apartments, villas, plots, and commercial properties in Bangalore.",
};

export default function ListingsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ListingsClient searchParams={searchParams} />
    </Suspense>
  );
}
