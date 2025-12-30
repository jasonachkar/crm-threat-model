# Architecture and Data Flow Diagrams

## Introduction

This document provides detailed architecture diagrams and data flow analysis for the multi-tenant CRM application. Understanding data flows is critical for identifying where security controls must be applied and where trust boundaries are crossed.

## Component Descriptions

### Detailed Component Responsibilities

#### 1. Web Client (SPA)
**Technology**: React/Angular/Vue.js Single-Page Application
**Hosting**: Static CDN (CloudFront, Azure CDN, etc.)

**Responsibilities**:
- Render user interface
- Capture user input and validate for UX (not security)
- Manage client-side routing
- Store authentication tokens (localStorage or httpOnly cookies)
- Make API calls with Authorization headers
- Display data returned from APIs
- Handle file uploads to object storage via signed URLs

**Security Concerns**:
- XSS attacks via unsanitized user input or API responses
- CSRF if using cookie-based authentication
- Token theft from localStorage (XSS-accessible)
- Client-side logic bypass (never trusted for authorization)

**Trust Level**: Untrusted

---

#### 2. API Gateway
**Technology**: AWS API Gateway / Azure API Management / Kong

**Responsibilities**:
- TLS termination (HTTPS to HTTP internal)
- Request routing to backend services
- API versioning and path-based routing
- Basic rate limiting (requests per second)
- Request/response logging (correlation IDs)
- CORS policy enforcement

**Security Concerns**:
- Misconfiguration allowing unauthorized access
- Rate limit bypass
- Path traversal or routing bypass
- Excessive error messages exposing internals

**Trust Level**: Partially trusted (configuration dependent)

---

#### 3. Web Application Firewall (WAF)
**Technology**: AWS WAF / Cloudflare / Imperva

**Responsibilities**:
- OWASP Top 10 protection (SQL injection, XSS detection)
- Bot detection and mitigation
- Rate limiting based on IP, headers, geo-location
- Known bad signature blocking
- Custom rule enforcement (e.g., block specific user agents)

**Security Concerns**:
- Rule bypass via encoding or obfuscation
- False positives blocking legitimate traffic
- DDoS if overwhelmed despite protection

**Trust Level**: Defense layer (reduces risk but not foolproof)

---

#### 4. Identity Provider (IdP)
**Technology**: Auth0 / Azure Entra ID / Okta (OIDC/OAuth 2.0)

**Responsibilities**:
- User authentication (username/password, SSO, social login)
- Multi-factor authentication (MFA)
- Token issuance (ID token, access token, refresh token)
- Token refresh flow
- Session management
- User directory (or sync with external directory via SCIM)

**Data Flows**:
- **Login**: User credentials → IdP → JWT tokens
- **Token Refresh**: Refresh token → IdP → New access token
- **Logout**: Revoke refresh token

**Security Concerns**:
- Credential stuffing / brute force attacks
- Token theft (XSS, network sniffing)
- Phishing attacks targeting users
- Insufficient token expiration
- Lack of MFA for privileged accounts

**Trust Level**: Trusted for authentication; tokens must be validated by application

---

#### 5. CRM Application Service
**Technology**: Node.js / Python / Java REST API
**Deployment**: Docker containers on Kubernetes / ECS / AKS

**Responsibilities**:
- **Authentication**: Validate JWT signature, expiration, issuer
- **Authorization**: Extract `tenant_id` from token, enforce role-based access control (RBAC)
- **Business Logic**: CRM operations (contacts, deals, activities)
- **Data Access**: Query database with tenant scoping (`WHERE tenant_id = :tenant`)
- **File Handling**: Generate signed URLs for object storage upload/download
- **API Endpoints**:
  - `GET /api/contacts` - List contacts (tenant-scoped)
  - `POST /api/contacts` - Create contact (tenant-scoped)
  - `PUT /api/contacts/{id}` - Update contact (with tenant+ownership check)
  - `DELETE /api/contacts/{id}` - Delete contact (with tenant+ownership check)
  - `GET /api/attachments/{id}/download` - Generate signed URL
  - `POST /api/reports/generate` - Enqueue report generation job
  - `GET /api/admin/users` - Admin-only endpoint

