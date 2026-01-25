import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { NavigationProvider } from '@/contexts/NavigationContext';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <NavigationProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </NavigationProvider>
  );
}
