import { Quest } from '@/lib/types';
import { MISSIONS } from '@/content/missions';

export const quest: Quest = {
    id: 'quest-intel-ops',
    title: 'Intelligence Operations',
    codename: 'OPERATION DARKNET',
    description: 'Advanced reconnaissance — geospatial tracking, graph analysis, and real-time surveillance.',
    storyIntro: `OPERATION DARKNET\n\nThe network is vast. Assets are scattered across the globe, connected through hidden relationships, and communicating in real-time. You'll need geospatial tracking, graph traversal, change stream surveillance, and full-text search to map the entire operation.`,
    storyOutro: `DARKNET EXPOSED\n\nEvery asset tracked. Every connection mapped. Every change captured in real-time. The intelligence network is fully operational.`,
    missionIds: ['mission-13', 'mission-14', 'mission-15', 'mission-17'],
    bonusXp: 800,
    icon: '🕵️',
    requiredMissions: 4,
  };
