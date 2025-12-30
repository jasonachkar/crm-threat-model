# Trust Boundaries

## Introduction

Trust boundaries are critical points in the system architecture where data crosses from one security zone to another. Each boundary represents a change in trust level and requires specific security controls. Failures at trust boundaries are common sources of security vulnerabilities.

This document analyzes each trust boundary in the multi-tenant CRM application, identifying what crosses the boundary, potential threats, and required controls.

**Visual Reference**: See [../diagrams/exports/trust-boundaries.svg](../diagrams/exports/trust-boundaries.svg)

---

## Boundary 1: Internet ↔ Edge Layer (DMZ)

### Description
This is the primary external trust boundary where untrusted internet traffic enters the system through the Web Application Firewall (WAF) and API Gateway.

### What Crosses This Boundary

**Inbound**:
- HTTP/HTTPS requests from web clients
- User credentials during login (routed to IdP)
- API calls with JWT bearer tokens
- File upload/download requests (via signed URLs)
- Attack traffic (scans, exploitation attempts, DDoS)

**Outbound**:
- HTTP responses with JSON data
- Error messages
- Redirect responses (e.g., OIDC flows)

### Security Concerns

**High-Risk Threats**:
- **DDoS attacks** overwhelming infrastructure
- **Application-layer attacks**: SQL injection, XSS payloads, command injection attempts
- **Brute force attacks** on authentication endpoints
- **Bot traffic** scraping data or abusing APIs
- **Exploitation of public vulnerabilities** (CVEs in frameworks, libraries)

### Required Security Controls

| Control | Description | Implementation |
|---------|-------------|----------------|
| **TLS Encryption** | All traffic encrypted in transit | TLS 1.2+ with strong cipher suites; HTTP redirects to HTTPS |
| **Web Application Firewall** | Block known attack signatures | AWS WAF / Cloudflare with OWASP Core Rule Set |
| **Rate Limiting** | Prevent brute force and DDoS | API Gateway rate limits (100 req/sec per IP) |
| **DDoS Protection** | Absorb volumetric attacks | Cloud provider DDoS mitigation (AWS Shield, Cloudflare) |
| **Authentication Required** | No unauthenticated access to APIs | JWT bearer token required for all `/api/*` endpoints (except `/api/health`) |
| **Input Validation** | Reject malformed requests | WAF rules + API Gateway request validation |
| **Geo-Blocking** | Restrict by geography if needed | WAF geo-filtering (optional, based on business requirements) |
| **Bot Detection** | Identify and block automated abuse | WAF bot detection, CAPTCHA for sensitive operations |

### Validation Checkpoints

Before traffic proceeds from this boundary:
- ✅ TLS connection established with valid certificate
- ✅ Request does not match WAF block rules (SQL injection, XSS signatures)
- ✅ Request rate is within limits for source IP
- ✅ Request path and method are allowed
- ✅ Request size is within limits (e.g., 5 MB max body)

---

## Boundary 2: Edge Layer ↔ Application Services

### Description
Traffic that has passed the WAF and API Gateway now enters the private application network where CRM services and workers operate. This boundary separates the DMZ from trusted application components.

### What Crosses This Boundary

**Inbound** (from API Gateway to Application):
- Routed API requests (with correlation IDs)
- JWT access tokens in Authorization headers
- JSON request payloads
- Query parameters and path variables

**Outbound** (from Application to API Gateway):
- JSON responses
- Error messages with status codes
- Redirect responses

### Security Concerns

**Medium-High Risk Threats**:
- **JWT forgery or tampering** (if signature validation fails)
- **Broken authentication** allowing unauthorized access
- **Broken Object Level Authorization (BOLA)** - accessing resources belonging to other users/tenants
- **Mass assignment** - client overriding server-side fields
- **Business logic bypass** - exploiting flaws in multi-step workflows

### Required Security Controls

