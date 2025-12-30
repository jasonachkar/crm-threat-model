# Security Requirements Checklist

## Introduction

This checklist translates the threat model findings into actionable security requirements for development, operations, and security teams. Each section maps to mitigation strategies from the STRIDE threat analysis.

**Status Legend**:
- ☐ Not Implemented
- ☑ Implemented
- ⚠️ Partially Implemented
- 🔄 In Progress

---

## 1. Tenant Isolation & Multi-Tenancy

**Goal**: Ensure absolute separation between tenants at all layers.

### 1.1 Data Layer Isolation

- ☐ **All tenant-specific tables include `tenant_id` column** (foreign key to tenants table)
- ☐ **All database queries include `WHERE tenant_id = :tenant`** filter (no exceptions)
- ☐ **Row-Level Security (RLS) policies** implemented on all tenant-specific tables
- ☐ **Tenant context extracted from JWT token claims only** (never from client input)
- ☐ **Automated testing**: Test suite verifies Tenant A cannot access Tenant B resources (CI/CD gate)
- ☐ **Code review checklist** includes tenant isolation verification
- ☐ **Database audit**: Periodic review of queries to ensure tenant filtering
- ☐ **ORM configuration** enforces automatic tenant scoping (global query filter)

**References**: TM-017, TM-007, TM-012

### 1.2 Object Storage Isolation

- ☐ **Object keys include tenant prefix**: `tenant-{tenant_id}/...` (enforced)
- ☐ **Signed URL generation validates tenant ownership** before creating URL
- ☐ **Bucket policies deny cross-tenant access**
- ☐ **IAM roles scoped per tenant** (if using per-tenant buckets)
- ☐ **Automated testing**: Verify Tenant A cannot access Tenant B's signed URLs

**References**: TM-019, TM-022

### 1.3 Cache Isolation

- ☐ **Cache keys include tenant namespace**: `tenant:{tenant_id}:...`
- ☐ **Cache key validation**: Ensure keys cannot collide across tenants
- ☐ **Tenant context used in all cache operations** (get, set, delete)

**References**: TM-024

### 1.4 Queue Message Isolation

- ☐ **All queue messages include `tenant_id` in payload**
- ☐ **Workers validate tenant context** before processing messages
- ☐ **Message schema validation** (reject messages missing tenant_id)

**References**: TM-010

---

## 2. Authentication & Authorization

**Goal**: Ensure only authenticated, authorized users access resources.

### 2.1 Authentication (AuthN)

- ☐ **OIDC/OAuth 2.0** used for authentication (via Auth0/Entra ID/Okta)
- ☐ **PKCE (Proof Key for Code Exchange)** enabled for authorization code flow
- ☐ **JWT tokens used for API access** (signed by trusted IdP)
- ☐ **Token validation on every API request**:
  - ☐ Signature verification (using JWKS public keys)
  - ☐ Issuer (`iss` claim) validation
  - ☐ Audience (`aud` claim) validation
  - ☐ Expiration (`exp` claim) validation
  - ☐ Not-before (`nbf` claim) validation
- ☐ **Access token expiration**: Short-lived (1 hour max)
- ☐ **Refresh token expiration**: Limited lifetime (30 days max)
- ☐ **Refresh token rotation**: New refresh token issued on each use (recommended)
- ☐ **Token storage**: Tokens stored in httpOnly, secure, SameSite cookies (NOT localStorage)
- ☐ **Token revocation**: Capability to revoke refresh tokens (logout, compromise)

**References**: TM-001, TM-002, TM-004, TM-005

### 2.2 Multi-Factor Authentication (MFA)

- ☐ **MFA mandatory for all admin accounts**
- ☐ **MFA recommended for all users** (enforced for high-value tenants)
- ☐ **Phishing-resistant MFA for admins**: WebAuthn/FIDO2 (not SMS or TOTP)
- ☐ **Conditional access policies**: MFA required for new device/location logins
- ☐ **MFA bypass prevention**: No backdoors or emergency access without MFA

