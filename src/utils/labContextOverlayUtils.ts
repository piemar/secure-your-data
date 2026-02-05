import { LabContextOverlay, WorkshopQuest, WorkshopTemplate } from '@/types';

/**
 * Utility functions for working with Lab Context Overlays.
 * 
 * Lab Context Overlays enable labs to be reused across different quests/challenges
 * with quest-specific narrative customization, without duplicating lab definitions.
 */

/**
 * Find the lab context overlay for a specific lab ID from a quest
 */
export function getLabOverlayFromQuest(
  quest: WorkshopQuest,
  labId: string
): LabContextOverlay | undefined {
  return quest.labContextOverlays?.find(overlay => overlay.labId === labId);
}

/**
 * Find the lab context overlay for a specific lab ID from a template
 */
export function getLabOverlayFromTemplate(
  template: WorkshopTemplate,
  labId: string
): LabContextOverlay | undefined {
  return template.labContextOverlays?.find(overlay => overlay.labId === labId);
}

/**
 * Merge overlays: template-level overlays are base, quest-level overlays override
 * (Quest overlays take precedence over template overlays)
 */
export function mergeLabOverlays(
  templateOverlay?: LabContextOverlay,
  questOverlay?: LabContextOverlay
): LabContextOverlay | undefined {
  if (!templateOverlay && !questOverlay) return undefined;
  if (!templateOverlay) return questOverlay;
  if (!questOverlay) return templateOverlay;

  // Quest overlay overrides template overlay
  return {
    ...templateOverlay,
    ...questOverlay,
    // Merge step narrative overrides (quest takes precedence)
    stepNarrativeOverrides: {
      ...templateOverlay.stepNarrativeOverrides,
      ...questOverlay.stepNarrativeOverrides
    },
    // Merge step filters (quest takes precedence)
    stepFilter: questOverlay.stepFilter || templateOverlay.stepFilter
  };
}

/**
 * Get the effective lab overlay for a lab in a quest context
 * (checks both quest and template for overlays)
 */
export function getEffectiveLabOverlay(
  labId: string,
  quest?: WorkshopQuest,
  template?: WorkshopTemplate
): LabContextOverlay | undefined {
  const questOverlay = quest ? getLabOverlayFromQuest(quest, labId) : undefined;
  const templateOverlay = template ? getLabOverlayFromTemplate(template, labId) : undefined;
  
  return mergeLabOverlays(templateOverlay, questOverlay);
}
