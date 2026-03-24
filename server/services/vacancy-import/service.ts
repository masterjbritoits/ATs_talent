import fs from "node:fs/promises";

import { JobStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { VacancyImportRecord } from "@/lib/types";

export async function readVacanciesFromJson(filePath: string) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as VacancyImportRecord[];
}

export async function scrapeVacanciesFromPages(urls: string[]): Promise<VacancyImportRecord[]> {
  const records: VacancyImportRecord[] = [];

  for (const url of urls) {
    const response = await fetch(url);
    const html = await response.text();
    const title = html.match(/<title>(.*?)<\/title>/i)?.[1]?.replace(/\s*\|.*$/, "").trim();
    const description =
      html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1] ??
      html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 400);

    if (!title) {
      continue;
    }

    records.push({
      title,
      department: "Imported",
      location: "Portugal",
      seniority: /senior/i.test(title) ? "Senior" : "Mid",
      employmentType: "Full-time",
      description,
      requiredSkills: ["communication"],
      optionalSkills: [],
      requiredLanguages: ["Portuguese", "English"],
      keywords: [title.toLowerCase()],
      minYearsExperience: /senior/i.test(title) ? 5 : 2,
      externalUrl: url,
      sourceType: "controlled_scrape",
      sourceReference: url
    });
  }

  return records;
}

export async function importVacancies(records: VacancyImportRecord[], source = "json") {
  const run = await prisma.importRun.create({
    data: {
      type: "job_import",
      source,
      status: "running",
      summaryJson: {},
      startedAt: new Date()
    }
  });

  let imported = 0;
  let updated = 0;

  for (const record of records) {
    const existing = await prisma.job.findFirst({
      where: {
        title: record.title,
        location: record.location
      }
    });

    if (existing) {
      await prisma.job.update({
        where: { id: existing.id },
        data: {
          department: record.department,
          seniority: record.seniority,
          employmentType: record.employmentType,
          description: record.description,
          requiredSkillsJson: record.requiredSkills,
          optionalSkillsJson: record.optionalSkills,
          requiredLanguagesJson: record.requiredLanguages,
          keywordsJson: record.keywords,
          minYearsExperience: record.minYearsExperience,
          externalUrl: record.externalUrl,
          sourceType: record.sourceType,
          sourceReference: record.sourceReference
        }
      });
      updated += 1;
    } else {
      await prisma.job.create({
        data: {
          title: record.title,
          department: record.department,
          location: record.location,
          seniority: record.seniority,
          employmentType: record.employmentType,
          description: record.description,
          requiredSkillsJson: record.requiredSkills,
          optionalSkillsJson: record.optionalSkills,
          requiredLanguagesJson: record.requiredLanguages,
          keywordsJson: record.keywords,
          minYearsExperience: record.minYearsExperience,
          externalUrl: record.externalUrl,
          sourceType: record.sourceType,
          sourceReference: record.sourceReference,
          status: JobStatus.OPEN
        }
      });
      imported += 1;
    }
  }

  await prisma.importRun.update({
    where: { id: run.id },
    data: {
      status: "completed",
      finishedAt: new Date(),
      summaryJson: { imported, updated, skipped: 0 }
    }
  });

  return { imported, updated, skipped: 0 };
}
