/** Minimal valid player for E2E (matches src/lib/game-store.ts shape). */
export const E2E_PLAYER_JSON = JSON.stringify({
  id: "e2e-test-agent",
  handle: "e2e_agent",
  xp: 0,
  rank: "Script Kiddie",
  level: 1,
  achievements: [],
  completedMissions: [],
  totalScore: 0,
  chaosEventsSurvived: 0,
  hintsUsed: 0,
  hintXpPenalty: 0,
  avatarId: "ghost",
});
