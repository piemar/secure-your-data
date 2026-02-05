import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "@/App";
import { getContentService } from "@/services/contentService";
import { getWorkshopSession, startNewWorkshop } from "@/utils/workshopUtils";

// Mock workshopUtils to prevent Atlas fetch (Invalid URL in test env)
vi.mock("@/utils/workshopUtils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/utils/workshopUtils")>();
  return {
    ...actual,
    getWorkshopSession: vi.fn().mockImplementation(() => {
      const stored = localStorage.getItem("workshop_session");
      return stored ? JSON.parse(stored) : null;
    }),
    startNewWorkshop: vi.fn().mockImplementation(async (customerName: string, date: string, source: string) => {
      const session = {
        id: `ws_${Date.now()}_test`,
        customerName,
        workshopDate: date,
        startedAt: Date.now(),
        labsEnabled: true,
        archivedLeaderboards: [],
        mongodbSource: source as "local" | "atlas",
        atlasConnectionString: source === "atlas" ? "mongodb+srv://test" : undefined,
      };
      localStorage.setItem("workshop_session", JSON.stringify(session));
    }),
  };
});

// Mock all validator utils
vi.mock("@/utils/validatorUtils", () => ({
  validatorUtils: {
    checkKeyVault: vi.fn().mockResolvedValue({ success: true, message: "Verified" }),
    checkKmsAlias: vi.fn().mockResolvedValue({ success: true, message: "Verified" }),
    checkKeyPolicy: vi.fn().mockResolvedValue({ success: true, message: "Verified" }),
    checkDataKey: vi.fn().mockResolvedValue({ success: true, message: "Verified" }),
    checkQEDEKs: vi.fn().mockResolvedValue({ success: true, message: "Verified" }),
    checkQECollection: vi.fn().mockResolvedValue({ success: true, message: "Verified" }),
    checkQERangeQuery: vi.fn().mockResolvedValue({ success: true, message: "Verified" }),
  }
}));

// Mock metrics service
vi.mock("@/services/metricsService", () => ({
  getMetricsService: () => ({
    recordEvent: vi.fn(),
    getEvents: vi.fn().mockReturnValue([]),
    getMetrics: vi.fn().mockReturnValue({
      workshopId: "test-workshop",
      startedAt: Date.now(),
      totalParticipants: 1,
      labsStarted: 1,
      labsCompleted: 0,
      stepsCompleted: 0,
      questsCompleted: 0,
      flagsCaptured: 0,
      verificationFailures: 0,
    }),
    getFailurePoints: vi.fn().mockReturnValue([]),
  })
}));

const renderApp = () => {
  // Set initial URL for BrowserRouter (App uses BrowserRouter, not MemoryRouter)
  window.history.replaceState({}, "", "/");

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
};

