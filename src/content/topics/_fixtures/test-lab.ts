import { WorkshopLabDefinition } from '@/types';

/**
 * Test Lab
 * 
 * Description of what this lab teaches and why it matters.
 */
export const labtestlab: WorkshopLabDefinition = {
  id: 'lab-test-lab',
  title: 'Test Lab',
  description: 'Description of what participants will learn in this lab',
  topicId: 'encryption',
  difficulty: 'intermediate', // 'beginner' | 'intermediate' | 'advanced'
  estimatedTotalTimeMinutes: 45,
  prerequisites: [], // e.g., ['lab-csfle-fundamentals']
  povCapabilities: ['ENCRYPT-FIELDS'], // PoV capabilities covered by this lab
  modes: ['demo', 'lab', 'challenge'],
  // Optional: sourceProof for step-level reference
  // sourceProof: 'Docs/Guides/Lab_1_CSFLE.md',
  steps: [
    {
      id: 'step-1-introduction',
      title: 'Introduction',
      narrative: 'Story context for this step',
      instructions: `What participants need to do in this step.

Include clear, actionable instructions.`,
      estimatedTimeMinutes: 10,
      verificationId: 'csfle.verifyKeyVaultIndex', // Or another verification ID
      codeBlocks: [
        {
          filename: 'example.js',
          language: 'javascript',
          code: `// Example code
const example = 'Hello World';`,
          skeleton: `// TODO: Add your code here`
        }
      ],
      hints: [
        'Hint 1',
        'Hint 2'
      ],
      tips: [
        'Tip 1',
        'Tip 2'
      ]
    }
    // Add more steps as needed
  ]
};
