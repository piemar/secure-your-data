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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigation } from '@/contexts/NavigationContext';
import { useRole } from '@/contexts/RoleContext';
import { useLab } from '@/context/LabContext';
import type { Section } from '@/types';
import { Button } from '@/components/ui/button';

interface NavItem {
  id: Section;
  label: string;
  icon: React.ElementType;
  subLabel?: string;
  moderatorOnly?: boolean;
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
    id: 'leaderboard',
    label: 'Leaderboard',
    icon: Trophy,
    subLabel: 'Rankings & Scores',
    moderatorOnly: true,
  },
  {
    id: 'lab1',
    label: 'Lab 1: CSFLE Fundamentals',
    icon: Database,
    subLabel: '45 min • AWS KMS',
  },
  {
    id: 'lab2',
    label: 'Lab 2: Queryable Encryption',
    icon: Shield,
    subLabel: '45 min • Range Queries',
  },
  {
    id: 'lab3',
    label: 'Lab 3: Migration & Multi-Tenant',
    icon: Key,
    subLabel: '30 min • Advanced Patterns',
  },
];

export function AppSidebar() {
  const { currentSection, setSection, sidebarOpen, toggleSidebar } = useNavigation();
  const { isLabAccessible } = useLab();
  const { isModerator, logout, role } = useRole();

  // Filter nav items based on role
  const visibleNavItems = navItems.filter(item => !item.moderatorOnly || isModerator);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 flex flex-col h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300 z-40',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold">
          M
        </div>
        {sidebarOpen && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">MongoDB</span>
            <span className="text-xs text-muted-foreground">SA Enablement</span>
          </div>
        )}
      </div>

      {/* Moderator Badge */}
      {isModerator && sidebarOpen && (
        <div className="mx-2 mt-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-2 text-primary text-sm font-medium">
            <Crown className="w-4 h-4" />
            Moderator Mode
          </div>
        </div>
      )}
      {isModerator && !sidebarOpen && (
        <div className="mx-2 mt-2 flex justify-center">
          <Crown className="w-5 h-5 text-primary" />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          const isLocked = (item.id === 'lab2' || item.id === 'lab3') && !isLabAccessible(parseInt(item.id.replace('lab', '')));

          return (
            <button
              key={item.id}
              onClick={() => !isLocked && setSection(item.id)}
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
              {isLocked && sidebarOpen && (
                <Lock className="absolute right-2 w-4 h-4 text-muted-foreground" />
              )}
              <Icon
                className={cn(
                  'w-5 h-5 flex-shrink-0',
                  isActive ? 'text-primary' : isLocked ? 'text-muted-foreground' : 'text-muted-foreground group-hover:text-sidebar-foreground'
                )}
              />
              {sidebarOpen && (
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-medium truncate">{item.label}</span>
                  {item.subLabel && (
                    <span className="text-xs text-muted-foreground truncate">
                      {isLocked ? 'Complete Lab 1 first' : item.subLabel}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Keyboard shortcuts hint - only for moderators */}
      {isModerator && sidebarOpen && (
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
            <div className="flex items-center justify-between">
              <span>Fullscreen</span>
              <kbd className="kbd">F</kbd>
            </div>
          </div>
        </div>
      )}

      {/* Role indicator and logout */}
      <div className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className={cn(
            'w-full justify-start gap-2 text-muted-foreground hover:text-foreground',
            !sidebarOpen && 'justify-center px-0'
          )}
        >
          <LogOut className="w-4 h-4" />
          {sidebarOpen && <span>Switch Role</span>}
        </Button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-sidebar-accent border border-sidebar-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
      >
        {sidebarOpen ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
}
