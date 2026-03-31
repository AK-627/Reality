import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";

async function getBuilders() {
  try {
    return await prisma.builder.findMany({ orderBy: { name: "asc" } });
  } catch {
    return [];
  }
}

export const metadata = {
  title: "Browse by Builder | UK Realty",
  description: "Explore properties from top developers in Bangalore.",
};

export default async function BuildersPage() {
  const builders = await getBuilders();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-black mb-2">Browse by Builder</h1>
      <p className="text-grey-500 text-sm mb-8">Explore properties from top developers in Bangalore</p>

      {builders.length === 0 ? (
        <p className="text-grey-500">No builders found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {builders.map((b: { id: string; name: string; slug: string; logoUrl: string | null }) => (
            <Link
              key={b.id}
              href={`/listings?builder=${encodeURIComponent(b.slug)}`}
              className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-grey-200 rounded-lg hover:border-black hover:shadow-sm transition-all group min-h-[120px]"
              aria-label={`Browse listings by ${b.name}`}
            >
              {b.logoUrl ? (
                <div className="relative w-16 h-16 grayscale group-hover:grayscale-0 transition-all">
                  <Image src={b.logoUrl} alt={`${b.name} logo`} fill className="object-contain" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold">
                  {b.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium text-black text-center leading-snug">{b.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
