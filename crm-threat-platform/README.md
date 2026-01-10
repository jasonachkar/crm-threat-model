# CRM Threat Management Platform

A **full-stack enterprise threat management platform** built with Next.js 14 that transforms a static threat model into an interactive, database-backed web application with authentication, CRUD operations, comprehensive risk analytics, and compliance mapping.

## 🎯 Key Features for Security Professionals

### 📊 Executive Dashboard
- **Security Posture Score** - Real-time composite score (0-100) based on SLA compliance, risk reduction, and mitigation coverage
- **Risk Trend Analysis** - 6-month visualization of risk exposure trends
- **SLA Tracking** - P0/P1/P2 deadline monitoring with breach alerts
- **MTTR Metrics** - Mean Time to Remediate with velocity tracking

### 🔥 Risk Scoring Engine
- **CVSS-like Risk Calculations** - Automated risk scoring (0-10) combining:
  - CIA impact assessment (weighted average)
  - Likelihood probability
  - Priority urgency multipliers
- **Risk Heat Map** - Interactive Likelihood vs Impact matrix visualization
- **Percentile Ranking** - Compare threats against the entire portfolio

### 📋 Compliance Framework Mapping
Threats automatically mapped to major security frameworks:
- **NIST Cybersecurity Framework (CSF)** - ID, PR, DE, RS, RC functions
- **CIS Critical Security Controls v8** - 18 control families
- **ISO 27001** - Annex A controls
- **SOC 2 Trust Service Criteria** - CC1-CC9
- **OWASP Top 10 (2021)** - Web application security risks

### ⚔️ MITRE ATT&CK Integration
- **Enterprise Tactics Mapping** - 12 ATT&CK tactics covered
- **Technique Coverage** - 25+ techniques mapped from threat patterns
- **Interactive Matrix View** - Visual representation with threat counts
- **External References** - Direct links to MITRE ATT&CK knowledge base

### 🛡️ Attack Surface Analytics
- **Component Risk Aggregation** - Treemap visualization of affected components
- **Owner Distribution** - Workload analysis by responsible teams
- **STRIDE Distribution** - Threat category breakdown with pie charts

### 📈 Security Metrics (KPIs)
- **Threat Velocity** - Threats resolved per month
- **Average Age of Open Threats** - Aging analysis in days
- **SLA Compliance Rate** - Percentage meeting remediation deadlines
- **Risk Reduction Progress** - Percentage of initial risk mitigated
- **Coverage Metrics** - Owner assignment and mitigation plan coverage

### 📄 Executive Reporting
- **HTML Reports** - Print-ready executive summaries
- **CSV Exports** - Full threat data with risk scores
- **JSON Exports** - Complete data for integration

## Technology Stack

- **Framework**: Next.js 16 (App Router with React Server Components)
- **Database**: Vercel Postgres (Neon) with Drizzle ORM
- **Authentication**: NextAuth.js v5 (Beta)
- **UI Library**: shadcn/ui + Tailwind CSS
- **Charts**: Recharts for data visualization
- **State Management**: TanStack Query (server state) + Zustand (client state)
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ and npm
- Vercel account (for Postgres database)
- Git

## Getting Started

### 1. Clone the Repository

This project is located in `/Volumes/Cybersec/Projects/crm/crm-threat-platform/`

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

#### Create Vercel Postgres Database

