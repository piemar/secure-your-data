import {
  Presentation,
  FlaskConical,
  ChevronLeft,
  ChevronRight,
  Database,
  Shield,
  Key,
  Trophy,
  Lock,
  LogOut,
  Crown,
  TrendingUp,
  RotateCcw,
  Settings,
  Target,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigation } from '@/contexts/NavigationContext';
import { useRole } from '@/contexts/RoleContext';
import { useLab } from '@/context/LabContext';
import { useWorkshopSession } from '@/contexts/WorkshopSessionContext';
import { areLabsEnabled } from '@/utils/workshopUtils';
import type { Section } from '@/types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useState, useEffect } from 'react';

interface NavItem {
  id: Section;
  label: string;
  icon: React.ElementType;
  subLabel?: string;
  moderatorOnly?: boolean;
  /**
   * Optional labId for template-driven lab navigation. When present, clicking
   * the nav item will select this lab and route to the generic 'lab' section.
   */
  labId?: string;
}

interface AppSidebarProps {
  isMobileOverlay?: boolean;
  onMobileNavigate?: (section: string) => void;
}

const navItems: NavItem[] = [
  {
    id: 'presentation',
    label: 'Presentation',
    icon: Presentation,
    subLabel: '45 min • 25 slides',
    moderatorOnly: true,
  },
  {
    id: 'setup',
    label: 'Lab Setup',
    icon: FlaskConical,
    subLabel: 'Environment Config',
  },
  {
    id: 'lab',
    label: 'Labs',
    icon: Database,
    subLabel: 'Labs & Exercises',
  },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    icon: Trophy,
    subLabel: 'Rankings & Scores',
  },
  {
    id: 'challenge',
    label: 'Challenge Mode',
    icon: Target,
    subLabel: 'Quests & Flags',
  },
  {
    id: 'metrics',
    label: 'Metrics',
    icon: BarChart3,
    subLabel: 'Analytics & Insights',
    moderatorOnly: true,
  },
];

