# ITSector Talent Inbox ATS

## Product Overview
ITSector Talent Inbox ATS is a local-first applicant tracking system built for the internal talent team recruiter workflow behind `careers@itsector.pt`. It converts Microsoft 365 mailbox intake into structured candidates, applications, ranked job pipelines, reusable talent-pool records, email workflows, interview scheduling, and operational exports.

## Business Problem
Applications currently arrive by email and require manual reading, CV interpretation, status tracking, and follow-up. This project replaces that fragmented process with a Windows-friendly ATS that can run on a recruiter workstation today and evolve into a modular enterprise deployment later.

## Feature Set
- Local session-based authentication with bcrypt password hashing
- Microsoft Graph-first mailbox sync architecture with provider abstraction
- Email storage, candidate/application creation, attachment preservation, and CV parsing
- Optional OCR fallback via Tesseract.js
- Candidate normalization, heuristic scoring, recommendation thresholds, and per-job ranking
- Jobs module with manual creation API, JSON import, import-run logging, and seeded vacancies
- Recruiter dashboard, inbox processing view, candidate list, candidate detail, jobs, talent pool, templates, reports, settings, and user admin pages
- Email drafting and sending with Microsoft Graph support and local heuristic fallback
- Microsoft 365 calendar interview scheduling support
- Excel export to local storage
- Duplicate review queue and talent-pool role suggestion logic
- Seeded jobs, templates, candidates, duplicate cases, spontaneous applications, and near-fit talent pool profiles

## Architecture
- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS, TanStack Table, Recharts
- Backend: Next.js route handlers plus service/repository layering
- Database: SQLite with Prisma
- Storage: local filesystem under `./storage`
- Integrations: Microsoft Graph mailbox/email/calendar connectors
- Parsing: `pdf-parse`, `mammoth`, `mailparser`-ready architecture, optional OCR
- Reporting: ExcelJS exports

See [architecture.md](/C:/Users/e617/OneDrive%20-%20ALTEN%20Group/Documentos/Projetos/ATs_talent/docs/architecture.md) and [data-model.md](/C:/Users/e617/OneDrive%20-%20ALTEN%20Group/Documentos/Projetos/ATs_talent/docs/data-model.md).

## Stack
- Node.js LTS
- Next.js 15
- React 19
- Prisma + SQLite
- Tailwind CSS
- Vitest

## Local Windows Setup
1. Install Node.js LTS.
2. Open PowerShell in the project root.
3. Run `npm.cmd install`.
4. Review `.env` or copy values from `.env.example`.
5. Run `npx.cmd prisma db push`.
6. Run `npm.cmd run db:seed`.
7. Run `node -e "const fs=require('fs');['storage/raw-emails','storage/attachments','storage/processed','storage/ocr','storage/exports','storage/temp'].forEach(d=>fs.mkdirSync(d,{recursive:true}))"`.
8. Run `npm.cmd run dev`.
9. Open `http://localhost:3000/login`.

## Microsoft Graph Setup Instructions
- Register an Azure AD / Microsoft Entra application for the recruiter workstation environment.
- Configure application credentials and populate:
  - `MICROSOFT_TENANT_ID`
  - `MICROSOFT_CLIENT_ID`
  - `MICROSOFT_CLIENT_SECRET`
  - `MICROSOFT_USER_EMAIL=careers@itsector.pt`
- Required Graph scopes for the intended production flow:
  - Mail.Read
  - Mail.ReadWrite if folder/tag actions are enabled later
  - Mail.Send
  - Calendars.ReadWrite
  - User.Read basic identity bootstrap if token acquisition is expanded
- Current connector code assumes a bearer token-compatible app registration path and can be upgraded to full OAuth token acquisition in the next phase.

## Environment Variables
See [.env.example](/C:/Users/e617/OneDrive%20-%20ALTEN%20Group/Documentos/Projetos/ATs_talent/.env.example) for the full list. The project includes:
- app/session configuration
- Graph credentials
- mailbox polling controls
- OCR controls
- optional AI provider keys
- local storage paths

## Database Init
- `npx.cmd prisma db push`
- `npm.cmd run db:seed`

Database file:
- `./prisma/dev.db`

## Storage Init
Storage folders used by the system:
- `./storage/raw-emails`
- `./storage/attachments`
- `./storage/processed`
- `./storage/ocr`
- `./storage/exports`
- `./storage/temp`

## Run Commands
- Development: `npm.cmd run dev`
- Build: `npm.cmd run build`
- Production start: `npm.cmd run start`
- Type validation: `npm.cmd run lint`
- Tests: `npm.cmd run test`
- Sync now: `npm.cmd run sync:now`
- Import jobs: `npm.cmd run jobs:import -- public/sample-jobs.json`

## Seeded Login Accounts
- Admin: `admin@itsector.pt` / `Admin123!`
- Recruiter: `joana.recruiter@itsector.pt` / `Recruiter123!`

## Troubleshooting
- If `prisma` fails in PowerShell because of policy restrictions, use `npx.cmd prisma ...`.
- If Graph is not configured, mailbox sync, outbound send, and calendar creation fall back to local-safe behavior without cloud calls.
- If OCR is not needed, leave `OCR_ENABLED=false`.
- If an attachment parses poorly, review the raw attachment under `storage/attachments`.
- If the seed script fails under a restricted shell, run it from a standard local PowerShell or Command Prompt session.

## Roadmap
### Phase 1 – Core ATS Foundation
- Auth, local DB, dashboard, jobs, candidates, mailbox sync, CV parsing, scoring, templates, manual send

### Phase 2 – Operational Productivity
- Vacancy import, ranking by job, bulk actions, Excel export, duplicate detection, talent pool intelligence

### Phase 3 – Smart Workflow Enhancement
- OCR, calendar integration, AI summaries, AI email suggestions, advanced reporting, hardened Graph auth flow
