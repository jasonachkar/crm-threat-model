# Deployment Guide: Deploy to Vercel

This guide will walk you through deploying your CRM Threat Management Platform to Vercel with a Neon PostgreSQL database.

## Prerequisites

- ✅ Neon database created and configured (already done)
- ✅ GitHub account
- ✅ Vercel account (free tier works)
- ✅ Git installed locally

---

## Step 1: Prepare Your Repository

### 1.1 Initialize Git (if not already done)

```bash
cd /Volumes/Cybersec/Projects/crm/crm-threat-platform
git init
```

### 1.2 Create .gitignore (already created)

Make sure `.env.local` is in `.gitignore` to avoid committing secrets:

```bash
# Verify .gitignore includes .env.local
cat .gitignore | grep env
```

### 1.3 Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click "New Repository"
3. Name it: `crm-threat-platform`
4. Keep it **Private** (recommended for security tools)
5. **Do NOT initialize** with README (we already have files)
6. Click "Create Repository"

### 1.4 Push to GitHub

```bash
# Add all files
git add .

# Create initial commit
git commit -m "feat: Initial CRM Threat Management Platform

- Complete Next.js 14 application with App Router
- Neon PostgreSQL database with Drizzle ORM
- NextAuth.js v5 authentication with RBAC
- 35 threats imported across STRIDE categories
- Dynamic dashboard with Recharts visualizations
- Threat browser with filters
- Requirements and mitigations tracking
- Interactive SVG diagrams
- CSV export functionality
- Status update workflow with audit logging"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/crm-threat-platform.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy to Vercel

### 2.1 Sign Up / Sign In to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" or "Log In"
3. Sign in with GitHub

### 2.2 Import Your Project

1. Click "Add New..." → "Project"
2. Find your `crm-threat-platform` repository
3. Click "Import"

### 2.3 Configure Project

**Framework Preset:** Next.js (auto-detected)
**Root Directory:** `./` (keep default)
**Build Command:** `next build` (default)
**Output Directory:** `.next` (default)

Click "Deploy" (it will fail first - we need to add environment variables)

---

## Step 3: Add Environment Variables

### 3.1 In Vercel Dashboard

After the first deployment attempt:

1. Go to your project settings
2. Click "Settings" → "Environment Variables"
3. Add the following variables:

#### Database Variables (from your Neon dashboard):

| Name | Value | Environment |
|------|-------|-------------|
| `POSTGRES_URL` | `postgresql://neondb_owner:npg_Na3jgvBG4hEZ@ep-blue-rain-adho5lr0-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require` | Production, Preview, Development |
| `POSTGRES_PRISMA_URL` | `postgresql://neondb_owner:npg_Na3jgvBG4hEZ@ep-blue-rain-adho5lr0-pooler.c-2.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require` | Production, Preview, Development |
| `POSTGRES_URL_NON_POOLING` | `postgresql://neondb_owner:npg_Na3jgvBG4hEZ@ep-blue-rain-adho5lr0.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require` | Production, Preview, Development |

#### Authentication Variables:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` | Production, Preview |
| `NEXTAUTH_URL` | Will be `https://your-project.vercel.app` (set after first deploy) | Production |

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```
Copy the output and paste it as the value.

### 3.2 Set NEXTAUTH_URL After First Deploy

After your first successful deployment:

1. Copy your Vercel URL (e.g., `https://crm-threat-platform.vercel.app`)
2. Go back to Settings → Environment Variables
3. Update `NEXTAUTH_URL` with your production URL
4. Click "Save"

---

## Step 4: Database Setup on Production

Your database is already created in Neon, but you need to ensure the schema is pushed:

### 4.1 Option A: Push Schema Locally

```bash
# Make sure .env.local has your Neon credentials
npm run db:push
```

This pushes the schema to your Neon database which is shared between local and production.

### 4.2 Option B: Use Vercel CLI (Advanced)

Install Vercel CLI:
```bash
npm i -g vercel
```

Link your project:
```bash
vercel link
```

Pull environment variables:
```bash
vercel env pull .env.local
```

Push schema:
```bash
npm run db:push
```

---

## Step 5: Seed Production Database

### 5.1 Seed from Local

Since Neon is a cloud database, you can seed it from your local machine:

```bash
npm run seed
```

This will seed your production database with:
- 35 threats
- 3 demo users (admin, editor, viewer)

### 5.2 Verify Seed Success

Check the output - you should see:
```
✓ Users created
✓ Imported TM-001: JWT Token Theft via XSS
...
✅ Database seeding completed successfully!
```

---

## Step 6: Redeploy

After adding environment variables:

1. Go to "Deployments" tab
2. Click "Redeploy" on the latest deployment
3. Wait for build to complete (~2-3 minutes)

---

## Step 7: Test Your Deployment

### 7.1 Access Your App

Visit: `https://your-project.vercel.app`

### 7.2 Test Login

Try logging in with demo accounts:
- **Admin:** `admin@crm-threat.com` / `admin123`
- **Editor:** `editor@crm-threat.com` / `editor123`
- **Viewer:** `viewer@crm-threat.com` / `viewer123`

### 7.3 Verify Features

- ✅ Dashboard loads with real data
- ✅ Charts display correctly
- ✅ Threats page shows all 35 threats
- ✅ Filters work
- ✅ Threat details page displays
- ✅ Status updates work (editor/admin)
- ✅ CSV export works
- ✅ Requirements page loads
- ✅ Mitigations page loads
- ✅ Diagrams display SVGs

---