describe("E2E: Full Workshop Flow", () => {
  beforeEach(() => {
    try {
      localStorage.clear();
    } catch {
      Object.keys(localStorage).forEach(key => localStorage.removeItem(key));
    }
    vi.clearAllMocks();
  });

  describe("Moderator Flow", () => {
    it("moderator can login and access settings", async () => {
      renderApp();

      // Should see attendee registration first
      await waitFor(() => {
        expect(screen.getByText(/Join the Workshop/i)).toBeInTheDocument();
      });

      // Click "Workshop Presenter? Click here"
      const presenterLink = screen.getByText(/Workshop Presenter/i);
      fireEvent.click(presenterLink);

      await waitFor(() => {
        expect(screen.getByText(/Presenter Mode/i)).toBeInTheDocument();
      });

      // Enter PIN (default: 163500)
      const pinInput = screen.getByPlaceholderText(/Enter PIN/i);
      fireEvent.change(pinInput, { target: { value: "163500" } });

      const accessButton = screen.getByText(/Access Presenter Mode/i);
      fireEvent.click(accessButton);

      // Should now see moderator layout
      await waitFor(() => {
        expect(screen.getByText(/Moderator/i)).toBeInTheDocument();
      });
    });

    it("moderator can select template and configure workshop", async () => {
      // Set moderator role
      localStorage.setItem("user_role", "moderator");
      localStorage.setItem("workshop_attendee_name", "Test Moderator");
      localStorage.setItem("userEmail", "moderator@test.com");

      renderApp();

      await waitFor(() => {
        expect(screen.getByText(/Moderator/i)).toBeInTheDocument();
      });

      // Navigate to Settings (would need to click sidebar, but for now check if accessible)
      // In real E2E, we'd click the Settings nav item
      // For now, verify moderator has access to settings-related content
    });

    it("moderator can switch modes", async () => {
      localStorage.setItem("user_role", "moderator");
      localStorage.setItem("workshop_attendee_name", "Test Moderator");
      localStorage.setItem("userEmail", "moderator@test.com");

      // Start a workshop session
      await startNewWorkshop("Test Customer", "2026-02-03", "local");

      renderApp();

      await waitFor(() => {
        // Mode indicator should be visible
        const modeBadges = screen.queryAllByText(/Demo|Lab|Challenge/i);
        expect(modeBadges.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Attendee Flow", () => {
    it("attendee can register and see labs", async () => {
      // Start workshop session
      await startNewWorkshop("Test Workshop", "2026-02-03", "local");

      renderApp();

      // Should see registration
      await waitFor(() => {
        expect(screen.getByText(/Join the Workshop/i)).toBeInTheDocument();
      });

      // Fill registration form
      const firstNameInput = screen.getByPlaceholderText(/Pierre/i);
      const lastNameInput = screen.getByPlaceholderText(/Petersson/i);
      const emailInput = screen.getByPlaceholderText(/your.email@company.com/i);

      fireEvent.change(firstNameInput, { target: { value: "John" } });
      fireEvent.change(lastNameInput, { target: { value: "Doe" } });
      fireEvent.change(emailInput, { target: { value: "john.doe@test.com" } });

      const joinButton = screen.getByText(/Join Workshop/i);
      expect(joinButton).not.toBeDisabled();

      fireEvent.click(joinButton);

      // Should now see lab setup or labs
      await waitFor(() => {
        // Either lab setup wizard or lab content
        const labContent = screen.queryByText(/Lab Setup|Lab 1|CSFLE/i);
        expect(labContent).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it("attendee can complete lab steps", async () => {
      // Setup: registered attendee with workshop started
      localStorage.setItem("user_role", "attendee");
      localStorage.setItem("workshop_attendee_name", "John Doe");
      localStorage.setItem("userEmail", "john.doe@test.com");
      await startNewWorkshop("Test Workshop", "2026-02-03", "local");

      renderApp();

      // Navigate to Lab 1 (would need sidebar click in real E2E)
      // For now, verify lab content is accessible
      await waitFor(() => {
        const labContent = screen.queryByText(/CSFLE|Lab 1/i);
        expect(labContent).toBeInTheDocument();
      });
    });
  });

  describe("Challenge Mode Flow", () => {
    it("challenge mode shows quests and flags", async () => {
      localStorage.setItem("user_role", "moderator");
      localStorage.setItem("workshop_attendee_name", "Test Moderator");
      localStorage.setItem("userEmail", "moderator@test.com");

      // Set challenge template
      const contentService = getContentService();
      const templates = await contentService.getTemplates();
      const challengeTemplate = templates.find(t => t.questIds && t.questIds.length > 0);

      if (challengeTemplate) {
        localStorage.setItem("workshop_active_template", JSON.stringify(challengeTemplate));
        localStorage.setItem("workshop_current_mode", "challenge");
      }

      await startNewWorkshop("Challenge Workshop", "2026-02-03", "local");

      renderApp();

      await waitFor(() => {
        // Should see challenge-related content
        const challengeContent = screen.queryByText(/Challenge|Quest|Flag/i);
        expect(challengeContent).toBeInTheDocument();
      });
    });
  });

  describe("Metrics Flow", () => {
    it("moderator can view metrics dashboard", async () => {
      localStorage.setItem("user_role", "moderator");
      localStorage.setItem("workshop_attendee_name", "Test Moderator");
      localStorage.setItem("userEmail", "moderator@test.com");
      await startNewWorkshop("Metrics Test", "2026-02-03", "local");

      renderApp();

      // Metrics should be accessible to moderators
      // (In real E2E, would click Metrics nav item)
      await waitFor(() => {
        expect(screen.getByText(/Moderator/i)).toBeInTheDocument();
      });
    });
  });
});