export function AppSidebar({ isMobileOverlay = false, onMobileNavigate }: AppSidebarProps) {
  const { currentSection, setSection, sidebarOpen, toggleSidebar } = useNavigation();
  const { isLabAccessible, userEmail, currentScore, completedLabs, resetProgress } = useLab();
  const { isModerator, logout } = useRole();
  const { currentMode, activeTemplate } = useWorkshopSession();
  const [userRank, setUserRank] = useState<number>(0);
  const [totalParticipants, setTotalParticipants] = useState<number>(0);
  const [labsEnabled, setLabsEnabled] = useState<boolean>(areLabsEnabled());

  const handleLogout = () => {
    logout();
    localStorage.removeItem('workshop_attendee_name');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('completedLabs');
    localStorage.removeItem('labStartTimes');
    window.location.reload();
  };

  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset all lab progress? This will clear completed steps, scores, and start fresh.')) {
      (async () => {
        try {
          // Reset only this user's leaderboard entry in the database; other users are unchanged
          if (userEmail) {
            const { postResetProgress } = await import('@/services/leaderboardApi');
            await postResetProgress(userEmail);
          }
        } catch {
          // Proceed with local reset even if API fails
        }
        localStorage.removeItem('workshop_leaderboard');
        resetProgress();
        // Clear only this browser's lab progress (per-user in single-user-per-browser usage)
        localStorage.removeItem('lab1-progress');
        localStorage.removeItem('lab2-progress');
        localStorage.removeItem('lab3-progress');
        localStorage.removeItem('completedLabs');
        localStorage.removeItem('labStartTimes');
        localStorage.removeItem('lab_mongo_uri');
        localStorage.removeItem('lab_aws_profile');
        localStorage.removeItem('lab_kms_alias');
        window.location.reload();
      })();
    }
  };

  // Calculate user rank, progress, and check lab status (sync from MongoDB periodically)
  useEffect(() => {
    const updateStatus = async () => {
      const { syncLeaderboardFromApi, getSortedLeaderboard } = await import('@/utils/leaderboardUtils');
      await syncLeaderboardFromApi();
      const leaderboard = getSortedLeaderboard();
      setTotalParticipants(leaderboard.length);
      const rank = leaderboard.findIndex(e => e.email === userEmail) + 1;
      setUserRank(rank);
      setLabsEnabled(areLabsEnabled());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000);
    return () => clearInterval(interval);
  }, [userEmail]);

  // Filter nav items based on role and mode
  const visibleNavItems = navItems.filter(item => {
    if (item.moderatorOnly && !isModerator) return false;
    // Show challenge mode only if challenge mode is active or template has quests
    if (item.id === 'challenge') {
      return currentMode === 'challenge' || (activeTemplate?.questIds && activeTemplate.questIds.length > 0);
    }
    return true;
  });

  // Calculate overall progress
  const totalLabs = 3;
  const progressPercentage = (completedLabs.length / totalLabs) * 100;

  const attendeeName = localStorage.getItem('workshop_attendee_name') || 'Attendee';

  // For mobile overlay, always show expanded
  const isExpanded = isMobileOverlay || sidebarOpen;

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-sidebar transition-all duration-300',
        // Desktop: fixed sidebar with border
        !isMobileOverlay && 'fixed left-0 top-0 border-r border-sidebar-border z-40',
        // Desktop width based on collapsed state
        !isMobileOverlay && (sidebarOpen ? 'w-64' : 'w-16'),
        // Mobile overlay: full width within sheet
        isMobileOverlay && 'w-full'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold">
          M
        </div>
        {isExpanded && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">MongoDB</span>
            <span className="text-xs text-muted-foreground">Encryption Workshop</span>
          </div>
        )}
      </div>

      {/* User Info / Moderator Badge */}
      {isExpanded ? (
        <div className="mx-2 mt-2 p-3 rounded-lg bg-card/50 border border-border">
          {isModerator ? (
            <div className="flex items-center gap-2 text-primary text-sm font-medium">
              <Crown className="w-4 h-4" />
              Moderator Mode
            </div>
          ) : (
            <div>
              <p className="font-medium text-sm truncate">{attendeeName}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {currentScore} pts
                </span>
                {userRank > 0 && totalParticipants > 0 && (
                  <span className="text-xs text-muted-foreground font-mono" title="Your rank among participants">
                    Rank #{userRank} of {totalParticipants}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mx-2 mt-2 flex justify-center">
          {isModerator ? (
            <Crown className="w-5 h-5 text-primary" />
          ) : (
            <div className="text-xs font-mono text-primary">
              {userRank > 0 && `#${userRank}`}
            </div>
          )}
        </div>
      )}

      {/* Progress Bar */}
      {isExpanded && !isModerator && (
        <div className="mx-2 mt-2 px-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{completedLabs.length}/{totalLabs} labs</span>
          </div>
          <Progress value={progressPercentage} className="h-1.5" />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto mt-2">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isLabItem = !!item.labId;
          const labNumber = !isLabItem && item.id.startsWith('lab') ? parseInt(item.id.replace('lab', '')) : null;
          const isActive = isLabItem
            ? currentSection === 'lab' && currentLabId === item.labId
            : currentSection === item.id;
          // For attendees: legacy labs are locked if workshop hasn't started OR if progression requirements not met
          const isWorkshopLocked = !isModerator && labNumber !== null && !labsEnabled;
          const isProgressionLocked =
            !isModerator && labNumber !== null && labNumber > 1 && !isLabAccessible(labNumber);
          const isLocked = isWorkshopLocked || isProgressionLocked;
          const isLabComplete = labNumber !== null && completedLabs.includes(labNumber);

          const handleClick = () => {
            if (isLocked) return;
            if (isLabItem && item.labId) {
              setCurrentLabId(item.labId);
              if (isMobileOverlay && onMobileNavigate) {
                onMobileNavigate('lab');
              } else {
                setSection('lab');
              }
              return;
            }
            if (isMobileOverlay && onMobileNavigate) {
              onMobileNavigate(item.id);
            } else {
              setSection(item.id);
            }
          };

          return (
            <button
              key={item.id}
              onClick={handleClick}
              disabled={isLocked}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left group relative',
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : isLocked
                  ? 'text-muted-foreground opacity-50 cursor-not-allowed'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              {isLocked && isExpanded && (
                <Lock className="absolute right-2 w-4 h-4 text-muted-foreground" />
              )}
              {isLabComplete && isExpanded && !isLocked && (
                <div className="absolute right-2 w-5 h-5 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center text-xs">
                  ✓
                </div>
              )}
              <Icon
                className={cn(
                  'w-5 h-5 flex-shrink-0',
                  isActive ? 'text-primary' : isLocked ? 'text-muted-foreground' : 'text-muted-foreground group-hover:text-sidebar-foreground'
                )}
              />
              {isExpanded && (
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-medium truncate">{item.label}</span>
                  {item.subLabel && (
                    <span className="text-xs text-muted-foreground truncate">
                      {isWorkshopLocked ? 'Workshop not started' : isProgressionLocked ? 'Complete Lab 1 first' : item.subLabel}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Keyboard shortcuts hint - only for moderators on desktop */}
      {isModerator && isExpanded && !isMobileOverlay && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center justify-between">
              <span>Navigate</span>
              <div className="flex gap-1">
                <kbd className="kbd">←</kbd>
                <kbd className="kbd">→</kbd>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Notes</span>
              <kbd className="kbd">N</kbd>
            </div>
          </div>
        </div>
      )}

      {/* Settings (Moderator Only), Reset Progress & Logout */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        {isModerator && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (isMobileOverlay && onMobileNavigate) {
                onMobileNavigate('settings');
              } else {
                setSection('settings');
              }
            }}
            className={cn(
              'w-full justify-start gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10',
              !isExpanded && 'justify-center px-0',
              currentSection === 'settings' && 'bg-primary/10 text-primary'
            )}
          >
            <Settings className="w-4 h-4" />
            {isExpanded && <span>Settings</span>}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResetProgress}
          className={cn(
            'w-full justify-start gap-2 text-muted-foreground hover:text-warning hover:bg-warning/10',
            !isExpanded && 'justify-center px-0'
          )}
        >
          <RotateCcw className="w-4 h-4" />
          {isExpanded && <span>Reset Progress</span>}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className={cn(
            'w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10',
            !isExpanded && 'justify-center px-0'
          )}
        >
          <LogOut className="w-4 h-4" />
          {isExpanded && <span>Log Out</span>}
        </Button>
      </div>

      {/* Collapse toggle - inside sidebar bounds (right-0) so click never hits main content; only toggles sidebar */}
      {!isMobileOverlay && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-50 flex items-center justify-center" aria-hidden>
          <button
            type="button"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation();
              toggleSidebar();
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation();
            }}
            className="w-6 h-6 rounded-full bg-sidebar-accent border border-sidebar-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors shrink-0"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      )}
    </aside>
  );
}
