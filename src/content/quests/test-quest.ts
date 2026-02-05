import { WorkshopQuest } from '@/types';

/**
 * Quest: Test Quest
 * 
 * Description of what this quest accomplishes.
 */
export const questtestquest: WorkshopQuest = {
  id: 'quest-test-quest',
  title: 'Test Quest',
  storyContext: `Narrative background for this quest.

Describe the situation, stakes, and what participants need to accomplish.`,
  objectiveSummary: 'Brief summary of the quest objectives',
  labIds: [
    'lab-test-lab'
  ],
  requiredFlagIds: [
    // Add required flag IDs
  ],
  optionalFlagIds: [
    // Add optional flag IDs (optional)
  ],
  modes: ['challenge', 'lab'] // Modes where this quest is available
};
