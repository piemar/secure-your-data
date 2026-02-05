import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { WorkshopMode, WorkshopInstance, WorkshopTemplate } from '@/types';

interface WorkshopSessionContextType {
  currentMode: WorkshopMode;
  setMode: (mode: WorkshopMode) => void;
  workshopInstance: WorkshopInstance | null;
  setWorkshopInstance: (instance: WorkshopInstance | null) => void;
  activeTemplate: WorkshopTemplate | null;
  setActiveTemplate: (template: WorkshopTemplate | null) => void;
  /**
   * ID of the currently selected lab when using template-driven navigation.
   * When null, the app can fall back to legacy CSFLE lab routing.
   */
  currentLabId: string | null;
  setCurrentLabId: (labId: string | null) => void;
  isDemoMode: boolean;
  isLabMode: boolean;
  isChallengeMode: boolean;
}

const WorkshopSessionContext = createContext<WorkshopSessionContextType | undefined>(undefined);

export function WorkshopSessionProvider({ children }: { children: ReactNode }) {
  // Default mode: 'lab' for attendees, can be changed by moderators
  const [currentMode, setCurrentModeState] = useState<WorkshopMode>(() => {
    const saved = localStorage.getItem('workshop_mode');
    return (saved as WorkshopMode) || 'lab';
  });

  const [workshopInstance, setWorkshopInstanceState] = useState<WorkshopInstance | null>(() => {
    const saved = localStorage.getItem('workshop_instance');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTemplate, setActiveTemplateState] = useState<WorkshopTemplate | null>(() => {
    const saved = localStorage.getItem('workshop_template');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentLabId, setCurrentLabIdState] = useState<string | null>(() => {
    const saved = localStorage.getItem('workshop_current_lab_id');
    return saved || null;
  });

  // Persist mode changes
  useEffect(() => {
    localStorage.setItem('workshop_mode', currentMode);
  }, [currentMode]);

  // Persist workshop instance
  useEffect(() => {
    if (workshopInstance) {
      localStorage.setItem('workshop_instance', JSON.stringify(workshopInstance));
    } else {
      localStorage.removeItem('workshop_instance');
    }
  }, [workshopInstance]);

  // Persist template
  useEffect(() => {
    if (activeTemplate) {
      localStorage.setItem('workshop_template', JSON.stringify(activeTemplate));
    } else {
      localStorage.removeItem('workshop_template');
    }
  }, [activeTemplate]);

  // Persist current lab selection
  useEffect(() => {
    if (currentLabId) {
      localStorage.setItem('workshop_current_lab_id', currentLabId);
    } else {
      localStorage.removeItem('workshop_current_lab_id');
    }
  }, [currentLabId]);

  const setMode = useCallback((mode: WorkshopMode) => {
    setCurrentModeState(mode);
  }, []);

  const setWorkshopInstance = useCallback((instance: WorkshopInstance | null) => {
    setWorkshopInstanceState(instance);
  }, []);

  const setActiveTemplate = useCallback((template: WorkshopTemplate | null) => {
    setActiveTemplateState(template);
    // When template is set, update mode to template's defaultMode
    if (template) {
      setCurrentModeState(template.defaultMode);
      // Default current lab to the first lab in the template if present
      if (template.labIds && template.labIds.length > 0) {
        setCurrentLabIdState(template.labIds[0]);
      }
    } else {
      setCurrentLabIdState(null);
    }
  }, []);

  const setCurrentLabId = useCallback((labId: string | null) => {
    setCurrentLabIdState(labId);
  }, []);

  return (
    <WorkshopSessionContext.Provider
      value={{
        currentMode,
        setMode,
        workshopInstance,
        setWorkshopInstance,
        activeTemplate,
        setActiveTemplate,
        currentLabId,
        setCurrentLabId,
        isDemoMode: currentMode === 'demo',
        isLabMode: currentMode === 'lab',
        isChallengeMode: currentMode === 'challenge',
      }}
    >
      {children}
    </WorkshopSessionContext.Provider>
  );
}

export function useWorkshopSession() {
  const context = useContext(WorkshopSessionContext);
  if (!context) {
    throw new Error('useWorkshopSession must be used within WorkshopSessionProvider');
  }
  return context;
}
