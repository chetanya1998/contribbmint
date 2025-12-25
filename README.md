# ContribMint

A minimal, role-aware MVP for open-source project insights built with Next.js (App Router), Prisma, Tailwind, and NextAuth.

## Getting started

1. Install dependencies

```bash
pnpm install
```

2. Set environment variables in `.env`:

```
DATABASE_URL="file:./dev.db"
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
GITHUB_TOKEN=personal-access-token
NEXTAUTH_SECRET=development-secret
NEXTAUTH_URL=http://localhost:3000
```

3. Generate the Prisma client and run migrations

```bash
pnpm prisma:generate
pnpm prisma:migrate
```

4. Seed demo data

```bash
pnpm prisma:seed
```

5. Run the dev server

```bash
pnpm dev
```

## Core features
- Public projects directory and project detail pages with role-based insights
- GitHub OAuth via NextAuth with basic RBAC
- Project import, sync via GitHub API polling, and admin approvals
- Contribution events ingestion + simple reputation scoring
- Role dashboards for contributors, maintainers, sponsors, and admins