**References**: TM-002, TM-003

### 2.3 Authorization (AuthZ)

- ☐ **Role-Based Access Control (RBAC)** implemented
  - ☐ Roles defined: Tenant Admin, Sales Manager, Sales Rep, Read-Only, Platform Admin, Support
  - ☐ Permissions mapped to roles
  - ☐ Least privilege principle applied
- ☐ **Resource-level authorization**:
  - ☐ Every API endpoint checks user has permission for requested operation
  - ☐ Resource ownership verified: `resource.tenant_id == user.tenant_id`
  - ☐ Ownership check: `resource.owner_id == user.id OR user.hasPermission('view_all')`
- ☐ **Centralized authorization logic**: Use authorization framework (Casbin, Oso, custom middleware)
- ☐ **Automated authorization testing**: Test that users cannot access unauthorized resources
- ☐ **Admin endpoints protected**: Admin-only endpoints verify admin role

**References**: TM-012, TM-017, TM-032

### 2.4 Session Management

- ☐ **Session tokens regenerated after authentication** (prevent session fixation)
- ☐ **Concurrent session limits** (e.g., max 3 active sessions per user)
- ☐ **Session expiration**: Idle timeout (30 minutes) and absolute timeout (12 hours)
- ☐ **Secure logout**: Logout invalidates session server-side (not just client-side)
- ☐ **Anomaly detection**: Alert on concurrent sessions from different geolocations

**References**: TM-004

---

## 3. Input Validation & Output Encoding

**Goal**: Prevent injection attacks and data tampering.

### 3.1 Input Validation

- ☐ **Allowlist validation**: Accept only known-good input (not blocklist)
- ☐ **Type validation**: Verify data types match expected (string, integer, email, etc.)
- ☐ **Length validation**: Enforce maximum length for all input fields
- ☐ **Format validation**: Use regex or libraries for structured data (email, phone, URL)
- ☐ **Range validation**: Enforce min/max for numeric inputs
- ☐ **Schema validation**: Use JSON Schema / OpenAPI to validate request bodies
- ☐ **Field allowlisting**: Accept only expected fields (reject extra fields to prevent mass assignment)
- ☐ **Reject unexpected fields**: Explicitly deny fields not in allowlist

**References**: TM-008, TM-009

### 3.2 SQL Injection Prevention

- ☐ **Parameterized queries / prepared statements** used for ALL database queries
- ☐ **Never concatenate user input into SQL strings**
- ☐ **Use ORM** (Sequelize, TypeORM, Prisma) that auto-escapes (but verify generated SQL)
- ☐ **Least-privilege database user**: App DB user has no DROP, ALTER, CREATE permissions
- ☐ **SAST tools** in CI/CD to detect SQL string concatenation
- ☐ **Code review checklist** includes SQL injection review

**References**: TM-007

### 3.3 XSS Prevention

- ☐ **Output encoding**: Escape HTML entities in all user-generated content
- ☐ **Content Security Policy (CSP)**: Strict CSP header: `default-src 'self'; script-src 'self'; object-src 'none'`
- ☐ **Use framework auto-escaping**: React, Angular, Vue auto-escape by default (verify no `dangerouslySetInnerHTML`)
- ☐ **Validate URLs**: Sanitize user-provided URLs (prevent `javascript:` protocol)
- ☐ **Use Trusted Types API** (browser feature) to prevent DOM-based XSS
- ☐ **HTTP security headers**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block` (legacy browsers)

**References**: TM-001, TM-011

### 3.4 File Upload Security

- ☐ **File type validation**: Validate using magic bytes (not just extension)
- ☐ **File type allowlist**: Only allow specific types (PDF, PNG, JPG, DOCX) - reject executables
- ☐ **File size limits**: Enforce max size (10 MB)
- ☐ **Virus scanning**: Scan all uploads with ClamAV or cloud antivirus
- ☐ **Content-Disposition header**: Force download (`Content-Disposition: attachment`) not inline
- ☐ **Separate storage domain**: Serve uploads from different domain (prevent cookie theft)
- ☐ **Disable file execution**: Object storage bucket configured to prevent script execution

**References**: TM-009

---

## 4. Data Protection

**Goal**: Protect sensitive data at rest and in transit.

### 4.1 Encryption in Transit

- ☐ **TLS 1.2+ for all communications** (client ↔ server, server ↔ database, server ↔ third parties)
- ☐ **Strong cipher suites**: Disable weak ciphers (RC4, 3DES, MD5)
- ☐ **HSTS header**: `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- ☐ **Redirect HTTP to HTTPS**: All HTTP requests redirect to HTTPS
- ☐ **Certificate validation**: Verify TLS certificates (no self-signed in production)

