import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Section } from '@/types';

interface NavigationContextType {
  currentSection: Section;
  setSection: (section: Section) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentSection, setCurrentSection] = useState<Section>('presentation');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const setSection = useCallback((section: Section) => {
    setCurrentSection(section);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        currentSection,
        setSection,
        sidebarOpen,
        toggleSidebar,
        setSidebarOpen,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
