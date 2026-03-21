import { Mission } from '@/lib/types';

export const mission: Mission = {
    id: 'mission-7',
    title: 'Encryption Lockdown',
    codename: 'CIPHER',
    tier: 'exfiltration',
    description: 'Implement Client-Side Field Level Encryption to protect PII data from database-level access.',
    briefing: `CLASSIFIED — EYES ONLY\n\nOur medical records database has been flagged by compliance. Patient SSNs and health data are stored in plaintext — visible to any DBA with cluster access. Your mission: implement CSFLE using envelope encryption.\n\nCreate a Customer Master Key in KMS, generate Data Encryption Keys, define the encryption schema, and prove that even with direct database access, the encrypted fields show only Binary ciphertext.\n\nNo plaintext. No exceptions.`,
    objectives: [
      { id: 'obj-7-1', text: 'Create Customer Master Key (CMK) in KMS', completed: false },
      { id: 'obj-7-2', text: 'Generate Data Encryption Key (DEK) with ClientEncryption', completed: false },
      { id: 'obj-7-3', text: 'Define encryption schema map with algorithms', completed: false },
      { id: 'obj-7-4', text: 'Create encrypted MongoClient with autoEncryption', completed: false },
      { id: 'obj-7-5', text: 'Insert and query — verify encryption/decryption works', completed: false },
    ],
    timeLimit: 900,
    xpReward: 1200,
    difficulty: 4,
    topic: 'encryption',
    povCapabilities: ['ENCRYPT-FIELDS', 'ENCRYPTION'],
    chaosEvents: [
      { id: 'chaos-7-1', title: '🔓 AUDIT ALERT', description: 'Compliance team running spot check! Encrypted fields must show Binary, not plaintext.', triggerAt: 300, penalty: 250, duration: 90 },
      { id: 'chaos-7-2', title: '🔑 KEY ROTATION REQUIRED', description: 'Security policy mandates key rotation. New DEK must be generated!', triggerAt: 600, penalty: 150, duration: 60 },
    ],
  };
