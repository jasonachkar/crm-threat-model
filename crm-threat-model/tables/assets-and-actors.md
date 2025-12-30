# Assets and Threat Actors

## System Assets

Assets are valuable resources that require protection. This document catalogs all assets in the multi-tenant CRM system and identifies threat actors who may target them.

---

## A. Data Assets

### A.1 Customer Data (Tier 2 - Confidential)

| Asset ID | Asset Name | Description | Confidentiality | Integrity | Availability | Owner |
|----------|------------|-------------|-----------------|-----------|--------------|-------|
| **DA-001** | Contact Records | Customer names, emails, phone numbers, addresses, company info | High | High | Medium | Application Team |
| **DA-002** | Deal/Opportunity Records | Sales pipeline data, deal values, probability, stages | High | High | Medium | Application Team |
| **DA-003** | Activity History | Emails, calls, meetings, notes associated with contacts | High | High | Low | Application Team |
| **DA-004** | File Attachments | Contracts, proposals, NDAs, financial documents | High | High | Medium | Application Team |
| **DA-005** | Custom Field Data | Tenant-defined custom fields (may contain PII) | High | High | Low | Application Team |

### A.2 Authentication & Authorization Data (Tier 1 - Highly Sensitive)

| Asset ID | Asset Name | Description | Confidentiality | Integrity | Availability | Owner |
|----------|------------|-------------|-----------------|-----------|--------------|-------|
| **AA-001** | User Credentials | Password hashes, salts | Critical | Critical | Medium | Platform Team |
| **AA-002** | API Keys & Secrets | Third-party API keys (SendGrid, Stripe, AWS) | Critical | Critical | High | Platform Team |
| **AA-003** | JWT Tokens | Access tokens, refresh tokens | Critical | Critical | High | Application Team |
| **AA-004** | Session Data | Session IDs, session state in Redis | High | High | High | Application Team |
| **AA-005** | Cryptographic Keys | Encryption keys, signing keys | Critical | Critical | Medium | Platform Team |

### A.3 Financial Data (Tier 2 - Confidential)

| Asset ID | Asset Name | Description | Confidentiality | Integrity | Availability | Owner |
|----------|------------|-------------|-----------------|-----------|--------------|-------|
| **FD-001** | Payment Tokens | Stripe payment tokens (NOT full card numbers) | High | Critical | High | Application Team |
| **FD-002** | Billing Records | Subscription history, invoices, payments | High | High | Medium | Application Team |
| **FD-003** | Revenue Data | Tenant revenue, deal values, forecasts | High | High | Low | Application Team |

### A.4 Operational Data (Tier 3 - Internal)

| Asset ID | Asset Name | Description | Confidentiality | Integrity | Availability | Owner |
|----------|------------|-------------|-----------------|-----------|--------------|-------|
| **OD-001** | Audit Logs | Authentication events, admin actions, data access | High | Critical | High | Security Team |
| **OD-002** | Application Logs | API requests, errors, system events | Medium | Medium | Medium | Platform Team |
| **OD-003** | Metrics & Telemetry | Request rates, latency, error rates | Low | Medium | High | Platform Team |
| **OD-004** | Configuration Data | Feature flags, rate limits, tenant settings | Medium | High | High | Application Team |

### A.5 Backup & Archive Data (Tier 2 - Confidential)

| Asset ID | Asset Name | Description | Confidentiality | Integrity | Availability | Owner |
|----------|------------|-------------|-----------------|-----------|--------------|-------|
| **BA-001** | Database Backups | Encrypted snapshots of PostgreSQL database | High | Critical | High | Platform Team |
| **BA-002** | Object Storage Backups | Snapshots of S3 file attachments | High | High | Medium | Platform Team |

---

## B. Infrastructure Assets

### B.1 Compute Resources

| Asset ID | Asset Name | Description | Criticality | Owner |
|----------|------------|-------------|-------------|-------|
| **IR-001** | CRM Application Servers | Docker containers running CRM API (ECS/Kubernetes) | High | Platform Team |
| **IR-002** | Worker Servers | Background job processors | Medium | Platform Team |
| **IR-003** | Admin Portal Servers | Internal admin application | Medium | Platform Team |

### B.2 Data Stores

