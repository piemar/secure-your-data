import { Quest } from '@/lib/types';
import { MISSIONS } from '@/content/missions';

export const quest: Quest = {
    id: 'quest-fortress',
    title: 'Fortress Protocol',
    codename: 'OPERATION FORTRESS',
    description: 'Secure the database from every angle — schema validation, encryption, and access control.',
    storyIntro: `OPERATION FORTRESS\n\nThe database is under siege. Rogue insiders, compliance auditors, and data thieves are all converging. Your mission chain: first lock down schema validation, then implement field-level encryption. Only agents who complete both earn the "Fortress Guardian" badge.`,
    storyOutro: `FORTRESS SECURED\n\nThe perimeter is locked down. Schema validation catches every invalid document. Field-level encryption ensures even DBAs can't read PII. The fortress holds.`,
    missionIds: ['mission-5', 'mission-7'],
    bonusXp: 750,
    icon: '🏰',
    requiredMissions: 2,
  };
