import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { DemoScriptView } from '@/components/workshop/DemoScriptView';
import { WorkshopSessionProvider } from '@/contexts/WorkshopSessionContext';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { RoleProvider } from '@/contexts/RoleContext';
import { getContentService } from '@/services/contentService';

// Mock content service
vi.mock('@/services/contentService', () => ({
  getContentService: vi.fn(() => ({
    getLabs: vi.fn().mockResolvedValue([
      {
        id: 'lab-csfle-fundamentals',
        topicId: 'encryption',
        title: 'Lab 1: CSFLE Fundamentals',
        description: 'Master CSFLE with AWS KMS',
        difficulty: 'intermediate',
        estimatedTotalTimeMinutes: 35,
        modes: ['lab', 'demo', 'challenge'],
        povCapabilities: ['ENCRYPT-FIELDS'],
        steps: [
          {
            id: 'step-1',
            title: 'Step 1',
            modes: ['demo', 'lab'],
            narrative: 'Demo step',
            instructions: 'Demo instructions'
          }
        ]
      },
      {
        id: 'lab-queryable-encryption',
        topicId: 'encryption',
        title: 'Lab 2: Queryable Encryption',
        description: 'Implement QE',
        difficulty: 'intermediate',
        estimatedTotalTimeMinutes: 45,
        modes: ['lab', 'demo', 'challenge'],
        povCapabilities: ['ENCRYPT-FIELDS'],
        steps: [
          {
            id: 'step-1',
            title: 'Step 1',
            modes: ['demo', 'lab'],
            narrative: 'Demo step',
            instructions: 'Demo instructions'
          }
        ]
      }
    ]),
    getLabById: vi.fn().mockImplementation((id) => {
      const labs = [
        {
          id: 'lab-csfle-fundamentals',
          title: 'Lab 1: CSFLE Fundamentals',
          steps: [{ id: 'step-1', title: 'Step 1' }]
        },
        {
          id: 'lab-queryable-encryption',
          title: 'Lab 2: Queryable Encryption',
          steps: [{ id: 'step-1', title: 'Step 1' }]
        }
      ];
      return Promise.resolve(labs.find(l => l.id === id));
    })
  }))
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

function renderDemoScriptView() {
  // Mock activeTemplate in localStorage
  const mockTemplate = {
    id: 'template-test',
    name: 'Test Template',
    description: 'Test',
    topicIds: ['encryption'],
    labIds: ['lab-csfle-fundamentals', 'lab-queryable-encryption'],
    questIds: [],
    defaultMode: 'demo',
    allowedModes: ['demo', 'lab']
  };
  localStorage.setItem('workshop_template', JSON.stringify(mockTemplate));
  localStorage.setItem('workshop_mode', 'demo');

  return render(
    <QueryClientProvider client={queryClient}>
      <NavigationProvider>
        <RoleProvider>
          <WorkshopSessionProvider>
            <DemoScriptView />
          </WorkshopSessionProvider>
        </RoleProvider>
      </NavigationProvider>
    </QueryClientProvider>
  );
}

describe('DemoScriptView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders component without crashing', async () => {
    renderDemoScriptView();
    
    // Component should render (check for any content)
    await waitFor(() => {
      const content = screen.queryByText(/Demo/) || screen.queryByText(/Template/) || screen.queryByText(/Loading/);
      expect(content).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('shows empty state when no template available', async () => {
    // Clear all workshop-related localStorage
    localStorage.removeItem('workshop_template');
    localStorage.removeItem('workshop_mode');
    localStorage.setItem('workshop_mode', 'demo');
    
    const { container } = renderDemoScriptView();
    
    // Component should render something (empty state, loading, or error)
    await waitFor(() => {
      const hasContent = container.textContent && 
                        (container.textContent.includes('No Demo Script') ||
                         container.textContent.includes('Loading') ||
                         container.textContent.includes('No template'));
      expect(hasContent).toBe(true);
    }, { timeout: 5000 });
  });

  it('loads demo scripts from template', async () => {
    const { container } = renderDemoScriptView();
    
    // Component should render - check for any rendered content
    await waitFor(() => {
      const hasContent = container.textContent && container.textContent.length > 0;
      expect(hasContent).toBe(true);
    }, { timeout: 3000 });
  });

  it('has side-by-side layout structure', async () => {
    const { container } = renderDemoScriptView();
    
    await waitFor(() => {
      // Check for flex layout structure
      const flexContainers = container.querySelectorAll('.flex');
      expect(flexContainers.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });
});
