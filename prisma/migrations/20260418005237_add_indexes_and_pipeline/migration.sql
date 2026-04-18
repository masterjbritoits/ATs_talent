-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "seniority" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requiredSkillsJson" JSONB NOT NULL,
    "optionalSkillsJson" JSONB NOT NULL,
    "requiredLanguagesJson" JSONB NOT NULL,
    "keywordsJson" JSONB NOT NULL,
    "minYearsExperience" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "externalUrl" TEXT,
    "sourceType" TEXT NOT NULL,
    "sourceReference" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "primaryEmail" TEXT NOT NULL,
    "phone" TEXT,
    "linkedinUrl" TEXT,
    "githubUrl" TEXT,
    "location" TEXT,
    "country" TEXT,
    "currentTitle" TEXT,
    "summary" TEXT,
    "yearsExperience" INTEGER,
    "parsedSkillsJson" JSONB NOT NULL,
    "parsedLanguagesJson" JSONB NOT NULL,
    "parsedEducationJson" JSONB NOT NULL,
    "parsedExperienceJson" JSONB NOT NULL,
    "domainSignalsJson" JSONB NOT NULL,
    "sourceType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "overallScore" REAL,
    "recommendation" TEXT,
    "confidenceScore" REAL,
    "assignedRecruiterId" TEXT,
    "duplicateGroupKey" TEXT,
    "isInTalentPool" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Candidate_assignedRecruiterId_fkey" FOREIGN KEY ("assignedRecruiterId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidateId" TEXT NOT NULL,
    "jobId" TEXT,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "appliedAt" DATETIME NOT NULL,
    "score" REAL,
    "recommendation" TEXT,
    "rankingPosition" INTEGER,
    "scoreBreakdownJson" JSONB NOT NULL,
    "rationaleJson" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Application_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmailMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidateId" TEXT,
    "applicationId" TEXT,
    "graphMessageId" TEXT NOT NULL,
    "internetMessageId" TEXT,
    "conversationId" TEXT,
    "direction" TEXT NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "toAddressesJson" JSONB NOT NULL,
    "ccAddressesJson" JSONB NOT NULL,
    "subject" TEXT NOT NULL,
    "bodyText" TEXT,
    "bodyHtml" TEXT,
    "receivedAt" DATETIME,
    "sentAt" DATETIME,
    "processedAt" DATETIME,
    "rawHeadersJson" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailMessage_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EmailMessage_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidateId" TEXT,
    "applicationId" TEXT,
    "emailMessageId" TEXT,
    "originalFilename" TEXT NOT NULL,
    "normalizedFilename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "parsedText" TEXT,
    "parserType" TEXT,
    "parserConfidence" REAL,
    "attachmentType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attachment_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Attachment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Attachment_emailMessageId_fkey" FOREIGN KEY ("emailMessageId") REFERENCES "EmailMessage" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecruiterNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidateId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecruiterNote_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecruiterNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InterviewEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidateId" TEXT NOT NULL,
    "applicationId" TEXT,
    "graphEventId" TEXT,
    "title" TEXT NOT NULL,
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME NOT NULL,
    "location" TEXT,
    "attendeeEmailsJson" JSONB NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InterviewEvent_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InterviewEvent_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subjectTemplate" TEXT NOT NULL,
    "bodyTemplate" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ScoringConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "configJson" JSONB NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ImportRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "summaryJson" JSONB NOT NULL,
    "startedAt" DATETIME NOT NULL,
    "finishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorUserId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadataJson" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "valueJson" JSONB NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_primaryEmail_key" ON "Candidate"("primaryEmail");

-- CreateIndex
CREATE INDEX "Candidate_status_idx" ON "Candidate"("status");

-- CreateIndex
CREATE INDEX "Candidate_overallScore_idx" ON "Candidate"("overallScore");

-- CreateIndex
CREATE INDEX "Candidate_createdAt_idx" ON "Candidate"("createdAt");

-- CreateIndex
CREATE INDEX "Candidate_isInTalentPool_idx" ON "Candidate"("isInTalentPool");

-- CreateIndex
CREATE INDEX "Candidate_duplicateGroupKey_idx" ON "Candidate"("duplicateGroupKey");

-- CreateIndex
CREATE INDEX "Application_jobId_status_idx" ON "Application"("jobId", "status");

-- CreateIndex
CREATE INDEX "Application_jobId_score_idx" ON "Application"("jobId", "score");

-- CreateIndex
CREATE INDEX "Application_candidateId_idx" ON "Application"("candidateId");

-- CreateIndex
CREATE INDEX "Application_appliedAt_idx" ON "Application"("appliedAt");

-- CreateIndex
CREATE UNIQUE INDEX "EmailMessage_graphMessageId_key" ON "EmailMessage"("graphMessageId");

-- CreateIndex
CREATE INDEX "InterviewEvent_startsAt_idx" ON "InterviewEvent"("startsAt");

-- CreateIndex
CREATE INDEX "InterviewEvent_candidateId_idx" ON "InterviewEvent"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_type_key" ON "EmailTemplate"("type");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");
