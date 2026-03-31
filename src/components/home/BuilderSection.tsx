"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Builder } from "@/lib/types";

function BuilderCard({ builder }: { builder: Builder }) {
  return (
    <Link
      href={`/listings?builder=${encodeURIComponent(builder.slug)}`}
      className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-grey-200 rounded-lg hover:border-black hover:shadow-sm transition-all group min-h-[120px]"
      aria-label={`Browse listings by ${builder.name}`}
    >
      {builder.logoUrl ? (
        <div className="relative w-16 h-16 grayscale group-hover:grayscale-0 transition-all">
          <Image
            src={builder.logoUrl}
            alt={`${builder.name} logo`}
            fill
            className="object-contain"
          />
        </div>
      ) : (
        <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold">
          {builder.name.charAt(0).toUpperCase()}
        </div>
      )}
      <span className="text-sm font-medium text-black text-center leading-snug">
        {builder.name}
      </span>
    </Link>
  );
}

export default function BuilderSection() {
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/builders")
      .then((r) => r.json())
      .then((data) => setBuilders(data.builders ?? []))
      .catch(() => setBuilders([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && builders.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-grey-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-black">Browse by Builder</h2>
          <p className="text-grey-500 text-sm mt-1">Explore properties from top developers</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[120px] bg-grey-200 rounded-lg animate-pulse"
                  aria-hidden="true"
                />
              ))
            : builders.map((b) => <BuilderCard key={b.id} builder={b} />)}
        </div>
      </div>
    </section>
  );
}
