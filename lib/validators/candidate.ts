import { z } from "zod";

export const candidateUpdateSchema = z.object({
  fullName: z.string().min(2),
  primaryEmail: z.string().email(),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  currentTitle: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  status: z.enum([
    "NEW",
    "MANUAL_REVIEW",
    "SHORTLISTED",
    "REJECTED",
    "INTERVIEW_SCHEDULED",
    "HIRED",
    "TALENT_POOL"
  ]),
  isInTalentPool: z.boolean().default(false)
});

export const bulkCandidateSchema = z.object({
  candidateIds: z.array(z.string()).min(1),
  status: z
    .enum([
      "NEW",
      "MANUAL_REVIEW",
      "SHORTLISTED",
      "REJECTED",
      "INTERVIEW_SCHEDULED",
      "HIRED",
      "TALENT_POOL"
    ])
    .optional(),
  recruiterId: z.string().optional(),
  tag: z.string().optional(),
  talentPool: z.boolean().optional(),
  templateType: z.string().optional()
});