**Security Concerns**:
- **BOLA/IDOR**: Accessing resources without proper authorization (e.g., `/api/contacts/999` from wrong tenant)
- **Mass Assignment**: Over-posting fields (e.g., setting `isAdmin=true` in request body)
- **SQL Injection**: Improperly parameterized queries
- **Tenant Isolation Failure**: Missing `tenant_id` filter in queries
- **Business Logic Bypass**: Exploiting flaws in multi-step workflows

**Trust Level**: Core trust boundary - must enforce all security policies

---

#### 6. Background Worker Service
**Technology**: Python / Node.js / Go asynchronous workers

**Responsibilities**:
- Poll message queue for jobs
- Process long-running tasks:
  - PDF report generation
  - Email notifications
  - Data import/export
  - Webhook delivery to third parties
- Write results back to database or object storage
- Acknowledge or dead-letter failed jobs

**Data Flows**:
- **Notification**: API enqueues message → Worker processes → Email sent via SendGrid
- **Report**: API enqueues report request → Worker queries DB → Generates PDF → Uploads to S3 → Notifies user

**Security Concerns**:
- **Queue Poisoning**: Malicious messages causing worker to crash or execute unintended code
- **SSRF**: Worker fetching attacker-controlled URLs (e.g., in webhook delivery or "import from URL")
- **Privilege Escalation**: Worker running with excessive permissions
- **Tenant Confusion**: Processing job for wrong tenant if `tenant_id` not validated

**Trust Level**: Trusted component but must validate all queue messages

---

#### 7. PostgreSQL Database
**Technology**: Amazon RDS PostgreSQL / Azure Database for PostgreSQL

**Responsibilities**:
- Persistent storage of all CRM data
- Transaction management
- Data integrity constraints (foreign keys, unique constraints)
- Encryption at rest (cloud provider managed keys)
- Automated backups

**Schema Design**:
- Multi-tenant shared schema model
- `tenant_id` column on all tenant-specific tables
- Row-level security (RLS) policies (recommended defense-in-depth)

**Key Tables**:
- `tenants` - Tenant metadata, configuration
- `users` - User accounts with `tenant_id` foreign key
- `contacts` - Customer records (tenant-scoped)
- `deals` - Sales opportunities (tenant-scoped)
- `attachments_metadata` - File metadata (tenant-scoped)
- `audit_log` - Security and compliance events

**Security Concerns**:
- **SQL Injection**: Application vulnerability leading to unauthorized queries
- **Missing Tenant Filter**: Query without `WHERE tenant_id = :tenant`
- **Excessive Permissions**: Application database user with DROP/ALTER privileges
- **Backup Exposure**: Unencrypted backups or backups accessible to unauthorized parties

**Trust Level**: Trusted data store; security depends on application layer enforcement

---

#### 8. Redis Cache
**Technology**: Amazon ElastiCache Redis / Azure Cache for Redis

**Responsibilities**:
- Session state storage (if not using stateless JWT-only)
- Rate limiting counters (per-user, per-tenant)
- Frequently accessed data caching (e.g., user permissions, reference data)
- Distributed lock management

**Cache Key Patterns**:
- `session:{session_id}` - User session data
- `ratelimit:tenant:{tenant_id}:{endpoint}:{window}` - Rate limit counter
- `permissions:user:{user_id}` - Cached permissions (TTL: 5 minutes)

**Security Concerns**:
- **Cache Poisoning**: Malicious data injected into cache
- **Key Collision**: Tenant A accessing Tenant B's cached data due to improper namespacing
- **Sensitive Data Exposure**: PII or secrets cached without encryption
- **Cache Timing Attacks**: Infer existence of data based on cache hits/misses

**Trust Level**: Infrastructure component; must be protected with network isolation and authentication

---

#### 9. Object Storage (S3 / Azure Blob)
**Technology**: AWS S3 / Azure Blob Storage

