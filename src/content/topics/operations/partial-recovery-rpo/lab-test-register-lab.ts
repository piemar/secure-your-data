import { WorkshopLabDefinition } from '@/types';

/**
 * Test Register Lab
 *
 * Source PoV proof exercise: Docs/pov-proof-exercises/proofs/14/README.md
 * Description of what this lab teaches and why it matters.
 */
export const labTestRegisterLabDefinition: WorkshopLabDefinition = {
  id: 'lab-test-register-lab',
  title: 'Test Register Lab',
  description: 'Description of what participants will learn in this lab',
  topicId: 'operations',
  difficulty: 'intermediate', // 'beginner' | 'intermediate' | 'advanced'
  estimatedTotalTimeMinutes: 45,
  prerequisites: [], // e.g., ['lab-csfle-fundamentals']
  povCapabilities: ['PARTIAL-RECOVERY-RPO'], // PoV capabilities covered by this lab
  modes: ['lab', 'challenge'],
  steps: [
    {
      id: 'lab-test-register-lab-step-1',
      title: 'Step 1: Introduction',
      narrative: 'Story context for this step.',
      instructions: 'What participants need to do in this step. Use clear, actionable instructions.',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'challenge'],
      points: 5,
      enhancementId: 'partial-recovery-rpo.step-1',
      sourceProof: 'proofs/14/README.md',
      sourceSection: 'Description',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],
    },
    {
      id: 'lab-test-register-lab-step-2',
      title: 'Step 2: Core exercise',
      narrative: 'Context and explanation for this step.',
      instructions: 'Instructions for completing this step.',
      estimatedTimeMinutes: 15,
      modes: ['lab', 'challenge'],
      points: 10,
      enhancementId: 'partial-recovery-rpo.step-2',
      sourceProof: 'proofs/14/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Execution',
    },
    {
      id: 'lab-test-register-lab-step-3',
      title: 'Step 3: Wrap-up',
      narrative: 'Summary and next steps.',
      instructions: 'Final instructions or verification steps.',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'challenge'],
      points: 5,
      enhancementId: 'partial-recovery-rpo.step-3',
      sourceProof: 'proofs/14/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Setup',
    },
  ],
};
