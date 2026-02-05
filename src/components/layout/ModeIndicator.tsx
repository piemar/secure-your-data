import { useWorkshopSession } from '@/contexts/WorkshopSessionContext';
import { useRole } from '@/contexts/RoleContext';
import { Badge } from '@/components/ui/badge';
import { Presentation, FlaskConical, Target } from 'lucide-react';

/**
 * ModeIndicator displays the current workshop mode in a compact badge.
 * Only visible to moderators, positioned in the header or sidebar.
 */
export function ModeIndicator() {
  const { currentMode, isDemoMode, isLabMode, isChallengeMode } = useWorkshopSession();
  const { isModerator } = useRole();

  if (!isModerator) {
    return null;
  }

  const modeConfig = {
    demo: {
      label: 'Demo',
      icon: Presentation,
      variant: 'secondary' as const,
    },
    lab: {
      label: 'Lab',
      icon: FlaskConical,
      variant: 'default' as const,
    },
    challenge: {
      label: 'Challenge',
      icon: Target,
      variant: 'outline' as const,
    },
  };

  const config = modeConfig[currentMode];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1.5">
      <Icon className="w-3 h-3" />
      {config.label} Mode
    </Badge>
  );
}
