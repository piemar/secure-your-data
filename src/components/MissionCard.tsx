import { Mission, MissionTier } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MissionCardProps {
  mission: Mission;
  isCompleted: boolean;
  onClick: () => void;
}

const tierColors: Record<MissionTier, string> = {
  recon: 'bg-primary/20 text-primary border-primary/30',
  infiltration: 'bg-warning/20 text-warning border-warning/30',
  exfiltration: 'bg-accent/20 text-accent border-accent/30',
};

const tierLabels: Record<MissionTier, string> = {
  recon: 'RECON',
  infiltration: 'INFILTRATION',
  exfiltration: 'EXFILTRATION',
};

export function MissionCard({ mission, isCompleted, onClick }: MissionCardProps) {
  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer transition-all duration-300 hover:border-primary/50 hover:border-glow group relative overflow-hidden ${
        isCompleted ? 'opacity-60' : ''
      }`}
    >
      {/* Scanline overlay */}
      <div className="absolute inset-0 scanline pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <Badge variant="outline" className={`font-mono text-[10px] ${tierColors[mission.tier]}`}>
            {tierLabels[mission.tier]}
          </Badge>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  i < mission.difficulty ? 'bg-primary' : 'bg-secondary'
                }`}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="font-mono text-[10px] text-muted-foreground mb-1">
            CODENAME: {mission.codename}
          </p>
          <h3 className="font-mono font-bold text-foreground group-hover:text-primary transition-colors">
            {mission.title}
          </h3>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2">{mission.description}</p>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-muted-foreground">
              ⏱ {Math.floor(mission.timeLimit / 60)}min
            </span>
            <span className="font-mono text-[10px] text-primary">
              +{mission.xpReward}XP
            </span>
          </div>
          {isCompleted && (
            <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
              ✓ COMPLETE
            </Badge>
          )}
          {mission.chaosEvents.length > 0 && !isCompleted && (
            <span className="text-[10px] text-destructive font-mono animate-pulse">
              ⚠ CHAOS
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
