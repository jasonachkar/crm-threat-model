# Mitigation Roadmap

## Introduction

This document provides a prioritized implementation roadmap for addressing the threats identified in the STRIDE analysis. Mitigations are categorized by priority (P0/P1/P2) based on risk severity, business impact, and implementation complexity.

**Priority Definitions**:
- **P0 (Critical)**: Address within 30 days - Severe business impact if exploited
- **P1 (High)**: Address within 90 days - Significant risk requiring near-term action
- **P2 (Medium)**: Address within 180 days - Important hardening, lower immediate risk

---

## P0: Critical Priority (30 Days)

These are **must-fix** vulnerabilities that pose catastrophic risk to the business, particularly cross-tenant data breaches.

### P0-1: Implement Tenant Isolation Verification Framework

**Threat IDs**: TM-017 (BOLA - Cross-Tenant Access), TM-007 (SQL Injection bypassing tenant filter)

**Problem**: No automated verification that tenant isolation is enforced in all database queries and API endpoints.

**Solution**:
1. **Automated Tenant Isolation Tests**:
   - Create test suite: "User from Tenant A attempts to access Tenant B resource → expect 403 Forbidden"
   - Test all CRUD endpoints: GET, POST, PUT, DELETE for contacts, deals, attachments, etc.
   - Run in CI/CD pipeline (deployment gate)

2. **Code Review Checklist**:
   - All database queries must include `WHERE tenant_id = :tenant` (extracted from JWT)
   - All file access must validate tenant ownership
   - All cache operations must use tenant-namespaced keys

3. **ORM Global Filters**:
   - Configure ORM (Sequelize, TypeORM, Prisma) to automatically add tenant filter to ALL queries
   - Set tenant context once per request (from JWT) and make immutable

**Effort**: 2 weeks (1 FTE)
**Owner**: Application Team
**Validation**: Run test suite on all endpoints; code review of all queries
**Success Criteria**: 100% of tenant-scoped endpoints have passing tenant isolation tests

---

### P0-2: Implement Mandatory JWT Validation

**Threat IDs**: TM-001 (Token Theft), TM-004 (Session Fixation), TM-005 (Refresh Token Replay)

**Problem**: Inconsistent or incomplete JWT validation across services.

**Solution**:
1. **Centralized JWT Middleware**:
   - Create authentication middleware that validates ALL incoming requests
   - Validation checks:
     - Signature verification (using JWKS public keys from IdP)
     - Issuer (`iss`) matches expected IdP URL
     - Audience (`aud`) matches application ID
     - Expiration (`exp` > current time)
     - Not-before (`nbf` <= current time)
   - Extract `tenant_id` and `user_id` from claims, set in request context

2. **Apply middleware to ALL API routes** (except public health check endpoint)

3. **Token Storage Best Practice**:
   - Move tokens from localStorage to httpOnly, secure, SameSite cookies
   - Update web client to use cookie-based authentication

**Effort**: 1 week (1 FTE)
**Owner**: Application Team
**Validation**: Attempt API call with invalid/expired JWT → expect 401
**Success Criteria**: All API endpoints require valid JWT; tokens stored securely

---

### P0-3: Enable Comprehensive Audit Logging for Admin Actions

**Threat IDs**: TM-013 (Missing Audit Logs), TM-034 (Insecure Impersonation)

**Problem**: Admin actions (impersonation, data exports, privilege changes) not fully logged.

**Solution**:
1. **Implement Audit Log Service**:
   - Log format (JSON): `{"timestamp": "...", "admin_user_id": "...", "action": "impersonate", "target_tenant_id": "...", "target_user_id": "...", "reason": "Support ticket #123", "ip": "...", "outcome": "success"}`
   - Log all admin actions:
     - User impersonation (start, end, reason)
     - User/role modifications
     - Data exports
     - Configuration changes
   - Send logs to immutable storage (S3 with object lock or SIEM)

2. **Real-time Alerting**:
   - Alert security team on all impersonation events
   - Alert on privilege escalation (role changes to admin)

3. **User Notifications**:
   - Email user when admin impersonates their account

**Effort**: 1.5 weeks (1 FTE)
**Owner**: Application Team + Security Team
**Validation**: Perform test impersonation; verify log entry and alert
**Success Criteria**: All admin actions logged with full context

