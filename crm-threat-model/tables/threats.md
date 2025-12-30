# Threats Table - Summary View

**Total Threats**: 35
**Last Updated**: 2025-12-29

For detailed threat descriptions, see [../docs/05-threats-stride.md](../docs/05-threats-stride.md)

---

## SPOOFING Threats (6)

| ID | Threat Title | Affected Components | Severity | OWASP | Priority | Owner |
|----|--------------|---------------------|----------|-------|----------|-------|
| TM-001 | JWT Token Theft via XSS | Web Client, CRM API | **HIGH** | A03:2021 Injection | P0 | App Team |
| TM-002 | Credential Stuffing Attack on Login | IdP, Web Client | **HIGH** | A07:2021 Auth | P0 | Platform Team |
| TM-003 | Phishing Attack Targeting Tenant Admins | IdP, Admin Users | **HIGH** | A07:2021 Auth | P1 | Platform + Security |
| TM-004 | Session Fixation Attack | Web Client, CRM API | MEDIUM | A07:2021 Auth | P2 | App Team |
| TM-005 | Refresh Token Replay Attack | IdP, Web Client | **HIGH** | A07:2021 Auth | P1 | Platform Team |
| TM-006 | Email Spoofing for Phishing | Email Provider, End Users | MEDIUM | N/A | P1 | Platform + Security |

---

## TAMPERING Threats (6)

| ID | Threat Title | Affected Components | Severity | OWASP | Priority | Owner |
|----|--------------|---------------------|----------|-------|----------|-------|
| TM-007 | SQL Injection via Unsanitized Input | CRM API, PostgreSQL | **HIGH** | A03:2021 Injection | P0 | App Team |
| TM-008 | Mass Assignment / Over-Posting Attack | CRM API | **HIGH** | A04:2021 Design | P0 | App Team |
| TM-009 | File Upload Tampering (Malicious File) | CRM API, Storage, Worker | **HIGH** | A04:2021 Design | P1 | App Team |
| TM-010 | Queue Message Tampering | Message Queue, Worker | MEDIUM | A08:2021 Integrity | P2 | App + Platform |
| TM-011 | HTML Injection in Generated Reports | Worker, Storage | MEDIUM | A03:2021 Injection | P2 | App Team |
| TM-012 | Data Tampering via Broken Access Control | CRM API | **HIGH** | A01:2021 Access | P0 | App Team |

---

## REPUDIATION Threats (4)

| ID | Threat Title | Affected Components | Severity | OWASP | Priority | Owner |
|----|--------------|---------------------|----------|-------|----------|-------|
| TM-013 | Missing Audit Logs for Admin Actions | Admin Portal, CRM API | MEDIUM | A09:2021 Logging | P0 | App + Security |
| TM-014 | Non-Repudiation Failure for Financial Transactions | Payment API, CRM API | MEDIUM | A09:2021 Logging | P1 | App + Finance |
| TM-015 | Log Tampering or Deletion by Attacker | Logging System, CRM API | **HIGH** | A09:2021 Logging | P1 | Platform + Security |
| TM-016 | Lack of User Action Logging | CRM API, Logging | LOW-MED | A09:2021 Logging | P2 | App Team |

---

## INFORMATION DISCLOSURE Threats (10)

