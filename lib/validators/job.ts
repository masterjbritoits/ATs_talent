import { z } from "zod";

export const jobSchema = z.object({
  title: z.string().min(2),
  department: z.string().min(2),
  location: z.string().min(2),
  seniority: z.string().min(2),
  employmentType: z.string().min(2),
  description: z.string().min(20),
  requiredSkills: z.array(z.string()).default([]),
  optionalSkills: z.array(z.string()).default([]),
  requiredLanguages: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  minYearsExperience: z.number().int().min(0).default(0),
  externalUrl: z.string().url().optional().or(z.literal("")),
  sourceType: z.string().default("manual"),
  sourceReference: z.string().optional()
});
