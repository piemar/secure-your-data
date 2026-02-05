import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "@/App";

// Mock workshopUtils to prevent Atlas fetch (Invalid URL in jsdom)
vi.mock("@/utils/workshopUtils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/utils/workshopUtils")>();
  return {
    ...actual,
    getWorkshopSession: vi.fn().mockReturnValue(null),
  };
});

describe("App flows", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows attendee registration by default for new users", () => {
    render(<App />);
    expect(
      screen.getByText(/Join the Workshop/i)
    ).toBeTruthy();
  });

  it("shows moderator layout when user_role is moderator", () => {
    localStorage.setItem("user_role", "moderator");
    localStorage.setItem("workshop_attendee_name", "Test User");
    localStorage.setItem("userEmail", "test@example.com");

    render(<App />);

    // Moderator badge and sidebar should be visible
    expect(screen.getByText(/Moderator Mode/i)).toBeTruthy();
    expect(screen.getByText(/Presentation/i)).toBeTruthy();
  });
});

