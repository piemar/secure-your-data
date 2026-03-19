import { useMemo, useRef, useEffect, useState } from 'react';
import { Mission, MissionTier } from '@/lib/types';
import { MISSION_PREREQUISITES, isMissionUnlocked } from '@/lib/mission-prerequisites';
import { getMissionIcon } from '@/lib/mission-icons';
import { soundEngine } from '@/lib/sound-engine';

interface MissionNodeGraphProps {
  missions: Mission[];
  completedMissions: string[];
  onMissionClick: (missionId: string) => void;
}

const TIER_META: Record<MissionTier, { label: string; color: string }> = {
  recon: { label: 'RECON', color: 'hsl(var(--primary))' },
  infiltration: { label: 'INFILTRATION', color: 'hsl(var(--warning))' },
  exfiltration: { label: 'EXFILTRATION', color: 'hsl(var(--destructive))' },
};

interface NodeData {
  mission: Mission;
  x: number;
  y: number;
  tier: MissionTier;
}

// Matrix rain particles for background
function MatrixParticles() {
  const chars = '01アイウエオカキクケコ';
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 4 + Math.random() * 6,
      char: chars[Math.floor(Math.random() * chars.length)],
      size: 8 + Math.random() * 6,
      opacity: 0.05 + Math.random() * 0.1,
    })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <span
          key={p.id}
          className="absolute font-mono text-primary animate-[matrix-fall_linear_infinite]"
          style={{
            left: `${p.x}%`,
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.char}
        </span>
      ))}
    </div>
  );
}

