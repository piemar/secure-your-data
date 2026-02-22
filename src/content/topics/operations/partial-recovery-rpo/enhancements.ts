import type { EnhancementMetadataRegistry } from '@/labs/enhancements/schema';

/**
 * Test Register Lab – Enhancement metadata
 *
 * Source PoV proof: Docs/pov-proof-exercises/proofs/14/README.md
 */

export const enhancements: EnhancementMetadataRegistry = {
  'partial-recovery-rpo.step-1': {
    id: 'partial-recovery-rpo.step-1',
    povCapability: 'PARTIAL-RECOVERY-RPO',
    sourceProof: 'proofs/14/README.md',
    sourceSection: 'Description',
    codeBlocks: [
      {
        filename: 'step-1.txt',
        language: 'text',
        code: `TODO: Add content for step 1`,
      },
    ],
    tips: ['Tip for step 1.'],
  },

  'partial-recovery-rpo.step-2': {
    id: 'partial-recovery-rpo.step-2',
    povCapability: 'PARTIAL-RECOVERY-RPO',
    sourceProof: 'proofs/14/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'step-2.txt',
        language: 'text',
        code: `TODO: Add content for step 2`,
      },
    ],
    tips: ['Tip for step 2.'],
  },

  'partial-recovery-rpo.step-3': {
    id: 'partial-recovery-rpo.step-3',
    povCapability: 'PARTIAL-RECOVERY-RPO',
    sourceProof: 'proofs/14/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'step-3.txt',
        language: 'text',
        code: `TODO: Add content for step 3`,
      },
    ],
    tips: ['Tip for step 3.'],
  },
};
