import { Quest } from '@/lib/types';
import { MISSIONS } from '@/content/missions';

export const quest: Quest = {
    id: 'quest-data-heist',
    title: 'The Data Heist',
    codename: 'OPERATION GENESIS',
    description: 'Master the complete MongoDB workflow — from basic CRUD to complex aggregations and indexing.',
    storyIntro: `OPERATION GENESIS\n\nAgent, this is your initiation into the MongoDB underground. You'll start with the basics — creating and querying documents. Then you'll graduate to compound queries, aggregation pipelines, and index optimization.\n\nComplete all four missions in sequence and you'll earn the "Genesis Agent" title and bonus XP.`,
    storyOutro: `OPERATION GENESIS COMPLETE\n\nYou've proven your mastery of MongoDB's core query engine. From simple CRUD to complex aggregation pipelines — you handled it all. The next operations will be harder. Rest up, agent.`,
    missionIds: ['mission-12', 'mission-6', 'mission-3', 'mission-1'],
    bonusXp: 500,
    icon: '🎯',
    requiredMissions: 4,
  };
