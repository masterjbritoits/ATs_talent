import { describe, expect, it } from "vitest";

import { scoreCandidateAgainstJob } from "@/lib/scoring/engine";

describe("scoreCandidateAgainstJob", () => {
  it("returns a high score for aligned candidates", () => {
    const result = scoreCandidateAgainstJob(
      {
        fullName: "Miguel Fernandes",
        primaryEmail: "miguel@email.com",
        phone: null,
        linkedinUrl: null,
        githubUrl: null,
        location: "Porto",
        country: "Portugal",
        currentTitle: "Senior .NET Developer",
        yearsExperience: 7,
        skills: [".net", "c#", "azure", "microservices"],
        languages: ["Portuguese", "English"],
        education: [],
        workHistory: [],
        domainSignals: ["banking"],
        certifications: [],
        summary: "Aligned backend engineer",
        confidence: 0.9,
        rawSignals: {}
      },
      {
        id: "job-1",
        title: "Senior .NET Developer",
        department: "Engineering",
        location: "Porto",
        seniority: "Senior",
        employmentType: "Full-time",
        description: "Role",
        requiredSkillsJson: [".net", "c#", "azure", "microservices"],
        optionalSkillsJson: ["banking"],
        requiredLanguagesJson: ["Portuguese", "English"],
        keywordsJson: ["banking", "enterprise"],
        minYearsExperience: 5,
        status: "OPEN",
        externalUrl: null,
        sourceType: "manual",
        sourceReference: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );

    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.recommendation).toBe("ADVANCE");
  });
});
