## Real‑time Todo App (Next.js + Socket.io + PostgreSQL + Drizzle)

Minimal full‑stack example:

- Next.js App Router UI
- Socket.io for realtime
- PostgreSQL + Drizzle ORM
- LISTEN/NOTIFY triggers for live updates

### Prerequisites

- Node 20+
- pnpm
- A PostgreSQL database (local, Docker, or hosted like Neon/Supabase)

### 1) Install dependencies

```bash
pnpm install
```

### 2) Configure environment

Create a `.env` file in the project root:

```env
# Required by both the app and the socket server
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DBNAME
# If your provider exposes POSTGRES_URL instead, you can use that; the socket server will accept either
# POSTGRES_URL=postgres://USER:PASSWORD@HOST:5432/DBNAME

# Optional
SOCKET_PORT=3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Notes:

- The socket server explicitly loads `.env`.
- Next.js automatically reads `.env.local` and `.env.development.local` as well.

### 3) Create and migrate the database

Generate migrations from the Drizzle schema and apply them:

```bash
pnpm db:generate
pnpm db:migrate
```

Optional: enable realtime DB notifications (LISTEN/NOTIFY) via SQL scripts:

```bash
psql "$DATABASE_URL" -f src/scripts/001-create-todos-table.sql -f src/scripts/002-optimize-triggers.sql
```

### 4) Run the app (two processes)

Terminal 1 (Next.js):

```bash
pnpm dev
```

Terminal 2 (Socket.io server):

```bash
pnpm dev:socket
```

Open http://localhost:3000

### Available scripts

- Dev (Next.js): `pnpm dev`
- Dev (Socket server): `pnpm dev:socket`
- Generate migrations: `pnpm db:generate`
- Apply migrations: `pnpm db:migrate`
- Drizzle Studio: `pnpm db:studio`

### Tech overview

- UI: Next.js (App Router), Tailwind CSS
- Realtime: Socket.io
- Data: PostgreSQL, Drizzle ORM
- Realtime flow: DB triggers -> PostgreSQL NOTIFY -> server listens -> broadcasts socket events

### Troubleshooting

- “DATABASE_URL environment variable is required”: ensure `.env` exists at repo root and the value is a valid PostgreSQL connection string.
- “SASL: client password must be a string”: your `DATABASE_URL` must contain a plain string password (no objects/JSON). Check your provider’s connection string.
