# Next.js App Template

Production-ready Next.js scaffold with TypeScript, Tailwind CSS v4, Better Auth, Drizzle ORM, and shadcn/ui.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL
docker compose up -d

# 3. Set up environment
cp .env.example .env
# Edit .env with your values

# 4. Push database schema
npm run db:push

# 5. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15+ (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui + Radix Primitives |
| Auth | Better Auth (email/password + OAuth) |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod |
| Forms | React Hook Form + @hookform/resolvers |
| Linting | ESLint 9 (flat config) + Prettier |
| Git Hooks | Husky + lint-staged |

## Scripts

| Command | Description |
|---------|------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier format |
| `npm run typecheck` | TypeScript check |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:migrate` | Run migrations |
| `npm run db:generate` | Generate migrations |

## Project Structure

```
src/
├── app/                  # App Router pages & layouts
│   ├── (auth)/           # Login, Register
│   ├── (dashboard)/      # Protected pages
│   ├── api/auth/         # Better Auth API handler
│   ├── layout.tsx        # Root layout
│   ├── error.tsx         # Error boundary
│   └── loading.tsx       # Loading state
├── components/
│   ├── ui/               # shadcn/ui (button, input, card, label)
│   └── features/         # Domain components
├── lib/
│   ├── db/               # Drizzle client, schema, migrations
│   ├── auth/             # Better Auth server & client
│   ├── validations/      # Shared Zod schemas
│   └── utils.ts          # cn() helper
├── hooks/                # Custom React hooks
├── types/                # TypeScript types
├── config/env.ts         # Type-safe env with Zod
└── styles/globals.css    # Tailwind v4 theme
```

## Environment Variables

Copy `.env.example` to `.env` and fill in values. All variables are validated at runtime with Zod.

## Docker

```bash
# Local dev database
docker compose up -d

# Production build
docker build -t next-app .
docker run -p 3000:3000 --env-file .env next-app
```

## CI/CD

GitHub Actions workflow at `.github/workflows/ci.yml` runs lint, typecheck, and build on push/PR to main.

## License

MIT
