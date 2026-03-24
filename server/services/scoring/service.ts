import { ApplicationStatus, CandidateStatus, Job } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { scoreCandidateAgainstJob } from "@/lib/scoring/engine";
import { candidateStatusFromRecommendation } from "@/lib/types";
import { buildParsedCandidateProfile } from "@/server/services/candidate-extraction/service";

export async function rescoreApplication(candidateId: string, job: Job | null, applicationId: string) {
  const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
  if (!candidate || !job) {
    return null;
  }

  const result = scoreCandidateAgainstJob(buildParsedCandidateProfile(candidate), job);
  const candidateStatus = candidateStatusFromRecommendation(result.recommendation);
  const applicationStatus =
    result.recommendation === "ADVANCE"
      ? ApplicationStatus.ADVANCED
      : result.recommendation === "MANUAL_REVIEW"
        ? ApplicationStatus.REVIEW
        : ApplicationStatus.REJECTED;

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      score: result.score,
      recommendation: result.recommendation,
      status: applicationStatus,
      scoreBreakdownJson: result.breakdown,
      rationaleJson: result.rationale
    }
  });

  await prisma.candidate.update({
    where: { id: candidateId },
    data: {
      overallScore: result.score,
      recommendation: result.recommendation,
      confidenceScore: result.confidence,
      status: candidateStatus as CandidateStatus
    }
  });

  return result;
}

export async function refreshJobRanking(jobId: string) {
  const applications = await prisma.application.findMany({
    where: { jobId },
    orderBy: [{ score: "desc" }, { updatedAt: "desc" }]
  });

  await Promise.all(
    applications.map((application, index) =>
      prisma.application.update({
        where: { id: application.id },
        data: {
          rankingPosition: index + 1
        }
      })
    )
  );
}