| ID | Threat Title | Affected Components | Severity | OWASP | Priority | Owner |
|----|--------------|---------------------|----------|-------|----------|-------|
| TM-017 | **BOLA - Cross-Tenant Data Access** | CRM API | **HIGH** | API1:2023 BOLA | P0 | App Team |
| TM-018 | Excessive Data Exposure in API Responses | CRM API | MEDIUM-HIGH | API3:2023 Excessive | P1 | App Team |
| TM-019 | Object Storage Bucket Misconfiguration | S3/Azure Blob | **HIGH** | A05:2021 Misconfig | P0 | Platform Team |
| TM-020 | Sensitive Data in Application Logs | CRM API, Logging | MEDIUM-HIGH | A09:2021 Logging | P1 | App Team |
| TM-021 | Error Messages Exposing Internal Details | CRM API, Web Client | MEDIUM | A05:2021 Misconfig | P2 | App Team |
| TM-022 | IDOR in File Downloads | CRM API, Storage | **HIGH** | API1:2023 BOLA | P0 | App Team |
| TM-023 | Timing Attack Leaking User Existence | CRM API (login) | LOW | A07:2021 Auth | P2 | Platform Team |
| TM-024 | Cache Poisoning Leading to Data Leak | Redis Cache, CRM API | MEDIUM-HIGH | A08:2021 Integrity | P1 | App Team |
| TM-025 | Verbose API Responses Exposing Business Logic | CRM API | MEDIUM | API3:2023 Excessive | P2 | App Team |
| TM-026 | Unencrypted Backup Exposure | DB Backups, Storage | **HIGH** | A02:2021 Crypto | P1 | Platform Team |

---

## DENIAL OF SERVICE Threats (5)

| ID | Threat Title | Affected Components | Severity | OWASP | Priority | Owner |
|----|--------------|---------------------|----------|-------|----------|-------|
| TM-027 | Resource Exhaustion via Expensive Queries | CRM API, PostgreSQL | MEDIUM-HIGH | API4:2023 Resources | P1 | App Team |
| TM-028 | File Upload Abuse (Storage Exhaustion) | CRM API, Storage | MEDIUM | API4:2023 Resources | P1 | App + Platform |
| TM-029 | Queue Flooding Attack | Message Queue, Worker | MEDIUM | API4:2023 Resources | P1 | App Team |
| TM-030 | Regular Expression Denial of Service | CRM API (validation) | MEDIUM | A05:2021 Misconfig | P2 | App Team |
| TM-031 | Distributed Denial of Service (DDoS) | API Gateway, WAF, Infra | **HIGH** | N/A | P1 | Platform Team |

---

## ELEVATION OF PRIVILEGE Threats (4)

| ID | Threat Title | Affected Components | Severity | OWASP | Priority | Owner |
|----|--------------|---------------------|----------|-------|----------|-------|
| TM-032 | Privilege Escalation via RBAC Misconfiguration | CRM API, AuthZ System | **HIGH** | A01:2021 Access | P0 | App Team |
| TM-033 | SSRF via Import from URL Feature | Worker Service | **HIGH** | A10:2021 SSRF | P0 | App Team |
| TM-034 | Insecure Admin Impersonation Feature | Admin Portal, CRM API | **HIGH** | A01:2021 Access | P0 | App + Security |
| TM-035 | Privilege Escalation via Webhook Manipulation | CRM API (webhooks) | MEDIUM-HIGH | API10:2023 Unsafe API | P1 | App Team |

---

## Threats by Severity

### HIGH Severity (15 threats)

Critical threats requiring immediate attention:

1. **TM-001** - JWT Token Theft via XSS
2. **TM-002** - Credential Stuffing Attack
3. **TM-003** - Phishing Attack (Admins)
4. **TM-005** - Refresh Token Replay
5. **TM-007** - SQL Injection
6. **TM-008** - Mass Assignment
7. **TM-009** - Malicious File Upload
8. **TM-012** - Broken Access Control
9. **TM-015** - Log Tampering
10. **TM-017** - BOLA (Cross-Tenant) ⚠️ **CRITICAL**
11. **TM-019** - Public S3 Bucket
12. **TM-022** - IDOR in Files
13. **TM-026** - Unencrypted Backups
14. **TM-031** - DDoS
15. **TM-032** - Privilege Escalation (RBAC)
16. **TM-033** - SSRF
17. **TM-034** - Insecure Impersonation

### MEDIUM Severity (16 threats)

TM-004, TM-006, TM-010, TM-011, TM-013, TM-014, TM-018, TM-020, TM-021, TM-024, TM-025, TM-027, TM-028, TM-029, TM-030, TM-035

