import { api, getAuthToken } from '@/services/api';
import { Player } from '@/lib/types';
import { getPlayer, setPlayer } from '@/lib/game-store';

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter(v => typeof v === 'string') : [];
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

export function normalizeServerPlayer(data: Record<string, unknown>, fallbackHandle = 'Agent'): Player {
  const xp = asNumber(data.xp, 0);
  const level = asNumber(data.level, Math.floor(xp / 250) + 1);

  return {
    id: asString(data.userId, crypto.randomUUID()),
    handle: asString(data.handle, fallbackHandle),
    xp,
    rank: asString(data.rank, 'Script Kiddie') as Player['rank'],
    level,
    achievements: asStringArray(data.achievements),
    completedMissions: asStringArray(data.completedMissions),
    totalScore: asNumber(data.totalScore, xp),
    chaosEventsSurvived: asNumber(data.chaosEventsSurvived, 0),
    hintsUsed: asNumber(data.hintsUsed, 0),
    hintXpPenalty: asNumber(data.hintXpPenalty, 0),
    avatarId: asString(data.avatarId, 'ghost'),
    preferredDifficulty:
      data.preferredDifficulty === 'guided' ||
      data.preferredDifficulty === 'challenge' ||
      data.preferredDifficulty === 'expert'
        ? data.preferredDifficulty
        : undefined,
    activeQuestId: typeof data.activeQuestId === 'string' ? data.activeQuestId : undefined,
    fastestMission: typeof data.fastestMission === 'number' ? data.fastestMission : undefined,
  };
}

export async function pullPlayerFromServer(fallbackHandle = 'Agent'): Promise<Player | null> {
  if (!getAuthToken()) return null;
  try {
    const remote = await api.players.me();
    const normalized = normalizeServerPlayer(remote, fallbackHandle);
    setPlayer(normalized);
    return normalized;
  } catch {
    return null;
  }
}

export async function syncLocalPlayerToServer(): Promise<Player | null> {
  if (!getAuthToken()) return null;
  const local = getPlayer();
  if (!local) return pullPlayerFromServer();

  try {
    const merged = await api.players.sync(local as unknown as Record<string, unknown>);
    const normalized = normalizeServerPlayer(merged, local.handle);
    setPlayer(normalized);
    return normalized;
  } catch {
    return pullPlayerFromServer(local.handle);
  }
}
