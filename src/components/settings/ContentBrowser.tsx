import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Beaker, LayoutTemplate } from 'lucide-react';
import { LabPoolBrowser } from './LabPoolBrowser';
import { TemplateBrowser } from './TemplateBrowser';
import { WorkshopTemplate } from '@/types';

export type BrowseMode = 'labs' | 'workshops';

const PAGE_SIZE = 10;

export interface ContentBrowserProps {
  /** Called when user selects a single lab (e.g. to test it) */
  onAddLab?: (labId: string) => void;
  /** Called when user selects multiple labs to test. Enables multi-select UI with Select All. */
  onTestLabs?: (labIds: string[]) => void;
  /** Called when user selects a workshop template */
  onSelectTemplate?: (template: WorkshopTemplate) => void;
  /** Optional: pre-selected topic IDs for lab filtering */
  selectedTopicIds?: string[];
  /** Optional: pre-selected lab IDs (to exclude from results) */
  selectedLabIds?: string[];
  /** Optional: default browse mode */
  defaultMode?: BrowseMode;
}

/**
 * ContentBrowser - Unified browse for Labs and Workshop Templates.
 *
 * Allows moderators to switch between browsing labs (for testing) or workshops
 * (templates), with search, filters, and pagination for performance.
 */
export const ContentBrowser: React.FC<ContentBrowserProps> = ({
  onAddLab,
  onTestLabs,
  onSelectTemplate,
  selectedTopicIds = [],
  selectedLabIds = [],
  defaultMode = 'labs',
}) => {
  const [browseMode, setBrowseMode] = useState<BrowseMode>(defaultMode);

  return (
    <div className="space-y-4">
      <Tabs value={browseMode} onValueChange={(v) => setBrowseMode(v as BrowseMode)}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="labs" className="flex items-center gap-2">
            <Beaker className="w-4 h-4" />
            Labs
          </TabsTrigger>
          <TabsTrigger value="workshops" className="flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4" />
            Workshops
          </TabsTrigger>
        </TabsList>

        <TabsContent value="labs" className="mt-4">
          <LabPoolBrowser
            selectedTopicIds={selectedTopicIds}
            selectedLabIds={selectedLabIds}
            onAddLab={onAddLab}
            onTestLabs={onTestLabs}
            pageSize={PAGE_SIZE}
          />
        </TabsContent>

        <TabsContent value="workshops" className="mt-4">
          <TemplateBrowser
            onSelectTemplate={onSelectTemplate}
            pageSize={PAGE_SIZE}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
