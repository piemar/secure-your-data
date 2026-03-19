import { useMemo, useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Mission, MissionTier } from '@/lib/types';
import { MISSION_PREREQUISITES, isMissionUnlocked } from '@/lib/mission-prerequisites';
import { getMissionIcon } from '@/lib/mission-icons';
import { soundEngine } from '@/lib/sound-engine';

interface MissionNodeGraphProps {
  missions: Mission[];
  completedMissions: string[];
  onMissionClick: (missionId: string) => void;
  highlightedMissionId?: string | null;
}

const TIER_META: Record<MissionTier, { label: string; color: string; glowColor: string }> = {
  recon: { label: 'RECON', color: 'hsl(var(--primary))', glowColor: '#00ED64' },
  infiltration: { label: 'INFILTRATION', color: 'hsl(var(--warning))', glowColor: '#F5A623' },
  exfiltration: { label: 'EXFILTRATION', color: 'hsl(var(--destructive))', glowColor: '#FF4444' },
};

interface NodeData {
  mission: Mission;
  x: number;
  y: number;
  tier: MissionTier;
}

export const MissionNodeGraph = forwardRef<{ scrollToNode: (id: string) => void }, MissionNodeGraphProps>(
  ({ missions, completedMissions, onMissionClick, highlightedMissionId }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      scrollToNode: (id: string) => {
        const el = containerRef.current?.querySelector(`[data-node-id="${id}"]`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      },
    }));

    const { nodes, connections, totalHeight, tierSections } = useMemo(() => {
      const tierOrder: MissionTier[] = ['recon', 'infiltration', 'exfiltration'];
      const byTier: Record<MissionTier, Mission[]> = { recon: [], infiltration: [], exfiltration: [] };
      for (const m of missions) byTier[m.tier].push(m);

      const allNodes: NodeData[] = [];
      const conns: { from: NodeData; to: NodeData }[] = [];
      const sections: { tier: MissionTier; yStart: number }[] = [];

      const nodeW = 700;
      const nodeSpacingY = 140;
      const tierGap = 80;
      const paddingTop = 70;
      const nodesPerRow = 3;
      let currentY = paddingTop;

      for (const tier of tierOrder) {
        sections.push({ tier, yStart: currentY });
        currentY += 50;
        const tierMissions = byTier[tier];

        tierMissions.forEach((m, i) => {
          const row = Math.floor(i / nodesPerRow);
          const col = i % nodesPerRow;
          const actualCol = row % 2 === 0 ? col : (nodesPerRow - 1 - col);
          const xSpacing = nodeW / (nodesPerRow + 1);
          const x = 50 + xSpacing * (actualCol + 1);
          const y = currentY + row * nodeSpacingY;
          allNodes.push({ mission: m, x, y, tier });
        });

        const rows = Math.ceil(tierMissions.length / nodesPerRow);
        currentY += rows * nodeSpacingY + tierGap;
      }

      const nodeMap = new Map(allNodes.map(n => [n.mission.id, n]));
      for (const [missionId, prereqs] of Object.entries(MISSION_PREREQUISITES)) {
        const toNode = nodeMap.get(missionId);
        if (!toNode) continue;
        for (const prereq of prereqs) {
          const fromNode = nodeMap.get(prereq);
          if (fromNode) conns.push({ from: fromNode, to: toNode });
        }
      }

      for (const tier of tierOrder) {
        const tierNodes = allNodes.filter(n => n.tier === tier);
        for (let i = 1; i < tierNodes.length; i++) {
          const from = tierNodes[i - 1];
          const to = tierNodes[i];
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
      <div
        ref={containerRef}
        className="relative w-full rounded-lg border border-border overflow-auto bg-gradient-to-b from-background via-card/50 to-background"
        style={{ maxHeight: '70vh' }}
      >
        {/* Scanline overlay */}
        <div className="absolute inset-0 pointer-events-none z-20 opacity-[0.03]" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--primary)) 2px, hsl(var(--primary)) 3px)',
          backgroundSize: '100% 4px',
        }} />

        {/* Grid background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }} />

        {/* Radial vignette */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, hsl(var(--background) / 0.6) 100%)',
        }} />

        <svg
          width="100%"
          height={totalHeight}
          viewBox={`0 0 ${svgWidth} ${totalHeight}`}
          className="relative z-10"
          style={{ minHeight: 400 }}
        >
          <defs>
            <filter id="node-glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="node-glow-strong">
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="highlight-pulse">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            {/* Gradient for tier separators */}
            <linearGradient id="tier-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              <stop offset="20%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
              <stop offset="80%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Tier sections */}
          {tierSections.map(({ tier, yStart }) => (
            <g key={tier}>
              {/* Tier badge background */}
              <rect
                x={40}
                y={yStart - 2}
                width={TIER_META[tier].label.length * 9 + 40}
                height={22}
                rx={3}
                fill={TIER_META[tier].color}
                opacity={0.08}
              />
              <text
                x={52}
                y={yStart + 13}
                className="font-mono"
                fontSize="10"
                fill={TIER_META[tier].color}
                opacity="0.8"
                letterSpacing="3"
                fontWeight="bold"
              >
                {'▸ ' + TIER_META[tier].label}
              </text>
              <line
                x1={40}
                y1={yStart + 26}
                x2={svgWidth - 40}
                y2={yStart + 26}
                stroke="url(#tier-line-grad)"
                strokeWidth="1"
              />
              {/* Tier decorative dots */}
              {Array.from({ length: 5 }, (_, i) => (
                <circle
                  key={i}
                  cx={svgWidth - 60 - i * 12}
                  cy={yStart + 10}
                  r={1.5}
                  fill={TIER_META[tier].color}
                  opacity={0.3 - i * 0.05}
                />
              ))}
            </g>
          ))}

          {/* Connection trails */}
          {connections.map(({ from, to }, i) => {
            const fromCompleted = completedMissions.includes(from.mission.id);
            const toCompleted = completedMissions.includes(to.mission.id);
            const bothComplete = fromCompleted && toCompleted;
            const oneComplete = fromCompleted || toCompleted;

            const midY = (from.y + to.y) / 2;
            const ctrlOffset = Math.abs(from.x - to.x) > 50 ? 30 : 0;
            const d = `M${from.x},${from.y} C${from.x},${midY - ctrlOffset} ${to.x},${midY + ctrlOffset} ${to.x},${to.y}`;

            return (
              <g key={i}>
                {/* Base path */}
                <path
                  d={d}
                  fill="none"
                  stroke={bothComplete ? 'hsl(var(--primary))' : oneComplete ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
                  strokeWidth={bothComplete ? 2.5 : 1.5}
                  opacity={bothComplete ? 0.5 : oneComplete ? 0.2 : 0.1}
                  strokeLinecap="round"
                />
                {/* Glow for completed paths */}
                {bothComplete && (
                  <path
                    d={d}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth={6}
                    opacity={0.08}
                    strokeLinecap="round"
                    filter="url(#node-glow)"
                  />
                )}
                {/* Animated particles on active paths */}
                {oneComplete && !bothComplete && (
                  <>
                    <path
                      d={d}
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth={1.5}
                      strokeDasharray="4 12"
                      opacity={0.4}
                      strokeLinecap="round"
                    >
                      <animate attributeName="stroke-dashoffset" from="32" to="0" dur="2s" repeatCount="indefinite" />
                    </path>
                    {/* Traveling dot */}
                    <circle r="2" fill="hsl(var(--primary))" opacity="0.6">
                      <animateMotion dur="3s" repeatCount="indefinite" path={d} />
                    </circle>
                  </>
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
            const isHighlighted = highlightedMissionId === m.id;
            const tierColor = TIER_META[m.tier].color;
            const glowColor = TIER_META[m.tier].glowColor;
            const icon = getMissionIcon(m.codename);
            const nodeRadius = 28;

            return (
              <g
                key={m.id}
                data-node-id={m.id}
                onClick={() => {
                  if (unlocked) {
                    soundEngine.play('click');
                    onMissionClick(m.id);
                  }
                }}
                onMouseEnter={() => setHoveredId(m.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={unlocked ? 'cursor-pointer' : 'cursor-not-allowed'}
                opacity={unlocked ? 1 : 0.25}
                style={{ transition: 'opacity 0.3s' }}
              >
                {/* Highlight ring from search */}
                {isHighlighted && (
                  <>
                    <circle cx={x} cy={y} r={nodeRadius + 16} fill="none" stroke={tierColor} strokeWidth={2} opacity={0.6} filter="url(#highlight-pulse)">
                      <animate attributeName="r" from={nodeRadius + 10} to={nodeRadius + 22} dur="1s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.6" to="0" dur="1s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={x} cy={y} r={nodeRadius + 10} fill="none" stroke={tierColor} strokeWidth={1.5} opacity={0.4}>
                      <animate attributeName="r" from={nodeRadius + 6} to={nodeRadius + 16} dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  </>
                )}

                {/* Pulse ring for available */}
                {unlocked && !isCompleted && (
                  <circle cx={x} cy={y} r={nodeRadius + 6} fill="none" stroke={tierColor} strokeWidth={1} opacity={0.3}>
                    <animate attributeName="r" from={nodeRadius + 2} to={nodeRadius + 14} dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.35" to="0" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Outer glow for completed */}
                {isCompleted && (
                  <>
                    <circle cx={x} cy={y} r={nodeRadius + 6} fill={tierColor} opacity={0.08} filter="url(#node-glow-strong)" />
                    <circle cx={x} cy={y} r={nodeRadius + 2} fill="none" stroke={tierColor} strokeWidth={0.5} opacity={0.3} />
                  </>
                )}

                {/* Hover glow */}
                {isHovered && unlocked && (
                  <circle cx={x} cy={y} r={nodeRadius + 4} fill={tierColor} opacity={0.06} filter="url(#node-glow)" />
                )}

                {/* Node background — hexagon-ish */}
                <rect
                  x={x - nodeRadius}
                  y={y - nodeRadius}
                  width={nodeRadius * 2}
                  height={nodeRadius * 2}
                  rx={isCompleted ? nodeRadius : 10}
                  fill={isCompleted ? tierColor : 'hsl(var(--card))'}
                  stroke={isCompleted ? tierColor : isHovered ? tierColor : 'hsl(var(--border))'}
                  strokeWidth={isCompleted ? 2 : isHovered ? 1.5 : 0.8}
                  filter={isCompleted || isHovered ? 'url(#node-glow)' : undefined}
                  style={{ transition: 'all 0.25s ease' }}
                />

                {/* Inner ring for non-completed */}
                {!isCompleted && unlocked && (
                  <rect
                    x={x - nodeRadius + 3}
                    y={y - nodeRadius + 3}
                    width={(nodeRadius - 3) * 2}
                    height={(nodeRadius - 3) * 2}
                    rx={7}
                    fill="none"
                    stroke={tierColor}
                    strokeWidth={0.3}
                    opacity={0.2}
                  />
                )}

                {/* Icon */}
                {unlocked ? (
                  <g transform={`translate(${x - 11}, ${y - 11}) scale(0.92)`}>
                    <path
                      d={icon.path}
                      fill="none"
                      stroke={isCompleted ? 'hsl(var(--primary-foreground))' : tierColor}
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={isCompleted ? 1 : 0.85}
                    />
                  </g>
                ) : (
                  <text x={x} y={y + 5} textAnchor="middle" fontSize="16" fill="hsl(var(--muted-foreground))" opacity={0.5}>🔒</text>
                )}

                {/* Completion badge */}
                {isCompleted && (
                  <g>
                    <circle cx={x + nodeRadius - 4} cy={y - nodeRadius + 4} r={8} fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth={2} />
                    <text x={x + nodeRadius - 4} y={y - nodeRadius + 8} textAnchor="middle" fontSize="10" fill="hsl(var(--primary-foreground))" fontWeight="bold">✓</text>
                  </g>
                )}

                {/* Difficulty dots */}
                {unlocked && !isCompleted && (
                  <g>
                    {Array.from({ length: Math.min(m.difficulty, 5) }, (_, di) => (
                      <circle
                        key={di}
                        cx={x - ((Math.min(m.difficulty, 5) - 1) * 5) / 2 + di * 5}
                        cy={y + nodeRadius + 12}
                        r={2}
                        fill={tierColor}
                        opacity={0.6}
                      />
                    ))}
                  </g>
                )}

                {/* Codename label */}
                <text
                  x={x}
                  y={y + nodeRadius + (unlocked && !isCompleted ? 24 : 16)}
                  textAnchor="middle"
                  className="font-mono"
                  fontSize="8.5"
                  fill="hsl(var(--foreground))"
                  opacity={unlocked ? 0.7 : 0.25}
                  letterSpacing="1.5"
                  fontWeight="bold"
                >
                  {m.codename}
                </text>

                {/* Hover tooltip */}
                {isHovered && unlocked && (
                  <g>
                    <rect
                      x={x - 90}
                      y={y - nodeRadius - 44}
                      width={180}
                      height={34}
                      rx={6}
                      fill="hsl(var(--popover))"
                      stroke={tierColor}
                      strokeWidth={0.5}
                      opacity={0.95}
                      filter="url(#node-glow)"
                    />
                    {/* Tooltip arrow */}
                    <polygon
                      points={`${x - 5},${y - nodeRadius - 10} ${x + 5},${y - nodeRadius - 10} ${x},${y - nodeRadius - 4}`}
                      fill="hsl(var(--popover))"
                      opacity={0.95}
                    />
                    <text x={x} y={y - nodeRadius - 26} textAnchor="middle" className="font-mono" fontSize="9.5" fill="hsl(var(--foreground))" fontWeight="bold">
                      {m.title.length > 24 ? m.title.slice(0, 22) + '…' : m.title}
                    </text>
                    <text x={x} y={y - nodeRadius - 14} textAnchor="middle" className="font-mono" fontSize="8" fill={tierColor}>
                      {isCompleted ? '✓ COMPLETED' : `+${m.xpReward} XP • Difficulty ${m.difficulty}/5`}
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
);

MissionNodeGraph.displayName = 'MissionNodeGraph';
