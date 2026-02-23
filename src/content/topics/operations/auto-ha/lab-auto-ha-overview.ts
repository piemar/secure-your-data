import { WorkshopLabDefinition } from '@/types';

/**
 * AUTO-HA Overview
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/17/README.md (AUTO-HA)
 * Learn how MongoDB Atlas provides automatic failover in a single region with no manual intervention.
 */
export const labAutoHaOverviewDefinition: WorkshopLabDefinition = {
  id: 'lab-auto-ha-overview',
  topicId: 'operations',
  title: 'AUTO-HA Overview',
  description:
    'Learn how MongoDB Atlas provides automatic failover in a single region: when the primary fails, a secondary is promoted and drivers reconnect within seconds, with no application changes.',
  difficulty: 'beginner',
  estimatedTotalTimeMinutes: 20,
  tags: ['operations', 'ha', 'failover', 'atlas', 'replica-set'],
  prerequisites: ['MongoDB Atlas account', 'Basic familiarity with replica sets'],
  povCapabilities: ['AUTO-HA'],
  modes: ['lab', 'demo', 'challenge'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/17',
  keyConcepts: [
    {
      term: 'Automatic failover',
      explanation:
        'Atlas monitors replica set members and promotes a secondary to primary when the primary fails; no manual steps required.',
    },
    {
      term: 'RTO',
      explanation: 'Recovery Time Objective; in this proof, application recovery is typically under 4 seconds.',
    },
    {
      term: 'Retryable writes and reads',
      explanation:
        'Driver-level retries minimize visible impact of brief failover downtime to the application.',
    },
  ],
  steps: [
    {
      id: 'lab-auto-ha-overview-step-1',
      title: 'Step 1: Understand automatic failover',
      narrative:
        'When the primary of a MongoDB Atlas replica set fails, another member is automatically promoted to primary. The client application\'s driver detects the primary change and fails over—typically within a few seconds. No application code changes are required; the driver handles reconnection.',
      instructions:
        '- Explain what automatic failover means: primary fails → election → new primary\n- RTO: time from failure to application recovery (proof shows under 4 seconds)\n- Application does not need to be modified; drivers detect the new primary and reconnect',
      estimatedTimeMinutes: 7,
      modes: ['lab', 'demo', 'challenge'],
      points: 5,
      enhancementId: 'auto-ha.concepts',
      sourceProof: 'proofs/17/README.md',
      sourceSection: 'Description',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],
    },
    {
      id: 'lab-auto-ha-overview-step-2',
      title: 'Step 2: Failover flow',
      narrative:
        'Failure detection, replica set election, and client reconnection happen in sequence. The driver reports connection problems briefly, then reconnects to the new primary and continues operations.',
      instructions:
        '- Describe the sequence: primary down → replica set election → new primary elected\n- Client sees a short period of connection errors, then RECONNECTED-TO-DB\n- Retryable writes and retryable reads can hide this disruption from the application',
      estimatedTimeMinutes: 7,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'auto-ha.flow',
      sourceProof: 'proofs/17/README.md',
      sourceSection: 'Execution',
      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],
    },
    {
      id: 'lab-auto-ha-overview-step-3',
      title: 'Step 3: Requirements',
      narrative:
        'Single-region AUTO-HA requires a replica set (not a standalone). Atlas recommends M10+ and three nodes in the same region for production-ready automatic failover.',
      instructions:
        '- Replica set (3 nodes); same cloud region for single-region failover\n- M10 or higher for Atlas managed replica sets\n- No scheduled maintenance window needed; failover is automatic',
      estimatedTimeMinutes: 6,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'auto-ha.requirements',
      sourceProof: 'proofs/17/README.md',
      sourceSection: 'Setup',
      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],
    },
  ],
};
