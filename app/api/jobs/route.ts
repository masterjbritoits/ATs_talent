import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { jobSchema } from "@/lib/validators/job";

export async function GET() {
  const jobs = await prisma.job.findMany({
    include: { applications: true },
    orderBy: { updatedAt: "desc" }
  });
  return NextResponse.json(jobs);
}

export async function POST(request: NextRequest) {
  const body = jobSchema.parse(await request.json());
  const job = await prisma.job.create({
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
      externalUrl: body.externalUrl || null,
      sourceType: body.sourceType,
      sourceReference: body.sourceReference
    }
  });

  return NextResponse.json(job, { status: 201 });
}
