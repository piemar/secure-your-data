import { MissionSkeleton } from '@/lib/types';
import { ObjectiveValidation } from '@/lib/validation';
import { mission as crud_boot_campMission } from './crud_boot_camp/mission';
import { mission as the_phantom_indexMission } from './the_phantom_index/mission';
import { mission as the_aggregation_heistMission } from './the_aggregation_heist/mission';
import { mission as rich_query_reconMission } from './rich_query_recon/mission';
import { mission as analytics_extractionMission } from './analytics_extraction/mission';
import { mission as geospatial_pursuitMission } from './geospatial_pursuit/mission';
import { mission as graph_infiltrationMission } from './graph_infiltration/mission';
import { mission as change_stream_stakeoutMission } from './change_stream_stakeout/mission';
import { mission as transaction_lockoutMission } from './transaction_lockout/mission';
import { mission as shard_under_siegeMission } from './shard_under_siege/mission';
import { mission as connection_stormMission } from './connection_storm/mission';
import { mission as scale_out_siegeMission } from './scale_out_siege/mission';
import { mission as auto_ha_failoverMission } from './auto_ha_failover/mission';
import { mission as text_search_infiltrationMission } from './text_search_infiltration/mission';
import { mission as the_schema_saboteurMission } from './the_schema_saboteur/mission';
import { mission as encryption_lockdownMission } from './encryption_lockdown/mission';
import { mission as deployment_automationMission } from './deployment_automation/mission';
import { mission as time_series_infiltrationMission } from './time_series_infiltration/mission';
import { mission as vector_heistMission } from './vector_heist/mission';
import { mission as schema_evolutionMission } from './schema_evolution/mission';
import { mission as csfle_key_vault_bootstrapMission } from './csfle_key_vault_bootstrap/mission';
import { mission as orthogonal_obfuscation_pipelineMission } from './orthogonal_obfuscation_pipeline/mission';
import { mission as semantic_retrieval_audit_runMission } from './semantic_retrieval_audit_run/mission';
import { skeleton as crud_boot_campSkeleton } from './crud_boot_camp/skeleton';
import { skeleton as the_phantom_indexSkeleton } from './the_phantom_index/skeleton';
import { skeleton as the_aggregation_heistSkeleton } from './the_aggregation_heist/skeleton';
import { skeleton as rich_query_reconSkeleton } from './rich_query_recon/skeleton';
import { skeleton as analytics_extractionSkeleton } from './analytics_extraction/skeleton';
import { skeleton as geospatial_pursuitSkeleton } from './geospatial_pursuit/skeleton';
import { skeleton as graph_infiltrationSkeleton } from './graph_infiltration/skeleton';
import { skeleton as change_stream_stakeoutSkeleton } from './change_stream_stakeout/skeleton';
import { skeleton as transaction_lockoutSkeleton } from './transaction_lockout/skeleton';
import { skeleton as shard_under_siegeSkeleton } from './shard_under_siege/skeleton';
import { skeleton as connection_stormSkeleton } from './connection_storm/skeleton';
import { skeleton as scale_out_siegeSkeleton } from './scale_out_siege/skeleton';
import { skeleton as auto_ha_failoverSkeleton } from './auto_ha_failover/skeleton';
import { skeleton as text_search_infiltrationSkeleton } from './text_search_infiltration/skeleton';
import { skeleton as the_schema_saboteurSkeleton } from './the_schema_saboteur/skeleton';
import { skeleton as encryption_lockdownSkeleton } from './encryption_lockdown/skeleton';
import { skeleton as deployment_automationSkeleton } from './deployment_automation/skeleton';
import { skeleton as time_series_infiltrationSkeleton } from './time_series_infiltration/skeleton';
import { skeleton as vector_heistSkeleton } from './vector_heist/skeleton';
import { skeleton as schema_evolutionSkeleton } from './schema_evolution/skeleton';
import { skeleton as csfle_key_vault_bootstrapSkeleton } from './csfle_key_vault_bootstrap/skeleton';
import { skeleton as orthogonal_obfuscation_pipelineSkeleton } from './orthogonal_obfuscation_pipeline/skeleton';
import { skeleton as semantic_retrieval_audit_runSkeleton } from './semantic_retrieval_audit_run/skeleton';
import { validations as crud_boot_campValidations } from './crud_boot_camp/validation';
import { validations as the_phantom_indexValidations } from './the_phantom_index/validation';
import { validations as the_aggregation_heistValidations } from './the_aggregation_heist/validation';
import { validations as rich_query_reconValidations } from './rich_query_recon/validation';
import { validations as analytics_extractionValidations } from './analytics_extraction/validation';
import { validations as geospatial_pursuitValidations } from './geospatial_pursuit/validation';
import { validations as graph_infiltrationValidations } from './graph_infiltration/validation';
import { validations as change_stream_stakeoutValidations } from './change_stream_stakeout/validation';
import { validations as transaction_lockoutValidations } from './transaction_lockout/validation';
import { validations as shard_under_siegeValidations } from './shard_under_siege/validation';
import { validations as connection_stormValidations } from './connection_storm/validation';
import { validations as scale_out_siegeValidations } from './scale_out_siege/validation';
import { validations as auto_ha_failoverValidations } from './auto_ha_failover/validation';
import { validations as text_search_infiltrationValidations } from './text_search_infiltration/validation';
import { validations as the_schema_saboteurValidations } from './the_schema_saboteur/validation';
import { validations as encryption_lockdownValidations } from './encryption_lockdown/validation';
import { validations as deployment_automationValidations } from './deployment_automation/validation';
import { validations as time_series_infiltrationValidations } from './time_series_infiltration/validation';
import { validations as vector_heistValidations } from './vector_heist/validation';
import { validations as schema_evolutionValidations } from './schema_evolution/validation';
import { validations as csfle_key_vault_bootstrapValidations } from './csfle_key_vault_bootstrap/validation';
import { validations as orthogonal_obfuscation_pipelineValidations } from './orthogonal_obfuscation_pipeline/validation';
import { validations as semantic_retrieval_audit_runValidations } from './semantic_retrieval_audit_run/validation';

