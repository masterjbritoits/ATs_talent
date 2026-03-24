# Local Windows Deployment

## Target Setup
- Windows recruiter workstation
- Node.js LTS installed
- Local filesystem storage
- SQLite local database
- Optional Microsoft 365 connectivity

## Boot Sequence
1. `npm.cmd install`
2. `npx.cmd prisma db push`
3. `npm.cmd run db:seed`
4. Initialize storage directories
5. `npm.cmd run dev` or `npm.cmd run build` then `npm.cmd run start`

## Local Production Mode
- Use `npm.cmd run build`
- Use `npm.cmd run start`
- Keep `.env` configured with production-like local values
- Back up `prisma/dev.db` and `storage/`