| Asset ID | Asset Name | Description | Criticality | Owner |
|----------|------------|-------------|-------------|-------|
| **DS-001** | PostgreSQL Database | Primary multi-tenant database (RDS) | Critical | Platform Team |
| **DS-002** | Redis Cache | Session state, rate limiting | High | Platform Team |
| **DS-003** | S3 / Azure Blob Storage | File attachments, generated reports | High | Platform Team |
| **DS-004** | Message Queue (SQS) | Asynchronous job queue | Medium | Platform Team |

### B.3 Network & Edge

| Asset ID | Asset Name | Description | Criticality | Owner |
|----------|------------|-------------|-------------|-------|
| **NW-001** | API Gateway | Request routing, rate limiting | High | Platform Team |
| **NW-002** | Web Application Firewall (WAF) | OWASP protection, bot detection | High | Platform Team |
| **NW-003** | CDN (CloudFront) | Static asset delivery | Medium | Platform Team |
| **NW-004** | Load Balancer | Traffic distribution | High | Platform Team |

### B.4 Security Services

| Asset ID | Asset Name | Description | Criticality | Owner |
|----------|------------|-------------|-------------|-------|
| **SS-001** | Identity Provider (Auth0/Entra) | Authentication service | Critical | Platform Team |
| **SS-002** | Secrets Manager (AWS/Vault) | API key and secret storage | Critical | Platform Team |
| **SS-003** | Key Management Service (KMS) | Encryption key management | Critical | Platform Team |
| **SS-004** | SIEM / Logging System | Security event monitoring | High | Security Team |

---

## C. Intellectual Property & Business Assets

| Asset ID | Asset Name | Description | Value | Owner |
|----------|------------|-------------|-------|-------|
| **IP-001** | Source Code | Application source code (GitHub) | High | Engineering |
| **IP-002** | Proprietary Algorithms | Business logic, scoring models | High | Product |
| **IP-003** | Customer Lists | List of paying customers (sales intelligence) | Medium | Sales |
| **IP-004** | Brand & Reputation | Company brand, customer trust | High | Marketing/Leadership |

---

## D. Threat Actors

### D.1 External Threat Actors

#### TA-001: Opportunistic Attacker (Script Kiddie)

**Motivation**: Financial gain (selling data), curiosity, notoriety
**Capabilities**:
- Automated vulnerability scanning tools (Nmap, Nikto)
- Exploitation of known CVEs (Metasploit, exploit-db)
- Credential stuffing using leaked password databases
- Basic SQL injection, XSS attempts

**Access Level**: None (internet-facing endpoints only)
**Likelihood**: High
**Preferred Targets**:
- DA-001 (Contact Records) - for resale
- AA-002 (API Keys) - for sending spam via SendGrid
- OD-004 (Configuration Data) - for reconnaissance

**Relevant Threats**: TM-001 (XSS), TM-002 (Credential Stuffing), TM-007 (SQL Injection)

---

#### TA-002: Targeted External Attacker (Advanced Persistent Threat - APT Lite)

**Motivation**: Corporate espionage, competitive intelligence, ransomware
**Capabilities**:
- Reconnaissance via OSINT (LinkedIn, GitHub, company website)
- Spear phishing campaigns targeting employees
- Exploitation of zero-day or recently disclosed vulnerabilities
- Custom malware, persistence mechanisms
- Social engineering

**Access Level**: Initially none; seeks to gain foothold via phishing or vulnerabilities
**Likelihood**: Medium
**Preferred Targets**:
- AA-001 (User Credentials) - for initial access
- DA-001 through DA-005 (All customer data) - for espionage or ransom
- IP-001 (Source Code) - for finding vulnerabilities

**Relevant Threats**: TM-003 (Phishing), TM-007 (SQL Injection), TM-009 (Malicious Upload), TM-033 (SSRF)

---

#### TA-003: Competitor

**Motivation**: Gain competitive advantage, steal customer lists, disrupt service
**Capabilities**:
- Hiring external hackers or pentesters
- Social engineering of employees
- Economic resources to sustain long-term attacks
- May bribe insiders

