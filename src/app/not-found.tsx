import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl font-bold text-grey-200 mb-4">404</p>
      <h1 className="text-2xl font-bold text-black mb-2">Page not found</h1>
      <p className="text-grey-500 text-sm mb-8 max-w-sm">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-black rounded hover:bg-grey-800 transition-colors min-h-[44px]"
      >
        Back to homepage
      </Link>
    </div>
  );
}
