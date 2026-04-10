"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import HamburgerMenu from "./HamburgerMenu";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/listings", label: "Listings" },
  { href: "/builders", label: "Builders" },
  { href: "/contact", label: "Contact" },
  { href: "/saved", label: "Saved" },
];

function AuthControls() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="w-16 h-5 bg-grey-200 rounded animate-pulse" />;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-grey-700 dark:text-white truncate max-w-[120px]">
          {session.user.name}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm font-medium text-grey-600 dark:text-white hover:text-black dark:hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/auth"
      className="text-sm font-medium text-grey-600 dark:text-white hover:text-black dark:hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center"
    >
      Login
    </Link>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-grey-900 border-b border-grey-200 dark:border-grey-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0 font-bold text-xl tracking-tight text-black dark:text-white"
          >
            UK Realty
          </Link>

          {/* Desktop nav — hidden below 768px */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Primary navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-grey-600 dark:text-white hover:text-black dark:hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop right controls — hidden below 768px */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <AuthControls />
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-black hover:bg-grey-800 dark:bg-white dark:text-black dark:hover:bg-grey-100 transition-colors rounded min-h-[44px]"
            >
              Contact Us
            </Link>
          </div>

          {/* Hamburger — visible ONLY below 768px */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <HamburgerMenu navLinks={navLinks} />
          </div>
        </div>
      </div>
    </header>
  );
}