**Access Level**: None initially; may recruit insider
**Likelihood**: Low (but high impact if successful)
**Preferred Targets**:
- IP-003 (Customer Lists) - to poach customers
- DA-002 (Deal/Opportunity Data) - for sales intelligence
- IP-004 (Brand & Reputation) - sabotage via data breach disclosure

**Relevant Threats**: TM-017 (BOLA), TM-034 (Insider + Admin Access)

---

#### TA-004: Botnet Operator

**Motivation**: DDoS extortion, resource hijacking (crypto mining), spam distribution
**Capabilities**:
- Large-scale DDoS attacks (hundreds of Gbps)
- Automated credential stuffing at scale
- Hijacking compute resources for crypto mining

**Access Level**: None
**Likelihood**: Medium (DDoS common for SaaS)
**Preferred Targets**:
- NW-001, NW-002, NW-004 (Network infrastructure) - for DDoS
- IR-001 (Application Servers) - for resource hijacking

**Relevant Threats**: TM-031 (DDoS), TM-002 (Credential Stuffing at scale)

---

### D.2 Internal Threat Actors

#### TA-005: Malicious Tenant Administrator

**Motivation**: Competitive advantage, industrial espionage, revenge
**Capabilities**:
- Full access to own tenant's data
- Understanding of application behavior and APIs
- Social engineering of support staff
- Probing for BOLA/IDOR vulnerabilities to access other tenants