export function MissionNodeGraph({ missions, completedMissions, onMissionClick }: MissionNodeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Layout: vertical winding path, missions snake left-right
  const { nodes, connections, totalHeight, tierSections } = useMemo(() => {
    const tierOrder: MissionTier[] = ['recon', 'infiltration', 'exfiltration'];
    const byTier: Record<MissionTier, Mission[]> = { recon: [], infiltration: [], exfiltration: [] };
    for (const m of missions) byTier[m.tier].push(m);

    const allNodes: NodeData[] = [];
    const conns: { from: NodeData; to: NodeData }[] = [];
    const sections: { tier: MissionTier; yStart: number }[] = [];

    const nodeW = 700; // usable width
    const nodeSpacingY = 120;
    const tierGap = 60;
    const paddingTop = 60;
    const nodesPerRow = 3;
    let currentY = paddingTop;

    for (const tier of tierOrder) {
      sections.push({ tier, yStart: currentY });
      currentY += 40; // space for tier label
      const tierMissions = byTier[tier];

      tierMissions.forEach((m, i) => {
        const row = Math.floor(i / nodesPerRow);
        const col = i % nodesPerRow;
        // Snake: even rows left-to-right, odd rows right-to-left
        const actualCol = row % 2 === 0 ? col : (nodesPerRow - 1 - col);
        const xSpacing = nodeW / (nodesPerRow + 1);
        const x = 50 + xSpacing * (actualCol + 1);
        const y = currentY + row * nodeSpacingY;

        allNodes.push({ mission: m, x, y, tier });
      });

      const rows = Math.ceil(tierMissions.length / nodesPerRow);
      currentY += rows * nodeSpacingY + tierGap;
    }

    // Build map for connections
    const nodeMap = new Map(allNodes.map(n => [n.mission.id, n]));
    for (const [missionId, prereqs] of Object.entries(MISSION_PREREQUISITES)) {
      const toNode = nodeMap.get(missionId);
      if (!toNode) continue;
      for (const prereq of prereqs) {
        const fromNode = nodeMap.get(prereq);
        if (fromNode) conns.push({ from: fromNode, to: toNode });
      }
    }

    // Also connect sequential nodes within the same tier for the trail
    for (const tier of tierOrder) {
      const tierNodes = allNodes.filter(n => n.tier === tier);
      for (let i = 1; i < tierNodes.length; i++) {
        const from = tierNodes[i - 1];
        const to = tierNodes[i];
        // Only add if not already a prerequisite connection
        const exists = conns.some(c =>
          c.from.mission.id === from.mission.id && c.to.mission.id === to.mission.id
        );
        if (!exists) conns.push({ from, to });
      }
    }

    return { nodes: allNodes, connections: conns, totalHeight: currentY + 40, tierSections: sections };
  }, [missions]);

  const svgWidth = 800;

  return (
    <div ref={containerRef} className="relative w-full rounded-lg border border-border overflow-hidden bg-gradient-to-b from-background via-card to-background">
      <MatrixParticles />

      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <svg
        width="100%"
        height={totalHeight}
        viewBox={`0 0 ${svgWidth} ${totalHeight}`}
        className="relative z-10"
        style={{ minHeight: 500 }}
      >
        <defs>
          <filter id="node-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="node-glow-strong">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Animated dash for trail */}
          <linearGradient id="trail-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Tier section labels */}
        {tierSections.map(({ tier, yStart }) => (
          <g key={tier}>
            <text
              x={50}
              y={yStart + 14}
              className="font-mono"
              fontSize="11"
              fill={TIER_META[tier].color}
              opacity="0.6"
              letterSpacing="3"
            >
              {'▸ ' + TIER_META[tier].label}
            </text>
            <line
              x1={50}
              y1={yStart + 22}
              x2={svgWidth - 50}
              y2={yStart + 22}
              stroke={TIER_META[tier].color}
              strokeWidth="0.5"
              opacity="0.15"
            />
          </g>
        ))}

        {/* Connection trails */}
        {connections.map(({ from, to }, i) => {
          const fromCompleted = completedMissions.includes(from.mission.id);
          const toCompleted = completedMissions.includes(to.mission.id);
          const bothComplete = fromCompleted && toCompleted;
          const oneComplete = fromCompleted || toCompleted;

          // Bezier curve for organic path
          const midY = (from.y + to.y) / 2;
          const d = `M${from.x},${from.y} C${from.x},${midY} ${to.x},${midY} ${to.x},${to.y}`;

          return (
            <g key={i}>
              {/* Shadow trail */}
              <path
                d={d}
                fill="none"
                stroke={bothComplete ? 'hsl(var(--primary))' : oneComplete ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
                strokeWidth={bothComplete ? 3 : 1.5}
                opacity={bothComplete ? 0.4 : oneComplete ? 0.15 : 0.08}
                strokeLinecap="round"
              />
              {/* Animated dashed overlay for active paths */}
              {oneComplete && !bothComplete && (
                <path
                  d={d}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth={1.5}
                  strokeDasharray="6 8"
                  opacity={0.3}
                  strokeLinecap="round"
                >
                  <animate attributeName="stroke-dashoffset" from="28" to="0" dur="2s" repeatCount="indefinite" />
                </path>
              )}
            </g>
          );
        })}

        {/* Mission nodes */}
        {nodes.map(node => {
          const { mission: m, x, y } = node;
          const isCompleted = completedMissions.includes(m.id);
          const unlocked = isMissionUnlocked(m.id, completedMissions);
          const isHovered = hoveredId === m.id;
          const tierColor = TIER_META[m.tier].color;
          const icon = getMissionIcon(m.codename);
          const nodeRadius = 26;

          return (
            <g
              key={m.id}
              onClick={() => {
                if (unlocked) {
                  soundEngine.play('click');
                  onMissionClick(m.id);
                }
              }}
              onMouseEnter={() => setHoveredId(m.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={unlocked ? 'cursor-pointer' : 'cursor-not-allowed'}
              opacity={unlocked ? 1 : 0.3}
              style={{ transition: 'opacity 0.3s' }}
            >
              {/* Pulse ring for available (unlocked, not completed) */}
              {unlocked && !isCompleted && (
                <circle cx={x} cy={y} r={nodeRadius + 6} fill="none" stroke={tierColor} strokeWidth={1} opacity={0.3}>
                  <animate attributeName="r" from={nodeRadius + 2} to={nodeRadius + 12} dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.3" to="0" dur="2.5s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Glow bg for completed */}
              {isCompleted && (
                <circle cx={x} cy={y} r={nodeRadius + 4} fill={tierColor} opacity={0.1} filter="url(#node-glow-strong)" />
              )}

              {/* Hexagonal-ish node (rounded rect) */}
              <rect
                x={x - nodeRadius}
                y={y - nodeRadius}
                width={nodeRadius * 2}
                height={nodeRadius * 2}
                rx={isCompleted ? nodeRadius : 8}
                fill={isCompleted ? tierColor : 'hsl(var(--card))'}
                stroke={isCompleted ? tierColor : isHovered ? tierColor : 'hsl(var(--border))'}
                strokeWidth={isCompleted ? 2 : isHovered ? 1.5 : 1}
                filter={isCompleted || isHovered ? 'url(#node-glow)' : undefined}
                style={{ transition: 'all 0.2s' }}
              />

              {/* Inner icon */}
              {unlocked ? (
                <g transform={`translate(${x - 10}, ${y - 10}) scale(0.83)`}>
                  <path
                    d={icon.path}
                    fill="none"
                    stroke={isCompleted ? 'hsl(var(--primary-foreground))' : tierColor}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={isCompleted ? 1 : 0.8}
                  />
                </g>
              ) : (
                <text x={x} y={y + 4} textAnchor="middle" fontSize="14" fill="hsl(var(--muted-foreground))">
                  🔒
                </text>
              )}

              {/* Completion check badge */}
              {isCompleted && (
                <g>
                  <circle cx={x + nodeRadius - 4} cy={y - nodeRadius + 4} r={7} fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth={2} />
                  <text x={x + nodeRadius - 4} y={y - nodeRadius + 7.5} textAnchor="middle" fontSize="9" fill="hsl(var(--primary-foreground))" fontWeight="bold">✓</text>
                </g>
              )}

              {/* Difficulty dots */}
              {unlocked && !isCompleted && (
                <g>
                  {Array.from({ length: Math.min(m.difficulty, 5) }, (_, di) => (
                    <circle
                      key={di}
                      cx={x - ((Math.min(m.difficulty, 5) - 1) * 4) / 2 + di * 4}
                      cy={y + nodeRadius + 10}
                      r={1.5}
                      fill={tierColor}
                      opacity={0.7}
                    />
                  ))}
                </g>
              )}

              {/* Codename label */}
              <text
                x={x}
                y={y + nodeRadius + (unlocked && !isCompleted ? 22 : 14)}
                textAnchor="middle"
                className="font-mono"
                fontSize="8"
                fill="hsl(var(--foreground))"
                opacity={unlocked ? 0.8 : 0.3}
                letterSpacing="1"
              >
                {m.codename}
              </text>

              {/* Hover tooltip */}
              {isHovered && unlocked && (
                <g>
                  <rect
                    x={x - 80}
                    y={y - nodeRadius - 36}
                    width={160}
                    height={26}
                    rx={4}
                    fill="hsl(var(--popover))"
                    stroke="hsl(var(--border))"
                    strokeWidth={0.5}
                    opacity={0.95}
                  />
                  <text
                    x={x}
                    y={y - nodeRadius - 20}
                    textAnchor="middle"
                    className="font-mono"
                    fontSize="9"
                    fill="hsl(var(--foreground))"
                  >
                    {m.title}
                  </text>
                  <text
                    x={x}
                    y={y - nodeRadius - 11}
                    textAnchor="middle"
                    className="font-mono"
                    fontSize="7"
                    fill="hsl(var(--primary))"
                  >
                    {isCompleted ? '✓ COMPLETED' : `+${m.xpReward} XP`}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
