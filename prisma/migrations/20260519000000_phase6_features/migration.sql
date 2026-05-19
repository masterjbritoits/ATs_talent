-- Phase 6: scorecards, offers, scheduling, sequences, job board posts, hiring manager role

-- User: add jobIds column (for hiring manager scope)
ALTER TABLE "User" ADD COLUMN "jobIds" TEXT NOT NULL DEFAULT '[]';

-- InterviewScorecard
CREATE TABLE "InterviewScorecard" (
  "id"               TEXT NOT NULL PRIMARY KEY,
  "applicationId"    TEXT NOT NULL,
  "interviewEventId" TEXT,
  "authorId"         TEXT NOT NULL,
  "interviewType"    TEXT NOT NULL,
  "scoresJson"       BLOB NOT NULL,
  "overallScore"     REAL NOT NULL,
  "recommendation"   TEXT NOT NULL,
  "notes"            TEXT,
  "createdAt"        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InterviewScorecard_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "InterviewScorecard_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "InterviewScorecard_applicationId_idx" ON "InterviewScorecard"("applicationId");

-- OfferLetter
CREATE TABLE "OfferLetter" (
  "id"            TEXT NOT NULL PRIMARY KEY,
  "applicationId" TEXT NOT NULL UNIQUE,
  "status"        TEXT NOT NULL DEFAULT 'DRAFT',
  "salary"        TEXT,
  "startDate"     DATETIME,
  "benefitsJson"  BLOB NOT NULL DEFAULT '[]',
  "notes"         TEXT,
  "sentAt"        DATETIME,
  "respondedAt"   DATETIME,
  "createdAt"     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OfferLetter_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- SchedulingSlot
CREATE TABLE "SchedulingSlot" (
  "id"            TEXT NOT NULL PRIMARY KEY,
  "applicationId" TEXT NOT NULL,
  "token"         TEXT NOT NULL UNIQUE,
  "startsAt"      DATETIME NOT NULL,
  "endsAt"        DATETIME NOT NULL,
  "location"      TEXT,
  "isBooked"      INTEGER NOT NULL DEFAULT 0,
  "bookedAt"      DATETIME,
  "createdAt"     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SchedulingSlot_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "SchedulingSlot_applicationId_idx" ON "SchedulingSlot"("applicationId");
CREATE UNIQUE INDEX "SchedulingSlot_token_key" ON "SchedulingSlot"("token");

-- EmailSequence
CREATE TABLE "EmailSequence" (
  "id"           TEXT NOT NULL PRIMARY KEY,
  "name"         TEXT NOT NULL,
  "triggerStage" TEXT NOT NULL,
  "stepsJson"    BLOB NOT NULL,
  "isActive"     INTEGER NOT NULL DEFAULT 1,
  "createdAt"    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- EmailSequenceEnrollment
CREATE TABLE "EmailSequenceEnrollment" (
  "id"          TEXT NOT NULL PRIMARY KEY,
  "sequenceId"  TEXT NOT NULL,
  "candidateId" TEXT NOT NULL,
  "currentStep" INTEGER NOT NULL DEFAULT 0,
  "completedAt" DATETIME,
  "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmailSequenceEnrollment_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "EmailSequence"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "EmailSequenceEnrollment_sequenceId_idx" ON "EmailSequenceEnrollment"("sequenceId");
CREATE INDEX "EmailSequenceEnrollment_candidateId_idx" ON "EmailSequenceEnrollment"("candidateId");

-- JobBoardPost
CREATE TABLE "JobBoardPost" (
  "id"         TEXT NOT NULL PRIMARY KEY,
  "jobId"      TEXT NOT NULL,
  "board"      TEXT NOT NULL,
  "status"     TEXT NOT NULL DEFAULT 'PENDING',
  "externalId" TEXT,
  "postedAt"   DATETIME,
  "removedAt"  DATETIME,
  "errorMsg"   TEXT,
  "createdAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "JobBoardPost_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "JobBoardPost_jobId_board_key" ON "JobBoardPost"("jobId", "board");
CREATE INDEX "JobBoardPost_jobId_idx" ON "JobBoardPost"("jobId");