**Responsibilities**:
- Store file attachments (PDFs, images, documents)
- Store generated reports
- Serve files via signed URLs (pre-authenticated, time-limited)

**Access Pattern**:
- Application generates signed URL with expiration (15-60 minutes)
- Client uploads/downloads file directly to/from S3 (bypassing application server)

**Object Key Structure**:
- `tenant-{tenant_id}/attachments/{file_id}.{ext}`
- `tenant-{tenant_id}/reports/{report_id}.pdf`

**Security Concerns**:
- **Public Bucket Misconfiguration**: Bucket accidentally set to public read
- **IDOR via Signed URLs**: User guessing file IDs and requesting signed URLs
- **Malicious File Upload**: Virus, malware, polyglot files, XXE in XML/SVG
- **Insufficient Expiration**: Signed URLs with excessively long validity

**Trust Level**: Infrastructure component; security depends on IAM policies and signed URL validation

---

#### 10. Message Queue (SQS / Service Bus)
**Technology**: AWS SQS / Azure Service Bus / RabbitMQ

**Responsibilities**:
- Decouple API from long-running tasks
- Reliable delivery of messages to workers
- Dead-letter queue for failed messages
- Message retention and replay capability

**Message Structure** (example):
```json
{
  "job_type": "send_email",
  "tenant_id": "tenant-123",
  "user_id": "user-456",
  "payload": {
    "to": "customer@example.com",
    "subject": "Welcome",
    "template": "welcome_email"
  },
  "created_at": "2025-12-29T10:00:00Z"
}
```

**Security Concerns**:
- **Queue Flooding**: Attacker enqueuing millions of messages (DoS)
- **Message Tampering**: If queue not authenticated/encrypted, messages could be modified
- **Sensitive Data in Messages**: PII or secrets in plaintext in queue
- **Replay Attacks**: Old messages replayed to trigger duplicate actions

**Trust Level**: Infrastructure; security depends on IAM and encryption configuration

---

#### 11. Email Service Provider (SendGrid / SES)
**Technology**: SendGrid / AWS SES / Mailgun

**Responsibilities**:
- Send transactional emails (password resets, notifications, reports)
- Provide delivery status (bounces, opens, clicks)

**Data Shared**:
- Email addresses
- User names
- Email content (potentially containing PII or business data)

**Security Concerns**:
- **Email Spoofing**: Attacker sending emails impersonating the platform
- **Data Exposure**: Third-party provider breach exposing customer emails
- **API Key Theft**: Stolen API key used to send spam or phishing emails

**Mitigations**:
- SPF, DKIM, DMARC email authentication
- API key rotation
- Vendor security assessment (SOC 2 compliance)

**Trust Level**: Partially trusted third party; data exposure risk accepted

---

#### 12. Payment Processor (Stripe / PayPal)
**Technology**: Stripe API

**Responsibilities**:
- Process subscription payments
- Store payment methods (tokenized)
- Send webhook events (payment succeeded, failed, subscription canceled)

**Data Shared**:
- Payment tokens (not raw card numbers - PCI DSS scoping)
- Billing addresses
- Transaction amounts

**Security Concerns**:
- **Webhook Validation Failure**: Accepting fake webhooks from attacker
- **Payment Fraud**: Stolen credit cards used for subscriptions
- **Account Takeover**: Attacker changing billing details

**Mitigations**:
- Webhook signature validation (HMAC)
- Stripe Connect for multi-tenant isolation
- Idempotency keys to prevent duplicate charges

**Trust Level**: Trusted third party; PCI compliance delegated to Stripe

---

#### 13. Admin Portal
**Technology**: Separate web application or protected section of main app

**Responsibilities**:
- Tenant configuration management (feature flags, limits)
- User impersonation for support (with full audit trail)
- System health monitoring dashboards
- Manual data operations (delete user, export data for GDPR)

**Access Control**:
- Restricted to internal employees only
- Corporate VPN or IP allowlist required
- MFA mandatory
- Role-based: Support Engineer (limited) vs Platform Administrator (full access)

