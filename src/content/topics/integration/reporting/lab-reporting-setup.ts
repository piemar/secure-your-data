import { WorkshopLabDefinition } from '@/types';

/**
 * Reporting (BI Connector) Setup
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/16/README.md (REPORTING)
 * Create Atlas cluster with BI Connector, load airline data, install ODBC driver and MySQL Workbench.
 */
export const labReportingSetupDefinition: WorkshopLabDefinition = {
  id: 'lab-reporting-setup',
  topicId: 'integration',
  title: 'Reporting: Environment and Data Setup',
  description:
    'Create an M20 Atlas cluster with BI Connector enabled, load U.S. airline on-time performance data (~1.3M records) via mongoimport, then install and configure the MongoDB ODBC driver and MySQL Workbench.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 75,
  tags: ['integration', 'reporting', 'bi-connector', 'mongoimport', 'odbc', 'mysql-workbench'],
  prerequisites: ['MongoDB Atlas account with SA credits', 'MongoDB tools 3.6+'],
  povCapabilities: ['REPORTING'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/16',
  modes: ['lab', 'demo'],
  steps: [
    {
      id: 'lab-reporting-setup-step-1',
      title: 'Step 1: Create Atlas Cluster with BI Connector',
      narrative:
        'Create an M20 3-node replica set. In Additional Settings when creating the cluster, enable the BI Connector and set Schema Sample Size (e.g. 1500) and Sample Refresh Interval (e.g. 300). Add user biuser (read/write any database) and IP whitelist. Record mongoimport host, Mongo Shell host, and BI Connector hostname/port/user.',
      instructions:
        'Create M20, 3-node, single region. Additional Settings → enable BI Connector; Schema Sample Size 1500, Sample Refresh Interval 300. Security: biuser, readWriteAnyDatabase; IP whitelist. Save: mongoimport --host value, Mongo Shell host, and Connect Your Business Intelligence Tool (Hostname, Port, User).',
      estimatedTimeMinutes: 15,
      modes: ['lab', 'demo'],
      points: 10,
      enhancementId: 'reporting.atlas-biconnector',
      sourceProof: 'proofs/16/README.md',
      sourceSection: 'Setup',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],
    },
    {
      id: 'lab-reporting-setup-step-2',
      title: 'Step 2: Configure and Run Data Load (import_data.sh)',
      narrative:
        'Edit .atlas_env in the proof folder with MONGO_IMPORT_HOST, MONGO_SHELL_HOST, USER (biuser), and PASS. Run ./import_data.sh to load the airline on-time CSV data into airlines.on_time_perf. This may take around one hour. Verify 1,348,838 documents and 8 indexes.',
      instructions:
        'In proofs/16/: edit .atlas_env (MONGO_IMPORT_HOST from mongoimport --host, MONGO_SHELL_HOST from Shell URL, USER=biuser, PASS=password). Run ./import_data.sh. Verify in Atlas Collections: airlines.on_time_perf has 1,348,838 documents and 8 indexes.',
      estimatedTimeMinutes: 65,
      modes: ['lab', 'demo'],
      points: 10,
      enhancementId: 'reporting.load-data',
      sourceProof: 'proofs/16/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Setup',
    },
    {
      id: 'lab-reporting-setup-step-3',
      title: 'Step 3: Install ODBC Driver, DSN, and MySQL Workbench',
      narrative:
        'Install the MongoDB ODBC driver for your OS. Create a system DSN per MongoDB BI Connector documentation (MacOS steps 1–5 and 8). Install MySQL Workbench and configure a connection using the BI Connector hostname, port, and username (follow Atlas connect-bic-workbench tutorial).',
      instructions:
        'Download/install MongoDB ODBC driver. Create MongoDB DSN (docs: create-system-dsn, steps 1–5 and 8). Install MySQL Workbench. Configure Workbench connection with BI Connector Hostname, Port, Username from Atlas. Do not use optional DSN steps if not needed.',
      estimatedTimeMinutes: 20,
      modes: ['lab', 'demo'],
      points: 10,
      enhancementId: 'reporting.odbc-workbench',
      sourceProof: 'proofs/16/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Setup',
    },
  ],
};
