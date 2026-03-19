/**
 * WorkshopSessionContext — ported from Secure Your Data, adapted for Express API.
 * Manages active workshop session state with API persistence + localStorage cache.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '@/services/api';
import type { WorkshopMode, WorkshopInstance, WorkshopTemplate } from '@/lib/types';

interface WorkshopSessionContextType {
  currentMode: WorkshopMode;
  setMode: (mode: WorkshopMode) => void;
  workshopInstance: WorkshopInstance | null;
  setWorkshopInstance: (instance: WorkshopInstance | null) => void;
  activeTemplate: WorkshopTemplate | null;
  setActiveTemplate: (template: WorkshopTemplate | null) => void;
  currentLabId: string | null;
  setCurrentLabId: (labId: string | null) => void;
  isDemoMode: boolean;
  isLabMode: boolean;
  isChallengeMode: boolean;
  /** Create a new workshop session via API (moderator) */
  createSession: (data: { name: string; missionIds: string[]; timeLimit?: number }) => Promise<WorkshopInstance>;
  /** Fetch moderator's sessions from API */
  fetchSessions: () => Promise<WorkshopInstance[]>;
  /** Update session status via API */
  updateSessionStatus: (id: string, status: string) => Promise<void>;
}

const WorkshopSessionContext = createContext<WorkshopSessionContextType | undefined>(undefined);

function loadCached<T>(key: string): T | null {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function persist(key: string, value: unknown) {
  if (value) {
    localStorage.setItem(key, JSON.stringify(value));
  } else {
    localStorage.removeItem(key);
  }
}

export function WorkshopSessionProvider({ children }: { children: ReactNode }) {
  const [currentMode, setCurrentModeState] = useState<WorkshopMode>(
    () => (localStorage.getItem('workshop_mode') as WorkshopMode) || 'lab'
  );
  const [workshopInstance, setWorkshopInstanceState] = useState<WorkshopInstance | null>(
    () => loadCached('workshop_instance')
  );
  const [activeTemplate, setActiveTemplateState] = useState<WorkshopTemplate | null>(
    () => loadCached('workshop_template')
  );
  const [currentLabId, setCurrentLabIdState] = useState<string | null>(
    () => localStorage.getItem('workshop_current_lab_id')
  );

  useEffect(() => { localStorage.setItem('workshop_mode', currentMode); }, [currentMode]);
  useEffect(() => { persist('workshop_instance', workshopInstance); }, [workshopInstance]);
  useEffect(() => { persist('workshop_template', activeTemplate); }, [activeTemplate]);
  useEffect(() => { persist('workshop_current_lab_id', currentLabId); }, [currentLabId]);

  const setMode = useCallback((mode: WorkshopMode) => setCurrentModeState(mode), []);

  const setWorkshopInstance = useCallback((instance: WorkshopInstance | null) => {
    setWorkshopInstanceState(instance);
  }, []);

  const setActiveTemplate = useCallback((template: WorkshopTemplate | null) => {
    setActiveTemplateState(template);
    if (template) {
      setCurrentModeState(template.defaultMode);
      if (template.labIds?.length) setCurrentLabIdState(template.labIds[0]);
    } else {
      setCurrentLabIdState(null);
    }
  }, []);

  const setCurrentLabId = useCallback((labId: string | null) => setCurrentLabIdState(labId), []);

  // API-backed operations
  const createSession = useCallback(async (data: { name: string; missionIds: string[]; timeLimit?: number }) => {
    const result = await api.workshops.create(data) as unknown as WorkshopInstance;
    setWorkshopInstanceState(result);
    return result;
  }, []);

  const fetchSessions = useCallback(async () => {
    return await api.workshops.list() as unknown as WorkshopInstance[];
  }, []);

  const updateSessionStatus = useCallback(async (id: string, status: string) => {
    await api.workshops.updateStatus(id, status);
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
        createSession,
        fetchSessions,
        updateSessionStatus,
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
