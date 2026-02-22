import { WorkshopLabDefinition, WorkshopLabStep } from '@/types';
import { Step, LabIntroContent } from '@/components/labs/LabViewWithTabs';
import { DifficultyLevel } from '@/components/labs/DifficultyBadge';

/**
 * Maps WorkshopLabDefinition (content model) to the Step format
 * expected by LabViewWithTabs (UI model).
 * 
 * This mapper bridges the gap between the new content-driven architecture
 * and the existing UI components. In later phases, we'll enhance the UI
 * to work directly with WorkshopLabDefinition, but for now we preserve
 * backward compatibility.
 */
export function mapLabDefinitionToSteps(
  labDef: WorkshopLabDefinition,
  // Optional: provide step-specific data (code blocks, verification functions, etc.)
  // that can't be expressed in pure content yet
  stepEnhancements?: Map<string, Partial<Step>>
): Step[] {
  return labDef.steps.map((step: WorkshopLabStep): Step => {
    const enhancement = stepEnhancements?.get(step.id) || {};
    
    // Parse estimatedTimeMinutes into "X min" format
    const estimatedTime = step.estimatedTimeMinutes 
      ? `${step.estimatedTimeMinutes} min`
      : 'N/A';

    // Map difficulty
    const difficulty: DifficultyLevel = 
      labDef.difficulty === 'beginner' ? 'basic' :
      labDef.difficulty === 'intermediate' ? 'intermediate' :
      'advanced';

    return {
      id: step.id,
      title: step.title,
      estimatedTime,
      description: step.narrative || step.instructions,
      difficulty,
      understandSection: step.narrative,
      doThisSection: step.instructions.split('\n').filter(s => s.trim()),
      hints: step.hints,
      tips: enhancement.tips,
      codeBlocks: enhancement.codeBlocks,
      troubleshooting: enhancement.troubleshooting,
      onVerify: enhancement.onVerify,
      verificationId: step.verificationId,
      exercises: enhancement.exercises,
      preview: step.preview,
      ...enhancement // Allow any other step properties to be overridden
    };
  });
}

/**
 * Creates a basic LabIntroContent from a WorkshopLabDefinition.
 * 
 * In the current implementation, labs define their intro content separately.
 * This mapper provides a default structure that can be enhanced.
 */
export function mapLabDefinitionToIntroContent(
  labDef: WorkshopLabDefinition
): Partial<LabIntroContent> {
  return {
    whatYouWillBuild: labDef.steps.map(s => s.title),
    keyConcepts: labDef.keyConcepts ?? [],
    keyInsight: labDef.description
  };
}
