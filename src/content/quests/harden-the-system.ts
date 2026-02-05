import { WorkshopQuest } from '@/types';

/**
 * Quest: Harden the System
 * 
 * Part of the retail data breach simulation challenge.
 * Focuses on access control, indexes, and query optimization.
 */
export const hardenTheSystemQuest: WorkshopQuest = {
  id: 'quest-harden-the-system',
  title: 'Harden the System',
  storyContext: `With encryption in place, you now need to ensure the system is hardened against unauthorized access and performance issues.

**The Situation:**
- Multiple applications and services access the database
- Some queries are slow and could impact customer experience during peak traffic
- Access patterns need to be audited and controlled
- The security team wants to ensure only authorized services can decrypt sensitive data

**Your Objective:**
Implement proper access controls, optimize queries with indexes, and ensure encryption keys are properly managed.`,
  objectiveSummary: 'Implement access controls, optimize queries, and ensure proper key management',
  labIds: ['lab-right-to-erasure'],
  requiredFlagIds: [
    'flag-proper-indexes',
    'flag-access-control-audit'
  ],
  optionalFlagIds: [
    'flag-query-optimization'
  ],
  modes: ['challenge', 'lab']
};
