# Security Requirements Template

Use this template to document security requirements for new features or components.

---

## Feature / Component Name: [Feature Name]

**Description**: [Brief description of the feature or component]

**Owner**: [Product Team | Engineering Team]
**Security Reviewer**: [Security Team Member]
**Target Release**: [Version / Date]

---

## 1. Authentication & Authorization Requirements

### 1.1 Authentication

- ☐ **User authentication required**: [Yes | No | Partial - specify]
  - If Yes: [OIDC/OAuth 2.0 via IdP | API Key | Other]
- ☐ **JWT token validation**: [Required for all endpoints | Not applicable]
  - Signature verification
  - Expiration check
  - Issuer validation
  - Audience validation
- ☐ **MFA requirement**: [Mandatory | Recommended | Not required]
  - For which user roles: [Admin | All users | Specific roles]

### 1.2 Authorization

- ☐ **Role-based access control (RBAC)**: [Yes | No]
  - Required roles: [List roles - e.g., "Admin, Sales Manager, Sales Rep"]
  - Permissions model: [Describe - e.g., "Admin: full access, Sales Rep: own records only"]
- ☐ **Resource-level authorization**: [Yes | No | N/A]
  - Check ownership: `resource.owner_id == user.id` OR user has permission
  - Check tenant: `resource.tenant_id == user.tenant_id`
- ☐ **Admin-only endpoints**: [Yes | No]
  - If Yes, verify admin role on every request

**Authorization Test Cases**:
1. [e.g., "User A cannot access User B's resources (expect 403)"]
2. [e.g., "Tenant A cannot access Tenant B's resources (expect 403)"]
3. [e.g., "Non-admin cannot access admin endpoints (expect 403)"]

---

## 2. Tenant Isolation Requirements

**(Critical for multi-tenant systems)**

- ☐ **Tenant-scoped data**: [Yes | No | N/A]
  - All database queries include `WHERE tenant_id = :tenant`
  - `tenant_id` extracted from JWT token claims (NEVER from client input)
- ☐ **Row-level security (RLS)**: [Applied | Not applicable]
  - RLS policies active on tables: [List tables]
- ☐ **Object storage tenant scoping**: [Yes | No | N/A]
  - Object keys include tenant prefix: `tenant-{id}/...`
  - Signed URLs validate tenant ownership
- ☐ **Cache tenant namespacing**: [Yes | No | N/A]
  - Cache keys include: `tenant:{id}:...`

**Tenant Isolation Test Cases**:
1. [e.g., "User from Tenant A attempts to access Tenant B resource → expect 403"]
2. [e.g., "API returns only current tenant's data (no cross-tenant leakage)"]

---

## 3. Input Validation Requirements

- ☐ **Input validation applied**: [Yes - all inputs | Partial - specify | No]
  - Validation type: [Allowlist | Type checking | Length limits | Format validation]
- ☐ **Field allowlisting**: [Yes | No]
  - Only expected fields accepted (prevent mass assignment)
- ☐ **Schema validation**: [JSON Schema | OpenAPI | Custom | None]
- ☐ **SQL injection prevention**: [Parameterized queries | ORM | N/A (no DB access)]
- ☐ **XSS prevention**: [Output encoding | CSP | Framework auto-escaping | N/A]
- ☐ **File upload validation** (if applicable): [Yes | No | N/A]
  - File type validation (magic bytes, not just extension)
  - File size limits: [e.g., "10 MB max"]
  - Virus scanning: [Yes | No]
  - Allowed file types: [e.g., "PDF, PNG, JPG, DOCX only"]

**Input Validation Test Cases**:
1. [e.g., "Submit malicious input (SQL injection payload) → expect 400 Bad Request"]
2. [e.g., "Submit oversized input (10,000 chars) → expect 400 or truncated"]
3. [e.g., "Submit unexpected field (isAdmin=true) → expect 400 or field ignored"]

---

## 4. Data Protection Requirements

### 4.1 Encryption

- ☐ **Encryption in transit**: [TLS 1.2+ required | Not applicable]
  - All API calls: HTTPS only
  - Database connections: TLS/SSL
  - Third-party integrations: HTTPS
- ☐ **Encryption at rest**: [Yes | No | N/A]
  - Database: [Cloud provider encryption | Application-level | Not required]
  - Object storage: [S3 SSE | Azure encryption | Not required]
  - Backups: [Encrypted | Not required]

### 4.2 Sensitive Data Handling

- ☐ **PII/sensitive data**: [Yes - this feature handles PII | No]
  - If Yes, data types: [e.g., "Names, emails, phone numbers"]
  - Data classification: [Tier 1 Highly Sensitive | Tier 2 Confidential | Tier 3 Internal]
- ☐ **Logging restrictions**: [Redact PII | No sensitive data logged]
  - Fields to redact: [e.g., "password, token, ssn, credit card"]
- ☐ **Caching restrictions**: [Do not cache sensitive data | Cache with encryption | No restrictions]

**Data Protection Test Cases**:
1. [e.g., "Verify API uses HTTPS (attempt HTTP → expect redirect)"]
2. [e.g., "Verify logs do not contain passwords or tokens"]

---

## 5. Rate Limiting & Abuse Prevention

- ☐ **Rate limiting required**: [Yes | No]
  - Per-user limit: [e.g., "50 requests/sec"]
  - Per-tenant limit: [e.g., "1000 requests/min"]
  - Per-endpoint limit: [e.g., "10 requests/min for expensive operations"]
