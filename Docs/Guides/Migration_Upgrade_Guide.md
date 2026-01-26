# Migration & Upgrade Guide
## MongoDB CSFLE & Queryable Encryption

**Version**: 1.0  
**Last Updated**: January 2026  
**Audience**: Solutions Architects, Database Administrators, DevOps Engineers

---

## Table of Contents

1. [Overview](#overview)
2. [Pre-Migration Checklist](#pre-migration-checklist)
3. [Migration Scenarios](#migration-scenarios)
4. [Upgrade Paths](#upgrade-paths)
5. [Rollback Procedures](#rollback-procedures)
6. [Validation & Testing](#validation--testing)
7. [Troubleshooting](#troubleshooting)

---

## Overview

This guide covers migration and upgrade scenarios for MongoDB's Client-Side Field Level Encryption (CSFLE) and Queryable Encryption (QE). Migrations can be complex and require careful planning to ensure data integrity and minimize downtime.

### Key Principles

- **Zero Data Loss**: All migrations must preserve data integrity
- **Minimal Downtime**: Plan for maintenance windows or zero-downtime migrations
- **Rollback Capability**: Always have a rollback plan
- **Test First**: Validate migrations in non-production environments
- **Documentation**: Document all steps and decisions

---

## Pre-Migration Checklist

### Environment Assessment

- [ ] **MongoDB Version**: Verify current version and target version compatibility
  - CSFLE: MongoDB 4.2+ required
  - QE Equality: MongoDB 7.0+ required
  - QE Range: MongoDB 8.0+ GA required

- [ ] **Cluster Configuration**: Document current cluster setup
  - Replica set configuration
  - Sharding configuration (if applicable)
  - Atlas vs. self-hosted

- [ ] **Data Inventory**: Identify all collections and fields to encrypt
  - Collection names and sizes
  - Field names and data types
  - Query patterns (equality, range, none)
  - Index requirements

- [ ] **KMS Setup**: Ensure KMS is configured and accessible
  - AWS KMS / Azure Key Vault / GCP KMS credentials
  - IAM permissions verified
  - Network connectivity tested
  - Key policies reviewed

- [ ] **Driver Versions**: Verify driver compatibility
  - Node.js: `mongodb` 4.0+ and `mongodb-client-encryption` 2.0+
  - Python: `pymongo` 4.0+ with encryption support
  - Java: MongoDB Java Driver 4.0+
  - Other languages: Check compatibility matrix

- [ ] **Backup Strategy**: Ensure backups are current and tested
  - Full backup before migration
  - Backup restoration tested
  - Backup retention policy verified

- [ ] **Performance Baseline**: Establish performance metrics
  - Current query latency
  - Throughput measurements
  - Resource utilization (CPU, memory, I/O)

### Risk Assessment

- [ ] **Data Sensitivity**: Classify data sensitivity levels
- [ ] **Compliance Requirements**: Identify regulatory requirements (GDPR, HIPAA, PCI-DSS)
- [ ] **Business Impact**: Assess impact of migration failures
- [ ] **Rollback Window**: Define acceptable rollback time window

---

## Migration Scenarios

### Scenario 1: Plaintext to CSFLE Migration

**Use Case**: Migrating existing plaintext data to encrypted state using CSFLE.

#### Prerequisites

- MongoDB 4.2+ cluster
- KMS configured and accessible
- Driver with CSFLE support installed

#### Step-by-Step Process

**Phase 1: Preparation (1-2 hours)**

1. **Create DEKs**:
   ```javascript
   const encryption = new ClientEncryption(client, {
     keyVaultNamespace: "encryption.__keyVault",
     kmsProviders: { aws: { ... } }
   });
   
   const dekId = await encryption.createDataKey("aws", {
     masterKey: { key: cmkArn, region: "us-east-1" },
     keyAltNames: ["migration-dek-v1"]
   });
   ```

2. **Define Schema Map**:
   ```javascript
   const schemaMap = {
     "hr.employees": {
       bsonType: "object",
       properties: {
         ssn: {
           encrypt: {
             keyId: [dekId],
             bsonType: "string",
             algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic"
           }
         },
         salary: {
           encrypt: {
             keyId: [dekId],
             bsonType: "int",
             algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random"
           }
         }
       }
     }
   };
   ```

3. **Create Encrypted Client**:
   ```javascript
   const secureClient = new MongoClient(uri, {
     autoEncryption: {
       keyVaultNamespace: "encryption.__keyVault",
       kmsProviders,
       schemaMap
     }
   });
   ```

**Phase 2: Migration Execution (Duration: Depends on data volume)**

```javascript
async function migratePlaintextToCSFLE() {
  const sourceClient = new MongoClient(uri); // No encryption
  const targetClient = secureClient; // With encryption
  
  await sourceClient.connect();
  await targetClient.connect();
  
  const sourceColl = sourceClient.db("hr").collection("employees");
  const targetColl = targetClient.db("hr").collection("employees_encrypted");
  
  const cursor = sourceColl.find({});
  let migrated = 0;
  let errors = 0;
  
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    
    try {
      // Insert through encrypted client - driver handles encryption
      await targetColl.insertOne(doc);
      migrated++;
      
      if (migrated % 1000 === 0) {
        console.log(`Migrated ${migrated} documents...`);
      }
    } catch (err) {
      console.error(`Error migrating doc ${doc._id}:`, err.message);
      errors++;
    }
  }
  
  console.log(`Migration complete: ${migrated} migrated, ${errors} errors`);
  
  await sourceClient.close();
  await targetClient.close();
}
```

**Phase 3: Validation**

- Verify document counts match
- Test queries on encrypted fields
- Verify DBA cannot see plaintext
- Performance testing

**Phase 4: Cutover**

1. Update application configuration to use encrypted client
2. Monitor for errors
3. Keep source collection for rollback period (e.g., 7 days)

#### Estimated Timeline

| Data Volume | Duration | Notes |
|------------|----------|-------|
| < 1M documents | 1-2 hours | Single-threaded migration |
| 1M - 10M documents | 4-8 hours | Consider parallel migration |
| > 10M documents | 1-2 days | Requires parallel migration, maintenance window |

---

### Scenario 2: CSFLE to Queryable Encryption Migration

**Use Case**: Migrating from CSFLE to QE to enable range queries.

#### Prerequisites

- MongoDB 8.0+ cluster (for QE Range)
- Existing CSFLE implementation
- Separate DEK per field (QE requirement)

#### Step-by-Step Process

**Phase 1: Assessment**

1. **Identify Fields Needing Range Queries**:
   - Fields currently using CSFLE Deterministic
   - Fields that would benefit from range queries
   - Fields that can remain with CSFLE

2. **Create QE DEKs** (one per field):
   ```javascript
   const salaryDek = await encryption.createDataKey("aws", {
     masterKey: { key: cmkArn, region: "us-east-1" },
     keyAltNames: ["qe-salary-dek"]
   });
   
   const creditScoreDek = await encryption.createDataKey("aws", {
     masterKey: { key: cmkArn, region: "us-east-1" },
     keyAltNames: ["qe-creditscore-dek"]
   });
   ```

**Phase 2: Create QE Collection**

```javascript
const encryptedFields = {
  fields: [
    {
      path: "salary",
      bsonType: "int",
      keyId: salaryDek,
      queries: {
        queryType: "range",
        min: 0,
        max: 500000,
        sparsity: 2,
        contention: 4
      }
    },
    {
      path: "creditScore",
      bsonType: "int",
      keyId: creditScoreDek,
      queries: {
        queryType: "range",
        min: 300,
        max: 850,
        sparsity: 2,
        contention: 4
      }
    }
  ]
};

await client.db("hr").createCollection("employees_qe", { encryptedFields });
```

**Phase 3: Data Migration**

```javascript
async function migrateCSFLEToQE() {
  const csfleClient = new MongoClient(uri, {
    autoEncryption: { /* CSFLE config */ }
  });
  
  const qeClient = new MongoClient(uri, {
    autoEncryption: {
      keyVaultNamespace: "encryption.__keyVault",
      kmsProviders
      // No schemaMap - QE uses encryptedFields from collection
    }
  });
  
  await csfleClient.connect();
  await qeClient.connect();
  
  const sourceColl = csfleClient.db("hr").collection("employees");
  const targetColl = qeClient.db("hr").collection("employees_qe");
  
  const cursor = sourceColl.find({});
  
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    // Driver automatically decrypts from CSFLE and encrypts for QE
    await targetColl.insertOne(doc);
  }
  
  await csfleClient.close();
  await qeClient.close();
}
```

**Phase 4: Application Update**

1. Update schema references from CSFLE schemaMap to QE encryptedFields
2. Update queries to use range operators
3. Test thoroughly

#### Important Considerations

- **DEK Requirement**: QE requires separate DEK per field (cannot share DEKs)
- **Storage Overhead**: QE adds 2-3x storage overhead for range queries
- **Performance**: QE range queries may have different performance characteristics
- **Downtime**: Consider dual-write approach for zero-downtime migration

---

### Scenario 3: Local Keys to KMS Migration

**Use Case**: Migrating from local key provider (development) to KMS (production).

#### Step-by-Step Process

1. **Create KMS CMK**:
   ```bash
   aws kms create-key --description "Production MongoDB CMK"
   ```

2. **Create New DEKs with KMS**:
   ```javascript
   const kmsDek = await encryption.createDataKey("aws", {
     masterKey: { key: cmkArn, region: "us-east-1" },
     keyAltNames: ["production-dek"]
   });
   ```

3. **Rewrap Existing DEKs** (if possible):
   ```javascript
   // If DEKs were created with local provider, they need to be recreated
   // Local keys cannot be rewrapped to KMS
   ```

4. **Re-encrypt Data**:
   - Use explicit encryption to decrypt with old key
   - Re-encrypt with new KMS-wrapped DEK
   - Update schemaMap to reference new DEK

**Note**: Local keys cannot be directly rewrapped to KMS. Data must be re-encrypted.

---

## Upgrade Paths

### MongoDB Version Upgrades

#### 4.2 → 7.0 (CSFLE to QE Equality)

**Compatibility**: CSFLE continues to work in MongoDB 7.0

**Process**:
1. Upgrade MongoDB cluster to 7.0
2. No changes required to CSFLE implementation
3. Optionally migrate to QE Equality for new features

**Downtime**: Standard MongoDB upgrade downtime

#### 7.0 → 8.0 (QE Equality to QE Range)

**Compatibility**: QE Equality continues to work in MongoDB 8.0

**Process**:
1. Upgrade MongoDB cluster to 8.0
2. No changes required to existing QE Equality implementation
3. Can add QE Range queries to new fields

**Downtime**: Standard MongoDB upgrade downtime

#### 4.2 → 8.0 (Direct Upgrade)

**Process**:
1. Upgrade MongoDB cluster to 8.0
2. CSFLE continues to work
3. Can implement QE Range queries

**Recommendation**: Consider incremental upgrade (4.2 → 7.0 → 8.0) for better testing

---

### Driver Version Upgrades

#### Node.js Driver Upgrade

**Before**: `mongodb@4.x` + `mongodb-client-encryption@2.x`  
**After**: `mongodb@6.x` + `mongodb-client-encryption@2.x`

**Breaking Changes**:
- Review MongoDB Node.js Driver changelog
- Test encryption functionality thoroughly
- Update connection string format if needed

**Process**:
1. Update package.json
2. Run `npm install`
3. Test encryption/decryption
4. Deploy to staging
5. Monitor for errors

---

## Rollback Procedures

### Rollback Strategy

**General Principles**:
- Keep source data until migration is validated
- Document rollback steps before migration
- Test rollback procedure in non-production

### Rollback Scenarios

#### Scenario 1: Plaintext to CSFLE Rollback

**If migration fails**:
1. Revert application configuration to use non-encrypted client
2. Continue using source collection
3. Investigate migration issues
4. Fix issues and retry migration

**If data corruption detected**:
1. Stop application writes
2. Restore from backup
3. Investigate root cause
4. Fix and retry migration

#### Scenario 2: CSFLE to QE Rollback

**If QE implementation fails**:
1. Revert application to use CSFLE client
2. Continue using CSFLE collection
3. Investigate QE issues
4. Fix and retry migration

**Rollback Window**: Keep CSFLE collection for 30 days minimum

---

## Validation & Testing

### Pre-Migration Testing

1. **Unit Tests**:
   - Test encryption/decryption with sample data
   - Verify schemaMap/encryptedFields configuration
   - Test query operations

2. **Integration Tests**:
   - End-to-end data flow testing
   - Application integration testing
   - Performance testing

3. **Staging Environment**:
   - Full migration test in staging
   - Load testing
   - Failure scenario testing

### Post-Migration Validation

1. **Data Integrity Checks**:
   ```javascript
   // Verify document counts
   const sourceCount = await sourceColl.countDocuments({});
   const targetCount = await targetColl.countDocuments({});
   console.assert(sourceCount === targetCount, "Count mismatch!");
   
   // Verify sample documents
   const sample = await targetColl.findOne({});
   console.log("Sample decrypted:", sample);
   ```

2. **Query Validation**:
   - Test equality queries (CSFLE Deterministic / QE)
   - Test range queries (QE Range)
   - Verify query performance

3. **Security Validation**:
   - Verify DBA cannot see plaintext
   - Verify backups contain encrypted data
   - Verify KMS access controls

4. **Performance Validation**:
   - Compare query latency (before vs. after)
   - Monitor resource utilization
   - Verify SLA compliance

---

## Troubleshooting

### Common Issues

#### Issue 1: KMS Access Denied

**Symptoms**: `KMS Error: AccessDenied`

**Solutions**:
- Verify IAM permissions (`kms:Encrypt`, `kms:Decrypt`, `kms:GenerateDataKey`)
- Check key policy allows your IAM user/role
- Verify AWS credentials are correct
- Check network connectivity to KMS

#### Issue 2: Missing crypt_shared Library

**Symptoms**: `Cannot find shared library`

**Solutions**:
- Install `mongodb-crypt` library
- Set `cryptSharedLibPath` in autoEncryption options
- Verify library path is correct
- Check file permissions

#### Issue 3: Schema Mismatch

**Symptoms**: Encryption/decryption errors

**Solutions**:
- Verify schemaMap matches collection structure
- Check field names and types
- Verify DEK IDs are correct
- Check algorithm selection (Deterministic vs. Random)

#### Issue 4: Performance Degradation

**Symptoms**: Slow queries after migration

**Solutions**:
- Monitor KMS latency
- Check connection pooling
- Verify indexes are still effective
- Consider caching strategies

#### Issue 5: Migration Timeout

**Symptoms**: Migration fails on large datasets

**Solutions**:
- Implement batch processing
- Add retry logic with exponential backoff
- Consider parallel migration
- Increase timeout values

---

## Best Practices

### Migration Planning

1. **Start Small**: Migrate one collection at a time
2. **Test Thoroughly**: Test in staging before production
3. **Document Everything**: Document all steps and decisions
4. **Monitor Closely**: Monitor during and after migration
5. **Have a Rollback Plan**: Always have a rollback strategy

### Performance Optimization

1. **Batch Processing**: Process documents in batches
2. **Parallel Migration**: Use multiple workers for large datasets
3. **Connection Pooling**: Optimize database connections
4. **KMS Caching**: Cache DEKs to reduce KMS calls
5. **Index Management**: Ensure indexes are optimized

### Security Considerations

1. **Key Management**: Use KMS, never local keys in production
2. **Access Control**: Limit KMS access to necessary roles
3. **Audit Logging**: Enable audit logging for key operations
4. **Backup Encryption**: Ensure backups are encrypted
5. **Compliance**: Verify compliance with regulations

---

## Migration Templates

### Node.js Migration Template

```javascript
const { MongoClient, ClientEncryption } = require('mongodb');

class MigrationManager {
  constructor(config) {
    this.config = config;
    this.sourceClient = null;
    this.targetClient = null;
    this.encryption = null;
  }
  
  async initialize() {
    // Initialize clients and encryption
  }
  
  async migrate() {
    // Migration logic
  }
  
  async validate() {
    // Validation logic
  }
  
  async rollback() {
    // Rollback logic
  }
}

// Usage
const migration = new MigrationManager(config);
await migration.initialize();
await migration.migrate();
await migration.validate();
```

---

## Additional Resources

- [MongoDB CSFLE Documentation](https://www.mongodb.com/docs/manual/core/csfle/)
- [MongoDB Queryable Encryption Documentation](https://www.mongodb.com/docs/manual/core/queryable-encryption/)
- [AWS KMS Best Practices](https://docs.aws.amazon.com/kms/latest/developerguide/best-practices.html)
- [Migration Checklist Template](./migration-checklist-template.md)

---

**Next Steps**: Review this guide with your team, create a migration plan, and test in staging before production migration.