**References**: All boundary crossings

### 4.2 Encryption at Rest

- ☐ **Database encryption**: Enable encryption at rest (RDS encryption, Transparent Data Encryption)
- ☐ **Object storage encryption**: S3 server-side encryption (SSE-S3 or SSE-KMS)
- ☐ **Backup encryption**: All backups encrypted (same or stronger encryption as prod data)
- ☐ **Key management**: Use cloud KMS (AWS KMS, Azure Key Vault) for key storage and rotation
- ☐ **Field-level encryption** (optional but recommended for PII): Encrypt sensitive fields with tenant-specific keys

**References**: TM-026

### 4.3 Sensitive Data Handling

- ☐ **Never log sensitive data**: Passwords, tokens, credit cards, SSN redacted from logs
- ☐ **Log redaction**: Implement redaction before logging: `logger.info(redact(data, ['password', 'token']))`
- ☐ **Mask sensitive data in UI**: Show last 4 digits of credit card, mask email
- ☐ **Minimize data in API responses**: Only include fields client needs (no excessive data exposure)
- ☐ **Do not cache sensitive data**: Avoid caching PII or credentials
- ☐ **Secure data deletion**: When deleting user data, purge from backups and caches

**References**: TM-020, TM-018

---

## 5. Logging, Monitoring & Auditing

**Goal**: Detect, investigate, and respond to security incidents.

### 5.1 Audit Logging

- ☐ **Log all security-relevant events**:
  - ☐ Authentication attempts (success, failure)
  - ☐ Authorization failures (403 Forbidden responses)
  - ☐ Admin actions (impersonation, config changes, user/role modifications)
  - ☐ Data exports and bulk operations
  - ☐ Sensitive data access (optional: sample or metadata only for privacy)
  - ☐ Payment/billing events
- ☐ **Log format includes**: Timestamp, user ID, tenant ID, action, IP address, user agent, correlation ID, outcome
- ☐ **Structured logging**: Use JSON format for easy parsing
- ☐ **Immutable logs**: Send to SIEM or S3 with write-once policy (prevent tampering)
- ☐ **Log retention**: Retain logs per compliance requirements (e.g., 1 year for SOC 2, 7 years for financial)
- ☐ **Log integrity**: Hash chain or signature to detect log tampering

**References**: TM-013, TM-014, TM-015, TM-016

### 5.2 Monitoring & Alerting

- ☐ **Real-time SIEM integration**: Forward logs to SIEM (Splunk, Datadog, Elastic)
- ☐ **Alert on critical events**:
  - ☐ Multiple failed login attempts (brute force)
  - ☐ Admin impersonation events
  - ☐ Privilege escalation (role changes)
  - ☐ Unusual data access patterns (anomaly detection)
  - ☐ Error rate spikes (500 errors)
  - ☐ Slow queries or database resource exhaustion
- ☐ **Security dashboards**: Visualize auth failures, API errors, anomalies
- ☐ **On-call rotation**: 24/7 on-call for critical security alerts
- ☐ **Incident response runbooks**: Defined procedures for common alerts

**References**: TM-013, TM-027

