import { prisma } from "@/lib/db/prisma";

export async function mergeDuplicateCandidates(primaryCandidateId: string, duplicateCandidateId: string) {
  const [primary, duplicate] = await Promise.all([
    prisma.candidate.findUnique({ where: { id: primaryCandidateId } }),
    prisma.candidate.findUnique({ where: { id: duplicateCandidateId } })
  ]);

  if (!primary || !duplicate) {
    throw new Error("Candidates for merge were not found.");
  }

  await prisma.$transaction([
    prisma.application.updateMany({
      where: { candidateId: duplicateCandidateId },
      data: { candidateId: primaryCandidateId }
    }),
    prisma.attachment.updateMany({
      where: { candidateId: duplicateCandidateId },
      data: { candidateId: primaryCandidateId }
    }),
    prisma.emailMessage.updateMany({
      where: { candidateId: duplicateCandidateId },
      data: { candidateId: primaryCandidateId }
    }),
    prisma.recruiterNote.updateMany({
      where: { candidateId: duplicateCandidateId },
      data: { candidateId: primaryCandidateId }
    }),
    prisma.interviewEvent.updateMany({
      where: { candidateId: duplicateCandidateId },
      data: { candidateId: primaryCandidateId }
    }),
    prisma.auditLog.create({
      data: {
        entityType: "Candidate",
        entityId: primaryCandidateId,
        action: "duplicate_merged",
        metadataJson: {
          primaryCandidateId,
          duplicateCandidateId
        }
      }
    }),
    prisma.candidate.delete({
      where: { id: duplicateCandidateId }
    })
  ]);

  return prisma.candidate.findUnique({
    where: { id: primaryCandidateId },
    include: {
      applications: true,
      attachments: true,
      emails: true,
      notes: true,
      interviews: true
    }
  });
}