---

### P0-4: Implement Row-Level Security (RLS) in Database

**Threat IDs**: TM-017 (Cross-Tenant Access), TM-007 (SQL Injection)

**Problem**: Tenant isolation relies solely on application-layer filters; database has no defense-in-depth.

**Solution**:
1. **Enable Row-Level Security Policies** in PostgreSQL:
   ```sql
   ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

   CREATE POLICY tenant_isolation_contacts ON contacts
     USING (tenant_id = current_setting('app.tenant_id')::text);
   ```
   - Apply to all tenant-scoped tables: contacts, deals, attachments_metadata, etc.

2. **Set Session Variable**:
   - Connection pool sets `app.tenant_id` session variable on every connection:
     ```sql
     SET app.tenant_id = 'tenant-123';
     ```
   - Application sets this based on JWT tenant_id at request start

3. **Test RLS**:
   - Attempt direct SQL query for cross-tenant data → expect 0 rows returned

**Effort**: 1 week (1 FTE)
**Owner**: Application Team + Platform Team
**Validation**: Run SQL query bypassing app (set wrong tenant_id) → expect no rows
**Success Criteria**: All tenant-scoped tables have RLS policies active

---

### P0-5: Deploy Rate Limiting (API Gateway + Application Layer)

**Threat IDs**: TM-002 (Credential Stuffing), TM-027 (Expensive Queries), TM-028 (File Upload Abuse), TM-029 (Queue Flooding)

**Problem**: No rate limiting allows brute force, resource exhaustion, and abuse.

**Solution**:
1. **API Gateway Rate Limits**:
   - Global: 1000 req/sec
   - Per-IP: 100 req/sec
   - Return `429 Too Many Requests` with `Retry-After` header

2. **Application-Layer Rate Limits** (Redis-backed):
   - Per-user: 50 req/sec
   - Per-tenant: Configurable (e.g., 1000 req/min for free tier)
   - Per-endpoint (expensive operations):
     - Search: 10 req/min per user
     - Report generation: 5 req/hour per user
     - File upload: 10 uploads/hour per user
   - Login endpoint: 10 attempts per 15 minutes per IP/email

3. **Monitoring**:
   - Track rate limit violations (alert on excessive violations from same IP/user)

**Effort**: 1 week (1 FTE)
**Owner**: Application Team
**Validation**: Exceed rate limit → expect 429 response
**Success Criteria**: All critical endpoints have rate limits

---

### P0-6: Secure Object Storage (Block Public Access + Signed URLs)

**Threat IDs**: TM-019 (Public Bucket Exposure), TM-022 (IDOR in File Downloads)

**Problem**: Risk of S3 bucket misconfiguration exposing all files.

**Solution**:
1. **Enable S3 Block Public Access** at account level (AWS)
   - Block all public ACLs and bucket policies
   - Verify with AWS Config rule: `s3-bucket-public-read-prohibited`

2. **Bucket Policy**: Explicitly deny public access
   ```json
   {
     "Effect": "Deny",
     "Principal": "*",
     "Action": "s3:GetObject",
     "Resource": "arn:aws:s3:::crm-attachments/*",
     "Condition": {
       "StringNotEquals": {"aws:PrincipalAccount": "123456789012"}
     }
   }
   ```

3. **Use Signed URLs ONLY**:
   - All file access via pre-signed URLs (15-minute expiration)
   - Validate tenant ownership before generating signed URL:
     ```
     if (file.tenant_id !== user.tenant_id) return 403;
     signedUrl = s3.getSignedUrl('getObject', { Bucket, Key, Expires: 900 });
     ```

**Effort**: 3 days (0.5 FTE)
**Owner**: Platform Team
**Validation**: Attempt direct S3 access → expect access denied; test signed URL authorization
**Success Criteria**: Bucket is private; all file access via authorized signed URLs

---

### P0-7: Implement Parameterized Queries / SQL Injection Prevention

**Threat IDs**: TM-007 (SQL Injection)

**Problem**: Risk of SQL injection if queries use string concatenation.

**Solution**:
1. **Code Audit**:
   - Search codebase for SQL string concatenation: `grep -r "SELECT.*\${" --include="*.js"`
   - Replace all concatenated queries with parameterized queries:
     ```javascript
     // BAD:
     const query = `SELECT * FROM contacts WHERE name = '${userInput}'`;

     // GOOD:
     const query = 'SELECT * FROM contacts WHERE name = $1';
     db.query(query, [userInput]);
     ```

