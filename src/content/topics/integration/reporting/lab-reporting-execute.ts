import { WorkshopLabDefinition } from '@/types';

/**
 * Reporting (BI Connector) Execute
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/16/README.md (REPORTING)
 * Run SQL queries in MySQL Workbench against MongoDB data via the BI Connector.
 */
export const labReportingExecuteDefinition: WorkshopLabDefinition = {
  id: 'lab-reporting-execute',
  topicId: 'integration',
  title: 'Reporting: Run SQL Queries via BI Connector',
  description:
    'Connect MySQL Workbench to Atlas via the BI Connector and run typical SQL queries: count, group by carrier, average arrival/departure delays, and filtered aggregations against the airline on-time performance data.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 25,
  tags: ['integration', 'reporting', 'bi-connector', 'sql', 'mysql-workbench'],
  prerequisites: [
    'lab-reporting-setup completed',
    'Data loaded (airlines.on_time_perf), ODBC and MySQL Workbench configured',
  ],
  povCapabilities: ['REPORTING'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/16',
  modes: ['lab', 'demo'],
  steps: [
    {
      id: 'lab-reporting-execute-step-1',
      title: 'Step 1: Connect and Run Count',
      narrative:
        'Open MySQL Workbench and select the connection configured for the BI Connector. Run a simple count to verify connectivity and that the on_time_perf table is visible. Note the default limit (e.g. 1000 rows) for result sets.',
      instructions:
        'Start MySQL Workbench, select your MongoDB BI connection. In SQL editor run: select count(*) from airlines.on_time_perf; Execute (lightning bolt). Confirm result (e.g. 1348838). Note session row limit if applicable.',
      estimatedTimeMinutes: 5,
      modes: ['lab', 'demo'],
      points: 5,
      enhancementId: 'reporting.query-count',
      sourceProof: 'proofs/16/README.md',
      sourceSection: 'Execution',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],
    },
    {
      id: 'lab-reporting-execute-step-2',
      title: 'Step 2: Group By and Aggregations by Carrier',
      narrative:
        'Run SQL queries that group by carrier and compute counts and average delays. These demonstrate that standard SQL works against the MongoDB-backed schema exposed by the BI Connector.',
      instructions:
        'Run: select Carrier, count(*) from airlines.on_time_perf group by 1 order by 1; Then: select Carrier, AVG(`Arrival.DelayMinutes`), AVG(`Departure.DelayMinutes`) from airlines.on_time_perf group by 1 order by 1; Check results match expected carrier distribution and delay averages.',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo'],
      points: 10,
      enhancementId: 'reporting.query-carriers',
      sourceProof: 'proofs/16/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Execution',
    },
    {
      id: 'lab-reporting-execute-step-3',
      title: 'Step 3: Multi-Dimensional and Filtered Queries',
      narrative:
        'Run queries that group by origin state, destination state, and filter (e.g. origin state = VA). This shows that complex reporting SQL runs seamlessly against the connector.',
      instructions:
        'Run: select Carrier, `Origin.State`, AVG(`Arrival.DelayMinutes`), AVG(`Departure.DelayMinutes`) from airlines.on_time_perf group by 1,2 order by 1,2; Then: select `Origin.State`, `Destination.State`, AVG(...) from airlines.on_time_perf where `Origin.State` = \'VA\' group by 1,2 order by 3 desc, 4 desc; Verify result counts and timing.',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo'],
      points: 10,
      enhancementId: 'reporting.query-delays',
      sourceProof: 'proofs/16/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Measurement',
    },
  ],
};
