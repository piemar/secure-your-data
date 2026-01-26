import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { NavigationProvider, useNavigation } from '@/contexts/NavigationContext';
import { useRole } from '@/contexts/RoleContext';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
}

function ModeratorBadge() {
  const { isModerator } = useRole();
  
  if (!isModerator) return null;
  
  return (
    <div className="fixed top-3 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-sm">
      <Crown className="w-4 h-4 text-primary" />
      <span className="text-sm font-medium text-primary">Moderator</span>
    </div>
  );
}

function LayoutContent({ children }: MainLayoutProps) {
  const { sidebarOpen } = useNavigation();
  
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <main 
        className={cn(
          'flex-1 overflow-y-auto relative transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-16'
        )}
      >
        <ModeratorBadge />
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
