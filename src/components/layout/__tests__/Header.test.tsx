/**
 * Tests for <Header>
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "../Header";

// Mock next-auth
vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  signOut: vi.fn(),
}));

describe("Header", () => {
  it("renders the logo", () => {
    render(<Header />);
    expect(screen.getAllByText("UK Realty").length).toBeGreaterThan(0);
  });

  it("renders desktop nav links", () => {
    render(<Header />);
    expect(screen.getAllByText("Home").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Listings").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Builders").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Contact").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Saved").length).toBeGreaterThan(0);
  });

  it("renders hamburger menu", () => {
    render(<Header />);
    expect(screen.getByTestId("hamburger-button")).toBeInTheDocument();
  });

  it("renders login link when not authenticated", () => {
    render(<Header />);
    expect(screen.getByText("Login")).toBeInTheDocument();
  });
});
