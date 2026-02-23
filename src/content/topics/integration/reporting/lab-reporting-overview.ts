import { WorkshopLabDefinition } from '@/types';

/**
 * Reporting (BI Connector) Overview
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/16/README.md (REPORTING)
 * Expose MongoDB data to SQL/ODBC-based BI and reporting tools via the BI Connector.
 */
export const labReportingOverviewDefinition: WorkshopLabDefinition = {
  id: 'lab-reporting-overview',
  topicId: 'integration',
  title: 'Reporting with BI Connector Overview',
  description:
    'Learn how the MongoDB BI Connector lets business analysts query MongoDB data using common SQL/ODBC-based BI and reporting tools, with no application changes.',
  difficulty: 'beginner',
  estimatedTotalTimeMinutes: 15,
  tags: ['integration', 'reporting', 'bi-connector', 'sql', 'odbc', 'bi'],
  prerequisites: [
    'MongoDB Atlas account',
    'Familiarity with SQL and BI tools',
  ],
  povCapabilities: ['REPORTING'],
  modes: ['lab', 'demo', 'challenge'],
  keyConcepts: [
    {
      term: 'BI Connector',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      explanation: 'Atlas feature that exposes MongoDB collections as SQL-queryable tables so BI tools can connect via ODBC/JDBC.',
    },
    {
      term: 'SQL/ODBC',
      explanation: 'Standard interfaces used by tools like MySQL Workbench, Tableau, and Excel to run SQL against the connector.',
    },
    {
      term: 'Schema sampling',
      explanation: 'The connector infers a relational schema from your documents; you can tune sample size and refresh interval.',
    },
    {
      term: 'On-time performance data',
      explanation: 'The proof uses U.S. airline on-time data (~1.3M records) loaded via mongoimport with field file shaping.',
    },
  ],
  steps: [
    {
      id: 'lab-reporting-overview-step-1',
      title: 'Step 1: Why BI Connector for Reporting',
      narrative:
        'Business analysts often use SQL and tools like MySQL Workbench, Tableau, or Excel. The BI Connector exposes MongoDB data as SQL tables so these tools can query Atlas without changing the database or building a separate reporting layer.',
      instructions:
        '- BI Connector runs alongside your Atlas cluster\n- ODBC/JDBC connection from any SQL-capable tool\n- Schema is inferred from document structure (sample size configurable)\n- No ETL or duplicate data store required',
      estimatedTimeMinutes: 5,
      modes: ['lab', 'demo', 'challenge'],
      points: 5,
      enhancementId: 'reporting.concepts',
      sourceProof: 'proofs/16/README.md',
      sourceSection: 'Description',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],
    },
    {
      id: 'lab-reporting-overview-step-2',
      title: 'Step 2: Reporting Flow (Proof 16)',
      narrative:
        'Load airline on-time performance data (~1.3M records) into MongoDB using mongoimport with a field file for shaping. Enable BI Connector on the cluster, then connect a SQL tool (e.g. MySQL Workbench) via ODBC and run standard SQL queries against the data.',
      instructions:
        '- Load CSV data with mongoimport (--fieldFile, --columnsHaveTypes) into airlines.on_time_perf\n- Create indexes for query performance\n- Enable BI Connector (schema sample size, refresh interval)\n- Install ODBC driver and DSN, connect MySQL Workbench\n- Run SQL: count(*), GROUP BY carrier, AVG(delays), etc.',
      estimatedTimeMinutes: 5,
      modes: ['lab', 'demo', 'challenge'],
      points: 5,
      enhancementId: 'reporting.flow',
      sourceProof: 'proofs/16/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Execution',
    },
    {
      id: 'lab-reporting-overview-step-3',
      title: 'Step 3: Requirements',
      narrative:
        'You need an M20+ cluster with the BI Connector option enabled (Additional Settings when creating the cluster). Schema sample size and refresh interval can be tuned. A user (e.g. biuser) and IP whitelist are required for both Mongo and BI connections.',
      instructions:
        '- Atlas: M20, 3-node replica set\n- BI Connector: enable in cluster creation (Additional Settings)\n- Schema Sample Size (e.g. 1500), Sample Refresh Interval (e.g. 300)\n- User with read/write, IP whitelist\n- Record Hostname, Port, User from Connect Your Business Intelligence Tool',
      estimatedTimeMinutes: 5,
      modes: ['lab', 'demo', 'challenge'],
      points: 5,
      enhancementId: 'reporting.requirements',
      sourceProof: 'proofs/16/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Setup',
    },
  ],
};
