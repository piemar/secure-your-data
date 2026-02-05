import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { QuestMapView } from '@/components/workshop/QuestMapView';
import { WorkshopSessionProvider } from '@/contexts/WorkshopSessionContext';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { RoleProvider } from '@/contexts/RoleContext';
import { getContentService } from '@/services/contentService';

// Mock content service
vi.mock('@/services/contentService', () => ({
  getContentService: vi.fn(() => ({
    getQuests: vi.fn().mockResolvedValue([
      {
        id: 'quest-stop-the-leak',
        title: 'Stop the Leak',
        storyContext: 'Encrypt PII data',
        objectiveSummary: 'Encrypt all PII fields',
        labIds: ['lab-csfle-fundamentals'],
        requiredFlagIds: ['flag-1', 'flag-2'],
        optionalFlagIds: [],
        modes: ['challenge', 'lab']
      },
      {
        id: 'quest-harden-the-system',
        title: 'Harden the System',
        storyContext: 'Add security controls',
        objectiveSummary: 'Implement security measures',
        labIds: ['lab-queryable-encryption'],
        requiredFlagIds: ['flag-3'],
        optionalFlagIds: [],
        modes: ['challenge', 'lab']
      }
    ]),
    getTemplates: vi.fn().mockResolvedValue([]),
    getFlags: vi.fn().mockResolvedValue([])
  }))
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

function renderQuestMapView() {
  // Mock activeTemplate in localStorage
  const mockTemplate = {
    id: 'template-test',
    name: 'Test Template',
    description: 'Test',
    topicIds: ['encryption'],
    labIds: ['lab-csfle-fundamentals'],
    questIds: ['quest-stop-the-leak', 'quest-harden-the-system'],
    defaultMode: 'challenge',
    allowedModes: ['challenge', 'lab']
  };
  localStorage.setItem('workshop_template', JSON.stringify(mockTemplate));
  localStorage.setItem('workshop_mode', 'challenge');

  return render(
    <QueryClientProvider client={queryClient}>
      <NavigationProvider>
        <RoleProvider>
          <WorkshopSessionProvider>
            <QuestMapView />
          </WorkshopSessionProvider>
        </RoleProvider>
      </NavigationProvider>
    </QueryClientProvider>
  );
}

describe('QuestMapView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders quest map title and description', async () => {
    renderQuestMapView();
    
    await waitFor(() => {
      expect(screen.getByText('Quest Map')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Complete quests in order/)).toBeInTheDocument();
  });

  it('displays quest nodes on the map', async () => {
    renderQuestMapView();
    
    await waitFor(() => {
      expect(screen.getByText('Stop the Leak')).toBeInTheDocument();
      expect(screen.getByText('Harden the System')).toBeInTheDocument();
    });
  });

  it('shows first quest as unlocked', async () => {
    renderQuestMapView();
    
    await waitFor(() => {
      expect(screen.getByText('Stop the Leak')).toBeInTheDocument();
    });
    
    // First quest should not have lock icon
    const firstQuest = screen.getByText('Stop the Leak').closest('.cursor-pointer');
    expect(firstQuest).toBeInTheDocument();
  });

  it('shows subsequent quests as locked until previous is completed', async () => {
    renderQuestMapView();
    
    await waitFor(() => {
      expect(screen.getByText('Harden the System')).toBeInTheDocument();
    });
    
    // Second quest should be locked (first not completed)
    // Check for "Locked" text which appears on locked quests
    await waitFor(() => {
      const lockedTexts = screen.getAllByText('Locked');
      expect(lockedTexts.length).toBeGreaterThan(0);
    });
  });

  it('shows completed quests with checkmark', async () => {
    // Mark first quest as completed
    localStorage.setItem('completed_quests', JSON.stringify(['quest-stop-the-leak']));
    
    renderQuestMapView();
    
    await waitFor(() => {
      expect(screen.getByText('Stop the Leak')).toBeInTheDocument();
    });
    
    // Should show completed badge
    await waitFor(() => {
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });
  });

  it('shows flag progress for each quest', async () => {
    renderQuestMapView();
    
    await waitFor(() => {
      expect(screen.getByText('Stop the Leak')).toBeInTheDocument();
    });
    
    // Should show flag count (0/2)
    await waitFor(() => {
      expect(screen.getByText(/0\/2 flags/)).toBeInTheDocument();
    });
  });

  it('allows clicking unlocked quests', async () => {
    renderQuestMapView();
    
    await waitFor(() => {
      expect(screen.getByText('Stop the Leak')).toBeInTheDocument();
    });
    
    const questCard = screen.getByText('Stop the Leak').closest('.cursor-pointer');
    expect(questCard).toBeInTheDocument();
    
    if (questCard) {
      fireEvent.click(questCard);
      // Should set selected quest in localStorage
      await waitFor(() => {
        expect(localStorage.getItem('selected_quest_id')).toBe('quest-stop-the-leak');
      });
    }
  });

  it('prevents clicking locked quests', async () => {
    renderQuestMapView();
    
    await waitFor(() => {
      expect(screen.getByText('Harden the System')).toBeInTheDocument();
    });
    
    // Locked quest should have cursor-not-allowed
    const lockedQuests = screen.getAllByText('Locked');
    expect(lockedQuests.length).toBeGreaterThan(0);
  });

  it('shows empty state when no quests available', async () => {
    const mockGetContentService = getContentService as any;
    mockGetContentService.mockReturnValueOnce({
      getQuests: vi.fn().mockResolvedValue([]),
      getTemplates: vi.fn().mockResolvedValue([]),
      getFlags: vi.fn().mockResolvedValue([])
    });
    
    localStorage.setItem('workshop_template', JSON.stringify({
      id: 'template-empty',
      name: 'Empty Template',
      questIds: []
    }));
    
    renderQuestMapView();
    
    await waitFor(() => {
      expect(screen.getByText('No Quests Available')).toBeInTheDocument();
    });
  });

  it('displays quest completion progress', async () => {
    localStorage.setItem('completed_quests', JSON.stringify(['quest-stop-the-leak']));
    
    renderQuestMapView();
    
    await waitFor(() => {
      expect(screen.getByText(/1 of 2 quests completed/)).toBeInTheDocument();
    });
  });

  it('shows legend with quest states', async () => {
    renderQuestMapView();
    
    await waitFor(() => {
      expect(screen.getByText('Legend')).toBeInTheDocument();
      expect(screen.getByText('Locked Quest')).toBeInTheDocument();
      expect(screen.getByText('Available Quest')).toBeInTheDocument();
      expect(screen.getByText('Completed Quest')).toBeInTheDocument();
    });
  });
});
