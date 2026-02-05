import { WorkshopLabDefinition } from '@/types';

/**
 * Flexible Schema: Nested Documents & Arrays
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/02/README.md
 * This lab demonstrates adding nested sub-documents and arrays to existing records,
 * showing how MongoDB's flexible schema supports complex data structures.
 */
export const labFlexibleNestedDocumentsDefinition: WorkshopLabDefinition = {
  id: 'lab-flexible-nested-documents',
  topicId: 'data-management',
  title: 'Flexible Schema: Adding Nested Documents & Arrays',
  description:
    'Learn how to add nested sub-documents and arrays to existing documents. This lab shows how to evolve your schema with complex structures like hobbies, contact information, or preferences without downtime.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 35,
  tags: ['flexible-schema', 'nested-documents', 'arrays', 'schema-evolution'],
  prerequisites: [
    'Lab: Flexible Schema Basic Evolution (recommended)',
    'MongoDB Atlas M10+ cluster',
    'Python 3 with pymongo installed'
  ],
  povCapabilities: ['FLEXIBLE'],
  modes: ['lab', 'demo', 'challenge'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/02',
  dataRequirements: [
    {
      id: 'nested-doc-scripts',
      description: 'Python scripts for nested document evolution',
      type: 'script',
      path: 'microservice_one.py',
      sizeHint: 'proof 02 scripts',
    },
  ],
  steps: [
    {
      id: 'lab-flexible-nested-documents-step-1',
      title: 'Step 1: Add Nested Sub-Documents',
      narrative:
        'Add structured sub-documents to existing employee records. For example, add a "contact" sub-document containing phone, address, and emergency contact information.',
      instructions:
        '- Use updateMany() with $set to add a "contact" sub-document to employee records\n- The sub-document should contain: phone, address (with street, city, state), emergencyContact\n- Add this to a subset of existing employees\n- Verify the nested structure is stored correctly',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo', 'challenge'],
      verificationId: 'flexible.verifyNestedDocuments',
      points: 15,
      enhancementId: 'flexible.nested-subdoc',
      sourceProof: 'proofs/02/README.md',
      sourceSection: 'Execution',
    },
    {
      id: 'lab-flexible-nested-documents-step-2',
      title: 'Step 2: Add Array Fields',
      narrative:
        'Add array fields to documents, such as hobbies, skills, or certifications. Arrays can grow over time and support different lengths per document.',
      instructions:
        '- Add a "hobbies" array field to employee records\n- Use $set with an array value: ["reading", "hiking", "photography"]\n- Add a "skills" array with different values for different employees\n- Show that arrays can have different lengths and contents per document\n- Query documents that contain specific array elements using $in or $elemMatch',
      estimatedTimeMinutes: 12,
      modes: ['lab', 'demo', 'challenge'],
      verificationId: 'flexible.verifyArrays',
      points: 15,
      enhancementId: 'flexible.add-arrays',
      sourceProof: 'proofs/02/README.md',
      sourceSection: 'Execution',
    },
    {
      id: 'lab-flexible-nested-documents-step-3',
      title: 'Step 3: Query Nested Structures',
      narrative:
        'Query nested documents and arrays efficiently. Learn how to access nested fields and filter by array contents.',
      instructions:
        '- Query employees by nested field: db.employees.find({ "contact.city": "New York" })\n- Query employees with specific hobbies using $elemMatch or $in\n- Use dot notation to access nested fields in projections\n- Show how to update nested fields using dot notation\n- Demonstrate that queries work even when some documents don\'t have the nested structure',
      estimatedTimeMinutes: 13,
      modes: ['lab', 'demo', 'challenge'],
      verificationId: 'flexible.verifyNestedQueries',
      points: 15,
      enhancementId: 'flexible.nested-queries',
      sourceProof: 'proofs/02/README.md',
      sourceSection: 'Execution',
    },
  ],
};
