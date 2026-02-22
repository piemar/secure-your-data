import React, { createContext, useContext, useState, useEffect } from 'react';
import type { WorkshopConfigResponse, CloudProvider } from '@/types/cloud';

interface WorkshopConfigState extends WorkshopConfigResponse {
  loading: boolean;
  error: string | null;
}

const defaultConfig: WorkshopConfigState = {
  cloud: 'aws',
  deploymentMode: 'local',
  runningInContainer: false,
  awsDefaultRegion: 'eu-central-1',
  azureKeyVaultSuffix: '.vault.azure.net',
  gcpDefaultLocation: 'global',
  loading: true,
  error: null,
};

const WorkshopConfigContext = createContext<WorkshopConfigState>(defaultConfig);

export function WorkshopConfigProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WorkshopConfigState>(defaultConfig);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/config')
      .then((res) => {
        if (!res.ok) throw new Error(`Config failed: ${res.status}`);
        return res.json();
      })
      .then((data: WorkshopConfigResponse) => {
        if (cancelled) return;
        const cloud = ['aws', 'azure', 'gcp'].includes(data.cloud) ? data.cloud : 'aws';
        setState({
          ...data,
          cloud: cloud as CloudProvider,
          deploymentMode: data.deploymentMode === 'central' ? 'central' : 'local',
          awsDefaultRegion: data.awsDefaultRegion ?? 'eu-central-1',
          azureKeyVaultSuffix: data.azureKeyVaultSuffix ?? '.vault.azure.net',
          gcpDefaultLocation: data.gcpDefaultLocation ?? 'global',
          loading: false,
          error: null,
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: err?.message ?? 'Failed to load workshop config',
          }));
        }
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <WorkshopConfigContext.Provider value={state}>
      {children}
    </WorkshopConfigContext.Provider>
  );
}

export function useWorkshopConfig() {
  const ctx = useContext(WorkshopConfigContext);
  if (ctx === undefined) {
    return defaultConfig;
  }
  return ctx;
}

export function useCloudProvider(): CloudProvider {
  return useWorkshopConfig().cloud;
}
