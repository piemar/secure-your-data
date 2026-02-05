import { describe, it, expect, beforeEach, vi } from "vitest";
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LabRunner } from "@/labs/LabRunner";
import { LabProvider } from "@/context/LabContext";
import { WorkshopSessionProvider } from "@/contexts/WorkshopSessionContext";
import { RoleProvider } from "@/contexts/RoleContext";

vi.mock("@/utils/workshopUtils", () => ({
  getWorkshopSession: vi.fn().mockReturnValue(null),
  startNewWorkshop: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/utils/validatorUtils", () => ({
  validatorUtils: {
    checkKeyVault: vi.fn().mockResolvedValue({ success: true, message: "Key vault verified" }),
    checkDataKey: vi.fn().mockResolvedValue({ success: true, message: "DEK exists" }),
  }
}));

// Mock LabContext to avoid workshop session fetch (same pattern as Lab1CSFLE)
vi.mock("@/context/LabContext", () => ({
  LabProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useLab: () => ({
    mongoUri: "mongodb://localhost:27017",
    awsRegion: "us-east-1",
    verifiedTools: {
      suffix: { verified: true, path: "test-suffix" },
      mongoCryptShared: { verified: true, path: "/path/to/mongo_crypt_v1.so" },
    },
    setMongoUri: vi.fn(),
    setAwsCredentials: vi.fn(),
    setAwsKeyArn: vi.fn(),
    completeStep: vi.fn(),
    setVerifiedTool: vi.fn(),
    setUserSuffix: vi.fn(),
    setUserEmail: vi.fn(),
    completeLab: vi.fn(),
    startLab: vi.fn(),
    isLabCompleted: vi.fn().mockReturnValue(false),
    isLabAccessible: vi.fn().mockReturnValue(true),
    resetProgress: vi.fn(),
    currentScore: 0,
    completedSteps: [],
    assistedSteps: [],
    userSuffix: "test-suffix",
    userEmail: "test@example.com",
    completedLabs: [],
    labStartTimes: {},
  }),
}));

const renderLab = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <RoleProvider>
        <WorkshopSessionProvider>
          <LabProvider>
            <LabRunner labNumber={3} labId="lab-right-to-erasure" />
          </LabProvider>
        </WorkshopSessionProvider>
      </RoleProvider>
    </QueryClientProvider>
  );
};

const renderLabAndGoToSteps = async () => {
  renderLab();

  // Wait for lab to load and switch to Steps tab (atomic to avoid race)
  await waitFor(
    () => {
      const titles = screen.getAllByText(/Lab 3|Right to Erasure/i);
      expect(titles.length).toBeGreaterThan(0);
      const tabs = screen.getAllByRole("tab");
      expect(tabs.length).toBeGreaterThanOrEqual(2);
      fireEvent.click(tabs[1]);
    },
    { timeout: 5000 }
  );
};

describe("Lab 3: Right to Erasure", () => {
  beforeEach(() => {
    try {
      localStorage.clear();
    } catch {
      Object.keys(localStorage).forEach(key => localStorage.removeItem(key));
    }
    vi.clearAllMocks();
  });

  it("renders lab title and first step", async () => {
    renderLab();

    await waitFor(() => {
      const labTitles = screen.getAllByText(/Lab 3|Right to Erasure/i);
      expect(labTitles.length).toBeGreaterThan(0);
    });
  });

  it("shows migration-specific content", async () => {
    await renderLabAndGoToSteps();

    const stepLabels = screen.getAllByText(/Step/i);
    expect(stepLabels.length).toBeGreaterThan(0);
  });

  it("displays GDPR/right-to-erasure concepts", async () => {
    await renderLabAndGoToSteps();

    const matches = screen.getAllByText(/migration|GDPR|crypto|Explicit|Multi-Tenant|Crypto-Shredding/i);
    expect(matches.length).toBeGreaterThan(0);
  });
});
