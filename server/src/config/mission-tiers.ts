/**
 * Control-plane mapping: validation tier per mission (pattern / sandbox execute / simulate).
 */

export type ValidationTier = 'pattern' | 'execute' | 'simulate' | 'hold';

export const MISSION_TIERS: Record<string, ValidationTier> = {
  // Tier 2: Sandboxed Execution
  'mission-12': 'execute',   // CRUD Boot Camp
  'mission-1': 'execute',    // Phantom Index
  'mission-3': 'execute',    // Aggregation Heist
  'mission-5': 'execute',    // Schema Saboteur
  'mission-6': 'execute',    // Rich Query Recon
  'mission-8': 'execute',    // Analytics Extraction
  'mission-13': 'execute',   // Geospatial Pursuit
  'mission-14': 'execute',   // Graph Infiltration
  'mission-15': 'execute',   // Change Stream Stakeout
  'mission-16': 'execute',   // Transaction Lockout
  'mission-18': 'execute',   // Time Series
  'mission-20': 'execute',   // Schema Evolution

  // Tier 3: On hold for now (previously simulated/cloud-proxy)
  'mission-2': 'hold',       // Shard Under Siege
  'mission-9': 'hold',       // Scale-Out Siege
  'mission-10': 'hold',      // Auto-HA Failover

  // Tier 1: Pattern Only
  'mission-4': 'pattern',    // Connection Storm
  'mission-7': 'pattern',    // Encryption Lockdown (CSFLE — needs KMS)
  'mission-11': 'pattern',   // Deployment Automation (Terraform)
  'mission-17': 'pattern',   // Text Search (Atlas Search only)
  'mission-19': 'pattern',   // Vector Heist (Atlas Vector Search only)
};
