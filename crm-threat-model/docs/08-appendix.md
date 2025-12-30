# Appendix

## A. References & Resources

### STRIDE Threat Modeling
- **Microsoft STRIDE Methodology**: https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats
- **Threat Modeling Manifesto**: https://www.threatmodelingmanifesto.org/
- **OWASP Threat Modeling**: https://owasp.org/www-community/Threat_Modeling

### OWASP Resources
- **OWASP Top 10 (2021)**: https://owasp.org/Top10/
- **OWASP API Security Top 10 (2023)**: https://owasp.org/API-Security/editions/2023/en/0x11-t10/
- **OWASP Cheat Sheet Series**: https://cheatsheetseries.owasp.org/
  - Authentication: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
  - Authorization: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
  - SQL Injection Prevention: https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html
  - XSS Prevention: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- **OWASP ASVS (Application Security Verification Standard)**: https://owasp.org/www-project-application-security-verification-standard/

### Multi-Tenant Security
- **AWS SaaS Tenant Isolation Strategies**: https://docs.aws.amazon.com/whitepapers/latest/saas-tenant-isolation-strategies/saas-tenant-isolation-strategies.html
- **NIST SP 800-144 (Cloud Security)**: https://csrc.nist.gov/publications/detail/sp/800-144/final
- **CSA (Cloud Security Alliance) Guidance**: https://cloudsecurityalliance.org/

### Industry Standards
- **NIST Cybersecurity Framework**: https://www.nist.gov/cyberframework
- **CIS Controls**: https://www.cisecurity.org/controls
- **ISO/IEC 27001**: Information Security Management
- **SOC 2 Trust Service Criteria**: https://us.aicpa.org/soc2

### Regulatory & Compliance
- **GDPR (EU)**: https://gdpr.eu/
- **CCPA (California)**: https://oag.ca.gov/privacy/ccpa
- **PCI DSS**: https://www.pcisecuritystandards.org/

### Attack Frameworks
- **MITRE ATT&CK**: https://attack.mitre.org/
- **Common Weakness Enumeration (CWE)**: https://cwe.mitre.org/
- **CVE Database**: https://cve.mitre.org/

---

## B. Glossary

