/**
 * Collection name constants for mongodb_mayhem database.
 * Centralised to prevent typos and enable easy refactoring.
 */
export const COLLECTIONS = {
  USERS: 'users',
  WORKSHOP_SESSIONS: 'workshop_sessions',
  WORKSHOP_TEMPLATES: 'workshop_templates',
  PLAYER_PROGRESS: 'player_progress',
  LEADERBOARD: 'leaderboard',
  METRICS_EVENTS: 'metrics_events',
  FLAGS: 'flags',
  SEED_DATA: 'seed_data',
} as const;
