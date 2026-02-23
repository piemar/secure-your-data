import type { EnhancementMetadataRegistry } from '@/labs/enhancements/schema';

/**
 * Partial Recovery Enhancement Metadata
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/15/README.md (PARTIAL-RECOVERY)
 * Recover a subset of data to the live database without downtime.
 */

export const enhancements: EnhancementMetadataRegistry = {
  'partial-recovery.concepts': {
    id: 'partial-recovery.concepts',
    povCapability: 'PARTIAL-RECOVERY',
    sourceProof: 'proofs/15/README.md',
    sourceSection: 'Description',
    codeBlocks: [
      {
        filename: 'Partial Recovery Concepts',
        language: 'text',
        code: `Partial Recovery
================

- Restore only the lost subset (e.g. 100 customer records) into the live DB
- Main cluster stays live; application keeps running (no downtime)
- Use PITR to a temporary cluster to get data at point before delete
- mongoexport from temp cluster → lost_records.json
- mongoimport into main (live) cluster
- Result: lost data back in live DB; app never stopped`,
      },
    ],
    tips: [
      'Same project/region for Main and Temp speeds up PITR (DirectAttach).',
      'Temp cluster can have backup disabled; it is only used to extract the subset.',
      'Query in mongoexport (e.g. firstname exists) selects only the lost records.',
    ],
  },

  'partial-recovery.flow': {
    id: 'partial-recovery.flow',
    povCapability: 'PARTIAL-RECOVERY',
    sourceProof: 'proofs/15/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Partial Recovery Flow',
        language: 'text',
        code: `Partial Recovery Flow (Proof 15)
===============================

1. Load 100 customer docs into test.customers (mgeneratejs + Customer360Data.json)
2. Run continuous-insert.py (simulates live app) — leave running
3. Take snapshot on Main cluster (so PITR is available)
4. Delete the 100 customer documents from Main
5. PITR restore to Temp cluster (time before delete)
6. mongoexport from Temp: --query '{"firstname":{"$exists":true}}' → lost_records.json
7. mongoimport lost_records.json into Main cluster
8. Verify: 100 customer docs back; continuous insert never stopped`,
      },
    ],
    tips: [
      'Note the time (e.g. 11:20) before delete; use that for PITR (convert to UTC).',
      'Keep Mongo Shell open to Main cluster for verification.',
      'Use --host from Atlas Command Line Tools for mongoexport/import if needed.',
    ],
  },

  'partial-recovery.requirements': {
    id: 'partial-recovery.requirements',
    povCapability: 'PARTIAL-RECOVERY',
    sourceProof: 'proofs/15/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'Cluster Requirements',
        language: 'text',
        code: `Main cluster:
  - M10, 3-node replica set, 100 GB storage
  - Turn on Cloud Backup, Continuous Cloud Backup ON
  - Same project, cloud provider, region as Temp (faster PITR)

Temp cluster:
  - M10, 3-node replica set, 100 GB storage
  - Cloud Backup OFF (not needed for temp)

Both: main_user (readWriteAnyDatabase), IP whitelist, SRV connection strings`,
      },
    ],
    tips: [
      'DirectAttach requires same project, provider, and region.',
      'Restore to Temp typically completes in under 10 minutes.',
    ],
  },

  'partial-recovery.tools': {
    id: 'partial-recovery.tools',
    povCapability: 'PARTIAL-RECOVERY',
    sourceProof: 'proofs/15/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'Laptop Tools',
        language: 'bash',
        code: `# MongoDB tools 3.6+ (for mongoexport, mongoimport, mongo shell)
# Install mgeneratejs
npm install -g mgeneratejs
mgeneratejs --help

# Python 3 + pymongo (for continuous-insert.py)
python3 --version
pip3 install pymongo`,
      },
    ],
    tips: [
      'No MongoDB server runs on the laptop—only CLI tools and scripts.',
      'Customer360Data.json is in proofs/15/; continuous-insert.py is there too.',
    ],
  },

  'partial-recovery.atlas-clusters': {
    id: 'partial-recovery.atlas-clusters',
    povCapability: 'PARTIAL-RECOVERY',
    sourceProof: 'proofs/15/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'Atlas Clusters',
        language: 'text',
        code: `Main cluster:
  - M10, 3-node, 100 GB
  - Cloud Backup ON, Continuous Cloud Backup ON

Temp cluster:
  - M10, 3-node, 100 GB
  - Cloud Backup OFF

Security: main_user (Read and write to any database), IP whitelist.
Copy SRV connection strings for both (Connect → Connect your application → SRV).`,
      },
    ],
    tips: [
      'Same project and region for both clusters speeds up PITR restore.',
      'Record Main and Temp SRV URIs for mongoimport and mongoexport.',
    ],
  },

  'partial-recovery.load-and-snapshot': {
    id: 'partial-recovery.load-and-snapshot',
    povCapability: 'PARTIAL-RECOVERY',
    sourceProof: 'proofs/15/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'Load Data and Snapshot',
        language: 'bash',
        code: `# Load 100 customers (replace password and host)
mgeneratejs Customer360Data.json -n 100 | mongoimport --uri "mongodb+srv://main_user:PASSWORD@MAIN_HOST/test" --collection customers

# Start continuous insert (leave running)
./continuous-insert.py main_user PASSWORD MAIN_HOST

# In Atlas: Main cluster → Backup → Snapshots → Take snapshot now
# Wait for snapshot to become available (<2 min)`,
      },
    ],
    tips: [
      'Leave continuous-insert.py running for the whole exercise.',
      'Snapshot is required before you can do PITR to Temp.',
    ],
  },

  'partial-recovery.verify-present': {
    id: 'partial-recovery.verify-present',
    povCapability: 'PARTIAL-RECOVERY',
    sourceProof: 'proofs/15/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Verify in Shell',
        language: 'javascript',
        code: `use test
show collections
db.customers.count()   // > 100 (customers + continuous insert)
db.customers.find({ firstname: { $exists: true } }).pretty()
db.customers.find({ firstname: { $exists: true } }).count()  // 100
// Write down time (e.g. 11:20), wait for next minute (11:21) before deleting`,
      },
    ],
    tips: [
      'Use Run all or Run selection in the editor to run the commands (mongosh-style).',
      'Keep this Mongo Shell session open for verification after import.',
      'Convert your noted time to UTC for PITR restore.',
    ],
  },

  'partial-recovery.delete-docs': {
    id: 'partial-recovery.delete-docs',
    povCapability: 'PARTIAL-RECOVERY',
    sourceProof: 'proofs/15/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Delete Customer Docs',
        language: 'javascript',
        code: `db.customers.remove({ firstname: { $exists: true } })
db.customers.find({ firstname: { $exists: true } }).count()  // 0
db.customers.count()  // still > 0 (continuous insert continues)`,
      },
    ],
    tips: [
      'Use Run all or Run selection in the editor to run the commands (mongosh-style).',
      'Only the 100 customer documents (with firstname) are removed.',
      'Continuous-insert script keeps adding other documents.',
    ],
  },

  'partial-recovery.pitr-export-import': {
    id: 'partial-recovery.pitr-export-import',
    povCapability: 'PARTIAL-RECOVERY',
    sourceProof: 'proofs/15/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'PITR and Restore to Live',
        language: 'bash',
        code: `# 1. Atlas: Main cluster → Backup → Point in Time Restore
#    Set date/time (UTC), Target cluster = Temp. Wait for restore (~10 min).

# 2. Export from Temp (use --host from Atlas if needed)
mongoexport --uri "mongodb+srv://user:pass@TEMP_HOST/test" --collection customers --query '{"firstname":{"$exists":true}}' --out lost_records.json

# 3. Import into Main
mongoimport --uri "mongodb+srv://user:pass@MAIN_HOST/test" --collection customers --file lost_records.json

# 4. In Mongo Shell (Main): verify
# db.customers.find({firstname: {$exists:true}}).count()  // 100
# Confirm continuous-insert.py still running`,
      },
    ],
    tips: [
      'Atlas Command Line Tools show --host for mongoexport/import if SRV is not used.',
      'Restore to Temp uses DirectAttach when same project/region.',
    ],
  },
};
