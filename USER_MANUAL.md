# User Manual

## Login
- Open `/login`.
- Sign in with the recruiter account.
- The system uses local secure session cookies.

## Sync Mailbox
- Go to `/inbox`.
- Click `Sync Now`.
- The system pulls mailbox items, stores email metadata, parses CV text, creates or updates candidate/application records, and ranks matched applicants.

## Review Inbox
- The inbox page shows stored inbound and outbound email history.
- Noise can still be retained locally for auditability while candidate-related messages are mapped into the ATS.

## Candidate List
- Open `/candidates`.
- Use the list to review current candidates, score context, linked role, and duplicate queue.
- Use bulk actions for rejection and export.

## Score Interpretation
- `75+`: Advance
- `45-74`: Manual Review
- `<45`: Reject
- Candidate details show score rationale and breakdown JSON for recruiter review.

## Ranking By Job
- Open `/jobs` and select a role.
- Applicants are ranked by score, then updated recency through the scoring/ranking service.

## Move To Talent Pool
- Candidates marked for future reuse appear in `/talent-pool`.
- Alternative role suggestions are generated from the matching service.

## Send Emails
- Open a candidate record.
- Use the Email Center panel.
- Choose a template, optionally edit subject/body, then send.
- Generated drafts are never auto-sent without recruiter action.

## Bulk Actions
- Select candidates on the candidate list.
- Bulk rejection currently updates status and can generate rejection drafts.
- Export is available directly from the candidate list.

## Export To Excel
- Use the `Export Excel` action on the candidates page or the reports page.
- Files are written to `storage/exports`.

## Schedule Interviews
- Open a candidate detail page.
- Use the Interview Scheduling panel.
- Select date/time and create an interview event.
- When Graph is configured, the event can be created in Microsoft 365 Calendar.
