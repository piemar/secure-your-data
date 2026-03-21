import { Mission } from '@/lib/types';

export const mission: Mission = {
    id: 'mission-5',
    title: 'The Schema Saboteur',
    codename: 'SABOTEUR',
    tier: 'exfiltration',
    description: 'Find and fix schema validation issues planted by a rogue insider across 5 collections.',
    briefing: `INSIDER THREAT CONFIRMED\n\nA rogue developer has sabotaged schema validation rules across 5 critical collections. Invalid documents are being inserted, data integrity is compromised, and downstream services are consuming corrupted data. Hunt down every tampered validation rule, restore proper JSON Schema validators, and ensure no more bad data gets through.\n\nTrust no document.`,
    objectives: [
      { id: 'obj-5-1', text: 'Audit all collection validators', completed: false },
      { id: 'obj-5-2', text: 'Identify tampered validation rules', completed: false },
      { id: 'obj-5-3', text: 'Fix validation on users collection', completed: false },
      { id: 'obj-5-4', text: 'Fix validation on transactions collection', completed: false },
      { id: 'obj-5-5', text: 'Fix validation on sessions collection', completed: false },
      { id: 'obj-5-6', text: 'Verify all validators reject invalid documents', completed: false },
    ],
    timeLimit: 1200,
    xpReward: 1500,
    difficulty: 5,
    topic: 'security',
    povCapabilities: ['SCHEMA'],
    chaosEvents: [
      { id: 'chaos-5-1', title: '🕵️ INSIDER STILL ACTIVE', description: 'The saboteur just changed another validator! Check the orders collection!', triggerAt: 400, penalty: 300, duration: 120 },
      { id: 'chaos-5-2', title: '📊 DATA CORRUPTION SPREADING', description: 'Invalid documents detected in analytics pipeline. Corruption rate: 23%', triggerAt: 700, penalty: 250, duration: 90 },
    ],
  };
