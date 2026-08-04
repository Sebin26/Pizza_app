# D Town Pizza — In-Store Digital Ordering (MVP)

A compact, in-store digital ordering app for restaurant tables — guest checkout, interactive pizza customizer, and a staff dashboard for kitchen workflow and simple administration.

## Quick overview
- Customer-facing app for building and submitting in-restaurant orders (no customer accounts required).
- Staff/kitchen portal (/staff) for live order queue and status transitions.
- Admin portal (/admin) for menu and pricing management, basic analytics, and user management.

## Features
- Interactive pizza customizer with size, crust, sauce, toppings, and add-ons.
- Guest checkout (name + optional phone number) and live order tracking (token number + ETA).
- Staff dashboard with audio/visual alerts and order status controls.
- Admin CRUD for categories, menu items, pizza factors, and staff accounts.

## Tech stack
- Framework: Next.js 16 (App Router) + React + TypeScript
- Styling: Tailwind CSS
- ORM: Prisma v6
- Database: PostgreSQL (configured via DATABASE_URL)
- Runtime: Node.js (use a modern LTS, e.g. Node 18+)

## Repository pointers
- App root and routes: src/app
- Components: src/components
- Prisma schema & migrations: prisma/schema.prisma and prisma/migrations
- Seed script: prisma/seed.ts
- Environment variables example: .env.example

## Prerequisites
- Node.js (recommended LTS)
- PostgreSQL accessible via a connection string
- npm or pnpm

## Environment
Copy .env.example to .env and update values. At minimum set DATABASE_URL and SESSION_SECRET.

Example .env entries (see .env.example):

DATABASE_URL="postgresql://user:password@localhost:5432/pizza_app_db"
SESSION_SECRET=replace_with_secure_random_value

Do NOT commit .env to source control.

## Setup (local development)
1. Install dependencies:

```bash
npm install
```

2. Generate Prisma client:

```bash
npx prisma generate
```

3. Apply migrations (if you want to run DB migrations locally):

```bash
npx prisma migrate deploy
```

4. Seed the database (optional — requires a reachable Postgres instance):

```bash
npx tsx prisma/seed.ts
```

5. Run the development server:

```bash
npm run dev
```

The app listens on http://localhost:3000 by default.

## Scripts
- npm run dev — start Next.js in development
- npm run build — build for production
- npm run start — run the production build
- npm run lint — run ESLint
- Prisma seed is configured in package.json via the prisma.seed entry and uses tsx prisma/seed.ts.

## Prisma & Database notes
- The Prisma schema is at prisma/schema.prisma. The project expects a Postgres database configured through DATABASE_URL.
- Migrations are stored under prisma/migrations. To create a new migration after schema changes, run:

```bash
npx prisma migrate dev --name descriptive_migration_name
```

## Security & secrets
- Ensure SESSION_SECRET is a long, random value in production.
- Do not commit .env or any production credentials into git.

## Common maintenance commands
- Check vulnerabilities and audit packages:

```bash
npm audit
```

- Regenerate Prisma client after schema changes:

```bash
npx prisma generate
```

## Troubleshooting
- If npx prisma generate fails, confirm DATABASE_URL is set in .env and that the Postgres server is reachable.
- If native packages fail to install (for example sharp), ensure system build tools and libraries are present (libvips for sharp).

## Next recommended steps
1. Confirm a local Postgres instance and set DATABASE_URL in .env.
2. Run migrations and seed to populate sample data.
3. Start the dev server and open /login to try the default credentials seeded by prisma/seed.ts (admin/admin123, staff/staff123).

## Contributing
Open a PR with changes; run npm install and npx prisma generate locally before submitting.

---
If you'd like, I can now run npm run lint, start the dev server, or apply migrations + seed the database for you.
