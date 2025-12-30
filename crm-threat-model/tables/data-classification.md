# Data Classification

## Overview

This document classifies data processed, stored, and transmitted by the multi-tenant CRM application according to sensitivity level. Data classification drives security controls and compliance requirements.

## Classification Levels

### Tier 1: Highly Sensitive (Restricted)

**Definition**: Data that would cause severe harm to individuals or the organization if disclosed, modified, or destroyed.

**Protection Requirements**:
- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.2+)
- Tokenization where applicable
- Access logging with real-time alerts
- Automatic rotation policies
- Never logged or cached in plaintext
- MFA required for access
- Annual penetration testing

| Data Type | Examples | Storage Location | Retention | Regulatory |
|-----------|----------|------------------|-----------|------------|
| **Authentication Credentials** | Passwords (hashed), API keys, secrets, private keys | AWS Secrets Manager, Database (hashed) | Until rotation/deletion | PCI DSS, SOC 2 |
| **Payment Card Data** | Credit card numbers, CVV, full PAN | Stripe (tokenized) - NOT stored locally | Per PCI DSS | PCI DSS Level 1 |
| **Cryptographic Keys** | Encryption keys, signing keys | AWS KMS, Hardware Security Module | Per key rotation policy | SOC 2, ISO 27001 |
| **Session Tokens** | JWTs (refresh tokens), session IDs | Redis (encrypted), httpOnly cookies | Access: 1hr, Refresh: 30 days | GDPR, CCPA |
| **Social Security Numbers (SSN)** | If collected (not recommended) | Database (encrypted) | 7 years (if required) | GDPR, CCPA |
| **Health Information** | PHI (if applicable) | Not in scope | N/A | HIPAA (out of scope) |

---

### Tier 2: Confidential (Private)

**Definition**: Sensitive business or personal data requiring protection under law, regulation, or contract.

**Protection Requirements**:
- Encryption in transit (TLS 1.2+)
- Encryption at rest (volume-level or database-level)
- Tenant isolation controls (strict query filtering)
- Role-based access controls (RBAC)
- Audit logging of access
- Anonymization/pseudonymization in non-production environments
- Data minimization in logs (redaction)

| Data Type | Examples | Storage Location | Retention | Regulatory |
|-----------|----------|------------------|-----------|------------|
| **Personally Identifiable Information (PII)** | Full names, email addresses, phone numbers, physical addresses | PostgreSQL Database | Until tenant requests deletion (GDPR) | GDPR, CCPA |
| **Financial Records** | Revenue data, contract values, pricing, invoices | PostgreSQL Database | 7 years (financial regs) | Tax laws, SOC 2 |
| **Proprietary Business Data** | Sales forecasts, strategic plans, customer lists, deal pipelines | PostgreSQL Database, S3 (reports) | Per tenant data retention policy | Trade secret law |
| **Employee Records** | Internal user roles, permissions, salaries (if stored) | PostgreSQL Database | Duration of employment + 7 years | Labor laws, GDPR |
| **Audit Logs (Security Events)** | Admin actions, authentication events, authorization failures | CloudWatch Logs, SIEM (Splunk), S3 | 1 year (SOC 2), 7 years (financial actions) | SOC 2, GDPR Art. 5 |
| **Customer Communications** | Email content sent via platform, notifications | Logs (redacted), SendGrid (temporary) | 30 days in logs | GDPR, CCPA |
| **File Attachments** | Contracts, proposals, NDAs, financial documents uploaded by users | S3 (encrypted), tenant-scoped | Until tenant deletes | GDPR, CCPA, Trade secrets |
| **OAuth Tokens (Access Tokens)** | Short-lived JWTs | In-memory (application), Redis (cache) | 1 hour | GDPR, CCPA |

---

### Tier 3: Internal (Restricted Distribution)

**Definition**: Non-public data with limited sensitivity, used for operations. Not subject to strict regulatory requirements but should not be publicly disclosed.

**Protection Requirements**:
- Access controls (authenticated users only)
- Encryption in transit (TLS)
- Integrity protection
- Standard retention policies
- Logged access (not real-time alerts)

