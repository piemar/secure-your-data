import { useEffect, useState } from 'react';
import { LabViewWithTabs, Step, LabIntroContent } from '@/components/labs/LabViewWithTabs';
import { getContentService } from '@/services/contentService';
import { mapLabDefinitionToSteps, mapLabDefinitionToIntroContent } from './labContentMapper';
import { WorkshopLabDefinition, LabContextOverlay, WorkshopMode } from '@/types';
import { useWorkshopSession } from '@/contexts/WorkshopSessionContext';
import { useRole } from '@/contexts/RoleContext';
import { buildStepEnhancementsAsync } from './stepEnhancementRegistry';
import { labIntroComponents } from './labIntroComponents';
import { getLabMongoUri } from '@/utils/workshopUtils';
import { useWorkshopConfig } from '@/context/WorkshopConfigContext';

interface LabRunnerProps {
  labNumber: number;
  // Option 1: Provide labId to load from ContentService
  labId?: string;
  // Option 2: Provide all props directly (backward compatible)
  title?: string;
  description?: string;
  duration?: string;
  prerequisites?: string[];
  objectives?: string[];
  steps?: Step[];
  introContent?: LabIntroContent;
  businessValue?: string;
  atlasCapability?: string;
  // Optional: Step enhancements (code blocks, verification functions, etc.)
  // that can't be expressed in pure content yet
  stepEnhancements?: Map<string, Partial<Step>>;
  // Optional: Lab context overlay (for quest/challenge-specific narrative)
  labContextOverlay?: LabContextOverlay;
}

/**
 * LabRunner is a component that can render labs either:
 * 1. From ContentService (content-driven) - when labId is provided
 * 2. From props (backward compatible) - when all props are provided
 *
 * This allows gradual migration: existing labs continue to work via props,
 * while new labs can be defined in content/ and loaded by ID.
 */
/**
 * Apply lab context overlay to customize lab narrative for quest/challenge context
 */
function applyLabContextOverlay(
  labDef: WorkshopLabDefinition,
  overlay?: LabContextOverlay
): WorkshopLabDefinition {
  if (!overlay || overlay.labId !== labDef.id) {
    return labDef;
  }

  // Apply title/description overrides
  const title = overlay.titleOverride || labDef.title;
  const description = overlay.descriptionOverride || labDef.description;

  // Apply step narrative overrides and filtering
  let steps = labDef.steps;

  // Filter steps if specified
  if (overlay.stepFilter) {
    if (overlay.stepFilter.stepIds) {
      steps = steps.filter(s => overlay.stepFilter!.stepIds!.includes(s.id));
    }
    if (overlay.stepFilter.excludeStepIds) {
      steps = steps.filter(s => !overlay.stepFilter!.excludeStepIds!.includes(s.id));
    }
    if (overlay.stepFilter.modeFilter) {
      steps = steps.filter(s => {
        // Include step if it has no mode restriction or matches filter
        return !s.modes || s.modes.some(m => overlay.stepFilter!.modeFilter!.includes(m));
      });
    }
  }

  // Apply step narrative overrides
  if (overlay.stepNarrativeOverrides) {
    steps = steps.map(step => {
      const narrativeOverride = overlay.stepNarrativeOverrides![step.id];
      if (narrativeOverride) {
        return {
          ...step,
          narrative: narrativeOverride
        };
      }
      return step;
    });
  }

  return {
    ...labDef,
    title,
    description,
    steps
  };
}

