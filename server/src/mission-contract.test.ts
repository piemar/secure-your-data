/**
 * Tier-2 missions must have seed + verification definitions.
 * Run: cd server && npm test
 */
import { describe, it, expect } from 'vitest';
import { MISSION_TIERS } from './config/mission-tiers.js';
import { SEED_DATA } from './config/seed-data.js';
import { VERIFICATION_CHECKS } from './config/verification-checks.js';

describe('execute-tier mission contract (server)', () => {
  const executeMissions = Object.entries(MISSION_TIERS)
    .filter(([, tier]) => tier === 'execute')
    .map(([id]) => id);

  it('has seed data for every execute-tier mission', () => {
    for (const id of executeMissions) {
      expect(SEED_DATA[id], `SEED_DATA missing for execute mission ${id}`).toBeDefined();
      expect(SEED_DATA[id].collections.length).toBeGreaterThan(0);
    }
  });

  it('has verification checks for every execute-tier mission', () => {
    for (const id of executeMissions) {
      const checks = VERIFICATION_CHECKS[id];
      expect(checks, `VERIFICATION_CHECKS missing for execute mission ${id}`).toBeDefined();
      expect(checks!.length).toBeGreaterThan(0);
    }
  });
});
