# System Overview

## Introduction

This document provides a high-level technical overview of the multi-tenant CRM web application. The system is designed as a cloud-native SaaS platform enabling multiple independent organizations (tenants) to manage customer relationships, sales pipelines, and business data through a secure web interface.

## Business Purpose

The CRM platform provides:

- **Contact & Account Management**: Customer records, interaction history, notes
- **Sales Pipeline Tracking**: Opportunities, deals, forecasting
- **Task & Activity Management**: Reminders, meetings, follow-ups
- **Document Storage**: File attachments, proposals, contracts
- **Reporting & Analytics**: Custom dashboards, data exports
- **Integration Capabilities**: Third-party tools (email, payments, calendar)
- **Administrative Controls**: User management, role-based permissions, audit logs

## High-Level Architecture

The system follows a modern cloud-native architecture pattern:

```
[End Users] → [Web Client (SPA)] → [API Gateway/WAF] → [Application Services]
                                                              ↓
                    [Identity Provider (OIDC)] ←→ [Auth Service]
                                                              ↓
    [PostgreSQL DB] ←→ [CRM Service] ←→ [Message Queue] → [Worker Service]
         ↓                   ↓                                   ↓
    [Redis Cache]     [Object Storage]                  [Email Provider]
                                                         [Payment Provider]
                                                              ↓
                                                    [Logging & Monitoring]
```

## System Components

### Client Layer

#### Web Client (Single-Page Application)
- **Technology**: React/Angular/Vue.js-based SPA
- **Deployment**: Static hosting (CDN/S3/Azure Blob)
- **Purpose**: User interface for end users and administrators
- **Key Features**:
  - Customer CRUD operations
  - Dashboard and reporting views
  - File upload/download
  - Real-time notifications (WebSocket/SSE)
  - Admin configuration panels
- **Security Concerns**: XSS, CSRF, token storage, client-side validation bypass

### Edge Layer

#### API Gateway
- **Technology**: AWS API Gateway / Azure API Management / Kong
- **Purpose**: Centralized API entry point, request routing
- **Responsibilities**:
  - TLS termination
  - Request routing
  - Rate limiting (basic)
  - Request/response logging
  - API versioning
- **Security Concerns**: Misconfiguration, bypass, DDoS

#### Web Application Firewall (WAF)
- **Technology**: AWS WAF / Azure Front Door / Cloudflare
- **Purpose**: Layer 7 attack protection
- **Protections**:
  - OWASP Top 10 rule sets
  - SQL injection detection
  - XSS filtering
  - Bot detection
  - Geo-blocking (if needed)
- **Security Concerns**: Rule bypass, false positives blocking legitimate traffic

### Authentication & Authorization

#### Identity Provider (IdP)
- **Technology**: Auth0 / Azure Entra ID / Okta (OIDC-compliant)
- **Purpose**: User authentication, token issuance
- **Capabilities**:
  - Username/password authentication
  - Multi-factor authentication (MFA)
  - Social login providers (optional)
  - Token lifecycle management (issue, refresh, revoke)
  - User directory sync (SCIM)
- **Security Concerns**: Token theft, credential stuffing, phishing, session hijacking

#### Authorization Service
- **Purpose**: Verify tokens, enforce tenant and role-based access control
- **Responsibilities**:
  - JWT signature validation
  - Token expiration checks
  - Tenant extraction from token claims
  - Role/permission lookup
  - Scope enforcement
- **Security Concerns**: Token replay, privilege escalation, tenant confusion

### Application Layer

#### CRM Application Service
- **Technology**: Node.js / Python / Java REST API
- **Deployment**: Container orchestration (Kubernetes / ECS / AKS)
- **Purpose**: Core business logic and data operations
- **Key Functions**:
  - Contact/account CRUD
  - Search and filtering
  - Report generation
  - File attachment handling
  - Tenant-scoped queries
  - Business rule enforcement
- **Security Concerns**: BOLA/IDOR, SQL injection, business logic abuse, tenant isolation failures

#### Worker Service (Background Jobs)
- **Technology**: Python / Node.js / Go asynchronous workers
- **Purpose**: Long-running or scheduled tasks
- **Responsibilities**:
  - Email notifications
  - PDF report generation
  - Data imports/exports
  - Scheduled data synchronization
  - Webhook delivery to third parties
- **Security Concerns**: Queue poisoning, privilege escalation, SSRF in webhook callbacks

### Data Layer

