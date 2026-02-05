import { WorkshopTemplate } from '@/types';

/**
 * Retail Data Breach Simulation Challenge Template
 * 
 * A full customer challenge scenario where participants must:
 * 1. Encrypt all PII data (Stop the Leak quest)
 * 2. Harden the system with access controls and optimization (Harden the System quest)
 * 
 * This is a story-driven challenge mode template.
 */
export const retailDataBreachSimulationTemplate: WorkshopTemplate = {
  id: 'template-retail-data-breach-simulation',
  name: 'Retail Data Breach Simulation',
  description: 'A realistic incident response scenario: encrypt PII data and harden the system before a security audit',
  industry: 'retail',
  labIds: [
    'lab-csfle-fundamentals',
    'lab-queryable-encryption',
    'lab-right-to-erasure'
  ],
  questIds: [
    'quest-stop-the-leak',
    'quest-harden-the-system'
  ],
  allowedModes: ['challenge', 'lab'],
  gamification: {
    enabled: true,
    basePointsPerStep: 10,
    bonusPointsPerFlag: 25,
    bonusPointsPerQuest: 50,
    achievements: [
      {
        id: 'achievement-encryption-guardian',
        name: 'Encryption Guardian',
        description: 'Captured all encryption-related flags',
        icon: '🛡️'
      },
      {
        id: 'achievement-incident-responder',
        name: 'Incident Responder',
        description: 'Completed the retail data breach simulation',
        icon: '🚨'
      }
    ]
  },
  storyIntro: `# Retail Data Breach Simulation

## The Incident

You're a MongoDB specialist called in by a major retail customer after their security team discovered a critical vulnerability during a routine audit.

### The Situation

**Customer:** MegaRetail Corp  
**Industry:** E-commerce & Physical Stores  
**Database:** MongoDB Atlas M30 cluster  
**Issue:** Customer PII stored in plaintext

### What Happened

During a security audit, the team discovered that sensitive customer data including:
- Names and addresses
- Email addresses
- Payment card information (last 4 digits)
- Purchase history

...is being stored **unencrypted** in MongoDB collections.

### The Stakes

- **Regulatory Compliance:** GDPR violations could result in fines up to 4% of annual revenue
- **Customer Trust:** A data breach would severely damage brand reputation
- **Business Impact:** Peak shopping season starts in 2 weeks

### Your Mission

You have **limited time** to:
1. **Stop the Leak:** Encrypt all PII data using MongoDB's field-level encryption
2. **Harden the System:** Implement access controls, optimize queries, and ensure proper key management

### Success Criteria

- All PII collections encrypted
- No plaintext PII accessible without proper decryption keys
- System performance maintained or improved
- Ready for security audit

**Time is critical. Let's get started.**`,
  storyOutro: `# Mission Complete! 🎉

Congratulations! You've successfully secured the customer's database and prevented a potential data breach.

## What You Accomplished

✅ Encrypted all PII collections using CSFLE and Queryable Encryption  
✅ Verified no plaintext PII remains accessible  
✅ Implemented proper access controls and key management  
✅ Optimized queries for performance  
✅ System ready for security audit

## Impact

- **Compliance:** GDPR requirements met
- **Security:** Data breach risk eliminated
- **Performance:** System optimized for peak traffic
- **Customer Trust:** Brand reputation protected

## Next Steps

The customer's security team can now proceed with their audit. Your work has:
- Protected customer data
- Ensured regulatory compliance
- Maintained system performance
- Built customer confidence

**Well done, specialist!** 🚀`
};
