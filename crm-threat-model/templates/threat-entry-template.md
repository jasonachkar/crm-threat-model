# Threat Entry Template

Use this template to document new threats as the system evolves.

---

## Threat ID: TM-XXX

**STRIDE Category**: [Spoofing | Tampering | Repudiation | Information Disclosure | Denial of Service | Elevation of Privilege]

**Threat Title**: [Short, descriptive title - e.g., "SQL Injection in Contact Search"]

**Affected Component(s)**: [List all components - e.g., "CRM API, PostgreSQL Database"]

**Asset(s) Impacted**: [What is at risk? - e.g., "Customer PII, Database Integrity"]

**OWASP Mapping**: [Map to OWASP Top 10 or API Top 10 - e.g., "A03:2021 - Injection" or "API1:2023 - BOLA"]

---

## Attack Scenario

**Detailed Attack Flow**:

1. [Step 1: What does the attacker do?]
2. [Step 2: How does the system respond?]
3. [Step 3: What vulnerability is exploited?]
4. [Step 4: What is the result?]

**Example**:
```
1. Attacker sends malicious input to search endpoint: GET /api/contacts/search?q=' OR '1'='1' --
2. Application constructs SQL query using string concatenation
3. SQL injection bypasses tenant filtering
4. Database returns all contacts across all tenants
```

**Preconditions** (what must be true for attack to succeed):
- [e.g., "SQL query uses string concatenation"]
- [e.g., "Input validation is missing or insufficient"]

**Threat Actor(s)**: [Who would execute this attack? - e.g., "TA-001 Opportunistic Attacker, TA-005 Malicious Tenant Admin"]

---

## Impact Analysis

**Confidentiality Impact**: [None | Low | Medium | High | Critical]
- **Description**: [What data is exposed?]

**Integrity Impact**: [None | Low | Medium | High | Critical]
- **Description**: [What data can be modified or deleted?]

**Availability Impact**: [None | Low | Medium | High | Critical]
- **Description**: [Is service disrupted?]

**Business Impact**:
- [e.g., "Regulatory fines (GDPR)"]
- [e.g., "Customer churn due to data breach"]
- [e.g., "Reputational damage"]

---

## Risk Assessment

**Likelihood**: [Low | Medium | High]
- **Justification**: [Why is this likely or unlikely? Consider attacker motivation, difficulty, existing controls]

**Severity**: [LOW | MEDIUM | HIGH]
- **Calculation**: [Based on Impact x Likelihood]

**Current Controls (if any)**:
- [e.g., "WAF with SQL injection rules (partial mitigation)"]
- [e.g., "Input length limits (does not prevent injection)"]

**Residual Risk (with current controls)**: [LOW | MEDIUM | HIGH]

---

## Detection & Telemetry

**How can this threat be detected?**

**Logs to Monitor**:
- [e.g., "WAF logs for SQL injection patterns"]
- [e.g., "Database slow query logs"]
- [e.g., "API error logs (SQL syntax errors)"]

**Alerts to Configure**:
- [e.g., "Alert on SQL syntax errors in application logs"]
- [e.g., "Alert on WAF blocking SQL injection attempts"]

**Anomalies to Watch**:
- [e.g., "Unusual query patterns (SELECT * from uncommon tables)"]
- [e.g., "Single user accessing cross-tenant data"]

---

## Mitigations

### Preventive Controls

**Primary Mitigation**:
- **Control**: [e.g., "Use parameterized queries / prepared statements"]
- **Implementation**: [How to implement - code example if helpful]
- **Owner**: [Application Team | Platform Team | Security Team]
- **Effort**: [1 day | 1 week | 1 month]
- **Priority**: [P0 | P1 | P2]

**Additional Preventive Controls**:
1. [e.g., "Input validation (allowlist expected characters)"]
2. [e.g., "Least-privilege database user (no DROP/ALTER)"]
3. [e.g., "ORM framework with auto-escaping"]

### Detective Controls

**Monitoring & Alerting**:
- [e.g., "SAST tools in CI/CD to detect SQL string concatenation"]
- [e.g., "WAF logging and alerting"]
- [e.g., "Database query logging"]

### Responsive Controls

**Incident Response**:
- [e.g., "Block attacker IP immediately"]
- [e.g., "Review database for unauthorized changes"]
- [e.g., "Restore from backup if data tampered"]

---

## Validation & Testing

**How to test for this vulnerability**:

**Manual Testing**:
- [e.g., "Submit SQL injection payload to search endpoint"]
- [e.g., "Expected result: 400 Bad Request or 403 Forbidden (NOT database error)"]

**Automated Testing**:
- [e.g., "Add SAST rule to detect SQL string concatenation"]
- [e.g., "Add integration test: attempt SQL injection, expect rejection"]

**Penetration Testing**:
- [e.g., "Include SQL injection in annual pentest scope"]

---

## References

**Related Threats**:
- [e.g., "TM-007 (existing SQL Injection threat)"]
- [e.g., "TM-017 (BOLA - tenant isolation failure)"]

**External References**:
- [OWASP SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [CWE-89: SQL Injection](https://cwe.mitre.org/data/definitions/89.html)
- [Relevant blog post, whitepaper, or CVE if applicable]

---

## Metadata

**Threat Identified By**: [Name / Team]
**Date Identified**: [YYYY-MM-DD]
**Status**: [Open | In Progress | Mitigated | Accepted Risk | Closed]
**Assigned To**: [Team / Individual]
**Target Remediation Date**: [YYYY-MM-DD]
**Actual Remediation Date**: [YYYY-MM-DD or N/A]

**Change Log**:
- [YYYY-MM-DD]: Threat identified and documented
- [YYYY-MM-DD]: Mitigation implemented
- [YYYY-MM-DD]: Validation testing completed

---

## Notes

[Any additional context, discussion points, or considerations]

---

**Template Version**: 1.0
**Last Updated**: 2025-12-29
