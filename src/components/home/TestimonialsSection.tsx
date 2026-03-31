const testimonials = [
  {
    id: 1,
    quote:
      "UK Realty made finding our dream apartment in Whitefield incredibly easy. The team was professional and the listings were accurate and up to date.",
    name: "Priya Sharma",
    location: "Whitefield, Bangalore",
  },
  {
    id: 2,
    quote:
      "I was looking for a commercial space for my startup and UK Realty found us the perfect office in Koramangala within two weeks. Highly recommended.",
    name: "Arjun Mehta",
    location: "Koramangala, Bangalore",
  },
  {
    id: 3,
    quote:
      "The property search filters saved me so much time. I could narrow down exactly what I needed and the agent was responsive throughout the process.",
    name: "Deepa Nair",
    location: "Indiranagar, Bangalore",
  },
];

function QuoteIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-8 h-8 text-grey-200"
      aria-hidden="true"
    >
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
    </svg>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="py-16 px-4 bg-grey-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold">What Our Clients Say</h2>
          <p className="text-grey-400 text-sm mt-2">
            Trusted by hundreds of buyers and investors across Bangalore
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <blockquote
              key={t.id}
              className="flex flex-col gap-4 p-6 bg-grey-800 rounded-lg border border-grey-700"
            >
              <QuoteIcon />
              <p className="text-sm text-grey-200 leading-relaxed flex-1">{t.quote}</p>
              <footer className="mt-2">
                <cite className="not-italic">
                  <span className="block text-sm font-semibold text-white">{t.name}</span>
                  <span className="block text-xs text-grey-400">{t.location}</span>
                </cite>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
