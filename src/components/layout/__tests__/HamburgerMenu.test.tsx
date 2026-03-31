import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import HamburgerMenu from "../HamburgerMenu";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/listings", label: "Listings" },
  { href: "/contact", label: "Contact" },
];

describe("HamburgerMenu", () => {
  it("renders the hamburger button", () => {
    render(<HamburgerMenu navLinks={navLinks} />);
    expect(screen.getByTestId("hamburger-button")).toBeInTheDocument();
  });

  it("drawer is not visible initially", () => {
    render(<HamburgerMenu navLinks={navLinks} />);
    const drawer = screen.getByTestId("mobile-nav-drawer");
    // Drawer exists in DOM but is translated off-screen (translate-x-full)
    expect(drawer).toHaveClass("translate-x-full");
  });

  it("opens the drawer when hamburger button is tapped", () => {
    render(<HamburgerMenu navLinks={navLinks} />);
    const button = screen.getByTestId("hamburger-button");
    fireEvent.click(button);
    const drawer = screen.getByTestId("mobile-nav-drawer");
    expect(drawer).toHaveClass("translate-x-0");
    expect(drawer).not.toHaveClass("translate-x-full");
  });

  it("shows all nav links inside the drawer when open", () => {
    render(<HamburgerMenu navLinks={navLinks} />);
    fireEvent.click(screen.getByTestId("hamburger-button"));
    expect(screen.getByTestId("mobile-nav-link-home")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-nav-link-listings")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-nav-link-contact")).toBeInTheDocument();
  });

  it("closes the drawer when a nav link is tapped", () => {
    render(<HamburgerMenu navLinks={navLinks} />);
    fireEvent.click(screen.getByTestId("hamburger-button"));
    // Drawer is open
    expect(screen.getByTestId("mobile-nav-drawer")).toHaveClass("translate-x-0");
    // Click a link
    fireEvent.click(screen.getByTestId("mobile-nav-link-home"));
    // Drawer should close
    expect(screen.getByTestId("mobile-nav-drawer")).toHaveClass("translate-x-full");
  });

  it("closes the drawer when the close button is tapped", () => {
    render(<HamburgerMenu navLinks={navLinks} />);
    fireEvent.click(screen.getByTestId("hamburger-button"));
    expect(screen.getByTestId("mobile-nav-drawer")).toHaveClass("translate-x-0");
    fireEvent.click(screen.getByTestId("drawer-close-button"));
    expect(screen.getByTestId("mobile-nav-drawer")).toHaveClass("translate-x-full");
  });

  it("closes the drawer when clicking outside (backdrop)", () => {
    render(<HamburgerMenu navLinks={navLinks} />);
    fireEvent.click(screen.getByTestId("hamburger-button"));
    expect(screen.getByTestId("mobile-nav-drawer")).toHaveClass("translate-x-0");
    // Simulate outside click via backdrop
    const backdrop = screen.getByTestId("drawer-backdrop");
    fireEvent.mouseDown(backdrop);
    expect(screen.getByTestId("mobile-nav-drawer")).toHaveClass("translate-x-full");
  });

  it("toggles aria-expanded on the hamburger button", () => {
    render(<HamburgerMenu navLinks={navLinks} />);
    const button = screen.getByTestId("hamburger-button");
    expect(button).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
  });
});
