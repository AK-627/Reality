import { Suspense } from "react";
import HeroSection from "@/components/home/HeroSection";
import FeaturedListings from "@/components/home/FeaturedListings";
import BuilderSection from "@/components/home/BuilderSection";
import ServicesSection from "@/components/home/ServicesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import RecentlyViewedSection from "@/components/home/RecentlyViewedSection";
import { ListingCardSkeleton } from "@/components/listings/ListingCard";

function FeaturedListingsFallback() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-7 w-48 bg-grey-200 rounded animate-pulse" />
            <div className="h-4 w-36 bg-grey-200 rounded animate-pulse mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Suspense fallback={<FeaturedListingsFallback />}>
        <FeaturedListings />
      </Suspense>
      <ServicesSection />
      <BuilderSection />
      <TestimonialsSection />
      <RecentlyViewedSection />
    </>
  );
}