| Term | Definition |
|------|------------|
| **API** | Application Programming Interface - programmatic interface for accessing application functionality |
| **BOLA** | Broken Object Level Authorization - attacker accessing resources without proper authorization (OWASP API #1) |
| **CSP** | Content Security Policy - HTTP header to prevent XSS attacks |
| **DAST** | Dynamic Application Security Testing - testing running applications for vulnerabilities |
| **DDoS** | Distributed Denial of Service - attack overwhelming system with traffic |
| **DTO** | Data Transfer Object - object pattern for controlling API input/output fields |
| **GDPR** | General Data Protection Regulation - EU privacy regulation |
| **HMAC** | Hash-based Message Authentication Code - cryptographic signature for message integrity |
| **IDOR** | Insecure Direct Object Reference - accessing resources by guessing IDs |
| **IdP** | Identity Provider - service for authentication (Auth0, Entra ID, Okta) |
| **IaC** | Infrastructure as Code - managing infrastructure via code (Terraform, CloudFormation) |
| **JWT** | JSON Web Token - signed token format for authentication |
| **JWKS** | JSON Web Key Set - public keys for verifying JWT signatures |
| **MFA** | Multi-Factor Authentication - authentication requiring multiple factors (password + code) |
| **MTTR** | Mean Time To Respond - average time to respond to security incidents |
| **OIDC** | OpenID Connect - authentication protocol built on OAuth 2.0 |
| **ORM** | Object-Relational Mapping - library for database access (Sequelize, Prisma) |
| **PII** | Personally Identifiable Information - data identifying individuals |
| **PKCE** | Proof Key for Code Exchange - OAuth extension preventing authorization code interception |
| **RBAC** | Role-Based Access Control - authorization based on user roles |
| **ReDoS** | Regular Expression Denial of Service - attack via complex regex patterns |
| **RLS** | Row-Level Security - database-enforced data access policies |
| **SAST** | Static Application Security Testing - analyzing source code for vulnerabilities |
| **SCA** | Software Composition Analysis - scanning dependencies for vulnerabilities |
| **SIEM** | Security Information and Event Management - centralized log analysis |
| **SOC 2** | Service Organization Control 2 - security audit framework |
| **SPA** | Single-Page Application - web app loading single HTML page (React, Angular) |
| **SPF/DKIM/DMARC** | Email authentication standards preventing spoofing |
| **SSRF** | Server-Side Request Forgery - attacker causing server to make unintended requests |
| **STRIDE** | Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege |
| **TLS** | Transport Layer Security - encryption protocol for data in transit |
| **TOTP** | Time-Based One-Time Password - MFA code changing every 30 seconds |
| **WAF** | Web Application Firewall - filters malicious HTTP traffic |
| **XSS** | Cross-Site Scripting - injecting malicious scripts into web pages |
| **XXE** | XML External Entity - attack exploiting XML parsers |

---

## C. Threat Mapping to OWASP Top 10 (2021)

| OWASP Category | Related Threats | Notes |
|----------------|-----------------|-------|
| **A01:2021 - Broken Access Control** | TM-012 (Data Tampering), TM-017 (BOLA), TM-032 (Privilege Escalation) | Most critical category; #1 risk |
| **A02:2021 - Cryptographic Failures** | TM-026 (Unencrypted Backups) | Encryption at rest/transit |
| **A03:2021 - Injection** | TM-007 (SQL Injection), TM-001 (XSS), TM-011 (HTML Injection) | Parameterized queries, output encoding |
| **A04:2021 - Insecure Design** | TM-008 (Mass Assignment), TM-035 (Webhook Manipulation) | Design flaws, not implementation bugs |
| **A05:2021 - Security Misconfiguration** | TM-019 (Public S3), TM-021 (Verbose Errors), TM-030 (ReDoS) | Default configs, unnecessary features |
| **A06:2021 - Vulnerable and Outdated Components** | (General supply chain risk) | Addressed via SCA in CI/CD |
| **A07:2021 - Identification and Authentication Failures** | TM-002 (Credential Stuffing), TM-003 (Phishing), TM-004 (Session Fixation), TM-005 (Token Replay) | MFA, session management |
| **A08:2021 - Software and Data Integrity Failures** | TM-009 (Malicious Upload), TM-010 (Queue Tampering), TM-024 (Cache Poisoning) | Integrity validation |
| **A09:2021 - Security Logging and Monitoring Failures** | TM-013 (Missing Audit Logs), TM-014 (Non-Repudiation), TM-015 (Log Tampering), TM-016 (Lack of User Logs) | Comprehensive logging |
| **A10:2021 - Server-Side Request Forgery (SSRF)** | TM-033 (SSRF via Import URL) | URL validation, IP blocking |

---

## D. Threat Mapping to OWASP API Security Top 10 (2023)

| OWASP API Category | Related Threats | Notes |
|--------------------|-----------------|-------|
| **API1:2023 - Broken Object Level Authorization** | TM-017 (BOLA Cross-Tenant), TM-012 (Broken Access Control), TM-022 (IDOR Files) | Resource-level authorization required |
| **API2:2023 - Broken Authentication** | TM-001 (Token Theft), TM-002 (Credential Stuffing), TM-005 (Token Replay) | JWT validation, MFA |
| **API3:2023 - Broken Object Property Level Authorization** | TM-018 (Excessive Data Exposure), TM-008 (Mass Assignment) | Field-level authorization, DTOs |
| **API4:2023 - Unrestricted Resource Consumption** | TM-027 (Expensive Queries), TM-028 (File Upload Abuse), TM-029 (Queue Flooding) | Rate limiting, quotas |
| **API5:2023 - Broken Function Level Authorization** | TM-032 (RBAC Misconfiguration) | Admin endpoints require role checks |
| **API6:2023 - Unrestricted Access to Sensitive Business Flows** | TM-025 (Business Logic Exposure) | Business logic on server-side |
| **API7:2023 - Server Side Request Forgery** | TM-033 (SSRF) | URL validation, IP allowlisting |
| **API8:2023 - Security Misconfiguration** | TM-019 (Public S3), TM-021 (Verbose Errors) | Secure defaults |
| **API9:2023 - Improper Inventory Management** | (General API documentation/inventory) | Maintain API inventory |
| **API10:2023 - Unsafe Consumption of APIs** | TM-035 (Webhook Manipulation) | Validate third-party API responses |

---

## E. Compliance Mapping

### SOC 2 Trust Service Criteria

| TSC | Related Controls | Evidence |
|-----|------------------|----------|
| **CC6.1 - Logical Access** | JWT validation, RBAC, tenant isolation | Access control tests, audit logs |
| **CC6.2 - Authentication** | OIDC/OAuth 2.0, MFA | IdP configuration, MFA enforcement policies |
| **CC6.3 - Authorization** | Resource-level authorization checks | Authorization tests, code reviews |
| **CC6.6 - Logical Access - Removal/Modification** | Admin audit logs, privilege change alerts | Audit log samples, alert configurations |
| **CC7.2 - System Monitoring** | SIEM, anomaly detection, alerts | SIEM dashboards, alert configurations |
| **CC7.3 - Environmental Threats** | DDoS protection, infrastructure resilience | AWS Shield configuration, auto-scaling |
| **CC7.4 - Assessment of Risk** | Threat modeling (this document) | Annual threat model review |

### GDPR Requirements

| GDPR Article | Related Controls | Implementation |
|--------------|------------------|----------------|
| **Art. 5(1)(f) - Security** | Encryption, access controls, audit logging | TLS, encryption at rest, RBAC |
| **Art. 15 - Right of Access** | Data export API | `/api/data-subject/export` endpoint |
| **Art. 17 - Right to Erasure** | Data deletion API | `/api/data-subject/delete` endpoint |
| **Art. 25 - Data Protection by Design** | Threat model, tenant isolation, field-level encryption | This document, RLS policies |
| **Art. 32 - Security of Processing** | Encryption, pseudonymization, security testing | Encryption keys, pentest reports |
| **Art. 33 - Breach Notification** | Incident response playbook | Notification templates (< 72 hours) |

---

## F. Tool Recommendations

### Security Testing Tools

| Category | Tool | Purpose | License/Cost |
|----------|------|---------|--------------|
| **SAST** | SonarQube | Static code analysis | Free (Community) / Paid (Enterprise) |
| **SAST** | Snyk Code | Security-focused SAST | Free tier / Paid |
| **SCA** | Snyk Open Source | Dependency vulnerability scanning | Free tier / Paid |
| **SCA** | Dependabot | GitHub-native dependency alerts | Free (GitHub) |
| **Secret Scanning** | GitGuardian | Detect secrets in code | Free tier / Paid |
| **Secret Scanning** | Gitleaks | Open-source secret detection | Free (Open Source) |
| **Container Scanning** | Trivy | Docker image vulnerability scanner | Free (Open Source) |
| **IaC Scanning** | Checkov | Terraform/CloudFormation security | Free (Open Source) |
| **DAST** | OWASP ZAP | Dynamic app security testing | Free (Open Source) |
| **DAST** | Burp Suite | Web app penetration testing | Free (Community) / Paid (Pro) |

### Monitoring & Logging

| Category | Tool | Purpose | Cost |
|----------|------|---------|------|
| **SIEM** | Splunk | Enterprise SIEM | Paid (volume-based) |
| **SIEM** | Datadog Security Monitoring | Cloud-native SIEM | Paid (per host) |
| **SIEM** | Elastic Security | Open-source SIEM | Free (Open Source) / Paid (Enterprise) |
| **Log Management** | AWS CloudWatch | AWS-native logging | Pay-per-GB |
| **APM** | Datadog APM | Application performance + security | Paid (per host) |

### Infrastructure Security

| Category | Tool | Purpose | Cost |
|----------|------|---------|------|
| **WAF** | AWS WAF | Web application firewall | Pay-per-request |
| **WAF** | Cloudflare | CDN + WAF + DDoS protection | Free tier / Paid |
| **DDoS** | AWS Shield | DDoS mitigation | Free (Standard) / $3K/mo (Advanced) |
| **Secrets Management** | AWS Secrets Manager | Secure secrets storage | Pay-per-secret |
| **Secrets Management** | HashiCorp Vault | Enterprise secret management | Free (Open Source) / Paid (Enterprise) |

---

## G. Incident Response Contacts

**Internal Contacts**:
- **Security Team Lead**: security-lead@example.com
- **On-Call Engineer**: Pager Duty rotation
- **Legal/Compliance**: legal@example.com
- **Customer Support**: support@example.com
- **Executive Sponsor (CISO)**: ciso@example.com

**External Contacts**:
- **Identity Provider (Auth0) Support**: support@auth0.com
- **Cloud Provider (AWS) Support**: AWS Enterprise Support
- **Payment Provider (Stripe) Support**: support@stripe.com
- **Incident Response Retainer (Optional)**: External IR firm

**Regulatory Contacts**:
- **Data Protection Authority (EU GDPR)**: https://edpb.europa.eu/about-edpb/board/members_en
- **California Attorney General (CCPA)**: oag.ca.gov

---

## H. Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-29 | Security Architecture Team | Initial threat model release - 35 threats identified across STRIDE categories |

**Future Updates**:
- Quarterly review schedule
- Update after major architecture changes
- Update post-incident (incorporate lessons learned)
- Update for new compliance requirements

---

## I. Acknowledgments

This threat model was developed using:
- **STRIDE Methodology** - Microsoft threat modeling framework
- **OWASP Resources** - OWASP Top 10, API Security Top 10, Cheat Sheets
- **Industry Best Practices** - NIST, CIS, CSA, SANS

**Tools Used**:
- PlantUML for architecture diagrams
- Markdown for documentation
- GitHub for version control

---

## J. Document Metadata

**Classification**: Internal Use
**Owner**: Security Architecture Team
**Stakeholders**: Engineering, Product, Security, Compliance
**Review Frequency**: Quarterly
**Last Updated**: 2025-12-29
**Next Review**: 2026-03-29

**Distribution List**:
- Engineering Leadership
- Product Management
- Security Team
- Compliance Team
- External Auditors (as needed)

**Feedback**: Send feedback or questions to security-architecture@example.com

---

**End of Threat Model Documentation**