## Step 8: Custom Domain (Optional)

### 8.1 Add Custom Domain

1. Go to Settings → Domains
2. Click "Add"
3. Enter your domain (e.g., `threats.yourcompany.com`)
4. Follow DNS configuration instructions

### 8.2 Update NEXTAUTH_URL

After adding custom domain:

1. Settings → Environment Variables
2. Update `NEXTAUTH_URL` to your custom domain
3. Redeploy

---

## Troubleshooting

### Build Fails

**Error:** `Cannot find module '@/lib/db'`
**Fix:** Ensure all dependencies are in `package.json`:
```bash
npm install
git add package.json package-lock.json
git commit -m "chore: update dependencies"
git push
```

### Authentication Doesn't Work

**Error:** `[next-auth][error] JWT_SESSION_ERROR`
**Fix:**
1. Regenerate `NEXTAUTH_SECRET`
2. Ensure `NEXTAUTH_URL` matches your deployment URL exactly
3. Redeploy

### Database Connection Fails

**Error:** `VercelPostgresError - 'missing_connection_string'`
**Fix:**
1. Verify all Postgres environment variables are set
2. Check for typos in variable names
3. Ensure variables are set for "Production" environment

### Slow Cold Starts

**Issue:** First request after inactivity is slow
**This is normal** - Vercel serverless functions have cold starts (~1-2s). Subsequent requests are fast.

**Optimization:** Use Vercel Pro for edge caching and reduced cold starts.

---

## Environment Variables Reference

Complete list for copy-paste:

```env
# Database (Neon)
POSTGRES_URL=postgresql://neondb_owner:npg_Na3jgvBG4hEZ@ep-blue-rain-adho5lr0-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
POSTGRES_PRISMA_URL=postgresql://neondb_owner:npg_Na3jgvBG4hEZ@ep-blue-rain-adho5lr0-pooler.c-2.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require
POSTGRES_URL_NON_POOLING=postgresql://neondb_owner:npg_Na3jgvBG4hEZ@ep-blue-rain-adho5lr0.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

# Authentication
NEXTAUTH_SECRET=[Generate with: openssl rand -base64 32]
NEXTAUTH_URL=https://your-project.vercel.app
```

---

## Post-Deployment Checklist

- [ ] App is accessible at Vercel URL
- [ ] Login works with all 3 demo accounts
- [ ] Dashboard displays real data from database
- [ ] All 35 threats are visible in threats page
- [ ] Filters work correctly
- [ ] Status updates work (test with editor account)
- [ ] CSV export downloads file
- [ ] Charts render on dashboard
- [ ] SVG diagrams display correctly
- [ ] User role permissions work (viewer can't edit)

---

## Security Considerations

### Production Security Checklist

- [ ] **Change default passwords** - Update demo user passwords in production
- [ ] **Environment variables secured** - Never commit `.env.local` to git
- [ ] **Database credentials rotated** - Consider rotating Neon credentials periodically
- [ ] **HTTPS enforced** - Vercel automatically provides SSL
- [ ] **Repository is private** - GitHub repo should be private for security tools
- [ ] **Audit logging enabled** - Already implemented in the app
- [ ] **Rate limiting** - Consider adding rate limiting for production (Vercel Pro)

### Update Demo Passwords

After deployment, update user passwords:

```sql
-- Connect to Neon database and run:
UPDATE users SET password_hash = '$2b$10$NEW_HASH' WHERE email = 'admin@crm-threat.com';
UPDATE users SET password_hash = '$2b$10$NEW_HASH' WHERE email = 'editor@crm-threat.com';
UPDATE users SET password_hash = '$2b$10$NEW_HASH' WHERE email = 'viewer@crm-threat.com';
```

Generate new hash with:
```javascript
const bcrypt = require('bcryptjs');
console.log(await bcrypt.hash('YOUR_NEW_PASSWORD', 10));
```

---

## Maintenance & Updates

### Deploy Updates

```bash
# Make changes locally
git add .
git commit -m "feat: your changes"
git push

# Vercel auto-deploys on push to main
```

### Database Migrations

When updating schema:

```bash
# Update schema.ts locally
# Then push changes
npm run db:push

# Commit schema changes
git add src/lib/db/schema.ts
git commit -m "chore: update database schema"
git push
```

### Monitoring

**Vercel Analytics:**
1. Go to project → Analytics tab
2. View traffic, performance, and errors

**Neon Monitoring:**
1. Go to Neon dashboard
2. View database metrics and queries

---

## Cost Breakdown

### Free Tier Limits

**Vercel Free:**
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Serverless functions
- ⚠️ No edge caching

**Neon Free:**
- ✅ 3 GB storage
- ✅ Unlimited compute hours
- ✅ Auto-suspend after inactivity
- ✅ Connection pooling

**Your App Usage:**
- Database: ~10-50 MB (35 threats + users)
- Traffic: Depends on usage
- **Estimated:** Stays within free tiers for <1000 users/month

---

## Advanced: CI/CD Pipeline

### GitHub Actions (Optional)

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
```

---

## Support & Resources

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Neon Docs:** [neon.tech/docs](https://neon.tech/docs)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **Issues:** GitHub repository issues tab

---

**Congratulations!** 🎉

Your CRM Threat Management Platform is now deployed and accessible worldwide!

**Next Steps:**
1. Share the URL with your team
2. Update demo passwords for security
3. Add your own threats and requirements
4. Customize branding and colors
5. Monitor usage via Vercel Analytics

**Deployment URL:** `https://your-project.vercel.app`
