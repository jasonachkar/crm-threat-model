# Assumptions and Scope

## Purpose

This document explicitly defines what is included and excluded from this threat model, along with key assumptions about the system, its environment, and potential threat actors. Clear scoping prevents scope creep and ensures stakeholders understand the boundaries of this security analysis.

## In-Scope Components

The following components are **within scope** for this threat model:

### Application Components
- ✅ Web Client (Single-Page Application)
- ✅ API Gateway and routing layer
- ✅ Web Application Firewall (WAF)
- ✅ CRM Application Service (REST API)
- ✅ Authorization Service and token validation
- ✅ Background Worker Service
- ✅ Admin Portal

### Data Components
- ✅ Primary Database (PostgreSQL) - schema, queries, access controls
- ✅ Cache Layer (Redis) - session management, rate limiting
- ✅ Object Storage (S3/Azure Blob) - file attachments
- ✅ Message Queue / Event Bus - asynchronous processing

### Integration Points
- ✅ Identity Provider (OIDC) - authentication flow, token lifecycle
- ✅ Email Service Provider - data shared, API security
- ✅ Payment Processor - webhook validation, data exposure
- ✅ Logging and Monitoring systems - data retention, access controls

### Security Controls
- ✅ Authentication and authorization mechanisms
- ✅ Tenant isolation controls
- ✅ Data encryption (in transit and at rest)
- ✅ Input validation and output encoding
- ✅ Rate limiting and abuse prevention
- ✅ Audit logging

### Infrastructure
- ✅ Network segmentation and boundaries
- ✅ Deployment pipeline (CI/CD security)
- ✅ Secrets management
- ✅ Container security
- ✅ Cloud service configurations (IAM, security groups, storage policies)

## Out-of-Scope Components

The following are **explicitly excluded** from this threat model:

### Physical & Environmental
- ❌ Physical security of data centers (cloud provider responsibility)
- ❌ Physical access controls to cloud provider facilities
- ❌ Environmental controls (power, cooling, natural disasters)
- ❌ Hardware tampering or supply chain attacks on physical servers