**Security Concerns**:
- **Insider Threat**: Malicious admin exfiltrating data
- **Insufficient Audit Logging**: Admin actions not tracked
- **Excessive Privileges**: Admins with more access than needed

**Mitigations**:
- Comprehensive audit logging (who, what, when, which tenant)
- Time-limited impersonation sessions (30 minutes)
- Separation of duties (no single admin has all permissions)

**Trust Level**: High-privilege component; requires strong controls

---

## Data Flow Scenarios

The following scenarios illustrate key data flows and security checkpoints.

### Data Flow 1: User Login (OIDC)

**Actors**: End User, Web Client, Identity Provider, CRM API

**Flow**:
1. User navigates to application (Web Client)
2. Web Client redirects to Identity Provider (IdP) with OIDC authorization request
3. User enters credentials at IdP
4. IdP authenticates user (checks password, MFA if enabled)
5. IdP redirects back to Web Client with authorization code
6. Web Client exchanges authorization code for tokens at IdP token endpoint
7. IdP returns:
   - **ID Token** (user identity, `tenant_id` in claims)
   - **Access Token** (JWT for API access)
   - **Refresh Token** (long-lived, used to get new access tokens)
8. Web Client stores tokens (localStorage or httpOnly cookie)
9. Web Client makes API request to `/api/user/profile` with `Authorization: Bearer {access_token}`
10. CRM API validates JWT (signature, expiration, issuer), extracts `tenant_id` from claims
11. CRM API returns user profile (tenant-scoped)

**Security Checkpoints**:
- ✅ TLS for all communications
- ✅ PKCE (Proof Key for Code Exchange) for authorization code flow
- ✅ Token signature validation
- ✅ Token expiration enforcement (access token: 1 hour, refresh token: 30 days)
- ✅ Tenant ID immutably embedded in token (cannot be changed by client)

**Threats Mitigated**:
- Authorization code interception
- Token forgery
- Tenant confusion attacks

**Diagram**: See [../diagrams/exports/auth-sequence.svg](../diagrams/exports/auth-sequence.svg)

---

### Data Flow 2: CRUD Operation on CRM Record

**Actors**: End User, Web Client, API Gateway, WAF, CRM API, PostgreSQL

**Flow**: Create Contact

1. User fills contact form in Web Client
2. Web Client sends `POST /api/contacts` with JSON payload:
   ```json
   {
     "first_name": "Jane",
     "last_name": "Doe",
     "email": "jane.doe@example.com",
     "phone": "+1-555-0100"
   }
   ```
   **Header**: `Authorization: Bearer {access_token}`
3. **WAF** inspects request for malicious patterns (SQL injection signatures, XSS payloads) → ALLOW
4. **API Gateway** routes request to CRM API, adds correlation ID
5. **CRM API**:
   - Validates JWT (signature, expiration, issuer)
   - Extracts `tenant_id` from token claims (e.g., `tenant-123`)
   - Validates input (email format, phone format, required fields)
   - **Constructs SQL query**:
     ```sql
     INSERT INTO contacts (tenant_id, first_name, last_name, email, phone, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     RETURNING id;
     -- $1 = 'tenant-123' (from token, NOT from client input)
     ```
   - Executes query
6. **PostgreSQL** inserts row, returns `id`
7. **CRM API** returns `201 Created` with contact JSON
8. **Web Client** displays success message

**Security Checkpoints**:
- ✅ Input validation (email format, length limits)
- ✅ Parameterized query (SQL injection prevention)
- ✅ `tenant_id` from token only (cannot be overridden by client)
- ✅ Authorization check (user has permission to create contacts)
- ✅ Audit log entry created (optional but recommended)

**Threats Mitigated**:
- SQL injection
- Tenant isolation bypass
- Mass assignment (only allowed fields accepted)

---

### Data Flow 3: File Upload to Object Storage

**Actors**: End User, Web Client, CRM API, S3 (Object Storage)

**Flow**:

