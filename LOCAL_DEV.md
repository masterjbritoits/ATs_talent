# Local Development Quick Start — ATs Talent

**Status**: ✅ Ready for local testing (SQLite)

## Current Setup

- **Database**: SQLite (`./prisma/dev.db`)
- **Storage**: Local filesystem (`./storage/`)
- **Async queues**: Disabled (sync mode)
- **Telemetry**: Disabled (for local dev)
- **Graph/AI**: Disabled (optional, requires credentials)

## Running Locally

### 1️⃣ First Time Setup
```powershell
# Already done, but for reference:
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run init:storage
```

### 2️⃣ Start Dev Server
```powershell
npm run dev
```

Then open: **http://localhost:3000**

### 3️⃣ Login Credentials (seeded)
| Email | Password | Role |
|-------|----------|------|
| `admin@itsector.pt` | `Admin123!` | Admin |
| `joana.recruiter@itsector.pt` | `Recruiter123!` | Recruiter |

### 4️⃣ Health Check
```powershell
# Should return 200 "ok"
curl http://localhost:3000/api/health
```

---

## Two-Database Strategy

### Phase 1: Local Dev (Current — SQLite)
- Fast, no setup friction
- Single-user only
- Files in `.env.local` point to `file:./prisma/dev.db`
- Use this for UI testing, feature development

### Phase 2: PostgreSQL (When Ready)

**Option A: Windows Native PostgreSQL**
1. Download & install [PostgreSQL 16+](https://www.postgresql.org/download/windows/)
2. Create database: `atsdb`, user: `postgres`, password: `postgres`
3. Switch schema: `./scripts/switch-db.ps1 postgres`
4. Update `.env.local`:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/atsdb"
   DIRECT_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/atsdb"
   ```
5. Run: `npm run db:push && npm run db:seed`

**Option B: WSL2 + Docker Desktop (Recommended for modern setup)**
```powershell
# Requires WSL2 + Docker Desktop installed
docker run --name postgres-ats -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=atsdb -p 5432:5432 -d postgres:16
# Then same as Option A, steps 3–5
```

**Option C: Cloud PostgreSQL (Quick remote testing)**
- [Neon](https://neon.tech) — free tier, PostgreSQL hosting
- Get connection string, update `.env.local`, run `npm run db:push`

---

## File Structure (Dev)

```
.env.local                          # Local dev config (SQLite)
.env.local-dev                      # Reference config (documented)
.env.example                        # Production template
prisma/
  schema.prisma                     # Active schema (currently SQLite)
  schema.sqlite.prisma              # SQLite version
  schema.prisma.postgres            # PostgreSQL version (backed up)
  dev.db                            # SQLite database file
scripts/
  switch-db.ps1                     # Switch between SQLite ↔ PostgreSQL
storage/
  raw-emails/
  attachments/
  processed/
  ocr/
  exports/
  temp/
```

---

## Key Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (Next.js) |
| `npm run build` | Production build |
| `npm run test` | Run Vitest |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:push` | Sync schema to database |
| `npm run db:migrate` | Create Prisma migration |
| `npm run db:seed` | Load seed data (users, jobs, candidates) |
| `npm run init:storage` | Create storage folders |
| `npm run sync:now` | Trigger mailbox sync (Graph required) |
| `./scripts/switch-db.ps1 sqlite` | Switch to SQLite |
| `./scripts/switch-db.ps1 postgres` | Switch to PostgreSQL |

---

## Next Steps → Production

Once local testing is complete:

### Phase 2.1: Set up PostgreSQL (Option A, B, or C above)
### Phase 2.2: Configure Microsoft Graph
- Create Azure AD App Registration
- Set `MICROSOFT_TENANT_ID`, `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`
- Test: `npm run sync:now`

### Phase 2.3: Deploy to Azure (5 Steps)
1. Create Azure resource group + PostgreSQL + Storage + Service Bus
2. Create App Service
3. Configure secrets in Key Vault
4. Push code → GitHub
5. CI pipeline auto-deploys

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `DATABASE_URL not found` | Ensure `.env.local` exists with `DATABASE_URL="file:./prisma/dev.db"` |
| `npm run dev` hangs | Kill: `Stop-Process -Name node -Force` |
| Storage errors | Run: `npm run init:storage` |
| Seed fails | Delete `./prisma/dev.db`, then `npm run db:push && npm run db:seed` |
| Port 3000 in use | `netstat -ano \| findstr :3000`, then `taskkill /PID <pid> /F` |

---

## Current Limitations (Local SQLite)

- ❌ No multi-instance concurrency (App Service needs PostgreSQL)
- ❌ No Service Bus async queuing (sync-only)
- ❌ No Application Insights telemetry (disabled for local)
- ❌ No Graph mailbox sync (requires credentials)
- ❌ No AI features (requires Foundry setup)

All of these are **enabled automatically** when DATABASE_URL switches to PostgreSQL and you deploy to Azure.

---

**Last updated**: 2026-04-18
**Schema**: SQLite (switch to PostgreSQL when ready)
**Health**: ✅ Passing (db: ok, storage: local-fs, health: 200)
