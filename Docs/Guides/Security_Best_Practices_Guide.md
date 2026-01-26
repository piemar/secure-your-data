# Security Best Practices & Threat Model
## MongoDB CSFLE & Queryable Encryption

**Version**: 1.0  
**Last Updated**: January 2026  
**Audience**: Security Engineers, Solutions Architects, Compliance Officers

---

## Table of Contents

1. [Overview](#overview)
2. [Threat Model](#threat-model)
3. [Security Configuration](#security-configuration)
4. [Key Management Security](#key-management-security)
5. [Access Control](#access-control)
6. [Compliance & Auditing](#compliance--auditing)
7. [Incident Response](#incident-response)
8. [Security Checklist](#security-checklist)

---

## Overview

This guide provides security best practices, threat modeling, and compliance guidance for MongoDB's Client-Side Field Level Encryption (CSFLE) and Queryable Encryption (QE). Proper security configuration is critical for protecting sensitive data and meeting regulatory requirements.

### Security Principles

- **Defense in Depth**: Multiple layers of security controls
- **Least Privilege**: Minimum necessary access
- **Zero Trust**: Never trust, always verify
- **Separation of Duties**: Different roles for different functions
- **Audit Everything**: Comprehensive logging and monitoring

---

## Threat Model

### Security Boundaries

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY BOUNDARIES                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │   Application    │         │   KMS Provider    │         │
│  │   (Trusted)      │◄───────►│   (Trusted)      │         │
│  │                  │         │                  │         │
│  │  • Has KMS creds │         │  • Stores CMK    │         │
│  │  • Can decrypt   │         │  • Wraps DEKs    │         │
│  └──────────────────┘         └──────────────────┘         │
│         │                                                      │
│         │ Encrypted Data                                       │
│         ▼                                                      │
│  ┌──────────────────┐                                        │
│  │   MongoDB        │                                        │
│  │   (Untrusted)    │                                        │
│  │                  │                                        │
│  │  • Never sees    │                                        │
│  │    plaintext     │                                        │
│  │  • Stores only   │                                        │
│  │    ciphertext    │                                        │
│  └──────────────────┘                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Threat Vectors

#### 1. Insider Threats

**Threat**: Malicious or compromised database administrators

**Attack Scenarios**:
- DBA with full database access attempts to read sensitive data
- Compromised DBA credentials used to access database
- Privilege escalation to gain database access

**Protection**:
- ✅ CSFLE/QE: DBA cannot decrypt without KMS access
- ✅ Separation of duties: DBAs don't have KMS credentials
- ✅ Audit logging: All database access logged

**Risk Level**: 🔴 **HIGH** (mitigated by CSFLE/QE)

---

#### 2. Cloud Provider Access

**Threat**: Cloud provider employees or infrastructure compromise

**Attack Scenarios**:
- Cloud provider employee accesses database backups
- Cloud infrastructure compromise exposes database
- Government data requests (legal but concerning)

**Protection**:
- ✅ CSFLE/QE: Data encrypted before reaching cloud
- ✅ Customer-controlled keys: Cloud provider cannot decrypt
- ✅ Data residency: Encryption keys stored separately

**Risk Level**: 🟡 **MEDIUM** (mitigated by CSFLE/QE)

---

#### 3. Network Attacks

**Threat**: Man-in-the-middle attacks, network interception

**Attack Scenarios**:
- Intercepting data in transit
- Compromising network infrastructure
- DNS hijacking or routing attacks

**Protection**:
- ✅ TLS encryption: Data encrypted in transit
- ✅ Certificate pinning: Verify server certificates
- ✅ Network segmentation: Isolate database traffic

**Risk Level**: 🟡 **MEDIUM** (mitigated by TLS + CSFLE/QE)

---

#### 4. Application Compromise

**Threat**: Compromised application server

**Attack Scenarios**:
- Application vulnerability exploited
- Malicious code injection
- Stolen application credentials

**Protection**:
- ⚠️ CSFLE/QE: Application has decryption capability
- ✅ Least privilege: Application has minimal KMS permissions
- ✅ Key rotation: Rotate keys if compromise suspected
- ✅ Monitoring: Detect anomalous access patterns

**Risk Level**: 🔴 **HIGH** (application compromise = full access)

**Mitigation Strategies**:
- Regular security audits
- Vulnerability scanning
- Intrusion detection systems
- Application security best practices

---

#### 5. Key Management Compromise

**Threat**: KMS compromise or key theft

**Attack Scenarios**:
- KMS credentials stolen
- KMS provider compromise
- Key material exfiltration

**Protection**:
- ✅ Key rotation: Regular CMK rotation
- ✅ Access controls: Strict IAM policies
- ✅ Monitoring: Detect unauthorized key access
- ✅ Multi-factor authentication: Require MFA for KMS access

**Risk Level**: 🔴 **HIGH** (key compromise = data compromise)

**Mitigation Strategies**:
- Use hardware security modules (HSMs) when possible
- Implement key rotation policies
- Monitor KMS access logs
- Use separate KMS accounts for production

---

#### 6. Backup Exposure

**Threat**: Backup tapes or files exposed

**Attack Scenarios**:
- Physical backup theft
- Backup storage compromise
- Backup restoration in insecure environment

**Protection**:
- ✅ CSFLE/QE: Backups contain only ciphertext
- ✅ Backup encryption: Additional encryption layer
- ✅ Secure storage: Encrypted backup storage
- ✅ Access controls: Limit backup access

**Risk Level**: 🟡 **MEDIUM** (mitigated by CSFLE/QE)

---

### Security Guarantees

**What CSFLE/QE Protects Against**:
- ✅ Database administrators seeing plaintext
- ✅ Cloud provider employees seeing plaintext
- ✅ Backup exposure revealing plaintext
- ✅ Database compromise revealing plaintext
- ✅ Network interception (when combined with TLS)

**What CSFLE/QE Does NOT Protect Against**:
- ❌ Application compromise (application can decrypt)
- ❌ KMS compromise (keys can decrypt data)
- ❌ Malicious application code (has decryption capability)
- ❌ Memory dumps from application server (contains keys)

---

## Security Configuration

### KMS Configuration

#### AWS KMS Best Practices

1. **Key Policy**:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "Enable IAM User Permissions",
         "Effect": "Allow",
         "Principal": {
           "AWS": "arn:aws:iam::ACCOUNT:root"
         },
         "Action": "kms:*",
         "Resource": "*"
       },
       {
         "Sid": "Allow Application Role",
         "Effect": "Allow",
         "Principal": {
           "AWS": "arn:aws:iam::ACCOUNT:role/ApplicationRole"
         },
         "Action": [
           "kms:Decrypt",
           "kms:GenerateDataKey",
           "kms:DescribeKey"
         ],
         "Resource": "*",
         "Condition": {
           "StringEquals": {
             "kms:ViaService": "mongodb.us-east-1.amazonaws.com"
           }
         }
       }
     ]
   }
   ```

2. **IAM Policy** (Least Privilege):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "kms:Decrypt",
           "kms:GenerateDataKey",
           "kms:DescribeKey"
         ],
         "Resource": "arn:aws:kms:us-east-1:ACCOUNT:key/KEY_ID"
       }
     ]
   }
   ```

3. **Key Rotation**:
   - Enable automatic key rotation (annual)
   - Use `rewrapManyDataKey()` for zero-downtime rotation
   - Document rotation schedule

4. **Multi-Region**:
   - Use separate CMKs per region
   - Implement disaster recovery procedures
   - Test cross-region failover

#### Azure Key Vault Best Practices

1. **Access Policies**:
   - Grant minimum necessary permissions
   - Use managed identities when possible
   - Enable soft delete and purge protection

2. **Network Security**:
   - Use private endpoints
   - Restrict network access
   - Enable firewall rules

3. **Monitoring**:
   - Enable Key Vault logging
   - Monitor access patterns
   - Set up alerts for suspicious activity

#### GCP KMS Best Practices

1. **IAM Permissions**:
   - Use service accounts with minimal permissions
   - Enable audit logging
   - Use Cloud IAM conditions

2. **Key Rings**:
   - Organize keys by environment
   - Use separate key rings for production
   - Implement key versioning

---

### Application Security

#### Secure Credential Management

1. **Environment Variables**:
   ```bash
   # Use secure secret management
   export AWS_ACCESS_KEY_ID=$(aws secretsmanager get-secret-value --secret-id kms-creds --query SecretString --output text | jq -r .access_key_id)
   export AWS_SECRET_ACCESS_KEY=$(aws secretsmanager get-secret-value --secret-id kms-creds --query SecretString --output text | jq -r .secret_access_key)
   ```

2. **Secret Management Services**:
   - AWS Secrets Manager
   - Azure Key Vault (for secrets)
   - HashiCorp Vault
   - Kubernetes Secrets (encrypted at rest)

3. **Never Hardcode**:
   - ❌ Never commit credentials to git
   - ❌ Never log credentials
   - ❌ Never store in plaintext files

#### Connection Security

1. **TLS Configuration**:
   ```javascript
   const client = new MongoClient(uri, {
     tls: true,
     tlsAllowInvalidCertificates: false, // Always false in production
     tlsAllowInvalidHostnames: false,
     tlsCAFile: '/path/to/ca-cert.pem'
   });
   ```

2. **Certificate Validation**:
   - Always validate server certificates
   - Use certificate pinning for critical connections
   - Rotate certificates regularly

---

### Database Security

#### Access Controls

1. **Database Users**:
   - Create dedicated users for applications
   - Use role-based access control (RBAC)
   - Grant minimum necessary permissions

2. **Network Security**:
   - Use IP whitelisting
   - Enable VPC peering (AWS)
   - Use private endpoints

3. **Encryption at Rest**:
   - Enable MongoDB encryption at rest (additional layer)
   - Use encrypted storage volumes
   - Encrypt backup storage

#### Audit Logging

1. **Enable Audit Logging**:
   ```javascript
   // MongoDB Atlas: Enable audit logging
   // Logs: authentication, authorization, CRUD operations
   ```

2. **Log Retention**:
   - Retain logs for compliance period (e.g., 7 years)
   - Store logs in secure, immutable storage
   - Enable log encryption

3. **Monitor Logs**:
   - Set up log aggregation (ELK, Splunk)
   - Create alerts for suspicious activity
   - Regular log review

---

## Key Management Security

### Key Lifecycle Management

#### Key Creation

1. **Secure Key Generation**:
   - Use KMS-provided key generation
   - Never generate keys manually
   - Use cryptographically secure random number generators

2. **Key Naming**:
   - Use descriptive keyAltNames
   - Include environment (prod, staging, dev)
   - Include purpose (ssn, salary, etc.)

3. **Key Documentation**:
   - Document key purpose
   - Record creation date
   - Assign key owner

#### Key Storage

1. **Key Vault Security**:
   - Secure `encryption.__keyVault` collection
   - Limit access to key vault
   - Enable audit logging for key vault access

2. **Key Backup**:
   - Backup key vault regularly
   - Store backups securely
   - Test key restoration

#### Key Rotation

1. **CMK Rotation**:
   - Annual rotation (compliance requirement)
   - Use `rewrapManyDataKey()` for zero-downtime
   - Document rotation schedule

2. **DEK Rotation**:
   - Rotate if compromise suspected
   - Requires data re-encryption
   - Plan for maintenance window

#### Key Deletion

1. **Crypto-Shredding**:
   - Delete DEK to render data indecipherable
   - Verify deletion
   - Document erasure requests

2. **Key Retirement**:
   - Archive old keys (if needed for compliance)
   - Document retirement date
   - Secure key archive

---

## Access Control

### Principle of Least Privilege

1. **Application Access**:
   - Minimum KMS permissions (Decrypt, GenerateDataKey)
   - Minimum database permissions (read/write to specific collections)
   - No administrative permissions

2. **DBA Access**:
   - Full database access (required for operations)
   - No KMS access (cannot decrypt)
   - Audit all DBA actions

3. **Security Team Access**:
   - KMS access (for key management)
   - Read-only database access (for audits)
   - Audit log access

### Role Separation

| Role | Database Access | KMS Access | Purpose |
|------|----------------|------------|---------|
| **Application** | Read/Write (specific collections) | Decrypt, GenerateDataKey | Normal operations |
| **DBA** | Full access | None | Database operations |
| **Security** | Read-only | Full access | Security operations |
| **Auditor** | Read-only | None | Compliance audits |

---

## Compliance & Auditing

### Compliance Frameworks

#### GDPR (General Data Protection Regulation)

**Article 32 - Security of Processing**:
- ✅ Encryption of personal data (CSFLE/QE provides this)
- ✅ Access controls (separation of duties)
- ✅ Regular security assessments

**Article 17 - Right to Erasure**:
- ✅ Crypto-shredding pattern (delete DEK)
- ✅ Works across backups and replicas
- ✅ Instant compliance

**Article 25 - Data Protection by Design**:
- ✅ Encryption by default
- ✅ Minimal data exposure
- ✅ Privacy-preserving architecture

#### HIPAA (Health Insurance Portability and Accountability Act)

**Technical Safeguards**:
- ✅ Access controls (CSFLE/QE)
- ✅ Audit controls (enable audit logging)
- ✅ Integrity controls (encryption)
- ✅ Transmission security (TLS)

**Administrative Safeguards**:
- ✅ Security management process
- ✅ Workforce security
- ✅ Information access management

#### PCI-DSS (Payment Card Industry Data Security Standard)

**Requirement 3 - Protect Stored Cardholder Data**:
- ✅ Encryption of cardholder data (CSFLE/QE)
- ✅ Key management (KMS)
- ✅ Access controls

**Requirement 4 - Encrypt Transmission**:
- ✅ TLS for data in transit
- ✅ Strong cryptography

#### SOC 2

**CC6 - Logical and Physical Access Controls**:
- ✅ Access controls (KMS, database)
- ✅ Authentication and authorization
- ✅ Encryption

**CC7 - System Operations**:
- ✅ Monitoring and logging
- ✅ Incident response
- ✅ Change management

### Audit Requirements

1. **Audit Logging**:
   - All database access
   - All KMS operations
   - All key management operations
   - Authentication and authorization events

2. **Log Retention**:
   - Minimum: 90 days (operational)
   - Compliance: 7 years (regulatory)
   - Immutable storage recommended

3. **Audit Review**:
   - Regular log review (weekly/monthly)
   - Automated alerting for suspicious activity
   - Compliance audit reports

---

## Incident Response

### Key Compromise Response

**Scenario**: KMS credentials compromised or key material exposed

**Immediate Actions** (0-1 hour):
1. ✅ Revoke compromised credentials
2. ✅ Disable affected KMS keys
3. ✅ Isolate affected systems
4. ✅ Notify security team

**Short-term Actions** (1-24 hours):
1. ✅ Assess scope of compromise
2. ✅ Create new CMK and DEKs
3. ✅ Begin data re-encryption
4. ✅ Update application configuration

**Long-term Actions** (1-7 days):
1. ✅ Complete data re-encryption
2. ✅ Verify data integrity
3. ✅ Update security controls
4. ✅ Document incident and lessons learned

### Data Breach Response

**Scenario**: Database compromise detected

**Immediate Actions**:
1. ✅ Isolate compromised systems
2. ✅ Preserve evidence
3. ✅ Notify security team and management
4. ✅ Assess data exposure

**Assessment**:
- ✅ With CSFLE/QE: Data is encrypted, attacker cannot decrypt without KMS access
- ✅ Verify KMS was not compromised
- ✅ Review audit logs for unauthorized access

**Notification**:
- ✅ Notify affected parties (if required by law)
- ✅ Document breach details
- ✅ Report to regulatory authorities (if required)

---

## Security Checklist

### Pre-Production Security Checklist

- [ ] **KMS Configuration**:
  - [ ] CMK created with proper key policy
  - [ ] IAM roles configured with least privilege
  - [ ] Key rotation enabled
  - [ ] Multi-region setup (if applicable)

- [ ] **Application Security**:
  - [ ] Credentials stored securely (no hardcoding)
  - [ ] TLS configured and validated
  - [ ] Connection pooling configured
  - [ ] Error handling doesn't expose sensitive data

- [ ] **Database Security**:
  - [ ] Database users created with minimal permissions
  - [ ] Network security configured (IP whitelisting, VPC)
  - [ ] Audit logging enabled
  - [ ] Encryption at rest enabled

- [ ] **Key Management**:
  - [ ] DEKs created with descriptive keyAltNames
  - [ ] Key vault secured
  - [ ] Key backup procedures documented
  - [ ] Key rotation schedule documented

- [ ] **Monitoring & Alerting**:
  - [ ] Security monitoring configured
  - [ ] Alerts configured for suspicious activity
  - [ ] Log aggregation set up
  - [ ] Incident response plan documented

- [ ] **Compliance**:
  - [ ] Compliance requirements identified
  - [ ] Audit logging configured
  - [ ] Data retention policies documented
  - [ ] Right to erasure procedures documented

### Ongoing Security Checklist

- [ ] **Monthly**:
  - [ ] Review audit logs
  - [ ] Review KMS access logs
  - [ ] Verify key rotation status
  - [ ] Review security alerts

- [ ] **Quarterly**:
  - [ ] Security assessment
  - [ ] Access review (who has access to what)
  - [ ] Key inventory review
  - [ ] Compliance audit

- [ ] **Annually**:
  - [ ] Full security audit
  - [ ] Penetration testing
  - [ ] Disaster recovery testing
  - [ ] Security training

---

## Security Best Practices Summary

1. **Use KMS**: Never use local keys in production
2. **Least Privilege**: Grant minimum necessary permissions
3. **Separation of Duties**: DBAs don't have KMS access
4. **Monitor Everything**: Comprehensive logging and monitoring
5. **Rotate Keys**: Regular key rotation (annual minimum)
6. **Secure Credentials**: Use secret management services
7. **Enable TLS**: Always use TLS for data in transit
8. **Audit Logging**: Enable and review audit logs regularly
9. **Test Security**: Regular security assessments and testing
10. **Document Everything**: Document security configurations and procedures

---

## Additional Resources

- [MongoDB Security Checklist](https://www.mongodb.com/docs/manual/administration/security-checklist/)
- [AWS KMS Security Best Practices](https://docs.aws.amazon.com/kms/latest/developerguide/best-practices.html)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

**Next Steps**: Review this guide with your security team, implement security controls, and establish ongoing security monitoring and review processes.
