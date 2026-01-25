import { 
  Presentation, 
  FlaskConical, 
  FileText, 
  ChevronLeft,
  ChevronRight,
  Database,
  Shield,
  Key,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigation } from '@/contexts/NavigationContext';
import type { Section } from '@/types';

interface NavItem {
  id: Section;
  label: string;
  icon: React.ElementType;
  subLabel?: string;
}

const navItems: NavItem[] = [
  { 
    id: 'presentation', 
    label: 'Presentation', 
    icon: Presentation,
    subLabel: '45 min • 25 slides',
  },
  { 
    id: 'lab1', 
    label: 'Lab 1: CSFLE', 
    icon: Database,
    subLabel: '34 min • AWS KMS',
  },
  { 
    id: 'lab2', 
    label: 'Lab 2: QE Range', 
    icon: Shield,
    subLabel: '34 min • Profiler',
  },
  { 
    id: 'lab3', 
    label: 'Lab 3: Erasure', 
    icon: Key,
    subLabel: '34 min • GDPR',
  },
  { 
    id: 'cheatsheet', 
    label: 'SA Cheat Sheet', 
    icon: FileText,
    subLabel: 'Quick Reference',
  },
];

export function AppSidebar() {
  const { currentSection, setSection, sidebarOpen, toggleSidebar } = useNavigation();

  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300',
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

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left group',
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon 
                className={cn(
                  'w-5 h-5 flex-shrink-0',
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-sidebar-foreground'
                )} 
              />
              {sidebarOpen && (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">{item.label}</span>
                  {item.subLabel && (
                    <span className="text-xs text-muted-foreground truncate">
                      {item.subLabel}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Keyboard shortcuts hint */}
      {sidebarOpen && (
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
