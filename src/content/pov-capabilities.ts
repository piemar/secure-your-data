import { PovCapability } from '@/types/pov-capabilities';

/**
 * POV Capability Registry
 * 
 * All 57 MongoDB PoV Proofs from Docs/POV.txt
 * Organized by category for easy filtering and discovery
 */
export const povCapabilities: PovCapability[] = [
  // Query Capabilities
  {
    id: 'RICH-QUERY',
    label: 'Rich Queries',
    description: 'Ability to run a single expressive and efficient query targeting a specific subset of records using compound criteria spanning a number of fields, including fields in sub-documents & array elements',
    category: 'query',
    proofNumber: 1
  },
  {
    id: 'TEXT-SEARCH',
    label: 'Text Search',
    description: 'Ability to search & rank records based on matching a search string even if misspelled',
    category: 'query',
    proofNumber: 36
  },
  {
    id: 'AUTO-COMPLETE',
    label: 'Auto-Complete',
    description: 'Ability to provide auto-complete suggestions for a text field that appears in a set of records, when a user provides just the first few characters to search',
    category: 'query',
    proofNumber: 37
  },
  {
    id: 'GEOSPATIAL',
    label: 'Geospatial Queries',
    description: 'Ability to search for records based on Earth geospatial location data, without requiring full data-set scans, and including the sphere-aware query types of 1) radial distance from a point, 2) shaped areas which a point occurs in, and 3) contained within a shaped area',
    category: 'query',
    proofNumber: 30
  },
  {
    id: 'GRAPH',
    label: 'Graph Traversal',
    description: 'Ability for applications to efficiently traverse a graph relationships across data records',
    category: 'query',
    proofNumber: 26
  },

  // Security Capabilities
  {
    id: 'ENCRYPTION',
    label: 'End-to-End Encryption',
    description: 'Ability to provide end-to-end encryption for sensitive data (in-flight & at-rest)',
    category: 'security',
    proofNumber: 21
  },
  {
    id: 'ENCRYPT-FIELDS',
    label: 'Field-Level Encryption',
    description: 'Ability for a client application to encrypt specific database fields at the application tier using encryption keys only accessible to the client, thus preventing any database/server-side access to the data',
    category: 'security',
    proofNumber: 46
  },
  {
    id: 'FLE-QUERYABLE-KMIP',
    label: 'FLE & Queryable Encryption with KMIP',
    description: 'Ability for a client application to encrypt specific database fields at the application tier using encryption keys managed by KMIP endpoint Hashicorp keyvault. Showcasing Queryable Encryption and CSFLE',
    category: 'security',
    proofNumber: 54
  },
  {
    id: 'RBAC',
    label: 'Role-Based Access Control',
    description: 'Ability to apply Role Based Access Controls (RBAC) to enforce which users can and can\'t access specific sets of data',
    category: 'security',
    proofNumber: 22
  },
  {
    id: 'END-USER-RBAC',
    label: 'End-User RBAC',
    description: 'Ability to enforce Role-Based-Access-Control (RBAC) to lock down access to specific record fields depending on the end user\'s identity',
    category: 'security',
    proofNumber: 40
  },
  {
    id: 'LDAP',
    label: 'LDAP Integration',
    description: 'Ability to natively integrate the database with an LDAP/Active-Directory for centralised authentication & access control management',
    category: 'security',
    proofNumber: 23
  },
  {
    id: 'AUDITING',
    label: 'Auditing',
    description: 'Ability to enforce native fine-grained auditing for administrative & user actions, to be able to subsequently prove who did what',
    category: 'security',
    proofNumber: 24
  },

  // Scalability Capabilities
  {
    id: 'SCALE-OUT',
    label: 'Scale Out',
    description: 'Ability to scale out over time to support increasing data volumes and usage, without requiring database or application downtime',
    category: 'scalability',
    proofNumber: 7
  },
  {
    id: 'SCALE-UP',
    label: 'Scale Up',
    description: 'Ability to increase/decrease underlying host compute resources (CPU/RAM/Storage) dynamically without database downtime',
    category: 'scalability',
    proofNumber: 8
  },
  {
    id: 'ELASTIC-SCALE',
    label: 'Elastic Scale',
    description: 'Ability for the database to automatically scale-up its compute capacity, without requiring human intervention, in response to increased database usage',
    category: 'scalability',
    proofNumber: 38
  },
  {
    id: 'AUTO-HA',
    label: 'Auto High Availability',
    description: 'Ability for database to automatically recover from host machine failure, for a single region/DC, within X seconds, without requiring human intervention',
    category: 'scalability',
    proofNumber: 17
  },
  {
    id: 'MULTI-REGION-HA',
    label: 'Multi-Region HA',
    description: 'Ability to deploy a distributed database across 3 or more cloud-regions or data-centres, with automated failover, for maximum high availability',
    category: 'scalability',
    proofNumber: 18
  },
  {
    id: 'MULTI-CLOUD',
    label: 'Multi-Cloud',
    description: 'Ability to deploy a distributed database across multiple cloud providers and regions, with automated failover, for maximum high availability',
    category: 'scalability',
    proofNumber: 50
  },
  {
    id: 'DATA-LOCALITY',
    label: 'Data Locality',
    description: 'Ability to govern and administer the database globally, whilst allowing local applications to read and write locally, for low latency and/or data sovereignty',
    category: 'scalability',
    proofNumber: 31
  },
  {
    id: 'SAFE-WRITES',
    label: 'Safe Writes',
    description: 'Ability to guarantee that critical insert/update/delete operations can be safely applied across multiple different cloud regions or data centres, and no changes are lost in the event of a complete region or data-centre outage',
    category: 'scalability',
    proofNumber: 35
  },

  // Analytics Capabilities
  {
    id: 'IN-PLACE-ANALYTICS',
    label: 'In-Place Analytics',
    description: 'Ability to issue a single command to the database instructing it to aggregate \'total\' and \'count\' values for a field, for an index targeted sub-set of all records',
    category: 'analytics',
    proofNumber: 4
  },
  {
    id: 'WORKLOAD-ISOLATION',
    label: 'Workload Isolation',
    description: 'Ability to execute aggregations on the same cluster as CRUD operations are currently occurring, with appropriate performance workload isolation',
    category: 'analytics',
    proofNumber: 5
  },
  {
    id: 'JOINS',
    label: 'Joins',
    description: 'Ability to perform the join of related data sets, directly in the database, for faster analytics',
    category: 'analytics',
    proofNumber: 32
  },
  {
    id: 'INCREMENTAL-ANALYTICS',
    label: 'Incremental Analytics',
    description: 'Ability to maintain a materialized view of the latest version of summary data, derived by continuosly performing incremental analytics in the background against the original raw data',
    category: 'analytics',
    proofNumber: 42
  },
  {
    id: 'TIME-SERIES',
    label: 'Time Series',
    description: 'Ability to work natively with time series data, reducing storage and index size and visualize those data with MongoDB Atlas Charts',
    category: 'analytics',
    proofNumber: 53
  },
  {
    id: 'RETRIEVAL-AUGMENTED-GENERATION',
    label: 'Retrieval Augmented Generation (RAG)',
    description: 'Enabling generic Large Language Models (LLMs) to answer questions based on knowledge not provided or available during their original training. Leverages Atlas Vector Search.',
    category: 'analytics',
    proofNumber: 55
  },
  {
    id: 'VECTOR-AUTO-EMBEDDING',
    label: 'Vector Auto-Embedding',
    description: 'Ability to do semantic searches via Atlas Vector Search and Voyage.ai without having to configure external embedding models',
    category: 'analytics',
    proofNumber: 57
  },
  {
    id: 'NATIVE-VISUALIZATION',
    label: 'Native Visualization',
    description: 'Ability to rapidly expose a graphical summary report of data to business users, where the report is periodically auto-refreshed, without requiring 3rd party BI tools',
    category: 'analytics',
    proofNumber: 43
  },
  {
    id: 'EMBED-VISUALIZATION',
    label: 'Embed Visualization',
    description: 'Ability to rapidly & securely embed a graphical summary report of data in a web page, exposed to web users, where the report auto-refreshes',
    category: 'analytics',
    proofNumber: 44
  },
  {
    id: 'REPORTING',
    label: 'Reporting',
    description: 'Ability to easily expose data to business analysts using common SQL/ODBC based BI & Reporting tools',
    category: 'analytics',
    proofNumber: 16
  },

  // Operations Capabilities
  {
    id: 'MONITORING',
    label: 'Monitoring',
    description: 'Ability to track and drill into fine-grained monitoring history to enable retrospective diagnosis of issues that have already occurred',
    category: 'operations',
    proofNumber: 28
  },
  {
    id: 'ALERTS',
    label: 'Alerts',
    description: 'Ability to configure alerting to detect things like database slowdown or impending database overload, to enable proactive and remedial administration actions to be taken',
    category: 'operations',
    proofNumber: 29
  },
  {
    id: 'PERF-ADVICE',
    label: 'Performance Advice',
    description: 'Ability to continuously be informed with database performance improvement advice for long running databases, enabling database health to be proactively maintained',
    category: 'operations',
    proofNumber: 25
  },
  {
    id: 'FULL-RECOVERY-RPO',
    label: 'Full Recovery RPO',
    description: 'Ability to recover a database to a specific point in time with zero data loss (RPO=0)',
    category: 'operations',
    proofNumber: 13
  },
  {
    id: 'FULL-RECOVERY-RTO',
    label: 'Full Recovery RTO',
    description: 'Ability to recover a database within X minutes for a data-set size of Y GB (RTO=Xmins)',
    category: 'operations',
    proofNumber: 14
  },
  {
    id: 'PARTIAL-RECOVERY',
    label: 'Partial Recovery',
    description: 'Ability to recover a subset of data to the running live database, without requiring database or application downtime',
    category: 'operations',
    proofNumber: 15
  },
  {
    id: 'ROLLING-UPDATES',
    label: 'Rolling Updates',
    description: 'Ability to apply patches (eg. to address bugs or security issues) without requiring scheduled downtime for the database or consuming applications',
    category: 'operations',
    proofNumber: 12
  },
  {
    id: 'TRIGGER-ALERT',
    label: 'Trigger Alert',
    description: 'Ability to send an alert to an administrator if the value of a record\'s field changes',
    category: 'operations',
    proofNumber: 41
  },

  // Data Management Capabilities
  {
    id: 'FLEXIBLE',
    label: 'Flexible Schema',
    description: 'Ability to make \'in-place\' data model changes to a live database without requiring planned downtime for the database or consuming applications',
    category: 'data-management',
    proofNumber: 2
  },
  {
    id: 'SCHEMA',
    label: 'Schema Validation',
    description: 'Ability to enforce data quality rules mandating the presence of specific fields and their data types in all records',
    category: 'data-management',
    proofNumber: 20
  },
  {
    id: 'CONSISTENCY',
    label: 'Strong Consistency',
    description: 'Ability to enforce strong consistency across a distributed database, to ensure applications always see the most up to date data',
    category: 'data-management',
    proofNumber: 6
  },
  {
    id: 'TRANSACTION',
    label: 'Transactions',
    description: 'Ability to update multiple different records as part of a single ACID transaction which is guaranteed to either succeed or fail as a whole',
    category: 'data-management',
    proofNumber: 19
  },
  {
    id: 'CHANGE-CAPTURE',
    label: 'Change Capture',
    description: 'Ability for applications to listen for and react to individual database events, in realtime (e.g. for fraud detection for updating a realtime visual dashboard or for CDC capture for downstream systems)',
    category: 'data-management',
    proofNumber: 33
  },
  {
    id: 'STREAM-PROCESSING',
    label: 'Stream Processing',
    description: 'Use a single platform, API, query language, and data model to continuously process, query, analyze, and react to streaming data using Atlas Stream Processing (Public Preview)',
    category: 'data-management',
    proofNumber: 56
  },
  {
    id: 'DECIMAL-PRECISION',
    label: 'Decimal Precision',
    description: 'Ability to natively store and retrieve high precision decimal numbers, and perform in place calculations on these with high precision',
    category: 'data-management',
    proofNumber: 34
  },
  {
    id: 'MULTIMEDIA',
    label: 'Multimedia Storage',
    description: 'Ability to store both large binary documents and related metadata together for easy centralised data management',
    category: 'data-management',
    proofNumber: 27
  },
  {
    id: 'ARCHIVE-STORAGE',
    label: 'Archive Storage',
    description: 'Ability to still access data, archived from an online database to inexpensive public cloud native object storage, and still access the data with the same query capabilities as the original database provided',
    category: 'data-management',
    proofNumber: 45
  },
  {
    id: 'MIGRATABLE',
    label: 'Migratable',
    description: 'Ability to deploy a database on-prem and then quickly migrate to a public cloud provider with less than 1 minute of scheduled application downtime required',
    category: 'data-management',
    proofNumber: 9
  },
  {
    id: 'PORTABLE',
    label: 'Portable',
    description: 'Ability to migrate a database from one public cloud provider, to another, to avoid cloud provider lock-in, with less than 1 minute of scheduled application downtime required',
    category: 'data-management',
    proofNumber: 10
  },
  {
    id: 'INGEST-RATE',
    label: 'High Ingest Rate',
    description: 'Ability to ingest X records in Y seconds with replication enforced for at least 2 copies of the data, for safety and redundancy (average record size of Z KB)',
    category: 'data-management',
    proofNumber: 3
  },
  {
    id: 'DEVICE-SYNC',
    label: 'Device Sync',
    description: 'Ability to keep user data automatically synchronized between intermittently internet connected devices and a centrally managed database',
    category: 'data-management',
    proofNumber: 49
  },

  // Integration Capabilities
  {
    id: 'DATA-REST-API',
    label: 'Data REST API',
    description: 'Ability to expose a database data-set to consuming applications via a REST API',
    category: 'integration',
    proofNumber: 39
  },
  {
    id: 'DATA-API',
    label: 'Data API',
    description: 'Ability to easily read, insert, modify, and delete documents stored in MongoDB Atlas using a REST-like API without a driver or additional infrastructure management',
    category: 'integration',
    proofNumber: 52
  },
  {
    id: 'GRAPHQL',
    label: 'GraphQL',
    description: 'Ability to perform a database query, using GraphQL, which combines data from two different data-sets and returns only the required fields in the combined result',
    category: 'integration',
    proofNumber: 47
  },
  {
    id: 'KAFKA',
    label: 'Kafka Integration',
    description: 'Ability to integrate the database with Kafka, acting as both a sync and a source, using a native Kafka connector provided by the database supplier',
    category: 'integration',
    proofNumber: 51
  },

  // Deployment Capabilities
  {
    id: 'AUTO-DEPLOY',
    label: 'Auto Deploy',
    description: 'Ability to automate the deployment & configuration of a production ready database cluster, which is ready and live within X minutes of invoking a single command',
    category: 'deployment',
    proofNumber: 11
  },
  {
    id: 'TERRAFORM',
    label: 'Terraform',
    description: 'Ability to automate the deployment & configuration of a production ready database cluster, using Terraform',
    category: 'deployment',
    proofNumber: 48
  }
];

/**
 * Get POV capability by ID
 */
export function getPovCapabilityById(id: string): PovCapability | undefined {
  return povCapabilities.find(cap => cap.id === id);
}

/**
 * Get POV capabilities by category
 */
export function getPovCapabilitiesByCategory(category: PovCapability['category']): PovCapability[] {
  return povCapabilities.filter(cap => cap.category === category);
}

/**
 * Get POV capabilities by IDs
 */
export function getPovCapabilitiesByIds(ids: string[]): PovCapability[] {
  return povCapabilities.filter(cap => ids.includes(cap.id));
}
