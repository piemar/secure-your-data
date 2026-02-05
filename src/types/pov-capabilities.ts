/**
 * POV Capability Types
 * 
 * Maps to MongoDB PoV Proofs (57 capabilities from Docs/POV.txt)
 */

export type PovCapabilityCategory = 
  | 'query' 
  | 'security' 
  | 'scalability' 
  | 'analytics' 
  | 'operations' 
  | 'data-management'
  | 'integration'
  | 'deployment';

export interface PovCapability {
  id: string; // e.g., 'RICH-QUERY', 'ENCRYPTION', 'SCALE-OUT'
  label: string; // Human-readable name
  description: string; // From POV.txt
  category: PovCapabilityCategory;
  proofNumber: number; // 1-57 from POV.txt
}
