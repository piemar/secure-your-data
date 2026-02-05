import { Step } from '@/components/labs/LabViewWithTabs';

/**
 * Utility to create stepEnhancements Map from TSX step definitions.
 * 
 * This allows migrating labs from TSX props to content-driven format
 * while preserving all rich content (code blocks, skeletons, hints, exercises, verification).
 * 
 * Usage:
 * ```typescript
 * const stepEnhancements = createStepEnhancements(lab1Steps);
 * <LabRunner labId="lab-csfle-fundamentals" stepEnhancements={stepEnhancements} />
 * ```
 */
export function createStepEnhancements(steps: Step[]): Map<string, Partial<Step>> {
  const enhancements = new Map<string, Partial<Step>>();
  
  steps.forEach(step => {
    const enhancement: Partial<Step> = {};
    
    // Preserve rich content that can't be expressed in pure content yet
    if (step.codeBlocks) enhancement.codeBlocks = step.codeBlocks;
    if (step.tips) enhancement.tips = step.tips;
    if (step.troubleshooting) enhancement.troubleshooting = step.troubleshooting;
    if (step.onVerify) enhancement.onVerify = step.onVerify;
    if (step.exercises) enhancement.exercises = step.exercises;
    if (step.understandSection) enhancement.understandSection = step.understandSection;
    if (step.doThisSection) enhancement.doThisSection = step.doThisSection;
    if (step.hints) enhancement.hints = step.hints;
    if (step.difficulty) enhancement.difficulty = step.difficulty;
    if (step.estimatedTime) enhancement.estimatedTime = step.estimatedTime;
    
    // Only add to map if there's actual enhancement data
    if (Object.keys(enhancement).length > 0) {
      enhancements.set(step.id, enhancement);
    }
  });
  
  return enhancements;
}
