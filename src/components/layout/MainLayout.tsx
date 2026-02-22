import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { MobileSidebar } from './MobileSidebar';
import { NavigationProvider, useNavigation } from '@/contexts/NavigationContext';
import { useRole } from '@/contexts/RoleContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModeIndicator } from './ModeIndicator';

interface MainLayoutProps {
  children: ReactNode;
}

function ModeratorBadge() {
  const { isModerator } = useRole();
  const isMobile = useIsMobile();
  
  if (!isModerator) return null;
  
  return (
    <div className={cn(
      "fixed z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-sm",
      isMobile ? "top-3 right-3" : "top-3 right-4"
    )}>
      <Crown className="w-4 h-4 text-primary" />
      <span className="text-sm font-medium text-primary">Moderator</span>
    </div>
  );
}

function LayoutContent({ children }: MainLayoutProps) {
  const { sidebarOpen } = useNavigation();
  const isMobile = useIsMobile();
  
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop: Fixed sidebar */}
      {!isMobile && <AppSidebar />}
      
      {/* Mobile: Hamburger overlay */}
      {isMobile && <MobileSidebar />}
      
      <main 
        className={cn(
          'flex-1 overflow-y-auto relative transition-all duration-300',
          // On mobile, no margin (sidebar is overlay)
          // On desktop, margin based on sidebar state
          isMobile ? 'ml-0' : (sidebarOpen ? 'ml-64' : 'ml-16')
        )}
      >
        <ModeratorBadge />
        <div className="fixed top-3 left-4 z-50">
          <ModeIndicator />
        </div>
        {children}
      </main>
    </div>
  );
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <NavigationProvider>
      <LayoutContent>{children}</LayoutContent>
    </NavigationProvider>
  );
}
