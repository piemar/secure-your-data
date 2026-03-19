import { MissionDifficulty } from '@/lib/types';
import { Shield, Swords, Skull } from 'lucide-react';
import { soundEngine } from '@/lib/sound-engine';

interface DifficultySelectorProps {
  selected: MissionDifficulty;
  onChange: (d: MissionDifficulty) => void;
  hintCounts?: { guided: number; challenge: number };
}

const DIFFICULTIES: {
  id: MissionDifficulty;
  label: string;
  icon: typeof Shield;
  description: string;
  color: string;
}[] = [
  {
    id: 'guided',
    label: 'GUIDED',
    icon: Shield,
    description: 'Fill in the blanks — structure provided, hints available',
    color: 'text-primary border-primary/40 bg-primary/5',
  },
  {
    id: 'challenge',
    label: 'CHALLENGE',
    icon: Swords,
    description: 'Minimal scaffolding — write most of the code yourself',
    color: 'text-warning border-warning/40 bg-warning/5',
  },
  {
    id: 'expert',
    label: 'EXPERT',
    icon: Skull,
    description: 'Blank slate — just the objective. No hints.',
    color: 'text-destructive border-destructive/40 bg-destructive/5',
  },
];

export function DifficultySelector({ selected, onChange, hintCounts }: DifficultySelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {DIFFICULTIES.map((d) => {
        const Icon = d.icon;
        const isSelected = selected === d.id;
        const hints = d.id === 'guided' ? hintCounts?.guided : d.id === 'challenge' ? hintCounts?.challenge : 0;

        return (
          <button
            key={d.id}
            onClick={() => {
              soundEngine.play('click');
              onChange(d.id);
            }}
            className={`relative p-4 rounded-lg border-2 transition-all text-left font-mono ${
              isSelected
                ? `${d.color} ring-1 ring-offset-1 ring-offset-background`
                : 'border-border bg-card text-muted-foreground hover:border-muted-foreground/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4" />
              <span className="text-xs font-bold tracking-wider">{d.label}</span>
            </div>
            <p className="text-[10px] leading-relaxed opacity-80">{d.description}</p>
            {hints !== undefined && hints > 0 && (
              <span className="absolute top-2 right-2 text-[10px] opacity-60">
                {hints} hints
              </span>
            )}
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
}
