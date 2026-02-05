/**
 * Topic-Centric Content Registry
 *
 * Topics and labs are colocated: each topic folder contains topic.ts (definition)
 * and POV subfolders with lab files. This index re-exports everything.
 *
 * Structure: src/content/topics/<topic-id>/topic.ts, <topic-id>/<pov>/lab-*.ts
 */

import type { WorkshopTopic, WorkshopLabDefinition } from '@/types';

// Topic definitions
export { encryptionTopic } from './encryption/topic';
export { dataManagementTopic } from './data-management/topic';
export { queryTopic } from './query/topic';
export { scalabilityTopic } from './scalability/topic';
export { analyticsTopic } from './analytics/topic';
export { operationsTopic } from './operations/topic';
export { deploymentTopic } from './deployment/topic';
export { integrationTopic } from './integration/topic';
export { securityTopic } from './security/topic';

import { queryTopic } from './query/topic';
import { encryptionTopic } from './encryption/topic';
import { analyticsTopic } from './analytics/topic';
import { scalabilityTopic } from './scalability/topic';
import { dataManagementTopic } from './data-management/topic';
import { operationsTopic } from './operations/topic';
import { deploymentTopic } from './deployment/topic';
import { integrationTopic } from './integration/topic';
import { securityTopic } from './security/topic';

// Lab definitions
import { lab1Definition } from './encryption/csfle/lab-csfle-fundamentals';
import { lab2Definition } from './encryption/queryable-encryption/lab-queryable-encryption';
import { lab3Definition } from './encryption/right-to-erasure/lab-right-to-erasure';
import { labRichQueryBasicsDefinition } from './query/rich-query/lab-rich-query-basics';
import { labRichQueryAggregationsDefinition } from './query/rich-query/lab-rich-query-aggregations';
import { labRichQueryEncryptedVsPlainDefinition } from './query/rich-query/lab-rich-query-encrypted-vs-plain';
import { labFlexibleBasicEvolutionDefinition } from './data-management/flexible/lab-flexible-basic-evolution';
import { labFlexibleNestedDocumentsDefinition } from './data-management/flexible/lab-flexible-nested-documents';
import { labFlexibleMicroserviceCompatDefinition } from './data-management/flexible/lab-flexible-microservice-compat';
import { labIngestRateBasicsDefinition } from './scalability/ingest-rate/lab-ingest-rate-basics';
import { labIngestRateBulkOperationsDefinition } from './scalability/ingest-rate/lab-ingest-rate-bulk-operations';
import { labIngestRateReplicationVerifyDefinition } from './scalability/ingest-rate/lab-ingest-rate-replication-verify';
import { labTextSearchBasicsDefinition } from './query/text-search/lab-text-search-basics';
import { labTextSearchWithAutocompleteDefinition } from './query/text-search/lab-text-search-with-autocomplete';
import { labTextSearchExperienceDefinition } from './query/text-search/lab-text-search-experience';
import { labGeospatialNearDefinition } from './query/geospatial/lab-geospatial-near';
import { labGeospatialPolygonsDefinition } from './query/geospatial/lab-geospatial-polygons';
import { labGeospatialPerformanceDefinition } from './query/geospatial/lab-geospatial-performance';
import { labGraphTraversalDefinition } from './query/graph/lab-graph-traversal';
import { labGraphRecommendationsDefinition } from './query/graph/lab-graph-recommendations';
import { labGraphFraudDetectionDefinition } from './query/graph/lab-graph-fraud-detection';
import { labAnalyticsOverviewDefinition } from './analytics/in-place-analytics/lab-analytics-overview';
import { labInPlaceAnalyticsBasicsDefinition } from './analytics/in-place-analytics/lab-in-place-analytics-basics';
import { labInPlaceAnalyticsAdvancedDefinition } from './analytics/in-place-analytics/lab-in-place-analytics-advanced';
import { labWorkloadIsolationOverviewDefinition } from './analytics/workload-isolation/lab-workload-isolation-overview';
import { labWorkloadIsolationReplicaTagsDefinition } from './analytics/workload-isolation/lab-workload-isolation-replica-tags';
import { labWorkloadIsolationReadPreferenceDefinition } from './analytics/workload-isolation/lab-workload-isolation-read-preference';
import { labConsistencyOverviewDefinition } from './scalability/consistency/lab-consistency-overview';
import { labConsistencyShardedSetupDefinition } from './scalability/consistency/lab-consistency-sharded-setup';
import { labConsistencyVerifyDefinition } from './scalability/consistency/lab-consistency-verify';
import { labScaleOutOverviewDefinition } from './scalability/scale-out/lab-scale-out-overview';
import { labScaleOutSetupDefinition } from './scalability/scale-out/lab-scale-out-setup';
import { labScaleOutExecuteDefinition } from './scalability/scale-out/lab-scale-out-execute';
import { labScaleUpOverviewDefinition } from './scalability/scale-up/lab-scale-up-overview';
import { labScaleUpSetupDefinition } from './scalability/scale-up/lab-scale-up-setup';
import { labScaleUpExecuteDefinition } from './scalability/scale-up/lab-scale-up-execute';
import { labOperationsMonitoringDefinition } from './operations/monitoring/lab-operations-monitoring';
import { labDataChangeStreamsDefinition } from './data-management/change-capture/lab-data-change-streams';
import { labMigratableOverviewDefinition } from './deployment/migratable/lab-migratable-overview';
import { labMigratableSetupDefinition } from './deployment/migratable/lab-migratable-setup';
import { labMigratableExecuteDefinition } from './deployment/migratable/lab-migratable-execute';
import { labPortableOverviewDefinition } from './deployment/portable/lab-portable-overview';
import { labPortableSetupDefinition } from './deployment/portable/lab-portable-setup';
import { labPortableExecuteDefinition } from './deployment/portable/lab-portable-execute';
import { labAutoDeployOverviewDefinition } from './deployment/auto-deploy/lab-auto-deploy-overview';
import { labAutoDeploySetupDefinition } from './deployment/auto-deploy/lab-auto-deploy-setup';
import { labAutoDeployExecuteDefinition } from './deployment/auto-deploy/lab-auto-deploy-execute';
import { labRollingUpdatesOverviewDefinition } from './operations/rolling-updates/lab-rolling-updates-overview';
import { labRollingUpdatesSetupDefinition } from './operations/rolling-updates/lab-rolling-updates-setup';
import { labRollingUpdatesExecuteDefinition } from './operations/rolling-updates/lab-rolling-updates-execute';
import { labFullRecoveryRpoOverviewDefinition } from './operations/full-recovery-rpo/lab-full-recovery-rpo-overview';
import { labFullRecoveryRpoSetupDefinition } from './operations/full-recovery-rpo/lab-full-recovery-rpo-setup';
import { labFullRecoveryRpoExecuteDefinition } from './operations/full-recovery-rpo/lab-full-recovery-rpo-execute';
import { labFullRecoveryRtoOverviewDefinition } from './operations/full-recovery-rto/lab-full-recovery-rto-overview';
import { labFullRecoveryRtoSetupDefinition } from './operations/full-recovery-rto/lab-full-recovery-rto-setup';
import { labFullRecoveryRtoExecuteDefinition } from './operations/full-recovery-rto/lab-full-recovery-rto-execute';