**Access Level**: Authenticated admin within own tenant
**Likelihood**: Low-Medium (but catastrophic if successful at cross-tenant access)
**Preferred Targets**:
- DA-001 through DA-005 (Other tenants' data) - via BOLA
- OD-004 (Configuration Data) - to understand rate limits, quotas for exploitation

**Relevant Threats**: TM-017 (BOLA), TM-012 (Broken Access Control), TM-022 (IDOR Files), TM-027 (Resource Exhaustion)

---

#### TA-006: Malicious End User

**Motivation**: Fraud, data theft, sabotage of own organization, revenge
**Capabilities**:
- Standard user access within tenant
- API abuse (excessive requests)
- Malicious file uploads (malware, viruses)
- Attempting privilege escalation

**Access Level**: Authenticated standard user (sales rep, read-only)
**Likelihood**: Medium
**Preferred Targets**:
- DA-001 (Contacts within tenant) - for unauthorized export/theft
- AA-003 (Own session tokens) - to maintain persistent access
- DS-003 (Object Storage) - upload malware

**Relevant Threats**: TM-009 (Malicious File Upload), TM-027 (Expensive Queries), TM-032 (Privilege Escalation)

---

#### TA-007: Malicious Insider (Employee/Contractor)

**Motivation**: Financial gain (sell data), revenge (disgruntled), negligence
**Capabilities**:
- Legitimate access to systems (developer, support, ops)
- Understanding of system internals and architecture
- Source code access (for developers)
- Admin portal access (for support)
- Ability to exfiltrate data slowly to avoid detection

**Access Level**: Varies (developer access, admin access, database access)
**Likelihood**: Low (but very high impact)
**Preferred Targets**:
- DA-001 through DA-005 (All customer data) - for exfiltration/sale
- AA-002 (API Keys) - for unauthorized access
- BA-001 (Database Backups) - download entire database
- IP-001 (Source Code) - for selling or sabotage

**Relevant Threats**: TM-013 (Lack of audit logs enabling undetected exfiltration), TM-015 (Log tampering), TM-034 (Abuse of impersonation), TM-026 (Backup theft)

---

#### TA-008: Negligent Insider

**Motivation**: None (unintentional harm due to lack of awareness or care)
**Capabilities**:
- Legitimate system access
- Poor security hygiene (weak passwords, reused passwords, clicking phishing links)
- Accidental misconfiguration (e.g., public S3 bucket)
- Sharing credentials or leaving session unlocked

**Access Level**: Varies (any employee/contractor)
**Likelihood**: High (humans make mistakes)
**Preferred Targets** (Unintentionally Exposed):
- AA-001 (Credentials) - via phishing or password reuse
- DA-001 through DA-005 (Customer data) - via misconfiguration
- AA-002 (API Keys) - accidentally committed to GitHub

**Relevant Threats**: TM-003 (Phishing victim), TM-019 (S3 misconfiguration), TM-020 (Secrets in logs)

---

### D.3 Third-Party Threat Actors

#### TA-009: Compromised Third-Party Service

**Motivation**: N/A (third party itself is compromised, becoming a vector)
**Capabilities** (Post-Compromise):
- Access to data shared with third party (email addresses, payment data)
- Ability to send malicious webhooks or API responses
- Pivot attacks via trusted integrations

**Access Level**: API integration endpoints, webhook receivers
**Likelihood**: Low-Medium (third-party breaches do occur)
**Preferred Targets**:
- FD-001 (Payment Tokens) - if Stripe compromised
- DA-001 (Email addresses) - if SendGrid compromised
- AA-003 (Tokens) - if IdP compromised

**Relevant Threats**: TM-035 (Malicious Webhook), TM-006 (Email spoofing via compromised SendGrid)

---

## E. Asset-Threat Mapping

### Critical Asset Protection Priorities

| Asset | Top Threat Actors | Top Threats | Priority |
|-------|-------------------|-------------|----------|
| **DA-001 to DA-005 (Customer Data)** | TA-002 (APT), TA-005 (Malicious Tenant), TA-007 (Insider) | TM-017 (BOLA), TM-007 (SQL Injection), TM-012 (Broken AuthZ) | **P0** |
| **AA-001 (User Credentials)** | TA-001 (Opportunistic), TA-002 (APT), TA-008 (Negligent) | TM-001 (Token Theft), TM-002 (Credential Stuffing), TM-003 (Phishing) | **P0** |
| **AA-002 (API Keys & Secrets)** | TA-007 (Insider), TA-008 (Negligent), TA-002 (APT) | TM-020 (Secrets in Logs), TM-026 (Backup Exposure) | **P0** |
| **BA-001 (Database Backups)** | TA-007 (Insider), TA-002 (APT) | TM-026 (Unencrypted Backups), TM-019 (S3 Misconfiguration) | **P1** |
| **OD-001 (Audit Logs)** | TA-007 (Insider - covering tracks) | TM-015 (Log Tampering), TM-013 (Missing Logs) | **P0** |
| **NW-001/NW-002 (Infrastructure)** | TA-004 (Botnet) | TM-031 (DDoS) | **P1** |

---

## F. Defense Strategy by Actor

### Against External Attackers (TA-001, TA-002, TA-004)

**Perimeter Defenses**:
- WAF with OWASP rule set
- DDoS protection (AWS Shield)
- Rate limiting at edge
- Bot detection

**Application Defenses**:
- Input validation, output encoding
- Parameterized queries (SQL injection prevention)
- JWT validation, MFA
- Penetration testing (annual)

---

### Against Malicious Tenants (TA-005)

**Tenant Isolation**:
- Mandatory tenant_id filtering in queries
- Row-level security (RLS) in database
- Automated tenant isolation testing (CI/CD)
- Resource-level authorization checks (BOLA prevention)

---

### Against Insiders (TA-007, TA-008)

**Insider Threat Mitigations**:
- Comprehensive audit logging (all admin actions)
- Least privilege access (RBAC)
- Separation of duties
- MFA for privileged accounts
- Background checks for sensitive roles
- User security awareness training (for TA-008 negligence prevention)
- Anomaly detection (unusual data access patterns)

---

### Against Compromised Third Parties (TA-009)

**Third-Party Risk Management**:
- Webhook signature validation
- API key rotation (90 days)
- Vendor security assessments (SOC 2 Type II required)
- Least-privilege API scopes
- Monitor third-party breach disclosures

---

## G. Summary

**Total Assets Identified**: 29
- **Critical Assets** (Tier 1): 5
- **High-Value Assets** (Tier 2): 14
- **Operational Assets** (Tier 3): 10

**Total Threat Actors Identified**: 9
- **External**: 4
- **Internal**: 4
- **Third-Party**: 1

**Asset Protection Priority**: Focus on **DA-001 through DA-005 (Customer Data)**, **AA-001 (Credentials)**, and **AA-002 (API Keys/Secrets)** - these are most likely to be targeted and have highest business impact if compromised.

---

**Owner**: Security Architecture Team
**Last Updated**: 2025-12-29
**Review Frequency**: Quarterly or on major architecture changes
