import { WorkshopTemplate } from '@/types';

/**
 * Retail Encryption Quickstart Template
 * 
 * Industry-specific template for retail customers focusing on
 * PII protection and compliance.
 */
export const retailEncryptionQuickstartTemplate: WorkshopTemplate = {
  id: 'retail-encryption-quickstart',
  name: 'Retail Encryption Quickstart',
  description: 'Focused encryption workshop for retail customers: protect customer PII and payment data',
  topicIds: ['encryption'],
  labIds: [
    'lab-csfle-fundamentals',
    'lab-queryable-encryption'
  ],
  defaultMode: 'lab',
  allowedModes: ['demo', 'lab', 'challenge'],
  industry: 'retail',
  gamification: {
    enabled: true,
    basePointsPerStep: 10,
    bonusPointsPerFlag: 30,
    bonusPointsPerQuest: 75,
    allowTeams: true
  },
  includeCompetitorComparisons: true,
  storyIntro: `You are a MongoDB Solutions Architect helping a retail customer secure their customer database.

**The Challenge:**
RetailCo, a growing e-commerce platform, needs to protect customer PII (names, addresses, payment card data) before migrating to MongoDB Atlas. Their current database exposes sensitive data to DBAs and backup operators, creating compliance risks.

**Your Mission:**
Implement Client-Side Field Level Encryption to ensure that even with full database access, sensitive customer data remains encrypted and unreadable.`,
  storyOutro: `**Success!** You've helped RetailCo implement encryption that protects customer data end-to-end. 

The customer database is now secure, and RetailCo can confidently migrate to MongoDB Atlas knowing their customer PII is protected even from internal database administrators.`
};
