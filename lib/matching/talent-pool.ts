import { Candidate, Job } from "@prisma/client";

import { TalentPoolSuggestion } from "@/lib/types";
import { scoreCandidateAgainstJob } from "@/lib/scoring/engine";
import { buildParsedCandidateProfile } from "@/server/services/candidate-extraction/service";

export function suggestAlternativeJobs(candidate: Candidate, jobs: Job[]): TalentPoolSuggestion[] {
  const profile = buildParsedCandidateProfile(candidate);

  return jobs
    .map((job) => {
      const result = scoreCandidateAgainstJob(profile, job);
      return {
        jobId: job.id,
        title: job.title,
        score: result.score,
        rationale: result.rationale.explanation.join(" | ")
      };
    })
    .filter((job) => job.score >= 45)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}
