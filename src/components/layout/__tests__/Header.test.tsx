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
    expect(screen.getByText("UK Realty")).toBeInTheDocument();
  });

  it("renders desktop nav links", () => {
    render(<Header />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Listings")).toBeInTheDocument();
    expect(screen.getByText("Builders")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
    expect(screen.getByText("Saved")).toBeInTheDocument();
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