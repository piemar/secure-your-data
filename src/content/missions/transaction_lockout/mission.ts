import { Mission } from '@/lib/types';

export const mission: Mission = {
    id: 'mission-16',
    title: 'Transaction Lockout',
    codename: 'ACIDRAIN',
    tier: 'infiltration',
    description: 'Execute multi-document ACID transactions to transfer funds atomically across accounts — no partial writes.',
    briefing: `CRITICAL TRANSFER\n\nFunds need to move between accounts atomically. If the debit succeeds but the credit fails, money vanishes. Your mission: start a session, begin a transaction, perform multiple writes across collections, and either commit all changes or abort everything.\n\nThere is no "partial success" in this operation.`,
    objectives: [
      { id: 'obj-16-1', text: 'Start a client session for transactions', completed: false },
      { id: 'obj-16-2', text: 'Begin transaction with readConcern/writeConcern', completed: false },
      { id: 'obj-16-3', text: 'Execute multi-document writes within the transaction', completed: false },
      { id: 'obj-16-4', text: 'Commit or abort the transaction', completed: false },
    ],
    timeLimit: 600,
    xpReward: 850,
    difficulty: 3,
    topic: 'data-management',
    povCapabilities: ['TRANSACTION'],
    chaosEvents: [
      { id: 'chaos-16-1', title: '🔒 WRITE CONFLICT', description: 'Another transaction modified the same document! Handle the conflict.', triggerAt: 250, penalty: 150, duration: 60 },
    ],
  };
