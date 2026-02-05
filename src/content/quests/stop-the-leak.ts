import { WorkshopQuest, LabContextOverlay } from '@/types';

/**
 * Quest: Stop the Leak
 * 
 * Part of the retail data breach simulation challenge.
 * Focuses on encrypting PII data using CSFLE and Queryable Encryption.
 * 
 * This quest uses the generic "lab-csfle-fundamentals" and "lab-queryable-encryption"
 * labs but provides quest-specific narrative context via labContextOverlays.
 */
export const stopTheLeakQuest: WorkshopQuest = {
  id: 'quest-stop-the-leak',
  title: 'Stop the Leak',
  storyContext: `A retail customer has discovered that sensitive customer data (PII) is being stored in plaintext in their MongoDB database. Your mission is to encrypt all PII fields before the next security audit.

**The Situation:**
- Customer names, email addresses, and payment card information are currently unencrypted
- The security team has flagged this as a critical vulnerability
- You need to implement encryption without disrupting existing operations
- The solution must support both exact-match queries (for customer lookups) and range queries (for analytics)

**Your Objective:**
Implement field-level encryption for all PII data using MongoDB's encryption capabilities.`,
  objectiveSummary: 'Encrypt all PII fields in the customer database using CSFLE and Queryable Encryption',
  labIds: ['lab-csfle-fundamentals', 'lab-queryable-encryption'],
  requiredFlagIds: [
    'flag-encrypted-pii-collections',
    'flag-no-plaintext-pii'
  ],
  optionalFlagIds: [
    'flag-queryable-encryption-active'
  ],
  modes: ['challenge', 'lab'],
  // Lab context overlays: customize lab narrative for this quest
  labContextOverlays: [
    {
      labId: 'lab-csfle-fundamentals',
      introNarrative: `**Quest Context: Stop the Leak**

You're implementing CSFLE to encrypt customer PII in the retail database. The CMK you create will protect all customer data encryption keys. This is critical - a security audit is scheduled in 48 hours, and unencrypted PII is a compliance violation.`,
      outroNarrative: `**Progress Update**

✅ CMK created and secured in AWS KMS
✅ Key Vault initialized with proper indexes
✅ Data Encryption Keys generated

**Next:** Move to Queryable Encryption to support range queries on encrypted salary fields.`,
      stepNarrativeOverrides: {
        'lab-csfle-fundamentals-step-create-cmk': `**Quest Context:** Create the root encryption key that will protect all customer PII. This CMK must be properly secured - it's the foundation of your encryption strategy.`,
        'lab-csfle-fundamentals-step-test-csfle': `**Quest Context:** Verify that customer PII is now encrypted. When you query without CSFLE, you should see Binary ciphertext - proving that even database administrators cannot access plaintext customer data.`
      }
    },
    {
      labId: 'lab-queryable-encryption',
      introNarrative: `**Quest Context: Enable Queryable Encryption**

Now that basic encryption is in place, you need to support range queries on encrypted salary fields for analytics. Queryable Encryption allows you to query encrypted data without decrypting it first.`,
      outroNarrative: `**Quest Progress**

✅ Range queries working on encrypted salary fields
✅ Customer lookup queries working on encrypted taxId
✅ All PII encrypted - security audit ready

**Flag Check:** Verify all PII collections are encrypted and no plaintext remains.`
    }
  ]
};