export function LabRunner(props: LabRunnerProps) {
  const { labId, labNumber, stepEnhancements, labContextOverlay } = props;
  const { currentMode, activeTemplate } = useWorkshopSession();
  const { isModerator } = useRole();
  const { runningInContainer } = useWorkshopConfig();
  const [labDef, setLabDef] = useState<WorkshopLabDefinition | null>(null);
  const [enhancements, setEnhancements] = useState<Map<string, Partial<Step>>>(new Map());
  const [loading, setLoading] = useState(false);
  const [loadingEnhancements, setLoadingEnhancements] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If labId is provided, load from ContentService
  useEffect(() => {
    if (labId) {
      setLoading(true);
      getContentService()
        .getLabById(labId)
        .then(def => {
          if (def) {
            setLabDef(def);
          } else {
            setError(`Lab with ID "${labId}" not found`);
          }
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [labId]);

  // Load enhancements asynchronously when labDef changes
  useEffect(() => {
    if (!labId || !labDef) return;

    setLoadingEnhancements(true);
    const contextualLabDef = applyLabContextOverlay(labDef, labContextOverlay);
    
    // Filter steps by current mode
    let filteredSteps = contextualLabDef.steps;
    if (currentMode) {
      filteredSteps = contextualLabDef.steps.filter(step => {
        return !step.modes || step.modes.includes(currentMode);
      });
    }

    const filteredLabDef: WorkshopLabDefinition = {
      ...contextualLabDef,
      steps: filteredSteps
    };

    // Load enhancements asynchronously
    buildStepEnhancementsAsync(filteredLabDef, stepEnhancements)
      .then(loadedEnhancements => {
        setEnhancements(loadedEnhancements);
        setLoadingEnhancements(false);
      })
      .catch(err => {
        console.error('Failed to load enhancements:', err);
        setEnhancements(new Map());
        setLoadingEnhancements(false);
      });
  }, [labId, labDef, currentMode, labContextOverlay, stepEnhancements]);

  // If loading from ContentService
  if (labId) {
    if (loading || loadingEnhancements) {
      return <div>Loading lab...</div>;
    }
    if (error) {
      return <div>Error: {error}</div>;
    }
    if (!labDef) {
      return <div>Lab not found</div>;
    }

    // Apply context overlay if provided (for quest/challenge-specific narrative)
    const contextualLabDef = applyLabContextOverlay(labDef, labContextOverlay);

    // Filter steps by current mode (if mode is available)
    let filteredSteps = contextualLabDef.steps;
    if (currentMode) {
      filteredSteps = contextualLabDef.steps.filter(step => {
        // Include step if it has no mode restriction or supports current mode
        return !step.modes || step.modes.includes(currentMode);
      });
    }

    // Create filtered lab definition for mapping
    const filteredLabDef: WorkshopLabDefinition = {
      ...contextualLabDef,
      steps: filteredSteps
    };

    // Merge: component-provided stepEnhancements (e.g. from Lab1CSFLE/Lab2QueryableEncryption) override
    // async-loaded enhancements so the IDE shows the same code as main (full codeBlocks, hints, etc.)
    const combinedEnhancements = new Map(enhancements);
    if (stepEnhancements) {
      stepEnhancements.forEach((value, key) => {
        combinedEnhancements.set(key, { ...(combinedEnhancements.get(key) || {}), ...value });
      });
    }

    // Map WorkshopLabDefinition to Step[] and LabIntroContent
    const steps = mapLabDefinitionToSteps(filteredLabDef, combinedEnhancements);
    const baseIntroContent = mapLabDefinitionToIntroContent(contextualLabDef);
    
    // Use provided introContent if available, otherwise build from lab definition
    // Check for lab-specific intro component (e.g., architecture diagram, key concepts)
    const labIntroOverride = labId ? labIntroComponents[labId]?.() : undefined;
    const introContent: LabIntroContent = props.introContent || {
      whatYouWillBuild: labIntroOverride?.whatYouWillBuild ?? filteredLabDef.steps.map(s => s.title),
      keyConcepts: labIntroOverride?.keyConcepts ?? baseIntroContent.keyConcepts ?? [],
      keyInsight: labIntroOverride?.keyInsight ?? baseIntroContent.keyInsight ?? filteredLabDef.description,
      ...baseIntroContent,
      ...labIntroOverride,
      // Add quest-specific intro narrative if provided
      ...(labContextOverlay?.introNarrative && {
        keyInsight: `${filteredLabDef.description}\n\n${labContextOverlay.introNarrative}`
      })
    };

    // Parse duration from estimatedTotalTimeMinutes
    const duration = filteredLabDef.estimatedTotalTimeMinutes 
      ? `${filteredLabDef.estimatedTotalTimeMinutes} min`
      : 'N/A';

    const defaultCompetitorId =
      activeTemplate?.defaultCompetitorId ??
      filteredLabDef.defaultCompetitorId ??
      filteredLabDef.competitorIds?.[0];
    const competitorIds = filteredLabDef.competitorIds;

    return (
      <LabViewWithTabs
        labNumber={labNumber}
        title={filteredLabDef.title}
        description={filteredLabDef.description}
        duration={duration}
        prerequisites={filteredLabDef.prerequisites || []}
        objectives={filteredLabDef.steps.map(s => s.title)}
        steps={steps}
        introContent={introContent}
        businessValue={props.businessValue}
        atlasCapability={props.atlasCapability}
        currentMode={currentMode}
        isModerator={isModerator}
        defaultCompetitorId={defaultCompetitorId}
        competitorIds={competitorIds}
        labMongoUri={getLabMongoUri(runningInContainer)}
      />
    );
  }

  // Backward compatible: use props directly
  if (!props.title || !props.steps || !props.introContent) {
    return <div>Error: Either provide labId or all required props</div>;
  }

  return <LabViewWithTabs {...props as Required<LabRunnerProps>} labMongoUri={getLabMongoUri(runningInContainer)} />;
}

