import { beforeEach, describe, expect, it } from "vitest";

import { prisma } from "@/lib/db/prisma";
import { runMailboxSync } from "@/server/services/inbox-sync/service";

describe("runMailboxSync", () => {
  beforeEach(async () => {
    await prisma.attachment.deleteMany();
    await prisma.emailMessage.deleteMany();
    await prisma.application.deleteMany();
    await prisma.candidate.deleteMany();
    await prisma.job.deleteMany();
    await prisma.job.create({
      data: {
        title: "React Developer",
        department: "Engineering",
        location: "Braga",
        seniority: "Mid",
        employmentType: "Full-time",
        description: "Frontend role",
        requiredSkillsJson: ["react", "typescript"],
        optionalSkillsJson: ["next.js"],
        requiredLanguagesJson: ["English"],
        keywordsJson: ["frontend"],
        minYearsExperience: 3,
        sourceType: "test",
        status: "OPEN"
      }
    });
  });

  it("creates candidate, application, and email records", async () => {
    const result = await runMailboxSync([
      {
        graphMessageId: "test-message-1",
        subject: "Application for React Developer",
        fromAddress: "sara@email.com",
        toAddresses: ["careers@itsector.pt"],
        ccAddresses: [],
        bodyText: "Sara Costa React Developer 4 years English Portugal",
        attachments: []
      }
    ]);

    const candidate = await prisma.candidate.findUnique({
      where: { primaryEmail: "sara@email.com" }
    });

    expect(result.importedMessages).toBe(1);
    expect(candidate).not.toBeNull();
  });
});
