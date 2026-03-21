/**
 * Content contract: every shipped mission must have aligned client artifacts.
 * Run: npm test
 */
import { describe, it, expect } from 'vitest';
import { MISSIONS } from '@/content/missions/mission';
import { QUESTS } from '@/content/quests/quest';
import { MISSION_VALIDATIONS } from '@/content/missions/validation';
import { MISSION_SKELETONS } from '@/content/missions/skeletons';
import { MISSION_TIERS } from '../../server/src/config/mission-tiers';

const missionIds = new Set(MISSIONS.map((m) => m.id));

describe('mission content contract (client)', () => {
  it('defines a tier for every shipped mission', () => {
    for (const m of MISSIONS) {
      expect(MISSION_TIERS[m.id], `MISSION_TIERS missing for ${m.id}`).toBeDefined();
    }
  });

  it('has validations and skeletons for every mission', () => {
    for (const m of MISSIONS) {
      expect(MISSION_VALIDATIONS[m.id], `MISSION_VALIDATIONS missing for ${m.id}`).toBeDefined();
      expect(MISSION_SKELETONS[m.id], `MISSION_SKELETONS missing for ${m.id}`).toBeDefined();
    }
  });

  it('aligns validation objective ids with game-data objectives', () => {
    for (const m of MISSIONS) {
      const rules = MISSION_VALIDATIONS[m.id];
      expect(rules?.length).toBe(m.objectives.length);
      const fromMission = m.objectives.map((o) => o.id).sort();
      const fromRules = rules.map((r) => r.objectiveId).sort();
      expect(fromRules).toEqual(fromMission);
    }
  });

  it('references only existing missions in quests', () => {
    for (const q of QUESTS) {
      for (const mid of q.missionIds) {
        expect(missionIds.has(mid), `Quest ${q.id} references unknown mission ${mid}`).toBe(true);
      }
      expect(q.requiredMissions).toBeLessThanOrEqual(q.missionIds.length);
    }
  });
});

describe('MISSION_TIERS hygiene', () => {
  it('does not define tiers for unknown missions (avoid stale keys)', () => {
    for (const id of Object.keys(MISSION_TIERS)) {
      expect(missionIds.has(id), `MISSION_TIERS has ${id} but no MISSIONS entry`).toBe(true);
    }
  });
});