1. User clicks "Upload Attachment" in Web Client
2. Web Client requests signed upload URL:
   - `POST /api/attachments/upload-url`
   - Body: `{ "filename": "proposal.pdf", "content_type": "application/pdf", "size_bytes": 2048000 }`
3. **CRM API**:
   - Validates JWT, extracts `tenant_id`
   - Checks file size limit (e.g., 10 MB max)
   - Validates content type (allowed: pdf, png, jpg, docx)
   - Generates unique `file_id` (UUID)
   - Constructs S3 object key: `tenant-{tenant_id}/attachments/{file_id}.pdf`
   - Generates **signed upload URL** (S3 presigned PUT URL, expires in 15 minutes)
   - Stores metadata in database:
     ```sql
     INSERT INTO attachments_metadata (id, tenant_id, filename, content_type, size_bytes, status)
     VALUES ($1, $2, $3, $4, $5, 'pending');
     ```
   - Returns: `{ "upload_url": "https://s3.amazonaws.com/...", "file_id": "..." }`
4. **Web Client** uploads file directly to S3 using signed URL (PUT request)
5. **S3** accepts upload (if within 15-minute window and size limits)
6. Web Client notifies API: `POST /api/attachments/{file_id}/confirm`
7. **CRM API** updates metadata status: `status = 'uploaded'`
8. (Optional) Background worker scans file for viruses

**Security Checkpoints**:
- ✅ Signed URL with short expiration (15 minutes)
- ✅ Tenant-specific object key prefix
- ✅ File size and type validation
- ✅ Virus scanning (defense-in-depth)
- ✅ Metadata stored with `tenant_id` to prevent IDOR on download

**Threats Mitigated**:
- Malicious file upload (virus scanning)
- Cross-tenant file access (tenant-scoped keys)
- Excessive storage abuse (size limits)

---

### Data Flow 4: Background Job Processing

**Actors**: CRM API, Message Queue, Worker Service, Email Provider, PostgreSQL

**Flow**: Send Email Notification

1. User completes action triggering notification (e.g., deal closed)
2. **CRM API** enqueues message to SQS:
   ```json
   {
     "job_type": "send_email",
     "tenant_id": "tenant-123",
     "user_id": "user-456",
     "payload": {
       "to": "customer@example.com",
       "template": "deal_closed",
       "data": { "deal_name": "Acme Corp Deal" }
     }
   }
   ```
3. **Worker Service** polls queue, receives message
4. Worker validates:
   - Message structure is valid
   - `tenant_id` exists
   - `template` is allowed
5. Worker fetches email template from database (tenant-scoped)
6. Worker renders email content with data
7. Worker calls SendGrid API to send email
8. Worker updates job status in database:
   ```sql
   UPDATE notification_log SET status='sent', sent_at=NOW()
   WHERE id = $1 AND tenant_id = $2;
   ```
9. Worker acknowledges message (removes from queue)

**Security Checkpoints**:
- ✅ Tenant ID validation in worker
- ✅ Template allowlist (prevent arbitrary HTML injection)
- ✅ Idempotency (prevent duplicate sends via unique job ID)
- ✅ Audit log of emails sent

**Threats Mitigated**:
- Queue poisoning (worker validates messages)
- Email spoofing (SPF/DKIM configured)
- Tenant confusion (worker checks tenant_id)

---

### Data Flow 5: Admin Support Access (User Impersonation)

**Actors**: Support Engineer, Admin Portal, CRM API, PostgreSQL

**Flow**:

1. Support engineer logs into Admin Portal (MFA required)
2. Support engineer searches for customer ticket: "Tenant ABC cannot access reports"
3. Support engineer clicks "Impersonate User" for affected user
4. **Admin Portal**:
   - Logs impersonation request (who, which tenant, which user, timestamp)
   - Calls CRM API: `POST /api/admin/impersonate`
   - Body: `{ "target_tenant_id": "tenant-abc", "target_user_id": "user-789", "reason": "Support ticket #12345" }`
