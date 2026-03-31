"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface NavLink {
  href: string;
  label: string;
}

interface HamburgerMenuProps {
  navLinks: NavLink[];
}

export default function HamburgerMenu({ navLinks }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on outside tap (anything that isn't the drawer or the toggle button)
  useEffect(() => {
    if (!isOpen) return;

    function handleOutsideClick(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      const clickedDrawer = drawerRef.current?.contains(target);
      const clickedButton = buttonRef.current?.contains(target);
      if (!clickedDrawer && !clickedButton) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Three-line hamburger button */}
      <button
        ref={buttonRef}
        type="button"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-nav-drawer"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex flex-col justify-center items-center gap-1.5 min-h-[44px] min-w-[44px] p-2 text-black hover:bg-grey-100 rounded transition-colors"
        data-testid="hamburger-button"
      >
        <span
          className={`block w-5 h-0.5 bg-current transition-transform duration-200 ${isOpen ? "translate-y-2 rotate-45" : ""}`}
        />
        <span
          className={`block w-5 h-0.5 bg-current transition-opacity duration-200 ${isOpen ? "opacity-0" : ""}`}
        />
        <span
          className={`block w-5 h-0.5 bg-current transition-transform duration-200 ${isOpen ? "-translate-y-2 -rotate-45" : ""}`}
        />
      </button>

      {/* Backdrop — outside drawerRef so outside-click logic works */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          aria-hidden="true"
          data-testid="drawer-backdrop"
          onMouseDown={() => setIsOpen(false)}
        />
      )}

      {/* Slide-in drawer */}
      <div
        ref={drawerRef}
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        data-testid="mobile-nav-drawer"
        className={`fixed top-0 right-0 h-full w-72 max-w-[85vw] bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-grey-200">
          <span className="font-bold text-lg text-black">UK Realty</span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] text-grey-600 hover:text-black hover:bg-grey-100 rounded transition-colors"
            data-testid="drawer-close-button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav aria-label="Mobile navigation" className="flex flex-col px-4 py-6 gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center min-h-[44px] px-3 text-base font-medium text-grey-700 hover:text-black hover:bg-grey-100 rounded transition-colors"
              data-testid={`mobile-nav-link-${link.label.toLowerCase()}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA at bottom of drawer */}
        <div className="px-4 pt-2 border-t border-grey-200 mx-4">
          <Link
            href="/contact"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center min-h-[44px] w-full px-4 text-sm font-semibold text-white bg-black hover:bg-grey-800 rounded transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </>
  );
}
