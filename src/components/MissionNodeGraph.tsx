import { useMemo } from 'react';
import { Mission, MissionTier } from '@/lib/types';
import { MISSION_PREREQUISITES, isMissionUnlocked } from '@/lib/mission-prerequisites';
import { soundEngine } from '@/lib/sound-engine';

interface MissionNodeGraphProps {
  missions: Mission[];
  completedMissions: string[];
  onMissionClick: (missionId: string) => void;
}

interface NodePosition {
  x: number;
  y: number;
}

const TIER_COLORS: Record<MissionTier, string> = {
  recon: 'hsl(var(--primary))',
  infiltration: 'hsl(var(--warning))',
  exfiltration: 'hsl(var(--destructive))',
};

const TIER_Y_BASE: Record<MissionTier, number> = {
  recon: 80,
  infiltration: 240,
  exfiltration: 400,
};

export function MissionNodeGraph({ missions, completedMissions, onMissionClick }: MissionNodeGraphProps) {
  const { positions, connections } = useMemo(() => {
    const pos: Record<string, NodePosition> = {};
    const conns: { from: string; to: string }[] = [];

    // Position missions by tier with horizontal spread
    const byTier: Record<MissionTier, Mission[]> = { recon: [], infiltration: [], exfiltration: [] };
    for (const m of missions) byTier[m.tier].push(m);

    for (const tier of ['recon', 'infiltration', 'exfiltration'] as MissionTier[]) {
      const tierMissions = byTier[tier];
      const spacing = 900 / (tierMissions.length + 1);
      tierMissions.forEach((m, i) => {
        // Add slight vertical jitter for organic feel
        const jitter = (i % 2 === 0 ? -15 : 15);
        pos[m.id] = {
          x: spacing * (i + 1),
          y: TIER_Y_BASE[tier] + jitter,
        };
      });
    }

    // Build connections from prerequisites
    for (const [missionId, prereqs] of Object.entries(MISSION_PREREQUISITES)) {
      for (const prereq of prereqs) {
        if (pos[prereq] && pos[missionId]) {
          conns.push({ from: prereq, to: missionId });
        }
      }
    }

    return { positions: pos, connections: conns };
  }, [missions]);

  return (
    <div className="relative w-full overflow-x-auto">
      <svg width="900" height="520" className="w-full" viewBox="0 0 900 520">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-strong">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Tier labels */}
        {(['recon', 'infiltration', 'exfiltration'] as MissionTier[]).map(tier => (
          <text
            key={tier}
            x={12}
            y={TIER_Y_BASE[tier] - 30}
            className="fill-muted-foreground font-mono"
            fontSize="10"
            opacity="0.5"
          >
            {tier.toUpperCase()}
          </text>
        ))}

        {/* Connection lines */}
        {connections.map(({ from, to }, i) => {
          const fromPos = positions[from];
          const toPos = positions[to];
          if (!fromPos || !toPos) return null;
          const isCompleted = completedMissions.includes(from) && completedMissions.includes(to);
          const isPartial = completedMissions.includes(from);

          return (
            <line
              key={i}
              x1={fromPos.x}
              y1={fromPos.y}
              x2={toPos.x}
              y2={toPos.y}
              stroke={isCompleted ? 'hsl(var(--primary))' : isPartial ? 'hsl(var(--primary) / 0.3)' : 'hsl(var(--border))'}
              strokeWidth={isCompleted ? 2 : 1}
              strokeDasharray={isCompleted ? undefined : '4 4'}
              opacity={isCompleted ? 0.8 : 0.4}
            />
          );
        })}

        {/* Mission nodes */}
        {missions.map(m => {
          const pos = positions[m.id];
          if (!pos) return null;
          const isCompleted = completedMissions.includes(m.id);
          const unlocked = isMissionUnlocked(m.id, completedMissions);
          const nodeColor = TIER_COLORS[m.tier];

          return (
            <g
              key={m.id}
              onClick={() => {
                if (unlocked) {
                  soundEngine.play('click');
                  onMissionClick(m.id);
                }
              }}
              className={unlocked ? 'cursor-pointer' : 'cursor-not-allowed'}
              opacity={unlocked ? 1 : 0.35}
            >
              {/* Pulse ring for available missions */}
              {unlocked && !isCompleted && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={28}
                  fill="none"
                  stroke={nodeColor}
                  strokeWidth={1}
                  opacity={0.4}
                >
                  <animate attributeName="r" from="24" to="32" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Node circle */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={22}
                fill={isCompleted ? nodeColor : 'hsl(var(--card))'}
                stroke={nodeColor}
                strokeWidth={isCompleted ? 2.5 : 1.5}
                filter={isCompleted ? 'url(#glow)' : undefined}
              />

              {/* Completion checkmark */}
              {isCompleted && (
                <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize="14" fill="hsl(var(--card))">✓</text>
              )}

              {/* Lock icon */}
              {!unlocked && (
                <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize="12" fill="hsl(var(--muted-foreground))">🔒</text>
              )}

              {/* Difficulty stars for unlocked incomplete */}
              {unlocked && !isCompleted && (
                <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize="10" fill={nodeColor}>
                  {'★'.repeat(Math.min(m.difficulty, 5))}
                </text>
              )}

              {/* Mission name label */}
              <text
                x={pos.x}
                y={pos.y + 38}
                textAnchor="middle"
                className="font-mono fill-foreground"
                fontSize="8"
                opacity={unlocked ? 0.9 : 0.4}
              >
                {m.codename}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
