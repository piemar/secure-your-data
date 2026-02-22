import type { EnhancementMetadataRegistry } from '@/labs/enhancements/schema';

/**
 * Reporting (BI Connector) Enhancement Metadata
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/16/README.md (REPORTING)
 * Expose MongoDB data to SQL/ODBC-based BI and reporting tools.
 */

export const enhancements: EnhancementMetadataRegistry = {
  'reporting.concepts': {
    id: 'reporting.concepts',
    povCapability: 'REPORTING',
    sourceProof: 'proofs/16/README.md',
    sourceSection: 'Description',
    codeBlocks: [
      {
        filename: 'BI Connector Concepts',
        language: 'text',
        code: `BI Connector for Reporting
=========================

- Exposes MongoDB collections as SQL-queryable tables
- BI tools connect via ODBC/JDBC (MySQL Workbench, Tableau, Excel, etc.)
- Schema inferred from documents (Schema Sample Size, Sample Refresh Interval)
- No ETL or separate reporting database needed
- Analysts use familiar SQL against live MongoDB data`,
      },
    ],
    tips: [
      'Enable BI Connector when creating the cluster (Additional Settings).',
      'Use biuser or a dedicated read-only user for BI connections.',
      'Nested fields appear as dotted names in SQL (e.g. Arrival.DelayMinutes).',
    ],
  },

  'reporting.flow': {
    id: 'reporting.flow',
    povCapability: 'REPORTING',
    sourceProof: 'proofs/16/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Reporting Flow',
        language: 'text',
        code: `Proof 16 Flow
=============

1. Load U.S. airline on-time data (~1.3M records) with mongoimport
   - Use --fieldFile and --columnsHaveTypes for document shaping
   - Collection: airlines.on_time_perf
2. Create indexes for query performance (createIndexes.js)
3. Enable BI Connector on Atlas cluster (schema sample, refresh interval)
4. Install MongoDB ODBC driver, create DSN
5. Install and configure MySQL Workbench with BI Connector connection
6. Run SQL: count(*), GROUP BY Carrier, AVG(Arrival.DelayMinutes), etc.`,
      },
    ],
    tips: [
      'Carriers in data: AS, AA, DL, EV, F9, HA, B6, OO, WN, NK, UA, VX.',
      'Default result limit in Workbench may be 1000; adjust if needed.',
    ],
  },

  'reporting.requirements': {
    id: 'reporting.requirements',
    povCapability: 'REPORTING',
    sourceProof: 'proofs/16/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'Requirements',
        language: 'text',
        code: `Atlas
-----
- M20, 3-node replica set
- BI Connector enabled (Additional Settings)
- Schema Sample Size: 1500
- Sample Refresh Interval: 300
- User: biuser (read/write any database)
- IP whitelist

Record from Atlas:
- mongoimport --host (for .atlas_env)
- Mongo Shell host
- Connect Your Business Intelligence Tool: Hostname, Port, User`,
      },
    ],
    tips: [
      'BI Connector must be enabled at cluster creation (Additional Settings).',
      'Same credentials (biuser) can be used for Shell and BI connection.',
    ],
  },

  'reporting.atlas-biconnector': {
    id: 'reporting.atlas-biconnector',
    povCapability: 'REPORTING',
    sourceProof: 'proofs/16/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'Atlas and BI Connector',
        language: 'text',
        code: `Create cluster: M20, 3-node, single region.
Additional Settings → BI Connector: ON
  Schema Sample Size: 1500
  Sample Refresh Interval: 300

Security: biuser (Read and write to any database), IP whitelist.

Save:
1. Command Line Tools → mongoimport → copy --host value
2. Connect → Mongo Shell → copy host part of SRV
3. Connect → Connect Your Business Intelligence Tool → Hostname, Port, User`,
      },
    ],
    tips: [
      'BI Connector option is under the Additional Settings dropdown.',
      'Port and hostname are specific to the BI Connector, not the cluster SRV.',
    ],
  },

  'reporting.load-data': {
    id: 'reporting.load-data',
    povCapability: 'REPORTING',
    sourceProof: 'proofs/16/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: '.atlas_env and import_data.sh',
        language: 'bash',
        code: `# In proofs/16/, edit .atlas_env:
MONGO_IMPORT_HOST="<--host value from mongoimport>"
MONGO_SHELL_HOST="<host from Mongo Shell SRV>"
USER="biuser"
PASS="<password>"

# Run import (may take ~1 hour)
./import_data.sh

# Verify in Atlas: airlines.on_time_perf
# Documents: 1,348,838  |  Indexes: 8`,
      },
    ],
    tips: [
      'import_data.sh uses mongoimport with PERFORMANCE_DATA and field file.',
      'Indexes are created by createIndexes.js; verify 8 indexes on collection.',
    ],
  },

  'reporting.odbc-workbench': {
    id: 'reporting.odbc-workbench',
    povCapability: 'REPORTING',
    sourceProof: 'proofs/16/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'ODBC and MySQL Workbench',
        language: 'text',
        code: `1. Download/install MongoDB ODBC driver (e.g. from GitHub releases)
2. Create system DSN: MongoDB docs "create-system-dsn" (MacOS steps 1,2,3,4,5,8)
3. Install MySQL Workbench (Community)
4. Configure connection: Atlas tutorial "connect-bic-workbench"
   Use BI Connector Hostname, Port, Username from Atlas
   (Documentation may show different Workbench version; steps still apply)`,
      },
    ],
    tips: [
      'On macOS Catalina+, use ODBC Manager 1.0.19 (1.0.16 not compatible).',
      'You only need the BI Connector connection; DSN steps 6–7 are optional in some setups.',
    ],
  },

  'reporting.query-count': {
    id: 'reporting.query-count',
    povCapability: 'REPORTING',
    sourceProof: 'proofs/16/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Count query',
        language: 'sql',
        code: `select count(*) from airlines.on_time_perf;`,
      },
    ],
    tips: [
      'Expected result: 1,348,838 (or your loaded count).',
      'Session default limit (e.g. 1000 rows) applies to SELECT with many rows, not to count(*).',
    ],
  },

  'reporting.query-carriers': {
    id: 'reporting.query-carriers',
    povCapability: 'REPORTING',
    sourceProof: 'proofs/16/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Carrier distribution and delays',
        language: 'sql',
        code: `-- Distribution by carrier
select Carrier, count(*) from airlines.on_time_perf group by 1 order by 1;

-- Average arrival and departure delay by carrier
select Carrier, AVG(\`Arrival.DelayMinutes\`), AVG(\`Departure.DelayMinutes\`)
from airlines.on_time_perf group by 1 order by 1;`,
      },
    ],
    tips: [
      'Use backticks for dotted column names: `Arrival.DelayMinutes`.',
      'Carriers: AS, AA, DL, EV, F9, HA, B6, OO, WN, NK, UA, VX.',
    ],
  },

  'reporting.query-delays': {
    id: 'reporting.query-delays',
    povCapability: 'REPORTING',
    sourceProof: 'proofs/16/README.md',
    sourceSection: 'Measurement',
    codeBlocks: [
      {
        filename: 'Multi-dimensional and filtered queries',
        language: 'sql',
        code: `-- By carrier and origin state
select Carrier, \`Origin.State\`, AVG(\`Arrival.DelayMinutes\`), AVG(\`Departure.DelayMinutes\`)
from airlines.on_time_perf group by 1, 2 order by 1, 2;

-- By origin and destination state, descending delays
select \`Origin.State\`, \`Destination.State\`, AVG(\`Arrival.DelayMinutes\`), AVG(\`Departure.DelayMinutes\`)
from airlines.on_time_perf group by 1, 2 order by 3 desc, 4 desc;

-- Filter: Virginia origin only
select \`Origin.State\`, \`Destination.State\`, AVG(\`Arrival.DelayMinutes\`), AVG(\`Departure.DelayMinutes\`)
from airlines.on_time_perf where \`Origin.State\` = 'VA' group by 1, 2 order by 3 desc, 4 desc;`,
      },
    ],
    tips: [
      'Check result row counts and query execution time in Workbench.',
      'Screencast available in proof vid/ for measurement reference.',
    ],
  },
};