2. **Enforce ORM Usage**:
   - Use ORM (Sequelize, Prisma) for all queries (ORM auto-escapes)
   - Raw SQL only allowed in exceptional cases with security review

3. **SAST Integration**:
   - Enable SonarQube or Snyk Code in CI/CD
   - Fail build on SQL injection vulnerabilities

**Effort**: 2 weeks (1-2 FTE, depending on codebase size)
**Owner**: Application Team
**Validation**: SAST scan passes; manual code review
**Success Criteria**: Zero SQL concatenation in codebase; ORM enforced

---

## Quick Wins (Part of P0 - Low Effort, High Impact)

These can be implemented quickly and provide significant security benefit:

### QW-1: Enable HTTP Security Headers (1 day)
- Add to API responses:
  ```
  Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  ```
- **Effort**: 1 day
- **Threats Mitigated**: TM-001 (XSS), clickjacking

### QW-2: Redact Sensitive Data from Logs (2 days)
- Implement log redaction middleware:
  ```javascript
  logger.info('API Request', redact(req.body, ['password', 'token', 'ssn', 'creditCard']));
  ```
- **Effort**: 2 days
- **Threats Mitigated**: TM-020 (Sensitive Data in Logs)

### QW-3: Generic Error Messages in Production (1 day)
- Return `500 Internal Server Error` (no stack traces) in production
- Log detailed errors server-side only
- **Effort**: 1 day
- **Threats Mitigated**: TM-021 (Error Message Info Disclosure)

### QW-4: Enforce HTTPS Redirect (1 day)
- Redirect all HTTP requests to HTTPS
- **Effort**: 1 day
- **Threats Mitigated**: Man-in-the-middle attacks

---

## P1: High Priority (90 Days)

These mitigations address significant risks and should be completed within 90 days.

### P1-1: Implement Multi-Factor Authentication (MFA)

**Threat IDs**: TM-002 (Credential Stuffing), TM-003 (Phishing)

**Solution**:
1. **MFA Mandatory for All Admins**:
   - Configure IdP to require MFA for admin role
   - Use phishing-resistant MFA (WebAuthn/FIDO2) for admins

2. **MFA Recommended for All Users**:
   - Offer TOTP (Google Authenticator) or SMS
   - Enforce MFA for high-value tenants (configurable)

3. **Conditional Access Policies**:
   - Require MFA on login from new device/location

**Effort**: 2 weeks (1 FTE)
**Owner**: Platform Team (IdP configuration)

---

### P1-2: Deploy Web Application Firewall (WAF)

**Threat IDs**: TM-007 (SQL Injection), TM-001 (XSS), TM-031 (DDoS)

**Solution**:
1. **Enable AWS WAF / Cloudflare**
2. **Enable OWASP Core Rule Set**
3. **Custom Rules**:
   - Block SQL injection patterns
   - Block XSS payloads
   - Rate limiting (100 req/sec per IP)
4. **Monitor WAF logs** for blocked requests

**Effort**: 1 week (1 FTE)
**Owner**: Platform Team

---

### P1-3: Implement SAST/SCA in CI/CD Pipeline

**Threat IDs**: All (Preventive measure)

**Solution**:
1. **Static Application Security Testing (SAST)**: SonarQube, Snyk Code, or Checkmarx
2. **Software Composition Analysis (SCA)**: Snyk, Dependabot, WhiteSource
3. **Secret Scanning**: GitGuardian, Gitleaks
4. **Container Scanning**: Trivy, Clair
5. **Fail Build on Critical Vulns**: Block deployment if critical/high vulnerabilities found

**Effort**: 2 weeks (1 FTE)
**Owner**: Platform Team + Security Team

---

### P1-4: Implement Virus Scanning on File Uploads

**Threat IDs**: TM-009 (Malicious File Upload)

**Solution**:
1. **Integrate ClamAV** or cloud-based scanner (e.g., AWS GuardDuty for S3, VirusTotal API)
2. **Scan all uploads** before storing in S3
3. **Quarantine malicious files** (move to separate bucket)
4. **Notify user** if file rejected

