import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LabRunner } from '@/labs/LabRunner';
import { LabProvider } from '@/context/LabContext';
import { WorkshopSessionProvider } from '@/contexts/WorkshopSessionContext';
import { RoleProvider } from '@/contexts/RoleContext';

vi.mock('@/utils/workshopUtils', () => ({
  getWorkshopSession: vi.fn().mockReturnValue(null),
  startNewWorkshop: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/context/LabContext', () => ({
  LabProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useLab: () => ({
    mongoUri: 'mongodb://localhost:27017',
    awsRegion: 'us-east-1',
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
    userSuffix: 'test-suffix',
    userEmail: 'test@example.com',
    completedLabs: [],
    labStartTimes: {},
  }),
}));

/**
 * Verifies that content-driven labs (with enhancementId) render code blocks.
 * Tests lab-rich-query-encrypted-vs-plain and lab-full-recovery-rto-overview.
 */
const renderLab = (labId: string, labNumber: number) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <RoleProvider>
        <WorkshopSessionProvider>
          <LabProvider>
            <LabRunner labNumber={labNumber} labId={labId} />
          </LabProvider>
        </WorkshopSessionProvider>
      </RoleProvider>
    </QueryClientProvider>
  );
};

describe('Content-driven labs render code blocks', () => {
  beforeEach(() => {
    try {
      localStorage.clear();
    } catch {
      Object.keys(localStorage).forEach((key) => localStorage.removeItem(key));
    }
    vi.clearAllMocks();
  });

  it('lab-rich-query-encrypted-vs-plain shows code in steps', async () => {
    renderLab('lab-rich-query-encrypted-vs-plain', 1);

    await waitFor(() => expect(screen.queryByText(/Loading lab/i)).not.toBeInTheDocument(), {
      timeout: 5000,
    });

    const tabs = screen.queryAllByRole('tab');
    if (tabs.length >= 2) fireEvent.click(tabs[1]);

    await waitFor(
      () => {
        const codeContent = screen.getAllByText(/db\.|find|aggregate|encrypted|CSFLE|QE/i);
        expect(codeContent.length).toBeGreaterThan(0);
      },
      { timeout: 5000 }
    );
  });

  it('lab-full-recovery-rto-overview shows code in steps', async () => {
    renderLab('lab-full-recovery-rto-overview', 1);

    await waitFor(
      () => {
        expect(screen.queryByText(/Loading lab/i)).not.toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    const tabs = screen.getAllByRole('tab');
    if (tabs.length >= 2) {
      fireEvent.click(tabs[1]);
    }

    await waitFor(
      () => {
        // Should show RTO/concepts code
        const codeContent = screen.getAllByText(/RTO|Restore|Backup|snapshot/i);
        expect(codeContent.length).toBeGreaterThan(0);
      },
      { timeout: 5000 }
    );
  });

  it('lab-analytics-overview shows code in steps', async () => {
    renderLab('lab-analytics-overview', 1);

    await waitFor(
      () => {
        expect(screen.queryByText(/Loading lab/i)).not.toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    const tabs = screen.getAllByRole('tab');
    if (tabs.length >= 2) {
      fireEvent.click(tabs[1]);
    }

    await waitFor(
      () => {
        // Should show aggregation/stages code
        const codeContent = screen.getAllByText(/\$match|\$group|aggregate|pipeline/i);
        expect(codeContent.length).toBeGreaterThan(0);
      },
      { timeout: 5000 }
    );
  });
});