### 5.3 Anomaly Detection

- ☐ **Detect unusual user behavior**:
  - ☐ Login from new location/device
  - ☐ Concurrent sessions from different geolocations
  - ☐ Unusual volume of API requests
  - ☐ Access to unusually high number of resources
- ☐ **Automated anomaly alerts**: ML-based or rule-based detection
- ☐ **User notifications**: Email user on suspicious activity (login from new location)

**References**: TM-001, TM-002, TM-004, TM-017

---

## 6. Rate Limiting & Abuse Prevention

**Goal**: Prevent denial-of-service and resource abuse.

### 6.1 API Rate Limiting

- ☐ **Global rate limits**: Max requests per second at API Gateway (e.g., 1000 req/sec)
- ☐ **Per-IP rate limits**: 100 req/sec per IP address
- ☐ **Per-user rate limits**: 50 req/sec per authenticated user
- ☐ **Per-tenant rate limits**: Configurable per tenant (e.g., 1000 req/min for free tier, 10,000 for paid)
- ☐ **Per-endpoint rate limits**: Expensive endpoints have stricter limits (e.g., search: 10 req/min)
- ☐ **Rate limit headers**: Return `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After` headers
- ☐ **Rate limit enforcement**: Return `429 Too Many Requests` when exceeded

**References**: TM-027, TM-028, TM-029

### 6.2 Resource Consumption Limits

- ☐ **Pagination required**: Enforce maximum page size (100 results per request)
- ☐ **Query timeout**: Database queries timeout after 5 seconds
- ☐ **Request size limits**: Max request body size (5 MB)
- ☐ **File upload limits**: Max file size (10 MB), max uploads per hour (10 per user)
- ☐ **Storage quotas**: Per-tenant storage limits (e.g., 10 GB)
- ☐ **Queue depth limits**: Reject new messages if queue exceeds threshold

**References**: TM-027, TM-028, TM-029

### 6.3 DDoS Protection

- ☐ **Cloud DDoS mitigation**: AWS Shield, Cloudflare, Azure DDoS Protection enabled
- ☐ **WAF rules**: OWASP Core Rule Set enabled
- ☐ **Bot detection**: Cloudflare bot protection or CAPTCHA for suspicious traffic
- ☐ **Geo-blocking**: Block countries not in customer base (if applicable)
- ☐ **Auto-scaling**: Infrastructure scales to absorb traffic spikes

**References**: TM-031

---

## 7. Secure Development Lifecycle (SDLC)

**Goal**: Integrate security into development process.

### 7.1 Secure Coding Practices

- ☐ **Security training**: Developers complete secure coding training (OWASP Top 10, SANS)
- ☐ **Code review**: All code reviewed for security issues before merge
- ☐ **Security code review checklist**: Tenant isolation, input validation, authorization checks
- ☐ **Pair programming for sensitive code**: Critical security code written with pair programming

**References**: All threats

### 7.2 CI/CD Security Gates

- ☐ **SAST (Static Application Security Testing)**: SonarQube, Snyk Code, Checkmarx in CI pipeline
- ☐ **SCA (Software Composition Analysis)**: Snyk, WhiteSource, Dependabot for dependency scanning
- ☐ **Secret scanning**: GitGuardian, Gitleaks to prevent secrets in code
- ☐ **Container scanning**: Trivy, Clair for Docker image vulnerabilities
- ☐ **IaC scanning**: Checkov, tfsec for Terraform/CloudFormation security
- ☐ **DAST (Dynamic Application Security Testing)**: OWASP ZAP, Burp Suite for running app testing (optional)
- ☐ **Build fails on high/critical vulnerabilities**: CI/CD gates block deployment if critical issues found

**References**: TM-007, TM-009, and general vulnerability prevention

### 7.3 Dependency Management