| Data Type | Examples | Storage Location | Retention | Regulatory |
|-----------|----------|------------------|-----------|------------|
| **User IDs, Tenant IDs** | UUIDs, internal identifiers (non-PII) | Database, Logs, Cache | Duration of account existence | None (internal) |
| **System Configuration** | Feature flags (non-secret), API rate limits, tenant settings | Database, Application config | Indefinite (until changed) | None |
| **Application Logs (Non-PII)** | Request timestamps, HTTP status codes, correlation IDs | CloudWatch, S3 | 90 days (operational), 1 year (compliance) | SOC 2 (for security logs) |
| **Metadata** | File upload timestamps, file sizes, MIME types, record creation dates | Database | Indefinite (tied to record) | None |
| **Metrics & Telemetry** | API request rates, error rates, latency, resource utilization | CloudWatch, Datadog | 30 days (detailed), 1 year (aggregated) | None |
| **IP Addresses** | User IP addresses (for rate limiting, fraud detection) | Logs, Redis (rate limiting) | 30 days | GDPR (can be PII in EU) |
| **User Agent Strings** | Browser and OS information | Logs | 30 days | GDPR (can be PII in combination) |

---

### Tier 4: Public

**Definition**: Data intended for public disclosure or already publicly available.

**Protection Requirements**:
- Integrity protection (prevent tampering)
- Availability protection (CDN, caching)
- No confidentiality requirements

| Data Type | Examples | Storage Location | Retention | Regulatory |
|-----------|----------|------------------|-----------|------------|
| **Marketing Content** | Website copy, blog posts, product descriptions | CDN, S3 (public) | Indefinite | None |
| **Public Documentation** | API docs (public endpoints), help articles, FAQs | Static site hosting | Indefinite | None |
| **Public Pricing** | Published subscription tiers, feature comparisons | Website | Indefinite | None |

---

## Data Flow Classification

### High-Risk Data Flows

These data flows cross security boundaries and involve Tier 1 or Tier 2 data:

1. **User Login** (Tier 1):
   - Flow: User → Web Client → IdP (credentials) → IdP returns tokens → Stored in cookies
   - Controls: TLS, PKCE, MFA, httpOnly cookies

2. **Cross-Tenant Query** (Tier 2):
   - Flow: API Request → CRM Service → Database (PII)
   - Controls: JWT validation, tenant_id extraction from token, WHERE tenant_id filter, RLS

3. **File Upload (Potentially Tier 2)**:
   - Flow: Web Client → API → S3 (contracts, financials)
   - Controls: Signed URLs, tenant-scoped keys, virus scanning, encryption at rest

4. **Payment Processing** (Tier 1):
   - Flow: Web Client → CRM API → Stripe (payment tokens)
   - Controls: Tokenization (Stripe), TLS, webhook signature validation

5. **Admin Impersonation** (Tier 2 access):
   - Flow: Admin Portal → CRM API → Database (tenant data access)
   - Controls: MFA, audit logging, time-limited tokens, IP allowlist

### Medium-Risk Data Flows

6. **Email Notifications** (Tier 2-3):
   - Flow: CRM API → SQS → Worker → SendGrid (email addresses, names)
   - Controls: TLS, queue message encryption, SPF/DKIM/DMARC

7. **Background Reports** (Tier 2):
   - Flow: CRM API → SQS → Worker → S3 (generated PDFs with tenant data)
   - Controls: Tenant-scoped queue messages, S3 encryption, signed URL access

---

## Data Lifecycle

### Data at Rest

| Tier | Encryption | Key Management | Access Control | Backup Encryption |
|------|------------|----------------|----------------|-------------------|
| **Tier 1** | AES-256 (field-level or volume) | AWS KMS, rotated annually | MFA required, audit logged | Yes (same or stronger) |
| **Tier 2** | AES-256 (volume-level) | AWS KMS or cloud-managed | RBAC, tenant isolation | Yes |
| **Tier 3** | AES-256 (volume-level, optional) | Cloud-managed | Authenticated users | Yes |
| **Tier 4** | None required | N/A | Public | No (public data) |

### Data in Transit

| Data Flow | Protocol | Minimum TLS Version | Certificate Validation |
|-----------|----------|---------------------|------------------------|
| **User ↔ Application** | HTTPS | TLS 1.2 | Yes (CA-signed) |
| **Application ↔ Database** | PostgreSQL SSL | TLS 1.2 | Yes |
| **Application ↔ Redis** | TLS | TLS 1.2 | Yes |
| **Application ↔ S3** | HTTPS | TLS 1.2 | Yes |
| **Application ↔ Third Parties** | HTTPS | TLS 1.2 | Yes |

### Data Retention

