# Data Model

## Primary Entities
- `User`: local recruiter/admin identity
- `Job`: normalized internal vacancy record
- `Candidate`: normalized candidate profile
- `Application`: candidate-to-job pipeline record
- `EmailMessage`: inbound/outbound communication log
- `Attachment`: stored original file and parsed diagnostics
- `RecruiterNote`: human review context
- `InterviewEvent`: interview scheduling record
- `EmailTemplate`: recruiter-approved message templates
- `ScoringConfig`: weight and threshold configuration
- `ImportRun`: vacancy import execution tracking
- `AuditLog`: sensitive operation audit trail
- `SystemSetting`: local operational settings

## Relationship Highlights
- One candidate can have many applications, emails, attachments, notes, and interviews.
- One job can have many applications.
- One application can link to one job and one candidate.
- One email can link to candidate and application records.
