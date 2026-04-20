-- Phase 5 v3: New pipeline stages, RGPD fields, interview type, email template lang
-- SQLite: enums are stored as TEXT, so we just add new columns

-- RGPD + language fields on Candidate
ALTER TABLE "Candidate" ADD COLUMN "preferredLanguage" TEXT NOT NULL DEFAULT 'pt';
ALTER TABLE "Candidate" ADD COLUMN "gdprConsent" DATETIME;
ALTER TABLE "Candidate" ADD COLUMN "gdprConsentIp" TEXT;
ALTER TABLE "Candidate" ADD COLUMN "anonymisedAt" DATETIME;

-- Interview type on InterviewEvent
ALTER TABLE "InterviewEvent" ADD COLUMN "interviewType" TEXT NOT NULL DEFAULT 'BEHAVIOURAL';

-- Language field on EmailTemplate
ALTER TABLE "EmailTemplate" ADD COLUMN "lang" TEXT NOT NULL DEFAULT 'pt';
