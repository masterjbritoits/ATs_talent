# Admin Manual

## Configure Microsoft 365 / Graph
- Populate Graph credentials in `.env`.
- Set `MICROSOFT_USER_EMAIL=careers@itsector.pt`.
- Validate that the app registration can access the target mailbox and calendar.

## App Registration Assumptions
- Single-tenant internal registration is acceptable for the workstation MVP.
- App secret storage is environment-based and local to the workstation.
- The current connector assumes bearer-token-capable configuration and is designed for later expansion into a fuller OAuth/token service.

## Mailbox Permissions
- Mail.Read
- Mail.Send
- Mail.ReadWrite for future mailbox state management

## Calendar Permissions
- Calendars.ReadWrite

## Scoring Configuration
- Default weights and thresholds are seeded.
- Settings can be stored in `SystemSetting` and `ScoringConfig`.
- Threshold model:
  - Advance: `>=75`
  - Manual Review: `45-74`
  - Reject: `<45`

## OCR Setup
- Set `OCR_ENABLED=true` to allow fallback OCR.
- Set `OCR_LANGUAGE=eng` or another Tesseract language pack identifier.

## Job Import
- JSON import can be triggered through the import service and sample script.
- Sample source file: `public/sample-jobs.json`
- Import runs are logged in `ImportRun`.

## Recruiter Management
- Users are visible under `/admin/users`.
- Roles are `ADMIN` and `RECRUITER`.
- Passwords are bcrypt-hashed.

## Backups
- Back up:
  - `prisma/dev.db`
  - `storage/attachments`
  - `storage/exports`
  - `.env`

## Database Reset
1. Stop the app.
2. Delete `prisma/dev.db`.
3. Run `npx.cmd prisma db push`.
4. Run `npm.cmd run db:seed`.

## Common Issues
- Graph not configured: mailbox sync uses safe fallback behavior with no live cloud read/write.
- OCR slow: keep disabled unless needed for low-quality CVs.
- Prisma command blocked in PowerShell: use `npx.cmd prisma ...`.
- Seed script blocked in a sandboxed shell: run `npm.cmd run db:seed` from a standard local session.