- ☐ **Resource consumption limits**: [Yes | No]
  - Pagination: [Max page size: e.g., "100 results"]
  - Query timeout: [e.g., "5 seconds"]
  - File upload limits: [e.g., "10 MB, 10 uploads/hour"]

**Abuse Prevention Test Cases**:
1. [e.g., "Exceed rate limit → expect 429 Too Many Requests"]
2. [e.g., "Request 10,000 results → expect paginated response (max 100)"]

---

## 6. Logging & Monitoring Requirements

- ☐ **Audit logging required**: [Yes | No]
  - Log events: [e.g., "All API requests, authentication attempts, authorization failures"]
  - Log format: [JSON structured logs]
  - Log fields: [timestamp, user_id, tenant_id, action, IP, user_agent, outcome]
- ☐ **Security event logging**: [Yes | No]
  - Events to log: [e.g., "Failed login, privilege escalation, admin actions"]
- ☐ **Alerting**: [Yes | No]
  - Alerts for: [e.g., "Repeated auth failures, unusual data access patterns"]

**Logging Test Cases**:
1. [e.g., "Perform action → verify audit log entry created"]
2. [e.g., "Attempt unauthorized action → verify authorization failure logged"]

---

## 7. Third-Party Integrations

(If feature integrates with external services)

- ☐ **Third-party service**: [Name - e.g., "Stripe, SendGrid"]
- ☐ **Data shared with third party**: [List data - e.g., "Email addresses, payment tokens"]
- ☐ **API key management**: [Stored in vault | Rotated every 90 days]
- ☐ **Webhook validation** (if applicable): [Signature validation required]
- ☐ **DPA/Contract in place**: [Yes | No | Pending]

**Third-Party Security Test Cases**:
1. [e.g., "Webhook received without valid signature → expect 401 or rejection"]
2. [e.g., "API key retrieved from vault (not hardcoded)"]

---

## 8. Error Handling & Information Disclosure

- ☐ **Generic error messages**: [Yes - no stack traces or internal details in production]
- ☐ **Error logging**: [Detailed errors logged server-side only]
- ☐ **HTTP status codes**: [Use standard codes - 200, 400, 401, 403, 404, 500]

**Error Handling Test Cases**:
1. [e.g., "Trigger error → verify response has generic message (no stack trace)"]
2. [e.g., "Verify detailed error logged server-side"]

---

## 9. Testing & Validation

### 9.1 Security Testing Required

- ☐ **Unit tests**: [Include security-focused tests]
- ☐ **Integration tests**: [Test authorization, tenant isolation]
- ☐ **Automated security tests**: [SAST, SCA in CI/CD]
- ☐ **Penetration testing**: [Include in annual pentest | Not required]

### 9.2 Security Review

- ☐ **Code review checklist**: [Security checklist completed]
- ☐ **Security team review**: [Required for high-risk features]
- ☐ **Threat modeling**: [Update threat model for significant features]

---

## 10. Compliance & Regulatory

- ☐ **GDPR compliance** (if handling PII):
  - Data subject rights: [Export, Delete capabilities]
  - Privacy by design: [Data minimization, encryption]
- ☐ **SOC 2 compliance**:
  - Audit logging, access controls, change management
- ☐ **PCI DSS** (if handling payment data):
  - Tokenization, no storage of CVV/PIN
- ☐ **Other regulations**: [HIPAA, CCPA, etc.]

---

## 11. Risk Assessment

**Security Risks Identified**:

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [e.g., "SQL Injection"] | [Low/Med/High] | [Low/Med/High] | [Parameterized queries] |
| [e.g., "Cross-tenant access"] | [Low/Med/High] | [Low/Med/High] | [Tenant ID validation from token] |

**Residual Risk**: [LOW | MEDIUM | HIGH]

**Risk Acceptance**: [Team accepts residual risk | Additional mitigations required]

---

## 12. Security Sign-Off

**Security Requirements Review**:
- ☐ All security requirements addressed
- ☐ Test cases defined and pass
- ☐ Code review completed with security focus
- ☐ Security team approval (if required)

**Reviewed By**: [Security Team Member Name]
**Review Date**: [YYYY-MM-DD]
**Approval Status**: [Approved | Approved with Conditions | Rejected - revise and resubmit]

**Conditions (if any)**:
1. [e.g., "Add integration test for tenant isolation before deployment"]
2. [e.g., "Complete penetration testing within 30 days post-launch"]

---

## 13. Deployment Checklist

- ☐ Security gates passed in CI/CD (SAST, SCA, secret scanning)
- ☐ Infrastructure security: TLS configured, WAF rules updated
- ☐ Secrets rotated (if new API keys added)
- ☐ Monitoring & alerting configured
- ☐ Incident response plan updated (if needed)
- ☐ Documentation updated (architecture diagrams, threat model)

---

## 14. Post-Deployment

**Monitoring Plan**:
- [e.g., "Monitor error rates for 1 week post-launch"]
- [e.g., "Review audit logs for unusual patterns"]

**Validation**:
- [e.g., "Run penetration test on new endpoints within 30 days"]
- [e.g., "Conduct security review after 90 days in production"]

---

## Notes

[Any additional security considerations, open questions, or follow-up items]

---

**Template Version**: 1.0
**Last Updated**: 2025-12-29
