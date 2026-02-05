import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { Lab1CSFLE } from "@/components/labs/Lab1CSFLE";
import { LabProvider } from "@/context/LabContext";
import { WorkshopSessionProvider } from "@/contexts/WorkshopSessionContext";
import { RoleProvider } from "@/contexts/RoleContext";

// Mock workshopUtils to prevent Atlas fetch (Invalid URL in test env)
vi.mock("@/utils/workshopUtils", () => ({
  getWorkshopSession: vi.fn().mockReturnValue(null),
  startNewWorkshop: vi.fn().mockResolvedValue(undefined),
}));

// Mock validatorUtils to avoid network calls
vi.mock("@/utils/validatorUtils", () => ({
  validatorUtils: {
    checkKeyVault: vi.fn().mockResolvedValue({ success: true, message: "Key vault verified" }),
    checkKmsAlias: vi.fn().mockResolvedValue({ success: true, message: "KMS alias exists" }),
    checkKeyPolicy: vi.fn().mockResolvedValue({ success: true, message: "Key policy verified" }),
    checkDataKey: vi.fn().mockResolvedValue({ success: true, message: "DEK exists" }),
    checkKeyVaultCount: vi.fn().mockResolvedValue({ success: true, message: "Count verified" }),
  }
}));

// Mock LabContext to provide default values
vi.mock("@/context/LabContext", () => ({
  LabProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useLab: () => ({
    mongoUri: "mongodb://localhost:27017",
    awsAccessKeyId: "test-key",
    awsSecretAccessKey: "test-secret",
    awsKeyArn: "arn:aws:kms:us-east-1:123456789012:key/test-key",
    awsRegion: "us-east-1",
    verifiedTools: {
      suffix: { verified: true, path: "test-suffix" },
      mongoCryptShared: { verified: true, path: "/path/to/mongo_crypt_v1.so" },
      awsCli: { verified: true, path: "/usr/bin/aws" },
      mongosh: { verified: true, path: "/usr/bin/mongosh" },
      node: { verified: true, path: "/usr/bin/node" },
      npm: { verified: true, path: "/usr/bin/npm" }
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
    labStartTimes: {}
  })
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
            <Lab1CSFLE />
          </LabProvider>
        </WorkshopSessionProvider>
      </RoleProvider>
    </QueryClientProvider>
  );
};

const renderLabAndGoToSteps = async () => {
  renderLab();

  // Wait for lab to fully load (ContentService + enhancements are async)
  await waitFor(
    () => {
      expect(screen.getByText(/Lab 1: CSFLE Fundamentals/i)).toBeInTheDocument();
      const tabs = screen.getAllByRole("tab");
      expect(tabs.length).toBeGreaterThanOrEqual(2);
    },
    { timeout: 5000 }
  );

  // Switch to the Steps tab where step content is rendered
  const tabs = screen.getAllByRole("tab");
  fireEvent.click(tabs[1]);
};

describe("Lab 1: CSFLE Fundamentals", () => {
  beforeEach(() => {
    // Clear localStorage (handle both clear() and manual clearing)
    try {
      localStorage.clear();
    } catch {
      // If clear() doesn't exist, manually clear
      Object.keys(localStorage).forEach(key => localStorage.removeItem(key));
    }
    vi.clearAllMocks();
  });

  it("renders lab title in the overview tab", async () => {
    renderLab();

    // Wait for lab to load (ContentService + enhancements are async)
    await waitFor(
      () => {
        expect(screen.getByText(/Lab 1: CSFLE Fundamentals/i)).toBeInTheDocument();
        expect(screen.getByText(/Overview/i)).toBeInTheDocument();
        expect(screen.getByText(/Steps/i)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("allows switching to the Steps tab", async () => {
    await renderLabAndGoToSteps();

    // After switching, the Steps tab is active and we render at least one step header
    const stepLabels = screen.getAllByText(/Step/i);
    expect(stepLabels.length).toBeGreaterThan(0);
  });
});
