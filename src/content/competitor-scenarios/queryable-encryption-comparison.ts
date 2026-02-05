import { WorkshopCompetitorScenario } from '@/types';

/**
 * Competitor Comparison: Queryable Encryption
 * 
 * Compares MongoDB's Queryable Encryption (range queries on encrypted data)
 * with alternatives.
 */
export const queryableEncryptionComparisonScenario: WorkshopCompetitorScenario = {
  id: 'scenario-queryable-encryption-comparison',
  labId: 'lab-queryable-encryption',
  stepId: 'step-2-range-queries',
  mongodbDescription: `MongoDB **Queryable Encryption** enables you to perform **range queries** (greater than, less than, between) on encrypted fields without decrypting the data first. This is achieved through advanced cryptographic techniques that maintain query performance while preserving security.

**Key Advantages:**
- **Range queries on encrypted data**: Query encrypted fields without decryption
- **Performance**: Indexed queries maintain performance characteristics
- **Security**: Data remains encrypted throughout the query process
- **Transparent**: Works seamlessly with existing MongoDB query syntax`,
  competitorImplementations: [
    {
      competitorId: 'rdbms',
      title: 'Traditional RDBMS',
      description: `Traditional databases **cannot query encrypted data** efficiently. To query encrypted fields, you must either:
- Decrypt all data first (performance and security issues)
- Use deterministic encryption (reduces security)
- Implement custom indexing schemes`,
      codeSnippets: [
        {
          language: 'sql',
          code: `-- Option 1: Decrypt all rows (slow, insecure)
SELECT * FROM customers
WHERE decrypt(ssn_encrypted, 'key') BETWEEN '100-00-0000' AND '200-00-0000';

-- Option 2: Deterministic encryption (reduces security)
-- Same plaintext always produces same ciphertext
-- Allows equality queries but not range queries efficiently`,
          description: 'Range queries require decrypting data or compromising security'
        }
      ],
      painPoints: [
        'Cannot efficiently query encrypted data',
        'Range queries require decrypting entire dataset',
        'Deterministic encryption reduces security guarantees',
        'Performance degradation with encrypted field queries',
        'Complex custom solutions needed for queryable encryption'
      ]
    },
    {
      competitorId: 'documentdb',
      title: 'AWS DocumentDB',
      description: `AWS DocumentDB **does not support queryable encryption**. All queries on encrypted fields require:
- Full collection scans
- Application-level decryption
- Performance penalties`,
      codeSnippets: [
        {
          language: 'javascript',
          code: `// DocumentDB: No queryable encryption support
// Must decrypt all documents to query

const allCustomers = await collection.find({}).toArray();

// Filter in application after decryption (slow!)
const filtered = allCustomers.filter(customer => {
  const ssn = decrypt(customer.ssn_encrypted);
  return ssn >= '100-00-0000' && ssn <= '200-00-0000';
});`,
          description: 'No native queryable encryption; requires full scan and application-side filtering'
        }
      ],
      painPoints: [
        'No queryable encryption support',
        'Range queries require full collection scans',
        'All data must be decrypted in application',
        'Significant performance overhead',
        'Cannot leverage database indexes for encrypted fields'
      ]
    }
  ]
};
