/*
  Warnings:

  - Added the required column `updatedAt` to the `RecruiterNote` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RecruiterNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidateId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "noteType" TEXT NOT NULL DEFAULT 'GENERAL',
    "tagsJson" JSONB NOT NULL DEFAULT [],
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RecruiterNote_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecruiterNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RecruiterNote" ("authorId", "candidateId", "createdAt", "id", "note") SELECT "authorId", "candidateId", "createdAt", "id", "note" FROM "RecruiterNote";
DROP TABLE "RecruiterNote";
ALTER TABLE "new_RecruiterNote" RENAME TO "RecruiterNote";
CREATE INDEX "RecruiterNote_candidateId_idx" ON "RecruiterNote"("candidateId");
CREATE INDEX "RecruiterNote_noteType_idx" ON "RecruiterNote"("noteType");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