/** All workshop topics */
export const allTopics: WorkshopTopic[] = [
  queryTopic,
  encryptionTopic,
  analyticsTopic,
  scalabilityTopic,
  dataManagementTopic,
  operationsTopic,
  deploymentTopic,
  integrationTopic,
  securityTopic,
];

/** All workshop labs, ordered for display */
export const allLabs: WorkshopLabDefinition[] = [
  lab1Definition,
  lab2Definition,
  lab3Definition,
  labRichQueryBasicsDefinition,
  labRichQueryAggregationsDefinition,
  labRichQueryEncryptedVsPlainDefinition,
  labFlexibleBasicEvolutionDefinition,
  labFlexibleNestedDocumentsDefinition,
  labFlexibleMicroserviceCompatDefinition,
  labIngestRateBasicsDefinition,
  labIngestRateBulkOperationsDefinition,
  labIngestRateReplicationVerifyDefinition,
  labTextSearchBasicsDefinition,
  labTextSearchWithAutocompleteDefinition,
  labTextSearchExperienceDefinition,
  labGeospatialNearDefinition,
  labGeospatialPolygonsDefinition,
  labGeospatialPerformanceDefinition,
  labGraphTraversalDefinition,
  labGraphRecommendationsDefinition,
  labGraphFraudDetectionDefinition,
  labAnalyticsOverviewDefinition,
  labInPlaceAnalyticsBasicsDefinition,
  labInPlaceAnalyticsAdvancedDefinition,
  labWorkloadIsolationOverviewDefinition,
  labWorkloadIsolationReplicaTagsDefinition,
  labWorkloadIsolationReadPreferenceDefinition,
  labConsistencyOverviewDefinition,
  labConsistencyShardedSetupDefinition,
  labConsistencyVerifyDefinition,
  labScaleOutOverviewDefinition,
  labScaleOutSetupDefinition,
  labScaleOutExecuteDefinition,
  labScaleUpOverviewDefinition,
  labScaleUpSetupDefinition,
  labScaleUpExecuteDefinition,
  labOperationsMonitoringDefinition,
  labDataChangeStreamsDefinition,
  labMigratableOverviewDefinition,
  labMigratableSetupDefinition,
  labMigratableExecuteDefinition,
  labPortableOverviewDefinition,
  labPortableSetupDefinition,
  labPortableExecuteDefinition,
  labAutoDeployOverviewDefinition,
  labAutoDeploySetupDefinition,
  labAutoDeployExecuteDefinition,
  labRollingUpdatesOverviewDefinition,
  labRollingUpdatesSetupDefinition,
  labRollingUpdatesExecuteDefinition,
  labFullRecoveryRpoOverviewDefinition,
  labFullRecoveryRpoSetupDefinition,
  labFullRecoveryRpoExecuteDefinition,
  labFullRecoveryRtoOverviewDefinition,
  labFullRecoveryRtoSetupDefinition,
  labFullRecoveryRtoExecuteDefinition,
];