| Control | Description | Implementation |
|---------|-------------|----------------|
| **Network Segmentation** | Application services not directly internet-accessible | VPC private subnets; no public IPs on app services |
| **JWT Validation** | Verify all tokens before processing requests | Validate signature (JWKS), issuer, audience, expiration |
| **Tenant Extraction** | Immutably extract tenant context | `tenant_id` from JWT claims only (never from client input) |
| **RBAC Enforcement** | Role-based access control | Check user roles/permissions from token claims against required permissions |
| **Input Validation** | Validate all client-provided data | Schema validation (JSON Schema / OpenAPI), type checking, range validation |
| **Output Encoding** | Prevent XSS in responses | Encode HTML entities, use Content-Type: application/json |
| **Correlation IDs** | Track requests across services | API Gateway adds `X-Correlation-ID`, propagated to logs |

### Validation Checkpoints

Before processing a request:
- ✅ JWT signature is valid (verified against IdP's public keys)
- ✅ JWT has not expired (`exp` claim > current time)
- ✅ JWT issuer and audience are correct
- ✅ `tenant_id` is extracted from token claims
- ✅ User has required role/permission for the requested operation
- ✅ Request payload passes schema validation

---

## Boundary 3: Application Services ↔ Data Layer

### Description
Application services (CRM API, Workers) access data stores (PostgreSQL, Redis, S3, SQS). This is a critical boundary for data protection and tenant isolation.

### What Crosses This Boundary

**Inbound** (from Application to Data Layer):
- **Database**: SQL queries, connection requests
- **Cache**: GET/SET operations with keys and values
- **Object Storage**: Signed URL generation requests, object metadata queries
- **Message Queue**: Enqueue messages, poll for messages

**Outbound** (from Data Layer to Application):
- **Database**: Query result sets (rows)
- **Cache**: Cached values or cache misses
- **Object Storage**: Signed URLs (time-limited, pre-authenticated)
- **Message Queue**: Messages for processing

### Security Concerns

**Critical Threats**:
- **SQL Injection** leading to data breach or tampering
- **Missing tenant filters** in queries (cross-tenant data leakage)
- **Excessive database permissions** (app can DROP tables)
- **Cache poisoning** - malicious data injected into cache
- **Cache key collisions** - Tenant A accessing Tenant B's cached data
- **Public object storage exposure** - bucket misconfiguration
- **IDOR in object access** - guessing file IDs to access other tenants' files

### Required Security Controls

| Control | Description | Implementation |
|---------|-------------|----------------|
| **Parameterized Queries** | Prevent SQL injection | Use ORM or prepared statements (NO string concatenation) |
| **Mandatory Tenant Scoping** | All queries include tenant filter | `WHERE tenant_id = :tenant` on every table with tenant data |
| **Row-Level Security** | Database-enforced tenant isolation (defense-in-depth) | PostgreSQL RLS policies: `CREATE POLICY tenant_isolation...` |
| **Least-Privilege DB User** | Application DB user has minimal permissions | Only SELECT, INSERT, UPDATE, DELETE on specific tables (no DROP, ALTER, CREATE) |
| **Connection Pooling** | Reuse DB connections securely | Connection pool with connection validation, max lifetime |
| **Encryption at Rest** | Protect data on disk | Cloud provider managed encryption (AES-256) |
| **Encryption in Transit** | Protect data in flight | TLS for database connections (PostgreSQL: `sslmode=require`) |
| **Cache Key Namespacing** | Prevent key collisions | Prefix all keys: `tenant:{tenant_id}:...` |
| **Object Key Prefixing** | Tenant-scoped storage | All object keys: `tenant-{tenant_id}/...` |
| **Signed URLs** | Time-limited, pre-authenticated access | Generate signed URLs with 15-minute expiration |
| **Bucket Policies** | Prevent public access | Block public ACLs, require authentication for all access |

### Validation Checkpoints

**Database Queries**:
- ✅ Query uses parameterized statements (no string interpolation of user input)
- ✅ Query includes `WHERE tenant_id = :tenant` (extracted from JWT, not client)
- ✅ ORM/query builder enforces tenant scoping automatically

**Cache Operations**:
- ✅ Cache key includes tenant namespace: `tenant:{id}:cache_key`
- ✅ TTL set appropriately (not indefinite for sensitive data)
- ✅ Sensitive data not cached in plaintext (consider encryption)

**Object Storage**:
- ✅ Object key includes tenant prefix: `tenant-{id}/attachments/{file_id}`
- ✅ Signed URL expiration is short (15-60 minutes)
- ✅ Signed URL includes tenant validation (cannot reuse signed URL for different tenant)

---

## Boundary 4: Application Services ↔ Identity Provider (IdP)

### Description
The application relies on an external Identity Provider (Auth0, Entra ID) for authentication. This is a trust relationship with a third-party service.

### What Crosses This Boundary

**Outbound** (Application to IdP):
- Token validation requests (JWKS endpoint to fetch public keys)
- Admin operations (user creation, password resets) via IdP management API
- Logout/revocation requests

**Inbound** (IdP to Application):
- JWKS (JSON Web Key Set) responses with public keys
- Management API responses

**User-Initiated Flows** (Web Client to IdP):
- Login requests (credentials, MFA codes)
- Authorization code exchange
- Token refresh requests

### Security Concerns

**Medium Risk Threats**:
- **Compromised IdP** exposing all user credentials
- **Token theft** in transit (if TLS compromised)
- **Phishing attacks** targeting IdP login page
- **Misconfigured OIDC settings** allowing open redirects or token theft

### Required Security Controls

| Control | Description | Implementation |
|---------|-------------|----------------|
| **TLS for All Communications** | Prevent token interception | All requests to IdP use HTTPS |
| **PKCE (Proof Key for Code Exchange)** | Prevent authorization code interception | OIDC flow includes code_challenge and code_verifier |
| **Validate IdP Certificates** | Prevent MITM attacks | Verify TLS certificate chain, pin IdP certificate (optional) |
| **Token Signature Validation** | Prevent token forgery | Validate JWT signature using JWKS public keys |
| **Issuer Validation** | Prevent token from untrusted source | Check `iss` claim matches expected IdP URL |
| **Audience Validation** | Prevent token reuse across apps | Check `aud` claim matches application identifier |
| **Short Token Lifetime** | Limit exposure window | Access tokens: 1 hour; Refresh tokens: 30 days max |
| **Refresh Token Rotation** | Prevent stolen refresh token reuse | IdP issues new refresh token on each refresh (optional but recommended) |
| **MFA Enforcement** | Stronger authentication | Require MFA for admin users and sensitive operations |

### Validation Checkpoints

**Token Validation** (every API request):
- ✅ JWT signature verified using IdP's public keys (cached from JWKS endpoint)
- ✅ `iss` claim matches expected IdP (e.g., `https://auth.example.com`)
- ✅ `aud` claim matches application ID
- ✅ `exp` claim > current time (token not expired)
- ✅ `nbf` claim <= current time (token is active)

---

## Boundary 5: Application Services ↔ Third-Party Services (Email, Payment)

### Description
The application integrates with external services for email delivery (SendGrid) and payment processing (Stripe). This involves sharing data with third parties and accepting webhooks from them.

### What Crosses This Boundary

**Outbound** (Application/Workers to Third Parties):
- **Email Provider**: API calls to send emails (email addresses, content, metadata)
- **Payment Provider**: API calls to create charges, subscriptions (payment tokens, amounts)

**Inbound** (Third Parties to Application):
- **Webhooks**: Event notifications (email delivered, payment succeeded, subscription canceled)

### Security Concerns

**Medium Risk Threats**:
- **Data exposure at third party** (if provider is breached)
- **Webhook forgery** - attacker sending fake webhooks
- **API key theft** - stolen keys used for abuse (spam emails, fraudulent charges)
- **Over-sharing data** - sending unnecessary PII to third parties

### Required Security Controls

| Control | Description | Implementation |
|---------|-------------|----------------|
| **TLS for All API Calls** | Protect data in transit | HTTPS for all third-party API calls |
| **API Key Management** | Secure storage and rotation | Store API keys in vault (AWS Secrets Manager), rotate regularly |
| **Webhook Signature Validation** | Prevent forged webhooks | Verify HMAC signature on all incoming webhooks (Stripe, SendGrid) |
| **Webhook Replay Prevention** | Prevent duplicate processing | Check event ID against processed events log |
| **Data Minimization** | Only share necessary data | Only send required fields to third parties (no excessive PII) |
| **Vendor Security Assessment** | Ensure third-party security | Require SOC 2 Type II, review vendor security questionnaire |
| **IP Allowlisting (optional)** | Restrict webhook sources | Allowlist third-party webhook IPs (SendGrid, Stripe documented IPs) |
| **Idempotency** | Prevent duplicate operations | Use idempotency keys for payment operations |

### Validation Checkpoints

**Outbound API Calls**:
- ✅ API key retrieved from secure vault (not hardcoded)
- ✅ TLS connection established
- ✅ Only necessary data included in request
- ✅ Idempotency key used for critical operations (payments)

**Inbound Webhooks**:
- ✅ Webhook signature validated (HMAC with shared secret)
- ✅ Event timestamp is recent (not replayed old event)
- ✅ Event ID checked against processed events (not duplicate)
- ✅ Tenant ID extracted from event payload and validated

---

## Boundary 6: Admin Network ↔ Admin Portal

### Description
The Admin Portal is accessed by internal platform administrators and support engineers, typically from a restricted network (VPN or IP allowlist). This boundary protects high-privilege operations.

### What Crosses This Boundary

**Inbound** (Admins to Admin Portal):
- Admin login requests (credentials, MFA codes)
- Admin operations (user impersonation, tenant configuration, data exports)

**Outbound** (Admin Portal to Admins):
- Admin dashboards and reports
- System health metrics
- Audit logs

### Security Concerns

**High Risk Threats** (due to elevated privileges):
- **Insider threat** - malicious admin exfiltrating data
- **Compromised admin credentials** - attacker gaining admin access
- **Insufficient audit logging** - admin actions not tracked
- **Excessive admin privileges** - admins with more access than needed

### Required Security Controls

| Control | Description | Implementation |
|---------|-------------|----------------|
| **Network Restriction** | Admin portal not publicly accessible | IP allowlist or VPN required |
| **Multi-Factor Authentication** | Mandatory for all admin accounts | TOTP or hardware token (YubiKey) |
| **Comprehensive Audit Logging** | Log all admin actions | Every admin operation logged with: who, what, when, which tenant, reason |
| **Time-Limited Sessions** | Short session expiration | Admin sessions expire after 30 minutes of inactivity |
| **Impersonation Audit Trail** | Track user impersonation | Log impersonation start, end, reason, and all actions taken |
| **Read-Only by Default** | Admins cannot modify tenant data without approval | Impersonation grants read-only access; write requires separate approval |
| **Separation of Duties** | No single admin has all permissions | Platform Admin != Billing Admin != Security Admin |
| **Background Checks** | Verify admin trustworthiness | Background checks for admin personnel |
| **Alert on Sensitive Actions** | Real-time notifications | Alert security team on: bulk data export, privilege changes, unusual access patterns |

### Validation Checkpoints

**Admin Access**:
- ✅ Request originates from allowed IP range or VPN
- ✅ Admin MFA verified
- ✅ Admin session has not expired
- ✅ Admin has required role for requested operation
- ✅ Audit log entry created before operation executes

---

## Boundary 7: Tenant A ↔ Tenant B (Logical Isolation)

### Description
**This is the MOST CRITICAL boundary.** In a multi-tenant system, the logical separation between tenants must be absolutely enforced. A failure here would be catastrophic, allowing one customer to access another's data.

This is not a network boundary but a logical boundary enforced at the application and data layers.

### What Should NEVER Cross This Boundary

- Tenant A users should **never** access Tenant B's data
- Tenant A API keys should **never** work for Tenant B's resources
- Tenant A's queries should **never** return Tenant B's rows
- Tenant A's files should **never** be accessible via Tenant B's signed URLs

### Security Concerns

**CRITICAL Threats**:
- **Broken Object Level Authorization (BOLA)** - Tenant A accessing Tenant B's resources by guessing IDs
- **Missing tenant filter in queries** - Query returns data from all tenants
- **Tenant confusion attacks** - Client manipulating `tenant_id` parameter
- **Shared resource abuse** - Tenant A exhausting rate limits affecting Tenant B
- **Cache key collision** - Tenant A accessing Tenant B's cached data

### Required Security Controls

| Control | Description | Implementation |
|---------|-------------|----------------|
| **Token-Based Tenant Context** | Tenant ID from token only | Extract `tenant_id` from JWT claims; NEVER from client input (query params, body, headers) |
| **Mandatory Query Filters** | Every query includes tenant filter | `WHERE tenant_id = :tenant` on ALL tables with tenant data |
| **Row-Level Security (Defense-in-Depth)** | DB enforces tenant isolation | PostgreSQL RLS policies: `CREATE POLICY ... USING (tenant_id = current_setting('app.tenant_id'))` |
| **Object Storage Prefixing** | Tenant-scoped object keys | All object keys: `tenant-{tenant_id}/...`; validate tenant on signed URL generation |
| **Cache Key Namespacing** | Prevent key collisions | All cache keys: `tenant:{tenant_id}:...` |
| **Queue Message Validation** | Verify tenant in messages | Workers validate `tenant_id` in messages matches expected tenant before processing |
| **Per-Tenant Rate Limiting** | Isolate resource consumption | Rate limits per tenant (not just per IP or global) |
| **Automated Tenant Isolation Testing** | CI/CD validation | Automated tests: User from Tenant A attempts to access Tenant B resource → expect 403 Forbidden |
| **Tenant Context Immutability** | Prevent mid-request changes | Set tenant context once per request (from token) and make immutable |

### Validation Checkpoints

**Every API Request**:
- ✅ `tenant_id` extracted from JWT claims (immutable)
- ✅ `tenant_id` set in request context (cannot be changed)
- ✅ Every database query includes tenant filter (verified by code review + automated tests)
- ✅ IDOR checks: Resource ID in request path belongs to current tenant

**Database Layer**:
- ✅ Row-level security policies active (verify: `SELECT * FROM pg_policies WHERE tablename = 'contacts';`)
- ✅ Connection pool sets `app.tenant_id` session variable for RLS enforcement

**Object Storage**:
- ✅ Signed URL generation validates resource belongs to tenant
- ✅ Object key includes tenant prefix

**Cache**:
- ✅ Cache key includes tenant namespace
- ✅ No shared cache keys across tenants

---

## Boundary Summary Table

| Boundary | Risk Level | Primary Threats | Key Controls |
|----------|------------|-----------------|--------------|
| **1. Internet ↔ Edge** | High | DDoS, SQL injection, brute force | TLS, WAF, rate limiting, authentication |
| **2. Edge ↔ Application** | High | JWT forgery, BOLA, business logic bypass | JWT validation, RBAC, input validation |
| **3. Application ↔ Data** | Critical | SQL injection, missing tenant filter | Parameterized queries, tenant scoping, RLS |
| **4. Application ↔ IdP** | Medium | Token theft, phishing | PKCE, signature validation, MFA |
| **5. Application ↔ Third Party** | Medium | Webhook forgery, API key theft | Signature validation, key rotation, TLS |
| **6. Admin Network ↔ Admin Portal** | High | Insider threat, compromised admin | MFA, IP restrict, audit logging |
| **7. Tenant A ↔ Tenant B** | **CRITICAL** | Cross-tenant data leakage | Token-based tenant context, mandatory filters, RLS |

---

## Testing Trust Boundaries

Each trust boundary must have associated security tests:

1. **Boundary 1 (Internet ↔ Edge)**:
   - Penetration testing of WAF rules
   - Load testing for DDoS resilience
   - Attempt API access without valid token → expect 401

2. **Boundary 2 (Edge ↔ Application)**:
   - Attempt API call with forged JWT → expect 401
   - Attempt API call with expired JWT → expect 401
   - Attempt BOLA attack (access resource with ID from different tenant) → expect 403

3. **Boundary 3 (Application ↔ Data)**:
   - SQL injection tests (automated SAST)
   - Code review: verify ALL queries include `WHERE tenant_id = :tenant`
   - RLS policy tests: attempt cross-tenant query at DB level → expect no rows

4. **Boundary 7 (Tenant Isolation)**:
   - Automated tests: User from Tenant A attempts to GET/PUT/DELETE Tenant B resource → expect 403
   - Cache isolation tests: Set key as Tenant A, attempt retrieval as Tenant B → expect miss
   - Object storage tests: Request signed URL for Tenant B file as Tenant A → expect 403

---

**Next**: Review [STRIDE Threat Analysis](05-threats-stride.md) for detailed threat scenarios.
