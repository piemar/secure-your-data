import { WorkshopLabDefinition } from '@/types';

/**
 * Lab: Change Streams for Encrypted Data Pipelines
 *
 * Demonstrates how to use change streams to react to changes in collections
 * that may contain encrypted fields, and how that feeds downstream analytics
 * or event-driven architectures.
 */
export const labDataChangeStreamsDefinition: WorkshopLabDefinition = {
  id: 'lab-data-change-streams-encryption',
  topicId: 'data-management',
  title: 'Change Streams for Encrypted Data Pipelines',
  description:
    'Use MongoDB change streams to react to changes in collections that contain encrypted fields and feed downstream systems.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 30,
  tags: ['change-streams', 'cdc', 'stream-processing', 'encryption'],
  prerequisites: [
    'MongoDB Atlas cluster deployed',
    'Basic Node.js or shell scripting experience',
    'Familiarity with the CSFLE / Queryable Encryption sample schema is helpful',
  ],
  steps: [
    {
      id: 'lab-data-change-streams-step-intro',
      title: 'Understand Change Streams & Encrypted Fields',
      narrative:
        'Change streams allow you to subscribe to inserts, updates, and deletes on a collection. When fields are encrypted client-side, the server still exposes structural information (such as which document changed) but not plaintext values.',
      instructions:
        'Review the documentation for MongoDB change streams. Identify which fields in a change stream event will still be visible when the underlying document fields are encrypted client-side.',
      estimatedTimeMinutes: 10,
      points: 5,

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],
    },
    {
      id: 'lab-data-change-streams-step-listen',
      title: 'Write a Simple Change Stream Listener',
      narrative:
        'You will write a small script that listens to changes on a collection used in the encryption labs and logs high-level events (insert/update/delete and key fields that remain visible).',
      instructions:
        'Using your preferred language (Node.js or mongosh), open a change stream on the collection used in the CSFLE or QE labs. Insert or update a few sample documents and observe the emitted change events. Note which parts of the event payload are visible and which remain encrypted.',
      estimatedTimeMinutes: 15,

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],
      points: 15,
    },
    {
      id: 'lab-data-change-streams-step-design',
      title: 'Design a Downstream Processing Pattern',
      narrative:
        'Design a simple downstream processing pipeline (e.g., sending change events to a queue, triggering analytics updates, or building a cache) that respects the fact that sensitive fields are encrypted.',
      instructions:
        'Sketch an architecture where your change stream listener forwards events to another system (such as Kafka or a serverless function) without exposing plaintext PII. Identify which event fields you would use for routing and which remain opaque ciphertext.',
      estimatedTimeMinutes: 5,

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],
      points: 10,
    },
  ],
  modes: ['demo', 'lab', 'challenge'],
  povCapabilities: ['CHANGE-CAPTURE', 'STREAM-PROCESSING'],
};

