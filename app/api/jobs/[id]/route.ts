import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { jobSchema } from "@/lib/validators/job";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = jobSchema.partial().parse(await request.json());
  const job = await prisma.job.update({
    where: { id },
    data: {
      title: body.title,
      department: body.department,
      location: body.location,
      seniority: body.seniority,
      employmentType: body.employmentType,
      description: body.description,
      requiredSkillsJson: body.requiredSkills,
      optionalSkillsJson: body.optionalSkills,
      requiredLanguagesJson: body.requiredLanguages,
      keywordsJson: body.keywords,
      minYearsExperience: body.minYearsExperience,
      externalUrl: body.externalUrl || undefined,
      sourceType: body.sourceType,
      sourceReference: body.sourceReference
    }
  });

  return NextResponse.json(job);
}
