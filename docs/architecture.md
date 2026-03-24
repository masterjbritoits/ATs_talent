# Architecture

## Overview
The system is a modular local-first ATS implemented in Next.js with App Router. UI routes, API endpoints, services, repositories, Prisma persistence, and local storage are separated so the workstation MVP can evolve into a larger deployment without rewriting the core domain logic.

## Layers
- `app/`: routes, route handlers, page composition
- `components/`: recruiter/admin UI
- `lib/`: shared utilities, Graph adapter, parsing, scoring, exports, validators
- `server/repositories/`: persistence access patterns
- `server/services/`: mailbox sync, parsing, scoring, duplicate detection, vacancy import, reporting, email suggestions, calendar
- `prisma/`: schema and seed
- `storage/`: local operational files

## Key Design Decisions
- Graph-first mailbox integration rather than IMAP-first
- SQLite for local operational simplicity
- Service-layer orchestration for scoring, parsing, and synchronization
- Filesystem preservation of original attachments
- Optional OCR and optional AI, both disabled by default

## Core Workflow
1. Sync inbox
2. Classify email
3. Persist raw message
4. Save and parse attachments
5. Extract candidate profile
6. Match likely job
7. Create/update candidate and application
8. Score and rank
9. Surface results in dashboard and candidate views