5. **CRM API**:
   - Validates admin JWT (must have `admin:impersonate` scope)
   - Creates time-limited impersonation token (30 minutes expiration)
   - Token claims include:
     - `tenant_id`: `tenant-abc`
     - `user_id`: `user-789`
     - `impersonated_by`: `admin-user-123`
     - `reason`: `Support ticket #12345`
   - Inserts audit log entry:
     ```sql
     INSERT INTO admin_audit_log (admin_user_id, action, target_tenant_id, target_user_id, reason, expires_at)
     VALUES ('admin-user-123', 'impersonate', 'tenant-abc', 'user-789', 'Support ticket #12345', NOW() + INTERVAL '30 minutes');
     ```
   - Returns impersonation token
6. Support engineer uses token to access tenant's data (read-only, typically)
7. After investigation, token expires automatically (30 minutes)

**Security Checkpoints**:
- ✅ MFA required for admin login
- ✅ Audit log entry for every impersonation
- ✅ Time-limited token (30 minutes)
- ✅ Reason code required (accountability)
- ✅ Read-only access (support cannot modify data without separate approval)

**Threats Mitigated**:
- Insider threat (full audit trail)
- Excessive access duration (time-limited)
- Unauthorized impersonation (admin role required)

---

## Trust Boundaries

Trust boundaries are points where data crosses from a lower-trust zone to a higher-trust zone, requiring security controls. See [04-trust-boundaries.md](04-trust-boundaries.md) for detailed analysis.

**Summary of Trust Boundaries**:

1. **Internet ↔ Edge (API Gateway/WAF)**
   - Untrusted internet traffic → Trusted application infrastructure
   - Controls: TLS, WAF rules, DDoS protection, authentication required

2. **Edge ↔ Application Services**
   - API Gateway → CRM API / Workers
   - Controls: Network segmentation (private VPC), service mesh (optional), IAM roles

3. **Application ↔ Data Stores**
   - CRM API → PostgreSQL / Redis / S3
   - Controls: Parameterized queries, tenant scoping, least-privilege database credentials, encryption

4. **Application ↔ Third Parties**
   - CRM API / Workers → SendGrid / Stripe / IdP
   - Controls: API key management, webhook signature validation, TLS

5. **Admin Network ↔ Admin Portal**
   - Corporate network / VPN → Admin Portal
   - Controls: IP allowlist, MFA, audit logging

6. **Tenant A ↔ Tenant B (Logical Boundary)**
   - Most critical: Prevent cross-tenant data access
   - Controls: Token-based tenant context, database query filters, object storage key prefixes

**Diagram**: See [../diagrams/exports/trust-boundaries.svg](../diagrams/exports/trust-boundaries.svg)

---

## Data Flow Diagram (DFD)

The complete Data Flow Diagram is available in PlantUML source and exported SVG:

- **Source**: [../diagrams/dfd.puml](../diagrams/dfd.puml)
- **Visual**: [../diagrams/exports/dfd.svg](../diagrams/exports/dfd.svg)

**DFD Legend**:
- **External Entities**: Users, third-party services (rectangles)
- **Processes**: Application components (rounded rectangles)
- **Data Stores**: Databases, caches, object storage (cylinders)
- **Data Flows**: Arrows showing data movement with protocol labels
- **Trust Boundaries**: Dashed lines separating security zones

**Key Insights from DFD**:
1. All external traffic must pass through WAF and API Gateway (single enforcement point)
2. Tenant ID flows from IdP → Token → API → Database (immutable chain of custody)
3. Workers are isolated from direct internet access (SSRF mitigation)
4. Admin portal is network-isolated from public internet
5. Third-party integrations have limited, purpose-specific access

---

## Summary

This architecture prioritizes:
- **Defense in Depth**: Multiple layers of security controls
- **Least Privilege**: Every component has minimal necessary permissions
- **Tenant Isolation**: Strict separation enforced at every layer
- **Auditability**: Comprehensive logging of security-relevant events

The identified data flows demonstrate where security controls must be enforced. The threat analysis (next section) will systematically identify what can go wrong at each boundary and data flow.

---

**Next**: Review [Trust Boundaries](04-trust-boundaries.md) for detailed boundary analysis.