export const MISSIONS = [
  crud_boot_campMission,
  the_phantom_indexMission,
  the_aggregation_heistMission,
  rich_query_reconMission,
  analytics_extractionMission,
  geospatial_pursuitMission,
  graph_infiltrationMission,
  change_stream_stakeoutMission,
  transaction_lockoutMission,
  shard_under_siegeMission,
  connection_stormMission,
  scale_out_siegeMission,
  auto_ha_failoverMission,
  text_search_infiltrationMission,
  the_schema_saboteurMission,
  encryption_lockdownMission,
  deployment_automationMission,
  time_series_infiltrationMission,
  vector_heistMission,
  schema_evolutionMission,
  csfle_key_vault_bootstrapMission,
  orthogonal_obfuscation_pipelineMission,
  semantic_retrieval_audit_runMission,
];

export const MISSION_SKELETONS: Record<string, MissionSkeleton> = {
  'mission-12': crud_boot_campSkeleton,
  'mission-1': the_phantom_indexSkeleton,
  'mission-3': the_aggregation_heistSkeleton,
  'mission-6': rich_query_reconSkeleton,
  'mission-8': analytics_extractionSkeleton,
  'mission-13': geospatial_pursuitSkeleton,
  'mission-14': graph_infiltrationSkeleton,
  'mission-15': change_stream_stakeoutSkeleton,
  'mission-16': transaction_lockoutSkeleton,
  'mission-2': shard_under_siegeSkeleton,
  'mission-4': connection_stormSkeleton,
  'mission-9': scale_out_siegeSkeleton,
  'mission-10': auto_ha_failoverSkeleton,
  'mission-17': text_search_infiltrationSkeleton,
  'mission-5': the_schema_saboteurSkeleton,
  'mission-7': encryption_lockdownSkeleton,
  'mission-11': deployment_automationSkeleton,
  'mission-18': time_series_infiltrationSkeleton,
  'mission-19': vector_heistSkeleton,
  'mission-20': schema_evolutionSkeleton,
  'mission-21': csfle_key_vault_bootstrapSkeleton,
  'mission-22': orthogonal_obfuscation_pipelineSkeleton,
  'mission-23': semantic_retrieval_audit_runSkeleton,
};

export const MISSION_VALIDATIONS: Record<string, ObjectiveValidation[]> = {
  'mission-12': crud_boot_campValidations,
  'mission-1': the_phantom_indexValidations,
  'mission-3': the_aggregation_heistValidations,
  'mission-6': rich_query_reconValidations,
  'mission-8': analytics_extractionValidations,
  'mission-13': geospatial_pursuitValidations,
  'mission-14': graph_infiltrationValidations,
  'mission-15': change_stream_stakeoutValidations,
  'mission-16': transaction_lockoutValidations,
  'mission-2': shard_under_siegeValidations,
  'mission-4': connection_stormValidations,
  'mission-9': scale_out_siegeValidations,
  'mission-10': auto_ha_failoverValidations,
  'mission-17': text_search_infiltrationValidations,
  'mission-5': the_schema_saboteurValidations,
  'mission-7': encryption_lockdownValidations,
  'mission-11': deployment_automationValidations,
  'mission-18': time_series_infiltrationValidations,
  'mission-19': vector_heistValidations,
  'mission-20': schema_evolutionValidations,
  'mission-21': csfle_key_vault_bootstrapValidations,
  'mission-22': orthogonal_obfuscation_pipelineValidations,
  'mission-23': semantic_retrieval_audit_runValidations,
};

export function getSkeletonForDifficulty(missionId: string, difficulty: 'guided' | 'challenge' | 'expert'): string {
  const skeleton = MISSION_SKELETONS[missionId];
  if (!skeleton) return '// Mission skeleton not found';
  return skeleton[difficulty];
}

export function getHintsForDifficulty(missionId: string, difficulty: 'guided' | 'challenge' | 'expert') {
  const skeleton = MISSION_SKELETONS[missionId];
  if (!skeleton) return [];
  if (difficulty === 'expert') return [];
  return skeleton.hints[difficulty] || [];
}