#### Primary Database (PostgreSQL)
- **Purpose**: Persistent storage of CRM data
- **Schema Design**: Multi-tenant with shared database, shared schema model
  - All tables include `tenant_id` column
  - Row-level security policies (recommended)
- **Data Types**:
  - User accounts, roles, permissions
  - Contacts, companies, deals
  - Activity logs, notes
  - Configuration and settings
- **Security Concerns**: SQL injection, unauthorized cross-tenant access, data leakage

#### Object Storage (S3 / Azure Blob)
- **Purpose**: File attachment storage
- **Structure**:
  - Bucket/container per environment
  - Object keys include tenant_id prefix: `tenant-{id}/attachments/{file-id}`
- **Access Control**: Signed URLs with short expiration (15-60 minutes)
- **Security Concerns**: Public bucket exposure, IDOR in file access, malicious file uploads

#### Cache (Redis)
- **Purpose**: Performance optimization and session state
- **Stored Data**:
  - User session tokens (if stateful sessions used)
  - Rate limiting counters
  - Frequently accessed reference data
  - Query result caching
- **Security Concerns**: Cache poisoning, sensitive data in cache without encryption, tenant key collisions

### Messaging & Events

#### Message Queue / Event Bus
- **Technology**: AWS SQS / Azure Service Bus / RabbitMQ / Kafka
- **Purpose**: Asynchronous task processing, event-driven architecture
- **Message Types**:
  - Email notifications
  - File processing jobs
  - Webhook delivery tasks
  - Data export requests
- **Security Concerns**: Message tampering, queue flooding (DoS), sensitive data in messages

### Third-Party Integrations

#### Email Service Provider
- **Technology**: SendGrid / AWS SES / Mailgun
- **Purpose**: Transactional emails, notifications
- **Data Shared**: Email addresses, user names, notification content
- **Security Concerns**: Email spoofing, data exposure to third party, credential theft

#### Payment Processor
- **Technology**: Stripe / PayPal / Braintree
- **Purpose**: Subscription billing, payment processing (if applicable)
- **Data Shared**: Payment tokens, billing addresses, amounts
- **Security Concerns**: PCI compliance, webhook validation, payment fraud

### Observability & Monitoring

#### Centralized Logging
- **Technology**: ELK Stack / Splunk / Datadog / Azure Monitor
- **Purpose**: Security monitoring, troubleshooting, compliance auditing
- **Logged Events**:
  - Authentication attempts (success/failure)
  - Authorization failures
  - API requests/responses (without sensitive data)
  - Admin actions (user creation, role changes)
  - Data access patterns
  - System errors and exceptions
- **Security Concerns**: Log injection, insufficient logging, logs containing PII/secrets

#### Metrics & Tracing
- **Technology**: Prometheus/Grafana / Application Insights / New Relic
- **Purpose**: Performance monitoring, anomaly detection
- **Metrics**:
  - Request rates, latencies, error rates
  - Database query performance
  - Queue depths
  - Resource utilization
- **Security Concerns**: Metrics exposing sensitive information, lack of alerting on security events

### Administrative Tools

#### Admin Portal
- **Purpose**: Support and operations team interface
- **Capabilities**:
  - Tenant configuration management
  - User impersonation for support (with audit trail)
  - System health monitoring
  - Data export for compliance requests
  - Feature flag management
- **Access Control**: Restricted to internal staff, requires MFA
- **Security Concerns**: Excessive admin privileges, insider threats, insufficient audit logging

## Multi-Tenancy Model

### Tenant Isolation Strategy

**Data Isolation**: Logical separation using shared database
- All tables include `tenant_id` foreign key
- Application-enforced filtering on every query
- Row-level security policies as defense-in-depth
- No shared data between tenants (except system config)

**Access Isolation**:
- Tenant context derived from authenticated user's JWT token
- Token claims include `tenant_id` (immutable after login)
- Application layer validates tenant_id on every request
- No client-side tenant selection (prevents tenant confusion attacks)

**Resource Isolation**:
- Per-tenant rate limits
- Object storage keys prefixed with `tenant_id`
- Cache keys namespaced by tenant
- Separate API keys per tenant for third-party integrations

**Operational Isolation**:
- Tenant-specific configuration and feature flags
- Separate billing and subscription management
- Independent data retention policies

## User Roles & Personas

### End User Roles (Per Tenant)

1. **Tenant Administrator**
   - Full control within tenant boundary
   - User/role management
   - Billing and subscription
   - Cannot access other tenants

