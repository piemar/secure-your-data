/**
 * Mission prerequisites and topic/POV metadata for search and gating.
 */

// Which missions must be completed before unlocking each mission
export const MISSION_PREREQUISITES: Record<string, string[]> = {
  // Recon tier — mission-12 is always unlocked (entry point)
  'mission-12': [],
  'mission-1': ['mission-12'],          // Need CRUD basics first
  'mission-6': ['mission-12'],          // Need CRUD basics first
  'mission-3': ['mission-1'],           // Need indexing before aggregation
  'mission-8': ['mission-3'],           // Need aggregation before analytics

  // Infiltration tier — need at least some recon
  'mission-13': ['mission-6'],          // Need rich queries before geospatial
  'mission-14': ['mission-3'],          // Need aggregation before graph
  'mission-15': ['mission-12'],         // Need CRUD before change streams
  'mission-16': ['mission-12'],         // Need CRUD before transactions
  'mission-2': ['mission-1', 'mission-9'], // Need indexing + scale-out concepts
  'mission-4': ['mission-12'],          // Need CRUD before connection mgmt
  'mission-9': ['mission-1'],           // Need indexing before sharding
  'mission-10': ['mission-4'],          // Need connection mgmt before HA

  // Exfiltration tier — need infiltration experience
  'mission-17': ['mission-6'],          // Need rich queries before text search
  'mission-5': ['mission-12'],          // Need CRUD before schema validation
  'mission-7': ['mission-5'],           // Need schema before encryption
  'mission-11': ['mission-10'],         // Need HA concepts before Terraform
};

// Human-readable topic labels for search
export const TOPIC_LABELS: Record<string, string> = {
  'query': 'Querying',
  'analytics': 'Analytics',
  'scalability': 'Scalability',
  'operations': 'Operations',
  'security': 'Security',
  'encryption': 'Encryption',
  'deployment': 'Deployment',
  'data-management': 'Data Management',
};

// POV capability descriptions for search display
export const POV_LABELS: Record<string, string> = {
  'RICH-QUERY': 'Rich Query',
  'IN-PLACE-ANALYTICS': 'In-Place Analytics',
  'WORKLOAD-ISOLATION': 'Workload Isolation',
  'GEOSPATIAL': 'Geospatial',
  'GRAPH': 'Graph Traversal',
  'CHANGE-CAPTURE': 'Change Streams',
  'TRANSACTION': 'ACID Transactions',
  'SCALE-OUT': 'Scale-Out',
  'CONSISTENCY': 'Consistency',
  'AUTO-HA': 'Auto High Availability',
  'TEXT-SEARCH': 'Full-Text Search',
  'AUTO-COMPLETE': 'Autocomplete',
  'SCHEMA': 'Schema Validation',
  'ENCRYPT-FIELDS': 'Field Encryption',
  'ENCRYPTION': 'Encryption',
  'AUTO-DEPLOY': 'Auto Deploy',
  'TERRAFORM': 'Terraform IaC',
};

// Check if a mission is unlocked for a player
export function isMissionUnlocked(missionId: string, completedMissions: string[]): boolean {
  const prereqs = MISSION_PREREQUISITES[missionId] || [];
  return prereqs.every(p => completedMissions.includes(p));
}

// Get all searchable tags for a mission
export function getMissionSearchTags(mission: { topic?: string; povCapabilities?: string[] }): string[] {
  const tags: string[] = [];
  if (mission.topic) {
    tags.push(mission.topic);
    if (TOPIC_LABELS[mission.topic]) tags.push(TOPIC_LABELS[mission.topic]);
  }
  if (mission.povCapabilities) {
    for (const pov of mission.povCapabilities) {
      tags.push(pov);
      if (POV_LABELS[pov]) tags.push(POV_LABELS[pov]);
    }
  }
  return tags;
}