### LOW Severity (4 threats)

TM-016, TM-023

---

## Threats by Component

### CRM API (Most Critical Component)

**Threats**: TM-001, TM-007, TM-008, TM-012, TM-013, TM-017, TM-018, TM-020, TM-021, TM-022, TM-024, TM-025, TM-027, TM-029, TM-032, TM-034, TM-035

**Total**: 17 threats

**Top Threats**:
- TM-017 (BOLA - Cross-Tenant) - **CRITICAL**
- TM-007 (SQL Injection)
- TM-012 (Broken Access Control)
- TM-032 (Privilege Escalation)

---

### Authentication & Identity

**Components**: IdP, Web Client (tokens)

**Threats**: TM-001, TM-002, TM-003, TM-004, TM-005, TM-023

**Total**: 6 threats

**Top Threats**:
- TM-002 (Credential Stuffing)
- TM-003 (Phishing)
- TM-001 (Token Theft)

---

### Object Storage (S3/Azure Blob)

**Threats**: TM-009, TM-019, TM-022, TM-026, TM-028

**Total**: 5 threats

**Top Threats**:
- TM-019 (Public Bucket) - **CRITICAL**
- TM-022 (IDOR in Files)
- TM-026 (Unencrypted Backups)

---

### Background Workers

**Threats**: TM-009, TM-010, TM-011, TM-029, TM-033

**Total**: 5 threats

**Top Threats**:
- TM-033 (SSRF)
- TM-009 (Malicious Upload Processing)

---

## Threats by Priority

### P0 (Critical - 30 Days)

**Count**: 12 threats

TM-001, TM-002, TM-007, TM-008, TM-012, TM-013, TM-017, TM-019, TM-022, TM-032, TM-033, TM-034

**Focus**: Tenant isolation, authentication, authorization, logging

---

### P1 (High - 90 Days)

**Count**: 17 threats

TM-003, TM-005, TM-006, TM-009, TM-014, TM-015, TM-018, TM-020, TM-024, TM-026, TM-027, TM-028, TM-029, TM-031, TM-035

**Focus**: MFA, WAF, file security, backups, DoS protection

---

### P2 (Medium - 180 Days)

**Count**: 6 threats

TM-004, TM-010, TM-011, TM-016, TM-021, TM-023, TM-025, TM-030

**Focus**: Defense-in-depth, error handling, logging completeness

---

## Implementation Tracking

Use this table to track mitigation status:

| Threat ID | Mitigation Status | Target Date | Notes |
|-----------|-------------------|-------------|-------|
| TM-001 | ☐ Not Started | 2026-01-29 | httpOnly cookies + CSP |
| TM-002 | ☐ Not Started | 2026-01-29 | MFA + rate limiting |
| TM-007 | ☐ Not Started | 2026-01-29 | Parameterized queries |
| TM-017 | ☐ Not Started | 2026-01-29 | Tenant isolation tests |
| TM-019 | ☐ Not Started | 2026-01-29 | S3 Block Public Access |
| ... | | | |

**Legend**:
- ☐ Not Started
- 🔄 In Progress
- ☑ Implemented
- ✅ Validated (tested)

---

## Quick Reference

**Most Critical Threat**: TM-017 (BOLA - Cross-Tenant Data Access)
**Most Affected Component**: CRM API (17 threats)
**Most Common STRIDE Category**: Information Disclosure (10 threats)
**Most Common OWASP Category**: A01:2021 Broken Access Control

---

**Related Documents**:
- [STRIDE Threat Analysis (Full)](../docs/05-threats-stride.md) - Detailed attack scenarios
- [Mitigation Roadmap](../docs/07-mitigations-roadmap.md) - Implementation plan
- [Security Requirements Checklist](../docs/06-security-requirements-checklist.md) - Controls

---

**CSV Format**: See [threats.csv](threats.csv) for machine-readable data (import to Excel, Jira, etc.)