- ☐ **Dependency updates**: Regular updates for security patches (monthly)
- ☐ **Automated dependency alerts**: GitHub Dependabot or similar
- ☐ **Vulnerability remediation SLA**: Critical vulns patched within 7 days, high within 30 days
- ☐ **Pin dependency versions**: Use lock files (package-lock.json, Gemfile.lock)

**References**: General supply chain security

---

## 8. Third-Party & Vendor Security

**Goal**: Ensure third-party integrations are secure.

### 8.1 Vendor Assessment

- ☐ **Security questionnaire**: Require vendors to complete security assessment
- ☐ **SOC 2 Type II**: Prefer vendors with SOC 2 Type II certification
- ☐ **Data Processing Agreements (DPA)**: GDPR-compliant DPAs with all vendors
- ☐ **Subprocessor disclosure**: Document all third parties with access to customer data

**References**: TM-006, Third-party integrations

### 8.2 API Key Management

- ☐ **API keys stored in vault**: AWS Secrets Manager, HashiCorp Vault (never hardcoded)
- ☐ **API key rotation**: Rotate keys every 90 days
- ☐ **Least-privilege API keys**: Grant minimum necessary permissions
- ☐ **Monitor API key usage**: Alert on unusual third-party API activity

**References**: TM-006, TM-010

### 8.3 Webhook Security

- ☐ **Webhook signature validation**: Verify HMAC signature on ALL incoming webhooks (Stripe, SendGrid, etc.)
- ☐ **Idempotency**: Track processed webhook events to prevent duplicates
- ☐ **IP allowlisting** (optional): Restrict webhook sources to known IPs
- ☐ **Webhook replay prevention**: Check event timestamp is recent

**References**: TM-035

---

## 9. Admin & Support Access

**Goal**: Protect high-privilege access and prevent insider threats.

### 9.1 Admin Access Controls

- ☐ **IP allowlist or VPN**: Admin portal accessible only from corporate network
- ☐ **MFA mandatory**: All admin accounts require MFA (WebAuthn/FIDO2 recommended)
- ☐ **Least privilege**: Admins granted minimum necessary permissions
- ☐ **Separation of duties**: No single admin has all permissions (platform admin != billing admin != security admin)
- ☐ **Time-limited access**: Admin sessions expire after 30 minutes inactivity

**References**: TM-032, TM-034

### 9.2 Impersonation & Support

- ☐ **MFA required for impersonation**: Support cannot impersonate without MFA
- ☐ **Justification required**: Support must provide ticket number and reason for impersonation
- ☐ **Time-limited impersonation**: Sessions expire after 30 minutes
- ☐ **Read-only by default**: Impersonation grants view access only; writes require approval
- ☐ **User notification**: Email user when admin impersonates their account
- ☐ **Comprehensive audit logging**: Log all impersonation events and actions taken

**References**: TM-034

### 9.3 Admin Audit Logging

- ☐ **Log all admin actions**:
  - ☐ User impersonation (start, end, target user, reason)
  - ☐ User/role modifications
  - ☐ Configuration changes
  - ☐ Data exports
  - ☐ Feature flag changes
- ☐ **Real-time alerts**: Security team notified of all high-privilege actions
- ☐ **Quarterly audit reviews**: Review admin access logs for anomalies

**References**: TM-013, TM-034

---

## 10. Incident Response & Resilience

**Goal**: Prepare for and respond to security incidents.

### 10.1 Incident Response Plan

- ☐ **Incident response playbook**: Documented procedures for common incidents:
  - ☐ Cross-tenant data breach
  - ☐ Compromised admin credentials
  - ☐ DDoS attack
  - ☐ Ransomware/data encryption
- ☐ **Incident response team**: Designated team members and on-call rotation
- ☐ **Communication plan**: Customer notification templates, regulatory reporting procedures
- ☐ **Tabletop exercises**: Quarterly incident response simulations
- ☐ **Evidence retention**: Preserve logs and forensic data during incidents

**References**: All threats (response capability)

### 10.2 Backup & Recovery

