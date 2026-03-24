# Email Flow

## Inbound
1. Recruiter triggers sync or scheduled polling later
2. Graph messages are fetched
3. Candidate-relevant emails are classified
4. Metadata is stored in `EmailMessage`
5. Attachments are written to disk and parsed
6. Candidate and application records are created or updated

## Outbound
1. Recruiter selects a template or enters custom content
2. Local draft generation fills placeholders
3. Recruiter edits before sending
4. Graph send is attempted when configured
5. Outbound email is recorded in `EmailMessage`
6. Audit log captures the send action
