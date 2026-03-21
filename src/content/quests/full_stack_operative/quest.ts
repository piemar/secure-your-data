import { Quest } from '@/lib/types';
import { MISSIONS } from '@/content/missions';

export const quest: Quest = {
    id: 'quest-full-stack',
    title: 'Full Stack Operative',
    codename: 'OPERATION OVERLORD',
    description: 'Complete every mission across all domains to prove you are the ultimate MongoDB operative.',
    storyIntro: `OPERATION OVERLORD\n\nThis is the final challenge. Complete EVERY mission in the system — query, encryption, analytics, scalability, operations, and deployment. Only the most dedicated agents earn the title of "Atlas Overlord."`,
    storyOutro: `OVERLORD STATUS ACHIEVED\n\nYou've completed every mission. Mastered every domain. Survived every chaos event. You are the Atlas Overlord. The grid bows to you.`,
    missionIds: MISSIONS.map(m => m.id),
    bonusXp: 2000,
    icon: '👑',
    requiredMissions: MISSIONS.length,
  };
