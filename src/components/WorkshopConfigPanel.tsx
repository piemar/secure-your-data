/**
 * Moderator panel to configure workshop execution mode:
 * sandbox_only, atlas_connected, or hybrid.
 */
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { api } from '@/services/api';
import { Cpu, Cloud, Layers, CheckCircle2, Settings2 } from 'lucide-react';

export type ExecutionMode = 'sandbox_only' | 'atlas_connected' | 'hybrid';

interface WorkshopConfigPanelProps {
  workshopId: string;
  currentMode?: ExecutionMode;
  onModeChange?: (mode: ExecutionMode) => void;
}

const MODES: Array<{
  id: ExecutionMode;
  label: string;
  icon: typeof Cpu;
  description: string;
  features: string[];
}> = [
  {
    id: 'sandbox_only',
    label: 'Sandbox Only',
    icon: Cpu,
    description: 'Local MongoDB sandbox for all missions. No cloud access needed.',
    features: [
      'Tier 1 pattern validation',
      'Tier 2 sandboxed execution',
      'Tier 3 simulated infrastructure',
      'No Atlas required',
    ],
  },
  {
    id: 'atlas_connected',
    label: 'Atlas Connected',
    icon: Cloud,
    description: 'Full Atlas cluster for all missions including cloud-only features.',
    features: [
      'All Tier 1/2/3 features',
      'Atlas Search & Vector Search',
      'Data Federation queries',
      'Real sharding & replica sets',
    ],
  },
  {
    id: 'hybrid',
    label: 'Hybrid',
    icon: Layers,
    description: 'Local sandbox for most missions, Atlas for cloud-specific missions.',
    features: [
      'Local sandbox for Tier 2',
      'Simulated for Tier 3',
      'Atlas for cloud missions (21-25)',
      'Best cost/feature balance',
    ],
  },
];

export function WorkshopConfigPanel({
  workshopId,
  currentMode = 'sandbox_only',
  onModeChange,
}: WorkshopConfigPanelProps) {
  const [selected, setSelected] = useState<ExecutionMode>(currentMode);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    try {
      await api.workshops.updateConfig(workshopId, { executionMode: selected });
      onModeChange?.(selected);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save workshop config:', err);
    } finally {
      setSaving(false);
    }
  }, [workshopId, selected, onModeChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Settings2 className="w-4 h-4 text-primary" />
        <h3 className="font-mono text-xs font-bold text-foreground">EXECUTION MODE</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selected === mode.id;
          return (
            <Card
              key={mode.id}
              className={`relative cursor-pointer p-4 transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                  : 'border-border hover:border-muted-foreground/30'
              }`}
              onClick={() => setSelected(mode.id)}
            >
              {isSelected && (
                <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-primary" />
              )}
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="font-mono text-xs font-bold text-foreground">{mode.label}</span>
              </div>
              <p className="font-mono text-[10px] text-muted-foreground mb-3">
                {mode.description}
              </p>
              <div className="space-y-1">
                {mode.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-primary/50" />
                    <span className="font-mono text-[10px] text-foreground/70">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={saving || selected === currentMode}
          size="sm"
          className="font-mono text-xs"
        >
          {saving ? 'SAVING...' : saved ? '✓ SAVED' : 'APPLY CONFIGURATION'}
        </Button>
        {selected !== currentMode && (
          <span className="font-mono text-[10px] text-muted-foreground">
            Changing from <Badge variant="outline" className="font-mono text-[9px]">{currentMode}</Badge>
            {' → '}
            <Badge variant="outline" className="font-mono text-[9px] border-primary/30 text-primary">{selected}</Badge>
          </span>
        )}
      </div>
    </div>
  );
}
