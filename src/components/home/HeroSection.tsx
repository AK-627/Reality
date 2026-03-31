import SearchBar from "./SearchBar";

export default function HeroSection() {
  return (
    <section className="w-full bg-black text-white py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
          Find Your Perfect Property in Bangalore
        </h1>
        <p className="text-lg text-grey-300 mb-10">
          Browse premium apartments, villas, plots and commercial spaces
        </p>
        <SearchBar
          placeholder="Search by location, property name..."
          className="max-w-2xl mx-auto"
        />
      </div>
    </section>
  );
}
