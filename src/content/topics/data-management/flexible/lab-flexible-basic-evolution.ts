import { WorkshopLabDefinition } from '@/types';

/**
 * Flexible Schema: Basic Evolution - Adding Fields to Existing Documents
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/02/README.md
 * This lab demonstrates MongoDB's ability to add new fields to existing documents
 * without requiring downtime or breaking existing applications.
 */
export const labFlexibleBasicEvolutionDefinition: WorkshopLabDefinition = {
  id: 'lab-flexible-basic-evolution',
  topicId: 'data-management',
  title: 'Flexible Schema: Adding Fields to Existing Documents',
  description:
    'Learn how to evolve your data model by adding new fields to existing documents without downtime. This lab demonstrates MongoDB\'s schema flexibility by adding fields like department and birth_date to employee records.',
  difficulty: 'beginner',
  estimatedTotalTimeMinutes: 30,
  tags: ['flexible-schema', 'schema-evolution', 'data-modeling', 'zero-downtime'],
  prerequisites: [
    'MongoDB Atlas M10+ cluster',
    'Python 3 with pymongo installed',
    'Basic understanding of MongoDB documents'
  ],
  povCapabilities: ['FLEXIBLE'],
  modes: ['lab', 'demo', 'challenge'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/02',
  dataRequirements: [
    {
      id: 'create-model-script',
      description: 'Python script to create initial employee collection',
      type: 'script',
      path: 'create_model.py',
      sizeHint: '~2KB',
    },
    {
      id: 'alter-model-script',
      description: 'Python script to add fields to existing documents',
      type: 'script',
      path: 'alter_model.py',
      sizeHint: '~2KB',
    },
  ],
  steps: [
    {
      id: 'lab-flexible-basic-evolution-step-1',
      title: 'Step 1: Create Initial Employee Collection',
      narrative:
        'Start with a collection of employee records containing basic fields (name, email, salary). This represents your existing application\'s data model.',
      instructions:
        '- Connect to your Atlas cluster using Python or mongosh\n- Create a database called "FLEXIBLE"\n- Insert at least 10-20 sample employee documents with fields: name, email, salary\n- Verify the documents are stored correctly',
      estimatedTimeMinutes: 8,
      modes: ['lab', 'demo', 'challenge'],
      verificationId: 'flexible.verifyInitialCollection',
      points: 10,
      enhancementId: 'flexible.initial-collection',
      sourceProof: 'proofs/02/README.md',
      sourceSection: 'Setup',
    },
    {
      id: 'lab-flexible-basic-evolution-step-2',
      title: 'Step 2: Add New Fields to Existing Documents',
      narrative:
        'Evolve your data model by adding new fields (department, birth_date) to a subset of existing employee records. This simulates a new application requirement without breaking existing code.',
      instructions:
        '- Use updateMany() or updateOne() to add "department" field to some employee records\n- Add "birth_date" field to a different subset of records\n- Use $set operator to add fields without overwriting existing data\n- Verify that existing fields remain unchanged',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo', 'challenge'],
      verificationId: 'flexible.verifyFieldsAdded',
      points: 15,
      enhancementId: 'flexible.add-fields',
      sourceProof: 'proofs/02/README.md',
      sourceSection: 'Execution',
    },
    {
      id: 'lab-flexible-basic-evolution-step-3',
      title: 'Step 3: Query Mixed Schema Documents',
      narrative:
        'Demonstrate that queries work seamlessly across documents with different schemas. Some documents have the new fields, others don\'t, and both can coexist.',
      instructions:
        '- Query all employees (both with and without new fields)\n- Query only employees with department field\n- Query employees by birth_date range\n- Show that documents without these fields are still returned (with null/undefined values)\n- Explain how MongoDB handles missing fields gracefully',
      estimatedTimeMinutes: 12,
      modes: ['lab', 'demo', 'challenge'],
      verificationId: 'flexible.verifyMixedQueries',
      points: 15,
      enhancementId: 'flexible.mixed-queries',
      sourceProof: 'proofs/02/README.md',
      sourceSection: 'Execution',
    },
  ],
};