| Data Type | Retention Period | Deletion Method | Compliance Driver |
|-----------|------------------|-----------------|-------------------|
| **User Account Data** | Until account deletion + 30 days (grace period) | Hard delete from DB, S3, backups | GDPR Art. 17 (Right to Erasure) |
| **Financial Records** | 7 years after transaction | Hard delete after retention period | Tax regulations, SOC 2 |
| **Audit Logs** | 1 year (security), 7 years (financial) | Archive to cold storage, then delete | SOC 2, financial regulations |
| **Backup Data** | 30 days (daily backups) | Automatic deletion after 30 days | Operational (disaster recovery) |
| **Email Logs** | 30 days | Automatic deletion | Operational |
| **Session Tokens** | Access: 1 hour, Refresh: 30 days | Automatic expiration (TTL in Redis) | Security best practice |

---

## Data Sharing with Third Parties

### Third-Party Data Processors

| Third Party | Data Shared | Purpose | DPA in Place? | SOC 2 Certified? |
|-------------|-------------|---------|---------------|------------------|
| **Auth0 / Entra ID** | Email, name, MFA phone (if applicable) | Authentication | Yes | Yes |
| **SendGrid** | Email addresses, names, email content (notifications) | Transactional email delivery | Yes | Yes |
| **Stripe** | Email, billing address, payment tokens (NOT full card numbers) | Payment processing | Yes | Yes (PCI DSS Level 1) |
| **AWS** | All data (infrastructure provider) | Cloud infrastructure | Yes (BAA for HIPAA if needed) | Yes |

**Data Processing Agreements (DPAs)**: All third parties processing customer data have signed GDPR-compliant DPAs.

---

## Non-Production Environments

### Development & Staging

- **No Production Data**: Never use production data in dev/staging
- **Synthetic Data**: Generate realistic but fake data for testing
- **Anonymization**: If production data is required (rare), anonymize:
  - Replace PII with fake data (Faker.js)
  - Scramble email addresses: `user@example.com` → `user123@example.com`
  - Replace payment tokens with test tokens (Stripe test mode)
- **Separate Databases**: Dev/staging use separate database instances (no shared connections)
- **Relaxed Retention**: Non-production data can be purged more frequently

---

## Data Subject Rights (GDPR/CCPA)

### Right of Access (GDPR Art. 15)

- **Endpoint**: `GET /api/data-subject/export` (authenticated)
- **Response**: JSON export of all user data (contacts, deals, activities, files)
- **Timeframe**: 30 days to respond

### Right to Erasure / Deletion (GDPR Art. 17, CCPA)

- **Endpoint**: `DELETE /api/data-subject/delete` (authenticated + confirmation)
- **Process**:
  1. Mark account for deletion (30-day grace period)
  2. After grace period, hard delete:
     - Database records (all tables)
     - S3 files (attachments, reports)
     - Logs (anonymize user ID in historical logs)
     - Backups (overwrite in next backup cycle, or mark for exclusion)
- **Timeframe**: 30 days to complete

### Right to Portability (GDPR Art. 20)

- **Endpoint**: `GET /api/data-subject/export?format=csv` or `format=json`
- **Response**: Machine-readable export (CSV, JSON)
- **Timeframe**: 30 days to respond

---

## Compliance Summary

| Regulation | Applicable Data | Key Requirements | Implementation |
|------------|-----------------|------------------|----------------|
| **GDPR** | All PII (Tier 2) | Consent, data minimization, encryption, breach notification (<72h), data subject rights | Consent management, DPAs, encryption, incident response plan, export/delete APIs |
| **CCPA** | California residents' PII | Consumer rights (access, delete, opt-out), data inventory | Export/delete APIs, privacy policy disclosure |
| **SOC 2** | All data | Access controls, encryption, audit logging, change management | RBAC, encryption, audit logs, SOC 2 audit (annual) |
| **PCI DSS** | Payment card data | Tokenization, encryption, network segmentation, no storage of CVV/PIN | Stripe tokenization (no local storage), TLS, restricted access |
| **ISO 27001** | All data | Information security management system (ISMS) | Policies, risk assessments, controls, audits |

---

## Classification Labeling

**File Naming Convention**:
- Highly Sensitive: `RESTRICTED-{document-name}.pdf`
- Confidential: `CONFIDENTIAL-{document-name}.pdf`
- Internal: `INTERNAL-{document-name}.pdf`
- Public: `PUBLIC-{document-name}.pdf`

**Email Subject Line** (for sensitive data):
- `[RESTRICTED] - {subject}`
- `[CONFIDENTIAL] - {subject}`

**Document Headers/Footers**:
- Include classification level on all internal documents

---

## Review & Updates

- **Quarterly Review**: Security team reviews data classification
- **On Change**: Update classification when new data types added
- **Annual Audit**: Compliance team audits data classification during SOC 2 audit

**Owner**: Security Architecture Team + Compliance Team
**Last Updated**: 2025-12-29
**Next Review**: 2026-03-29
