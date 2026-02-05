import { WorkshopCompetitorScenario } from '@/types';

/**
 * Competitor Comparison: Field-Level Encryption
 * 
 * Compares MongoDB's Client-Side Field Level Encryption (CSFLE) and Queryable Encryption
 * with how encryption is handled in traditional RDBMS and AWS DocumentDB.
 */
export const encryptionComparisonScenario: WorkshopCompetitorScenario = {
  id: 'scenario-encryption-comparison',
  labId: 'lab-csfle-fundamentals',
  stepId: 'step-1-encryption-overview',
  mongodbDescription: `MongoDB provides **Client-Side Field Level Encryption (CSFLE)** and **Queryable Encryption**, allowing you to encrypt sensitive fields before data leaves your application. Encryption keys are managed separately via a Key Management Service (KMS), ensuring that even database administrators cannot access plaintext data.

**Key Advantages:**
- **Field-level granularity**: Encrypt only specific fields, not entire documents
- **Query support**: Queryable Encryption allows range queries on encrypted data
- **Zero-trust architecture**: Data remains encrypted even with full database access
- **Multiple KMS support**: AWS KMS, Azure Key Vault, GCP KMS, or local key management
- **Transparent to applications**: Encryption/decryption handled automatically by drivers`,
  competitorImplementations: [
    {
      competitorId: 'rdbms',
      title: 'Traditional RDBMS (PostgreSQL/MySQL)',
      description: `Traditional relational databases typically rely on **Transparent Data Encryption (TDE)** or application-level encryption.

**Approach:**
- TDE encrypts data at rest but data is decrypted in memory
- Application-level encryption requires manual implementation
- Encryption keys often stored in application configuration`,
      codeSnippets: [
        {
          language: 'sql',
          code: `-- PostgreSQL: Application must encrypt before insert
INSERT INTO customers (name, email, ssn_encrypted)
VALUES ('John Doe', 'john@example.com', encrypt('123-45-6789', 'key'));

-- Querying requires decryption in application
SELECT name, email, decrypt(ssn_encrypted, 'key') as ssn
FROM customers
WHERE email = 'john@example.com';`,
          description: 'Application must manually encrypt/decrypt sensitive fields'
        }
      ],
      painPoints: [
        'Database administrators can access plaintext data in memory',
        'Application developers must implement encryption logic manually',
        'No built-in support for querying encrypted data',
        'Key management often handled in application code (security risk)',
        'Encryption adds complexity to application queries',
        'Difficult to rotate encryption keys without downtime'
      ]
    },
    {
      competitorId: 'documentdb',
      title: 'AWS DocumentDB',
      description: `AWS DocumentDB provides encryption at rest using AWS KMS, but **does not support client-side field-level encryption**.

**Approach:**
- Encryption at rest via AWS KMS
- Encryption in transit via TLS
- No field-level encryption capabilities`,
      codeSnippets: [
        {
          language: 'javascript',
          code: `// DocumentDB: Only encryption at rest
// No field-level encryption support
// Application must handle encryption manually

const document = {
  name: 'John Doe',
  email: 'john@example.com',
  ssn: encryptManually('123-45-6789') // Manual encryption required
};

await collection.insertOne(document);

// Querying encrypted fields requires full collection scan
// and decryption in application`,
          description: 'No native field-level encryption; manual implementation required'
        }
      ],
      painPoints: [
        'No client-side field-level encryption support',
        'Database administrators can access all data',
        'Application must implement encryption manually',
        'Cannot query encrypted fields efficiently',
        'Limited to AWS KMS (vendor lock-in)',
        'No support for Queryable Encryption features'
      ]
    }
  ]
};
