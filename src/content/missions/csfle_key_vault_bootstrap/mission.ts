import { Mission } from '@/lib/types';

export const mission: Mission = {
  id: 'mission-21',
  title: 'CSFLE Key Vault Bootstrap',
  codename: 'VAULTBOOT',
  tier: 'infiltration',
  description: 'Configure a CSFLE key vault and schema map to protect the orthogonal matrix used for vector obfuscation.',
  briefing: `KEY MATERIAL IS THE CROWN JEWEL

The vector obfuscation pipeline depends on an orthogonal matrix. If that matrix leaks, the transformation can be reversed. Your first objective is to secure the matrix with CSFLE by defining a key vault namespace, data key alias, and schema map rules.

No plaintext matrix. No exceptions.`,
  objectives: [
    { id: 'obj-21-1', text: 'Define the CSFLE key vault namespace and encrypted field path', completed: false },
    { id: 'obj-21-2', text: 'Create a data key and persist the keyAltName', completed: false },
    { id: 'obj-21-3', text: 'Configure auto-encryption schema for orthogonal_matrix', completed: false },
    { id: 'obj-21-4', text: 'Write/read obfuscation_config so decryption is transparent in app code', completed: false },
  ],
  timeLimit: 660,
  xpReward: 850,
  difficulty: 4,
  topic: 'encryption',
  povCapabilities: ['ENCRYPT-FIELDS', 'ENCRYPTION'],
  chaosEvents: [
    {
      id: 'chaos-21-1',
      title: '🔐 KEY VAULT DRIFT',
      description: 'A teammate changed namespace naming. Re-anchor your schema map and key alias.',
      triggerAt: 280,
      penalty: 120,
      duration: 60,
    },
  ],
};