- ☐ **Automated backups**: Daily database backups, retained for 30 days
- ☐ **Backup encryption**: All backups encrypted at rest
- ☐ **Backup testing**: Monthly restore tests to verify backup integrity
- ☐ **Disaster recovery plan**: RTO/RPO defined (e.g., RTO: 4 hours, RPO: 1 hour)
- ☐ **Separate backup storage**: Backups stored in different AWS account/region

**References**: TM-026, availability threats

### 10.3 Security Incident Logging

- ☐ **Centralized incident log**: Track all security incidents (date, severity, impact, resolution)
- ☐ **Post-incident reviews**: Conduct blameless post-mortems for all incidents
- ☐ **Lessons learned documentation**: Update threat model and security controls based on incidents

**References**: Continuous improvement

---

## 11. Compliance & Regulatory

**Goal**: Meet regulatory and contractual security obligations.

### 11.1 GDPR Compliance

- ☐ **Data subject rights**: Implement data access, export, deletion capabilities
- ☐ **Privacy by design**: Data protection controls in architecture
- ☐ **Data minimization**: Collect only necessary data
- ☐ **Consent management**: Track and honor user consent preferences
- ☐ **Breach notification**: Process for notifying DPA within 72 hours
- ☐ **Data Processing Agreements**: DPAs with all subprocessors

**References**: Regulatory requirements

### 11.2 SOC 2 Type II

- ☐ **Security controls documentation**: Document all security controls
- ☐ **Access controls**: Least privilege, MFA, audit logging
- ☐ **Change management**: Formal change approval process
- ☐ **Vendor management**: Assess third-party security
- ☐ **Annual audit**: SOC 2 Type II audit by qualified firm

**References**: Compliance requirements

### 11.3 PCI DSS (if handling payment cards)

- ☐ **Tokenization**: Use Stripe/payment processor tokenization (avoid storing card data)
- ☐ **Network segmentation**: Isolate cardholder data environment
- ☐ **Encryption**: Encrypt cardholder data in transit and at rest
- ☐ **Access controls**: Restrict access to cardholder data
- ☐ **Quarterly scans**: ASV scans if applicable

**References**: Payment processing

---

## 12. Testing & Validation

**Goal**: Continuously validate security controls.

### 12.1 Security Testing

- ☐ **Automated security tests in CI/CD**:
  - ☐ Tenant isolation tests (Tenant A cannot access Tenant B)
  - ☐ Authorization tests (unauthorized requests return 403)
  - ☐ Input validation tests (reject malicious input)
- ☐ **Annual penetration testing**: Engage third-party pentest firm
- ☐ **Bug bounty program**: HackerOne or Bugcrowd for continuous testing
- ☐ **Red team exercises**: Annual red team engagement (advanced attack simulation)

**References**: All threats (testing validates mitigations)

### 12.2 Threat Model Maintenance

- ☐ **Quarterly threat model reviews**: Update threat model as architecture evolves
- ☐ **Threat model on architecture changes**: Review threat model before major releases
- ☐ **Post-incident threat model updates**: Incorporate lessons from security incidents
- ☐ **Stakeholder reviews**: Annual review with leadership and development teams

**References**: Continuous improvement

---

## Implementation Tracking

Use this checklist to track implementation progress. Update status:
- ☐ → 🔄 (In Progress) → ☑ (Implemented)
- Use ⚠️ for partially implemented (e.g., works in some components but not all)

**Recommended Approach**:
1. Review checklist with security and development teams
2. Prioritize items based on threat model severity (P0, P1, P2)
3. Assign owners for each section
4. Track progress in project management tool (Jira, GitHub Projects)
5. Review monthly in security working group
6. Update checklist as controls are implemented

---

**Related Documents**:
- [STRIDE Threat Analysis](05-threats-stride.md) - Detailed threat scenarios
- [Mitigation Roadmap](07-mitigations-roadmap.md) - Prioritized implementation plan
- [Assumptions and Scope](02-assumptions-and-scope.md) - Scope boundaries
