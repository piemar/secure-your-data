import { Quest } from '@/lib/types';

export const quest: Quest = {
  id: 'quest-obfuscated-intelligence',
  title: 'Obfuscated Intelligence',
  codename: 'OPERATION VEILVECTOR',
  description: 'Secure semantic retrieval with CSFLE-protected matrix keys, orthogonal vector obfuscation, and auditable search.',
  storyIntro: `OPERATION VEILVECTOR

Your data platform must support semantic retrieval while preserving strict privacy controls. You will secure the obfuscation key material with CSFLE, transform embeddings with an orthogonal matrix, and run traceable search over obfuscated vectors.`,
  storyOutro: `VEILVECTOR COMPLETE

Key material remains encrypted. Vectors stay obfuscated at rest. Semantic retrieval is still accurate. Every match is auditable.`,
  missionIds: ['mission-21', 'mission-22', 'mission-23'],
  bonusXp: 900,
  icon: '🧬',
  requiredMissions: 3,
};
