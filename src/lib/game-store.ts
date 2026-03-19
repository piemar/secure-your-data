import { Player, PlayerRank } from './types';
import { RANK_THRESHOLDS } from './game-data';

const STORAGE_KEY = 'mongodb-heist-player';

function getRank(xp: number): PlayerRank {
  let rank: PlayerRank = 'Script Kiddie';
  for (const t of RANK_THRESHOLDS) {
    if (xp >= t.minXP) rank = t.rank as PlayerRank;
  }
  return rank;
}

function getLevel(xp: number): number {
  return Math.floor(xp / 250) + 1;
}

export function getPlayer(): Player | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function createPlayer(handle: string): Player {
  const player: Player = {
    id: crypto.randomUUID(),
    handle,
    xp: 0,
    rank: 'Script Kiddie',
    level: 1,
    achievements: [],
    completedMissions: [],
    totalScore: 0,
    chaosEventsSurvived: 0,
    hintsUsed: 0,
    hintXpPenalty: 0,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
  return player;
}

export function updatePlayer(updates: Partial<Player>): Player {
  const current = getPlayer();
  if (!current) throw new Error('No player found');
  const updated = { ...current, ...updates };
  updated.rank = getRank(updated.xp);
  updated.level = getLevel(updated.xp);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function addXP(amount: number): Player {
  const current = getPlayer();
  if (!current) throw new Error('No player found');
  return updatePlayer({ xp: current.xp + amount, totalScore: current.totalScore + amount });
}

export function completeMission(missionId: string, xpEarned: number): Player {
  const current = getPlayer();
  if (!current) throw new Error('No player found');
  const completedMissions = [...new Set([...current.completedMissions, missionId])];
  return updatePlayer({
    completedMissions,
    xp: current.xp + xpEarned,
    totalScore: current.totalScore + xpEarned,
  });
}

export function unlockAchievement(achievementId: string): Player {
  const current = getPlayer();
  if (!current) throw new Error('No player found');
  const achievements = [...new Set([...current.achievements, achievementId])];
  return updatePlayer({ achievements });
}

export function setPreferredDifficulty(difficulty: 'guided' | 'challenge' | 'expert'): Player {
  return updatePlayer({ preferredDifficulty: difficulty });
}

export function clearPlayer(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export { getRank, getLevel };
