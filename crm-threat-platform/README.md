# CRM Threat Management Platform

A full-stack threat management platform built with Next.js 14 that transforms a static threat model into an interactive, database-backed web application with authentication, CRUD operations, and status tracking.

## Features

- **Authentication**: Secure login with NextAuth.js v5 and role-based access control (Admin, Editor, Viewer)
- **Threat Management**: Browse, search, and filter 35 security threats across STRIDE categories
- **Requirements Tracking**: Monitor security requirements implementation status
- **Mitigations Roadmap**: Track mitigation efforts with priority and timeline management
- **Interactive Diagrams**: Clickable SVG architecture diagrams showing affected components
- **Audit Trail**: Complete logging of all changes with user attribution
- **Responsive Design**: Built with shadcn/ui and Tailwind CSS

## Technology Stack

- **Framework**: Next.js 14 (App Router with React Server Components)
- **Database**: Vercel Postgres (Neon) with Drizzle ORM
- **Authentication**: NextAuth.js v5
- **UI Library**: shadcn/ui + Tailwind CSS
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
│   │   │   └── login/          # Login page
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx      # Dashboard layout with sidebar
│   │   │   ├── page.tsx        # Dashboard home
│   │   │   ├── threats/        # Threat management pages
│   │   │   ├── requirements/   # Requirements tracking
│   │   │   ├── mitigations/    # Mitigations roadmap
│   │   │   └── diagrams/       # Interactive diagrams
│   │   └── api/
│   │       ├── auth/           # NextAuth routes
│   │       ├── threats/        # Threat API endpoints
│   │       └── ...
│   ├── components/
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/
│   │   ├── auth.ts             # NextAuth configuration
│   │   └── db/
│   │       ├── schema.ts       # Drizzle ORM schema
│   │       └── index.ts        # Database connection
│   └── types/
│       └── next-auth.d.ts      # TypeScript definitions
├── scripts/
│   └── seed-data.ts            # Database seeding script
├── public/
│   └── diagrams/               # SVG architecture diagrams
├── drizzle.config.ts           # Drizzle configuration
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

## Development Roadmap

### Phase 1: Foundation ✅ (Completed)
- [x] Next.js project setup
- [x] Database schema with Drizzle
- [x] NextAuth.js authentication
- [x] Seed script for data import
- [x] Basic dashboard and layout

### Phase 2: Threat Management (In Progress)
- [ ] Threat browser with filters
- [ ] Threat detail pages
- [ ] Create/edit threat forms
- [ ] API endpoints for CRUD operations

### Phase 3: Additional Features
- [ ] Requirements checklist page
- [ ] Mitigations roadmap page
- [ ] Interactive SVG diagrams
- [ ] Audit trail viewer

### Phase 4: Polish
- [ ] Search functionality
- [ ] Export capabilities (CSV, PDF)
- [ ] Dark mode
- [ ] Mobile responsiveness improvements

## Contributing

This is a private security tool. Ensure all security best practices are followed when making changes.

## License

Proprietary - Internal use only

---

**Built with ❤️ for enhanced security threat management**
