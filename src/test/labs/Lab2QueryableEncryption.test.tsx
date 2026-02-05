import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Lab2QueryableEncryption } from "@/components/labs/Lab2QueryableEncryption";
import { LabProvider } from "@/context/LabContext";
import { WorkshopSessionProvider } from "@/contexts/WorkshopSessionContext";
import { RoleProvider } from "@/contexts/RoleContext";

// Mock workshopUtils to prevent Atlas fetch (Invalid URL in test env)
vi.mock("@/utils/workshopUtils", () => ({
  getWorkshopSession: vi.fn().mockReturnValue(null),
  startNewWorkshop: vi.fn().mockResolvedValue(undefined),
}));

// Mock LabContext to provide default values (matches Lab1CSFLE pattern)
vi.mock("@/context/LabContext", () => ({
  LabProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useLab: () => ({
    mongoUri: "mongodb://localhost:27017",
    awsAccessKeyId: "test-key",
    awsSecretAccessKey: "test-secret",
    awsKeyArn: "arn:aws:kms:us-east-1:123456789012:key/test-key",
    awsRegion: "us-east-1",
    verifiedTools: {},
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
    userSuffix: "test",
    userEmail: "test@example.com",
    completedLabs: [],
    labStartTimes: {},
  }),
}));

vi.mock("@/utils/validatorUtils", () => ({
  validatorUtils: {
    checkQEDEKs: vi.fn().mockResolvedValue({ success: true, message: "QE DEKs verified" }),
    checkQECollection: vi.fn().mockResolvedValue({ success: true, message: "QE collection verified" }),
    checkQEMetadata: vi.fn().mockResolvedValue({ success: true, message: "QE metadata verified" }),
    checkQERangeQuery: vi.fn().mockResolvedValue({ success: true, message: "Range query verified" }),
  }
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
            <Lab2QueryableEncryption />
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
      expect(screen.getByText(/Lab 2: Queryable Encryption/i)).toBeInTheDocument();
      const tabs = screen.getAllByRole("tab");
      expect(tabs.length).toBeGreaterThanOrEqual(2);
      fireEvent.click(tabs[1]);
    },
    { timeout: 5000 }
  );
};

describe("Lab 2: Queryable Encryption", () => {
  beforeEach(() => {
    try {
      localStorage.clear();
    } catch {
      Object.keys(localStorage).forEach(key => localStorage.removeItem(key));
    }
    vi.clearAllMocks();
  });

  it("renders lab 2 title in the overview tab", async () => {
    renderLab();

    await waitFor(() => {
      expect(
        screen.getByText(/Lab 2: Queryable Encryption/i)
      ).toBeInTheDocument();
    });
  });

  it("can navigate to the steps for lab 2", async () => {
    await renderLabAndGoToSteps();

    const stepLabels = screen.getAllByText(/Step/i);
    expect(stepLabels.length).toBeGreaterThan(0);
  });
});