**Effort**: 1 week (1 FTE)
**Owner**: Application Team

---

### P1-5: Implement Webhook Signature Validation

**Threat IDs**: TM-035 (Webhook Manipulation), TM-010 (Queue Tampering)

**Solution**:
1. **Validate Stripe Webhooks**:
   ```javascript
   const sig = req.headers['stripe-signature'];
   const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
   ```
2. **Validate SendGrid Webhooks** (verify signature header)
3. **Idempotency**: Track processed event IDs to prevent replay

**Effort**: 3 days (0.5 FTE)
**Owner**: Application Team

---

### P1-6: Create Incident Response Playbook

**Threat IDs**: All (Response capability)

**Solution**:
1. **Develop Playbooks**:
   - Cross-tenant data breach response
   - Compromised admin account
   - DDoS attack
   - Ransomware/data encryption
2. **Define Roles**: Incident commander, comms lead, technical lead
3. **Communication Templates**: Customer notification, regulatory reporting
4. **Conduct Tabletop Exercises**: Quarterly incident simulations

**Effort**: 2 weeks (0.5 FTE)
**Owner**: Security Team

---

### P1-7: Implement Admin Impersonation Controls

**Threat IDs**: TM-034 (Insecure Impersonation)

**Solution**:
1. **MFA Required**: Admin must re-authenticate with MFA before impersonation
2. **Justification Required**: Ticket number mandatory
3. **Time-Limited**: Sessions expire after 30 minutes
4. **Read-Only Default**: Impersonation grants view access; writes require approval
5. **User Notification**: Email user when impersonated

**Effort**: 1.5 weeks (1 FTE)
**Owner**: Application Team

---

### P1-8: Implement Backup Encryption

**Threat IDs**: TM-026 (Unencrypted Backup Exposure)

**Solution**:
1. **Enable RDS Encryption** at rest (if not already enabled)
2. **Encrypt S3 backups**: SSE-S3 or SSE-KMS
3. **Separate Backup Account**: Store backups in different AWS account
4. **Test Restoration**: Monthly restore tests

**Effort**: 1 week (1 FTE)
**Owner**: Platform Team

---

### P1-9: Implement Anomaly Detection for User Behavior

**Threat IDs**: TM-001 (Token Theft), TM-002 (Credential Stuffing), TM-017 (BOLA)

**Solution**:
1. **Login Anomaly Detection**:
   - Alert on login from new device/location
   - Alert on concurrent sessions from different geolocations
2. **API Usage Anomalies**:
   - Alert on unusually high volume of requests
   - Alert on accessing unusual number of resources
3. **SIEM Integration**: Forward anomaly alerts to SIEM

**Effort**: 2 weeks (1 FTE)
**Owner**: Security Team + Application Team

---

## P2: Medium Priority (180 Days)

These are defense-in-depth measures and lower-priority hardening.

### P2-1: Implement Field-Level Encryption for PII

**Threat IDs**: TM-019 (Data Exposure), TM-026 (Backup Exposure)

**Solution**:
- Encrypt sensitive fields (SSN, credit card) with tenant-specific keys
- Use AWS KMS or application-level encryption

**Effort**: 3 weeks (1 FTE)
**Owner**: Application Team

---

### P2-2: Implement DDoS Protection

**Threat IDs**: TM-031 (DDoS)

**Solution**:
- Enable AWS Shield Standard (automatic and free)
- Consider AWS Shield Advanced for larger attacks ($3K/month)
- OR: Use Cloudflare for DDoS protection

**Effort**: 1 week (1 FTE)
**Owner**: Platform Team

---

### P2-3: Implement Content Security Policy (CSP)

**Threat IDs**: TM-001 (XSS)

**Solution**:
- Enable strict CSP: `Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'; report-uri /csp-report`
- Gradually tighten policy (start with report-only mode)

**Effort**: 2 weeks (1 FTE)
**Owner**: Application Team

---

### P2-4: Conduct Penetration Testing

**Threat IDs**: All (Validation)

**Solution**:
- Engage third-party pentest firm (annual)
- Focus on multi-tenant isolation, authorization, and injection attacks

**Effort**: 2 weeks (external vendor) + 1 week (remediation)
**Owner**: Security Team

---

### P2-5: Implement SSRF Protection

