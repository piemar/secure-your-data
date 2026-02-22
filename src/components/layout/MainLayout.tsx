import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { MobileSidebar } from './MobileSidebar';
import { NavigationProvider, useNavigation } from '@/contexts/NavigationContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ModeIndicator } from './ModeIndicator';

interface MainLayoutProps {
  children: ReactNode;
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