2. **Sales Manager**
   - View and manage sales pipeline
   - Generate reports
   - Assign tasks to sales reps

3. **Sales Representative**
   - CRUD on assigned contacts/deals
   - View team data (based on role configuration)

4. **Read-Only User / Auditor**
   - View-only access to reports and data
   - No modification capabilities

### System-Level Roles

5. **Platform Administrator**
   - Internal operations team
   - Cross-tenant visibility (for support only)
   - Cannot modify tenant data directly
   - Requires impersonation with audit trail

6. **Support Engineer**
   - Limited cross-tenant access
   - Impersonation capability (logged and time-limited)
   - Cannot access billing or sensitive config

## Data Classification

See [tables/data-classification.md](../tables/data-classification.md) for detailed classification.

**Summary**:

| Classification | Examples | Protection Required |
|---------------|----------|---------------------|
| **Highly Sensitive** | Payment card data, auth credentials, API keys | Encryption at rest + in transit, access logging, tokenization |
| **Confidential** | Customer PII, financial records, proprietary business data | Encryption in transit, access controls, tenant isolation |
| **Internal** | User IDs, system configuration, feature flags | Access controls, audit logging |
| **Public** | Marketing content, public documentation | Integrity protection only |

## Network Architecture

### Production Environment

- **Internet-Facing**:
  - CDN (web client static assets)
  - API Gateway / WAF (HTTPS only)

- **Private Application Network**:
  - Application services (no direct internet access)
  - Communication via private endpoints
  - Outbound internet via NAT gateway (controlled)

- **Data Network**:
  - Database, cache, object storage
  - No internet access
  - Private endpoints only

- **Management Network**:
  - Admin portal
  - Monitoring dashboards
  - Restricted to corporate VPN or IP allowlist

### Development/Staging Environments

- Separate cloud accounts/subscriptions
- Non-production data only (synthetic or anonymized)
- Similar architecture to production
- Additional access for development teams

## Deployment Pipeline

- **Source Control**: GitHub / GitLab (private repositories)
- **CI/CD**: GitHub Actions / GitLab CI / Jenkins
- **Artifact Storage**: Container registry, artifact repository
- **Deployment**: Infrastructure-as-Code (Terraform / CloudFormation)
- **Secrets Management**: Vault / AWS Secrets Manager / Azure Key Vault

**Security Gates** (to be implemented):
- SAST (static application security testing)
- SCA (software composition analysis)
- Container scanning
- IaC security scanning
- Secret detection

## Trust Relationships

The system trusts:
- **Identity Provider** to correctly authenticate users and issue valid tokens
- **Cloud Provider** for infrastructure security, encryption services, and managed service security
- **Third-Party Services** (email, payments) to protect data shared with them
- **Internal Administrators** to use elevated access responsibly (trust but verify with audit logs)

The system does NOT trust:
- **End Users**: All input is validated, all access is authorized
- **Web Clients**: Client-side validation is convenience only, not security
- **Network**: Encryption required for all data in transit
- **Other Tenants**: Strict isolation enforced

## Technology Stack Summary

| Layer | Technology (Example) |
|-------|---------------------|
| Frontend | React SPA, hosted on CloudFront/CDN |
| API Gateway | AWS API Gateway with WAF |
| Application | Node.js (Express/Fastify) in Docker containers |
| Authentication | Auth0 (OIDC/OAuth 2.0) |
| Database | Amazon RDS PostgreSQL with encryption at rest |
| Cache | Amazon ElastiCache Redis |
| Object Storage | Amazon S3 with server-side encryption |
| Message Queue | Amazon SQS |
| Workers | Node.js workers in ECS Fargate |
| Email | SendGrid API |
| Payments | Stripe API (optional) |
| Logging | CloudWatch Logs → S3 → Splunk/SIEM |
| Monitoring | CloudWatch Metrics, AWS X-Ray tracing |
| Secrets | AWS Secrets Manager |
| IaC | Terraform |
| CI/CD | GitHub Actions |

## Out of Scope

See [02-assumptions-and-scope.md](02-assumptions-and-scope.md) for complete scope definition.

**Not covered in this threat model**:
- Physical security of data centers (cloud provider responsibility)
- End-user device security (client responsibility)
- Supply chain attacks on cloud provider infrastructure
- Quantum cryptography or post-quantum threats
- Mobile native applications (if separate from web SPA)

---

**Next**: Review [Assumptions and Scope](02-assumptions-and-scope.md) for detailed boundary definitions.