**Threat IDs**: TM-033 (SSRF)

**Solution** (if "import from URL" feature exists):
- URL allowlist for trusted domains
- Block private IP ranges (10.x, 192.168.x, 169.254.x)
- Use proxy for outbound requests

**Effort**: 1 week (1 FTE)
**Owner**: Application Team

---

### P2-6: Implement Regular Expression Timeout

**Threat IDs**: TM-030 (ReDoS)

**Solution**:
- Use safe regex patterns (avoid nested quantifiers)
- Use regex timeout library (e.g., `safe-regex` in Node.js)
- Limit input length (max 255 chars for email, etc.)

**Effort**: 3 days (0.5 FTE)
**Owner**: Application Team

---

### P2-7: Establish Security Champions Program

**Threat IDs**: All (Cultural/process improvement)

**Solution**:
- Train 1-2 developers per team as "security champions"
- Security champions review PRs for security issues
- Monthly security training sessions

**Effort**: Ongoing (1-2 hours/month per team)
**Owner**: Security Team + Engineering Managers

---

## Implementation Schedule

### Month 1 (P0 Focus)
- **Week 1-2**: P0-1 (Tenant Isolation Tests), P0-2 (JWT Validation)
- **Week 3**: P0-3 (Audit Logging), P0-4 (RLS)
- **Week 4**: P0-5 (Rate Limiting), P0-6 (S3 Security), P0-7 (SQL Injection Fix - start)
- **Quick Wins**: QW-1 through QW-4 (complete in parallel)

### Month 2-3 (P0 Completion + P1 Start)
- **Complete**: P0-7 (SQL Injection Fix)
- **Start P1**: P1-1 (MFA), P1-2 (WAF), P1-3 (SAST/SCA)
- **Progress**: P1-4 (Virus Scanning), P1-5 (Webhook Validation)

### Month 4-6 (P1 Focus)
- **Complete**: All P1 items
- **Start P2**: Begin P2-1 (Field-Level Encryption)

### Month 7-12 (P2 Completion)
- **Complete**: All P2 items
- **Annual**: P2-4 (Penetration Testing)

---

## Resource Allocation

**Engineering Effort Summary**:
- **P0**: 8-10 weeks FTE
- **P1**: 12-14 weeks FTE
- **P2**: 8-10 weeks FTE
- **Total**: 28-34 weeks FTE (spread across 12 months, ~3-4 FTE dedicated)

**Budget Estimate** (Tooling & Services):
- SIEM/Logging: $25K-50K/year
- SAST/SCA Tools: $15K-30K/year
- WAF (AWS WAF or Cloudflare): $10K-20K/year
- Penetration Testing: $30K-50K (annual)
- DDoS Protection (Shield Advanced): $36K/year (optional)
- **Total**: $80K-150K/year

---

## Success Metrics

Track progress using these KPIs:

1. **Vulnerability Remediation Rate**:
   - P0 vulnerabilities resolved within 30 days: 100%
   - P1 vulnerabilities resolved within 90 days: 100%
   - P2 vulnerabilities resolved within 180 days: 100%

2. **Security Testing Coverage**:
   - % of API endpoints with tenant isolation tests: Target 100%
   - % of code covered by SAST: Target 80%+

3. **Incident Detection**:
   - Mean Time to Detect (MTTD): < 1 hour for critical incidents
   - Mean Time to Respond (MTTR): < 4 hours for critical incidents

4. **Audit Compliance**:
   - % of admin actions logged: 100%
   - % of authentication events logged: 100%

5. **External Validation**:
   - Penetration test findings: 0 critical, < 3 high-severity by year-end
   - Bug bounty valid submissions: Track and trend

---

## Next Steps

1. **Review with Stakeholders**: Present roadmap to engineering leadership and security team
2. **Assign Owners**: Designate team members for each workstream
3. **Create Jira Epics**: Track work in project management tool
4. **Monthly Reviews**: Security working group reviews progress monthly
5. **Adjust Priorities**: Reprioritize based on emerging threats or business changes

---

**Related Documents**:
- [STRIDE Threat Analysis](05-threats-stride.md) - Detailed threat scenarios
- [Security Requirements Checklist](06-security-requirements-checklist.md) - Detailed requirements
- [Executive Summary](00-executive-summary.md) - Business case for investment