1. Go to [vercel.com](https://vercel.com) and sign in
2. Create a new project or select existing one
3. Go to Storage → Create Database → Postgres
4. Copy the connection strings

#### Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Database (from Vercel Postgres dashboard)
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."

# Authentication
NEXTAUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

#### Push Database Schema

```bash
npm run db:push
```

This creates all required tables (users, threats, requirements, mitigations, audit_log).

### 4. Seed Data

Import the 35 threats and create demo users:

```bash
npm run seed
```

This creates:
- 35 threats from `../crm-threat-model/tables/threats.csv`
- 3 demo users:
  - `admin@crm-threat.com` / `admin123` (Admin role)
  - `editor@crm-threat.com` / `editor123` (Editor role)
  - `viewer@crm-threat.com` / `viewer123` (Viewer role)

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with one of the demo accounts.

## Project Structure

```
crm-threat-platform/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/              # Login page
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx          # Dashboard layout with sidebar
│   │   │   ├── page.tsx            # Executive dashboard
│   │   │   ├── threats/            # Threat management pages
│   │   │   ├── requirements/       # Requirements tracking
│   │   │   ├── mitigations/        # Mitigations roadmap
│   │   │   ├── compliance/         # Compliance framework mapping (NEW)
│   │   │   ├── attack-matrix/      # MITRE ATT&CK visualization (NEW)
│   │   │   ├── attack-surface/     # Component risk analysis (NEW)
│   │   │   └── diagrams/           # Interactive diagrams
│   │   └── api/
│   │       └── auth/               # NextAuth routes
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── executive-dashboard.tsx # KPI dashboard (NEW)
│   │   ├── risk-heat-map.tsx       # Risk matrix (NEW)
│   │   ├── compliance-dashboard.tsx # Framework coverage (NEW)
│   │   ├── mitre-attack-matrix.tsx # ATT&CK visualization (NEW)
│   │   ├── attack-surface.tsx      # Component analysis (NEW)
│   │   ├── risk-score-badge.tsx    # Risk score display (NEW)
│   │   ├── export-report.tsx       # Report generation (NEW)
│   │   └── ...
│   ├── lib/
│   │   ├── auth.ts                 # NextAuth configuration
│   │   ├── risk-scoring.ts         # CVSS-like scoring engine (NEW)
│   │   ├── compliance-mapping.ts   # Framework mappings (NEW)
│   │   ├── mitre-attack.ts         # ATT&CK integration (NEW)
│   │   ├── security-metrics.ts     # KPI calculations (NEW)
│   │   └── db/
│   │       ├── schema.ts           # Drizzle ORM schema
│   │       └── index.ts            # Database connection
│   └── types/
│       └── next-auth.d.ts          # TypeScript definitions
├── scripts/
│   └── seed-data.ts                # Database seeding script
├── public/
│   └── diagrams/                   # SVG architecture diagrams
├── drizzle.config.ts               # Drizzle configuration
└── package.json
```

## Database Schema

### Users
- Authentication and role-based access control (admin/editor/viewer)

### Threats
- 35 threats with STRIDE categorization
- Impact analysis (Confidentiality, Integrity, Availability)
- Risk assessment (Likelihood, Severity, Priority)
- OWASP Top 10 mapping
- Status tracking

### Requirements
- Security requirements checklist
- Implementation status tracking
- Links to related threats

### Mitigations
- Remediation roadmap
- Priority and effort estimates
- Timeline tracking

### Audit Log
- Complete change history
- User attribution
- IP and user agent tracking

## New Features (Security Enhancement Update)

### Risk Scoring Engine (`/lib/risk-scoring.ts`)
- Calculates CVSS-like risk scores (0-10) for each threat
- Considers CIA triad impact (weighted: C=40%, I=35%, A=25%)
- Applies likelihood probability and priority multipliers
- Provides risk level classification: Critical, High, Medium, Low
- Calculates percentile ranking across all threats

### Compliance Framework Mapping (`/lib/compliance-mapping.ts`)
- Maps STRIDE categories to compliance controls
- Supports 5 major frameworks:
  - NIST CSF (11 controls)
  - CIS Controls v8 (18 controls)
  - ISO 27001 Annex A (14 controls)
  - SOC 2 Trust Service Criteria (9 controls)
  - OWASP Top 10 2021 (10 controls)
- Calculates coverage percentages and identifies gaps

### MITRE ATT&CK Integration (`/lib/mitre-attack.ts`)
- Maps threats to ATT&CK tactics and techniques
- Pattern-based technique detection (XSS, credential, phishing, injection, etc.)
- Coverage statistics across the matrix
- External links to MITRE ATT&CK knowledge base

### Security Metrics Engine (`/lib/security-metrics.ts`)
- SLA tracking with breach detection (P0: 30 days, P1: 90 days, P2: 180 days)
- Mean Time to Remediate (MTTR) calculation
- Threat velocity estimation
- Owner and component distribution analysis

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio (database GUI)
- `npm run db:generate` - Generate migrations
- `npm run seed` - Seed database with initial data

## User Roles

| Action | Viewer | Editor | Admin |
|--------|--------|--------|-------|
| View content | ✅ | ✅ | ✅ |
| Update status | ❌ | ✅ | ✅ |
| Create/edit threats | ❌ | ✅ | ✅ |
| Delete threats | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

## Deployment to Vercel

### 1. Push to Git

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Follow the prompts to link your project and deploy.

### 3. Add Environment Variables

In the Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.local`
3. Redeploy the project

### 4. Run Database Operations

After deployment:
```bash
vercel env pull .env.local  # Pull production env vars
npm run db:push             # Push schema to production DB
npm run seed                # Seed production data
```

## Security Features Showcase

### For Cloud Security Professionals
- ✅ Multi-framework compliance mapping (NIST, CIS, ISO, SOC2)
- ✅ MITRE ATT&CK technique coverage analysis
- ✅ Risk-based prioritization with CVSS-like scoring
- ✅ Attack surface visualization by component
- ✅ SLA tracking and breach detection

### For Cybersecurity Recruiters
- ✅ Demonstrates security domain expertise
- ✅ Shows understanding of threat modeling (STRIDE)
- ✅ Implements industry-standard frameworks
- ✅ Modern, professional UI with executive dashboards
- ✅ Full-stack development capabilities

### For Security Managers
- ✅ Executive-level reporting and KPIs
- ✅ Risk trend analysis and forecasting
- ✅ Team workload distribution insights
- ✅ Compliance gap identification
- ✅ PDF/CSV/JSON export capabilities

## Contributing

This is a private security tool. Ensure all security best practices are followed when making changes.

## License

Proprietary - Internal use only

---

**Built with ❤️ for enhanced security threat management**
