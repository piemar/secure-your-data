import { useState, useEffect } from 'react';
import { useWorkshopSession } from '@/contexts/WorkshopSessionContext';
import { useRole } from '@/contexts/RoleContext';
import { WorkshopTemplate } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import { DynamicTemplateBuilder } from './DynamicTemplateBuilder';
import { TemplateBrowser } from './TemplateBrowser';

interface TemplateSelectionWizardProps {
  onComplete: () => void;
  onCancel?: () => void;
  onUseDynamicBuilder?: () => void;
}

export function TemplateSelectionWizard({ onComplete, onCancel, onUseDynamicBuilder }: TemplateSelectionWizardProps) {
  const [useDynamicBuilder, setUseDynamicBuilder] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const { isModerator } = useRole();
  const { setActiveTemplate, setWorkshopInstance, activeTemplate } = useWorkshopSession();

  useEffect(() => {
    setSelectedTemplateId(activeTemplate?.id || null);
  }, [activeTemplate?.id]);

  const handleSelectTemplate = (template: WorkshopTemplate) => {
    setSelectedTemplateId(template.id);
    setActiveTemplate(template);
    setWorkshopInstance({
      id: `workshop-${Date.now()}`,
      templateId: template.id,
      createdAt: new Date(),
      mode: template.defaultMode,
    });
  };

  const handleComplete = () => {
    if (selectedTemplateId) {
      onComplete();
    }
  };

  // Only moderators can access this wizard
  if (!isModerator) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Template selection is only available to moderators.
          </p>
        </CardContent>
      </Card>
    );
  }

  // If user wants to use dynamic builder, show that instead
  if (useDynamicBuilder) {
    return (
      <DynamicTemplateBuilder
        onComplete={(template) => {
          setUseDynamicBuilder(false);
          onComplete();
        }}
        onCancel={() => {
          setUseDynamicBuilder(false);
          onCancel?.();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Select Workshop Template</CardTitle>
          <CardDescription>
            Choose a pre-built template or build a custom one. Search and paginate for faster browsing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TemplateBrowser
            onSelectTemplate={handleSelectTemplate}
            pageSize={8}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wand2 className="w-4 h-4" />
            Build Custom Template
          </CardTitle>
          <CardDescription>
            Create a custom workshop by selecting topics and labs dynamically
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => setUseDynamicBuilder(true)}
            className="w-full"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Build Custom Template
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          onClick={handleComplete}
          disabled={!selectedTemplateId}
        >
          Start Workshop
        </Button>
      </div>
    </div>
  );
}
