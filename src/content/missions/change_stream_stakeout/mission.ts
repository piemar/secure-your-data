import { Mission } from '@/lib/types';

export const mission: Mission = {
    id: 'mission-15',
    title: 'Change Stream Stakeout',
    codename: 'WIRETAP',
    tier: 'infiltration',
    description: 'Set up real-time change stream surveillance to detect and react to database mutations as they happen.',
    briefing: `SURVEILLANCE OPERATION\n\nWe need eyes on the transactions collection — real-time. Every insert, update, and delete must be captured and logged. Set up a change stream, filter for suspicious operations, and implement a resume token strategy so we never miss an event, even if the watcher crashes.\n\nThe targets don't know they're being watched. Keep it that way.`,
    objectives: [
      { id: 'obj-15-1', text: 'Open a change stream with collection.watch()', completed: false },
      { id: 'obj-15-2', text: 'Filter changes with $match pipeline', completed: false },
      { id: 'obj-15-3', text: 'Store and use resumeAfter token', completed: false },
      { id: 'obj-15-4', text: 'Handle change events by operationType', completed: false },
    ],
    timeLimit: 600,
    xpReward: 800,
    difficulty: 3,
    topic: 'data-management',
    povCapabilities: ['CHANGE-CAPTURE'],
    chaosEvents: [
      { id: 'chaos-15-1', title: '📡 STREAM DISCONNECTED', description: 'Change stream lost connection! Resume from the last token before events are lost.', triggerAt: 200, penalty: 150, duration: 60 },
    ],
  };
