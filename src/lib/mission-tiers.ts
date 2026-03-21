/**
 * Frontend mirror of server MISSION_TIERS — determines validation strategy per mission.
 */
export type ValidationTier = 'pattern' | 'execute' | 'simulate' | 'hold';

export const MISSION_TIERS: Record<string, ValidationTier> = {
  // Tier 2: Sandboxed Execution
  'mission-12': 'execute',
  'mission-1': 'execute',
  'mission-3': 'execute',
  'mission-5': 'execute',
  'mission-6': 'execute',
  'mission-8': 'execute',
  'mission-13': 'execute',
  'mission-14': 'execute',
  'mission-15': 'execute',
  'mission-16': 'execute',
  'mission-18': 'execute',
  'mission-20': 'execute',

  // Tier 3: On hold for now (previously simulated/cloud-proxy)
  'mission-2': 'hold',
  'mission-9': 'hold',
  'mission-10': 'hold',

  // Tier 1: Pattern Only
  'mission-4': 'pattern',
  'mission-7': 'pattern',
  'mission-11': 'pattern',
  'mission-17': 'pattern',
  'mission-19': 'pattern',
  'mission-21': 'pattern',
  'mission-22': 'pattern',
  'mission-23': 'pattern',
  'mission-24': 'pattern',
  'mission-25': 'pattern',
};

export function getMissionTier(missionId: string): ValidationTier {
  return MISSION_TIERS[missionId] || 'pattern';
}

export function isMissionTierOnHold(missionId: string): boolean {
  return getMissionTier(missionId) === 'hold';
}
