import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TopicLabBundlePanel } from '@/components/settings/TopicLabBundlePanel';

vi.mock('@/services/contentService', () => ({
  getContentService: () => ({
    getTopics: () => Promise.resolve([]),
    getLabsByTopic: () => Promise.resolve([])
  })
}));

describe('TopicLabBundlePanel', () => {
  beforeEach(() => {
    localStorage.clear?.();
  });

  it('shows message to select topics when no topics selected', async () => {
    render(
      <TopicLabBundlePanel
        selectedTopicIds={[]}
        selectedLabIds={[]}
        onLabIdsChange={() => {}}
      />
    );
    await screen.findByText(/Select topics in Step 1 to see their lab bundles/i);
    expect(screen.getByText(/Select topics in Step 1 to see their lab bundles/i)).toBeTruthy();
  });

  it('shows Labs by topic (bundle) heading when topics are selected', async () => {
    vi.doMock('@/services/contentService', () => ({
      getContentService: () => ({
        getTopics: () =>
          Promise.resolve([{ id: 'encryption', name: 'Encryption', description: 'Encryption topic' }]),
        getLabsByTopic: () => Promise.resolve([]),
        getPovCapabilities: () => Promise.resolve([]),
      }),
    }));

    render(
      <TopicLabBundlePanel
        selectedTopicIds={['encryption']}
        selectedLabIds={[]}
        onLabIdsChange={() => {}}
      />
    );

    const heading = await screen.findByText(/Labs by topic \(bundle\)/i);
    expect(heading).toBeTruthy();
  });
});