### Cloud Provider Responsibilities
- ❌ Hypervisor and virtualization layer security
- ❌ Cloud provider's internal network security
- ❌ Cloud provider's employee access controls
- ❌ DDoS mitigation at infrastructure level (assumed to be cloud provider's responsibility)
- ❌ Underlying OS security for managed services (RDS, managed Redis, etc.)

### End-User Environment
- ❌ End-user device security (laptops, phones, tablets)
- ❌ End-user network security (home WiFi, corporate networks)
- ❌ End-user browser security (patches, extensions)
- ❌ Social engineering attacks targeting end users (outside of system design)
- ❌ Phishing campaigns (except as they relate to token theft)

### Third-Party Services
- ❌ Security of Identity Provider's infrastructure (Auth0, Entra ID)
- ❌ Security of email provider's platform
- ❌ Security of payment processor's systems
- ❌ Vulnerabilities within third-party libraries (addressed via SCA tooling, not threat modeling)

### Future/Planned Features
- ❌ Mobile native applications (iOS/Android) - not yet developed
- ❌ Desktop applications
- ❌ Real-time collaboration features (future roadmap)
- ❌ AI/ML features (future roadmap)

### Specialized Threats
- ❌ Nation-state advanced persistent threats (APTs)
- ❌ Quantum cryptography attacks
- ❌ Supply chain attacks on cloud provider or major OSS libraries
- ❌ Zero-day exploits in underlying platforms (OS, cloud services)
- ❌ Sophisticated cryptographic attacks (timing attacks, side channels)

## Data Classification Assumptions

This threat model assumes the following data classifications:

### Highly Sensitive (Tier 1)
**Definition**: Data that would cause severe harm if disclosed, modified, or destroyed.

**Examples**:
- Authentication credentials (passwords, API keys, secrets)
- Payment card data (PCI DSS scope)
- Cryptographic keys
- Session tokens and refresh tokens

**Protection Requirements**:
- Encryption at rest using strong algorithms (AES-256)
- Encryption in transit (TLS 1.2+)
- Tokenization where applicable (e.g., payment cards)
- Access logging with alerts
- Automatic rotation policies
- Never logged or cached

### Confidential (Tier 2)
**Definition**: Sensitive business or personal data requiring protection under law or contract.

**Examples**:
- Customer personally identifiable information (PII): names, email addresses, phone numbers
- Financial records: revenue, contracts, pricing
- Business intelligence: sales forecasts, strategic plans
- Employee records
- Proprietary business logic or algorithms

**Protection Requirements**:
- Encryption in transit (TLS 1.2+)
- Tenant isolation controls (strict query filtering)
- Role-based access controls
- Audit logging of access
- Anonymization/pseudonymization in non-production environments
- Data minimization in logs (redaction)

### Internal (Tier 3)
**Definition**: Non-public data with limited sensitivity, used for operations.

**Examples**:
- User IDs, tenant IDs
- System configuration (non-secret)
- Feature flags
- Application logs (without PII)
- Metadata (creation dates, status codes)

**Protection Requirements**:
- Access controls (authenticated users only)
- Integrity protection
- Retention policies

### Public (Tier 4)
**Definition**: Data intended for public disclosure.

**Examples**:
- Marketing content
- Public API documentation
- Help articles

**Protection Requirements**:
- Integrity protection (prevent tampering)
- Availability protection (CDN, caching)

## Trust Assumptions

### What We Trust

1. **Identity Provider (IdP)**
   - Correctly authenticates users
   - Issues cryptographically valid tokens
   - Enforces MFA policies (when configured)
   - **BUT**: We validate token signatures, expiration, and issuer - we trust, but verify

2. **Cloud Provider**
   - Provides secure managed services (RDS, S3, etc.)
   - Encryption services function correctly
   - IAM policies are enforced
   - Infrastructure is isolated from other customers
   - **BUT**: We follow least-privilege and defense-in-depth principles

3. **TLS/Cryptographic Implementations**
   - Standard TLS libraries are secure
   - Cloud provider's encryption-at-rest is effective
   - Random number generation is cryptographically secure

4. **Internal Administrators (with verification)**
   - Platform administrators act in good faith
   - **BUT**: All admin actions are logged
   - **BUT**: Admin access requires MFA and is time-limited
   - **BUT**: Separation of duties prevents single-person risk

### What We Do NOT Trust

1. **End Users**
   - All user input is untrusted and validated
   - Client-side validation is UX only, not security
   - Users may be malicious, compromised, or negligent

2. **Web Client (Browser)**
   - Browser may be compromised or manipulated
   - JavaScript can be modified via browser DevTools
   - Never trust client-side security decisions

3. **Network**
   - All network paths are assumed hostile
   - Man-in-the-middle attacks are possible
   - Encryption required for all data in transit

4. **Other Tenants**
   - Tenants are potential adversaries to each other
   - Tenant isolation is enforced at every layer
   - No shared resources without strict access controls

5. **Third-Party Services (partially trusted)**
   - Email provider may expose data in breach
   - Payment provider webhooks must be validated
   - Third-party APIs may have vulnerabilities

## Threat Actor Assumptions

This threat model considers the following threat actors:

### 1. External Attacker (Opportunistic)
**Motivation**: Financial gain, data theft for resale
**Capabilities**:
- Automated vulnerability scanning
- Exploitation of known CVEs
- Credential stuffing attacks
- Basic SQL injection / XSS attempts
**Access Level**: None (internet-facing endpoints only)
**Likelihood**: High

### 2. External Attacker (Targeted)
**Motivation**: Corporate espionage, competitive intelligence, ransomware
**Capabilities**:
- Reconnaissance and OSINT gathering
- Spear phishing campaigns
- Exploitation of application logic flaws (BOLA, business logic bypass)
- Persistence and lateral movement (if breach occurs)
**Access Level**: None initially, seeks to gain access via phishing or vulnerabilities
**Likelihood**: Medium

### 3. Malicious Tenant Administrator
**Motivation**: Competitive advantage, industrial espionage
**Capabilities**:
- Full access to own tenant's data
- Understanding of application behavior
- Ability to manipulate own tenant's users
- Attempts to access other tenants' data via BOLA/IDOR
**Access Level**: Authenticated, admin-level within own tenant
**Likelihood**: Low-Medium (high impact if successful)

### 4. Malicious End User
**Motivation**: Fraud, data theft, sabotage
**Capabilities**:
- Standard user access within tenant
- API abuse, excessive requests
- Attempts at privilege escalation
- Malicious file uploads
**Access Level**: Authenticated, limited permissions
**Likelihood**: Medium

### 5. Insider Threat (Employee/Contractor)
**Motivation**: Financial gain, revenge, negligence
**Capabilities**:
- Potential access to source code, infrastructure, admin panels
- Understanding of system internals
- Ability to exfiltrate data or plant backdoors
- Social engineering of colleagues
**Access Level**: Varies (developer, support, operations)
**Likelihood**: Low (but high impact)

### 6. Compromised Third-Party Service
**Motivation**: N/A (third party itself is compromised)
**Capabilities**:
- Access to data shared with third party (emails, payment info)
- Ability to send malicious webhooks or responses
**Access Level**: API integration endpoints
**Likelihood**: Low-Medium

### NOT Considered (Out of Scope)
- ❌ Nation-state APT actors with unlimited resources
- ❌ Insider with root access to cloud provider infrastructure
- ❌ Attackers with physical access to data centers

## Operational Assumptions

### Environment Separation
- **Assumption**: Production, staging, and development environments are fully separated
- **Assumption**: Non-production environments use synthetic or anonymized data
- **Assumption**: Secrets are unique per environment

### Secrets Management
- **Assumption**: Secrets are stored in a dedicated vault (AWS Secrets Manager, HashiCorp Vault)
- **Assumption**: Secrets are not committed to source control (enforced by pre-commit hooks)
- **Assumption**: Secrets are rotated regularly (at least annually, more frequently for high-value keys)

### Backup & Disaster Recovery
- **Assumption**: Database backups are encrypted and stored securely
- **Assumption**: Backup restoration process is tested regularly
- **Assumption**: Backup retention follows compliance requirements (e.g., 7 years for financial data)

### Monitoring & Alerting
- **Assumption**: Centralized logging is in place with retention policies
- **Assumption**: Security-relevant events trigger alerts (e.g., repeated auth failures, admin actions)
- **Assumption**: On-call team responds to critical alerts within SLA

### Patch Management
- **Assumption**: Managed services (RDS, ElastiCache) are patched by cloud provider
- **Assumption**: Application dependencies are regularly updated for security patches
- **Assumption**: Container base images are scanned and updated monthly

### Access Controls
- **Assumption**: Principle of least privilege is enforced for all IAM roles
- **Assumption**: Admin access requires MFA
- **Assumption**: Production access is audited and time-limited (break-glass for emergencies)

## Compliance & Regulatory Assumptions

### Applicable Regulations
This threat model assumes the following regulations apply:

- **GDPR** (General Data Protection Regulation) - EU customer data
- **CCPA** (California Consumer Privacy Act) - California residents
- **SOC 2 Type II** - Security, availability, confidentiality controls
- **ISO 27001** - Information security management system
- **PCI DSS** (if payment card data is stored/processed)

### Data Residency
- **Assumption**: Tenant data is stored in region specified at tenant onboarding
- **Assumption**: Data does not cross regional boundaries without customer consent
- **Assumption**: Subprocessors (third-party services) are disclosed and approved

### Data Subject Rights
- **Assumption**: System supports data subject access requests (DSAR)
- **Assumption**: Data deletion capabilities exist for "right to be forgotten"
- **Assumption**: Data portability exports are available in machine-readable format

## Multi-Tenant Specific Assumptions

### Critical Tenant Isolation Assumptions

1. **Tenant Context from Token Only**
   - **Assumption**: `tenant_id` is always extracted from authenticated token claims
   - **Assumption**: Client cannot specify or override `tenant_id` in requests
   - **Assumption**: Token claims are immutable and signed by trusted IdP

2. **Database-Level Isolation**
   - **Assumption**: Every table with tenant-specific data has a `tenant_id` column
   - **Assumption**: Every query includes a `WHERE tenant_id = :current_tenant` filter
   - **Assumption**: Row-level security (RLS) policies are implemented as defense-in-depth
   - **Assumption**: No shared tables exist without explicit tenant scoping

3. **Object Storage Isolation**
   - **Assumption**: All object keys include tenant prefix: `tenant-{id}/...`
   - **Assumption**: Signed URLs include tenant validation
   - **Assumption**: IAM policies restrict cross-tenant access

4. **Cache Isolation**
   - **Assumption**: Cache keys are namespaced by tenant: `tenant:{id}:cache_key`
   - **Assumption**: No cache key collisions between tenants

5. **Queue Message Isolation**
   - **Assumption**: Queue messages include `tenant_id` in payload
   - **Assumption**: Workers validate tenant context before processing

## Known Limitations & Residual Risks

### Accepted Risks

1. **Distributed Denial of Service (DDoS)**
   - **Risk**: Sophisticated DDoS attacks may overwhelm infrastructure
   - **Mitigation**: Cloud provider DDoS protection, rate limiting
   - **Residual Risk**: Low (relies on cloud provider)

2. **Zero-Day Vulnerabilities**
   - **Risk**: Unknown vulnerabilities in frameworks, libraries, or platforms
   - **Mitigation**: Defense-in-depth, monitoring, incident response readiness
   - **Residual Risk**: Medium (inevitable in complex systems)

3. **Social Engineering / Phishing**
   - **Risk**: Users may be tricked into revealing credentials
   - **Mitigation**: MFA, security awareness training, anomaly detection
   - **Residual Risk**: Medium (user behavior dependent)

4. **Insider Threats**
   - **Risk**: Malicious or negligent employees with legitimate access
   - **Mitigation**: Least privilege, audit logging, background checks, separation of duties
   - **Residual Risk**: Low (cannot eliminate entirely)

### Technical Debt / Implementation Gaps

(To be addressed in mitigation roadmap)

1. **Incomplete Audit Logging**
   - Current logging does not cover all admin actions and sensitive data access
   - Gap: Read operations on customer data are not consistently logged

2. **Manual Tenant Isolation Testing**
   - No automated testing framework to verify tenant isolation on every deployment
   - Gap: Reliance on code review and manual testing

3. **Limited Rate Limiting**
   - Rate limiting exists at API Gateway but not application layer
   - Gap: Per-tenant, per-endpoint limits not enforced

4. **Insufficient Input Validation**
   - Not all endpoints have comprehensive input validation
   - Gap: Risk of injection attacks or business logic bypass

5. **No Field-Level Encryption**
   - Sensitive PII is encrypted at rest (volume encryption) but not field-level
   - Gap: Database compromise would expose plaintext PII

## Review & Update Schedule

This assumptions document should be reviewed:

- **Quarterly**: Regular review by security and architecture teams
- **On Architecture Changes**: Any new component, integration, or significant refactoring
- **Post-Incident**: After security incidents to update threat assumptions
- **Compliance Audits**: Before SOC 2, ISO 27001, or other audits

## Questions & Clarifications

If assumptions in this document do not reflect reality, or if scope boundaries are unclear, contact:

- **Security Architecture Team**: security-architecture@example.com
- **Product Security**: product-security@example.com

---

**Next**: Review [Architecture and Data Flow Diagrams](03-architecture-and-dfd.md) to understand system design in detail.
