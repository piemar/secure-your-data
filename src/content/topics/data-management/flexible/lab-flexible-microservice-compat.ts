import { WorkshopLabDefinition } from '@/types';

/**
 * Flexible Schema: Microservice Compatibility
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/02/README.md
 * This lab demonstrates how multiple microservices can work with the same collection
 * even when they expect different schemas, proving zero-downtime schema evolution.
 */
export const labFlexibleMicroserviceCompatDefinition: WorkshopLabDefinition = {
  id: 'lab-flexible-microservice-compat',
  topicId: 'data-management',
  title: 'Flexible Schema: Microservice Compatibility & Zero-Downtime Evolution',
  description:
    'Demonstrate how multiple microservices can coexist and work with the same MongoDB collection, even when they expect different document structures. This proves MongoDB\'s ability to support zero-downtime schema evolution.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 40,
  tags: ['flexible-schema', 'microservices', 'zero-downtime', 'schema-evolution', 'compatibility'],
  prerequisites: [
    'Lab: Flexible Schema Basic Evolution (recommended)',
    'Lab: Flexible Schema Nested Documents (recommended)',
    'MongoDB Atlas M10+ cluster',
    'Python 3 with pymongo installed',
    'Understanding of microservice architecture'
  ],
  povCapabilities: ['FLEXIBLE'],
  modes: ['lab', 'demo', 'challenge'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/02',
  dataRequirements: [
    {
      id: 'microservice-scripts',
      description: 'Python scripts for microservice compatibility demo',
      type: 'script',
      path: 'microservice_one.py',
      sizeHint: 'proof 02 scripts',
    },
  ],
  steps: [
    {
      id: 'lab-flexible-microservice-compat-step-1',
      title: 'Step 1: Simulate Existing Microservice',
      narrative:
        'Create a Python script that simulates an existing microservice reading employee data. This service only knows about the original fields (name, email, salary) and continues to work even after schema changes.',
      instructions:
        '- Create a Python script (microservice_one.py) that:\n  - Connects to MongoDB\n  - Continuously queries employees collection\n  - Reads only: name, email, salary fields\n  - Prints results every few seconds\n- Run this script in the background\n- Verify it works with existing employee documents',
      estimatedTimeMinutes: 12,
      modes: ['lab', 'demo', 'challenge'],
      verificationId: 'flexible.verifyMicroserviceOne',
      points: 15,
      enhancementId: 'flexible.microservice-one',
      sourceProof: 'proofs/02/README.md',
      sourceSection: 'Execution',
    },
    {
      id: 'lab-flexible-microservice-compat-step-2',
      title: 'Step 2: Evolve Schema While Service Runs',
      narrative:
        'While the first microservice is still running, add new fields and nested structures to employee documents. The existing microservice should continue working without interruption.',
      instructions:
        '- While microservice_one.py is running, execute schema evolution:\n  - Add "department" and "birth_date" fields to some employees\n  - Add "hobbies" array and "contact" sub-document to others\n- Use updateMany() to modify a subset of documents\n- Verify microservice_one.py continues running without errors\n- Check that it still reads the fields it knows about (name, email, salary)',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo', 'challenge'],
      verificationId: 'flexible.verifySchemaEvolution',
      points: 15,
      enhancementId: 'flexible.schema-evolution',
      sourceProof: 'proofs/02/README.md',
      sourceSection: 'Execution',
    },
    {
      id: 'lab-flexible-microservice-compat-step-3',
      title: 'Step 3: Deploy New Microservice',
      narrative:
        'Deploy a new microservice that uses the newly added fields. Both microservices can work simultaneously with the same collection, each reading the fields they need.',
      instructions:
        '- Create a second Python script (microservice_two.py) that:\n  - Connects to the same MongoDB collection\n  - Queries employees using new fields (department, hobbies)\n  - Reads both original fields (name, email) and new fields\n  - Handles documents that may not have new fields (using .get() or checking existence)\n- Run both microservices simultaneously\n- Verify both work correctly:\n  - microservice_one reads original fields from all documents\n  - microservice_two reads new fields from documents that have them\n- Demonstrate zero-downtime schema evolution',
      estimatedTimeMinutes: 18,
      modes: ['lab', 'demo', 'challenge'],
      verificationId: 'flexible.verifyMicroserviceTwo',
      points: 20,
      enhancementId: 'flexible.microservice-two',
      sourceProof: 'proofs/02/README.md',
      sourceSection: 'Execution',
    },
  ],
};
