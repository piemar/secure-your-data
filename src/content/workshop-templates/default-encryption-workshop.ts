import { WorkshopTemplate } from '@/types';

/**
 * Default Encryption Workshop Template
 * 
 * This is the standard workshop template that mirrors the current
 * three-lab encryption workshop structure.
 */
export const defaultEncryptionWorkshopTemplate: WorkshopTemplate = {
  id: 'default-encryption-workshop',
  name: 'Encryption Workshop',
  description: 'Standard MongoDB encryption workshop covering CSFLE, Queryable Encryption, and GDPR patterns',
  topicIds: ['encryption'],
  labIds: [
    'lab-csfle-fundamentals',
    'lab-queryable-encryption',
    'lab-right-to-erasure'
  ],
  defaultMode: 'lab',
  allowedModes: ['demo', 'lab'],
  gamification: {
    enabled: true,
    basePointsPerStep: 10,
    bonusPointsPerFlag: 25,
    bonusPointsPerQuest: 50,
    allowTeams: false
  },
  includeCompetitorComparisons: false
};
