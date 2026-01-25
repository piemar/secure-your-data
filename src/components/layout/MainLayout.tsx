import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { useRole } from '@/contexts/RoleContext';
import { Crown } from 'lucide-react';

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

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <NavigationProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-hidden relative">
          <ModeratorBadge />
          {children}
        </main>
      </div>
    </NavigationProvider>
  );
}
