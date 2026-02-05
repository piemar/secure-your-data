import React from 'react';
import {
  CryptoShreddingDiagram,
  PITRFlowDiagram,
  LiveMigrationFlowDiagram,
  RollingUpgradeDiagram,
  RTOFlowDiagram,
  ScaleOutDiagram,
  WorkloadIsolationDiagram,
} from '@/components/labs/LabArchitectureDiagrams';
import type { LabIntroContent } from '@/components/labs/LabViewWithTabs';

/**
 * Registry of lab-specific intro content (e.g., architecture diagrams, key concepts).
 * Used by LabRunner when rendering labs that need custom intro content.
 */
export const labIntroComponents: Record<
  string,
  () => Partial<LabIntroContent>
> = {
  'lab-full-recovery-rpo-overview': () => ({
    architectureDiagram: <PITRFlowDiagram />,
  }),
  'lab-migratable-overview': () => ({
    architectureDiagram: <LiveMigrationFlowDiagram />,
  }),
  'lab-portable-overview': () => ({
    architectureDiagram: <LiveMigrationFlowDiagram />,
  }),
  'lab-rolling-updates-overview': () => ({
    architectureDiagram: <RollingUpgradeDiagram />,
  }),
  'lab-full-recovery-rto-overview': () => ({
    architectureDiagram: <RTOFlowDiagram />,
  }),
  'lab-scale-out-overview': () => ({
    architectureDiagram: <ScaleOutDiagram />,
  }),
  'lab-workload-isolation-overview': () => ({
    architectureDiagram: <WorkloadIsolationDiagram />,
  }),
  'lab-right-to-erasure': () => ({
    whatYouWillBuild: [
      'Implement explicit encryption for data migration',
      'Design multi-tenant isolation with per-tenant DEKs',
      'Execute CMK rotation without re-encrypting data',
      'Understand the "Right to Erasure" pattern via crypto-shredding',
    ],
    keyConcepts: [
      {
        term: 'Explicit Encryption',
        explanation: 'Manually encrypt/decrypt fields using the ClientEncryption API. Required for migrating existing plaintext data to encrypted format.',
      },
      {
        term: 'Multi-Tenant Isolation',
        explanation: "Assign one DEK per tenant. If a tenant's key is compromised, only their data is at risk - other tenants remain secure.",
      },
      {
        term: 'Crypto-Shredding (Right to Erasure)',
        explanation: 'Delete the DEK to make all associated data cryptographically unreadable. Fulfills GDPR Article 17 without finding/deleting every record.',
      },
    ],
    keyInsight:
      'When a user requests deletion under GDPR, instead of finding and deleting all their data across collections, simply delete their DEK. All their data becomes cryptographically unreadable garbage.',
    architectureDiagram: <CryptoShreddingDiagram />,
  }),
};
