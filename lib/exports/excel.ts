import ExcelJS from "exceljs";

import { CandidateWithRelations } from "@/lib/types";
import { safeWriteFile } from "@/lib/utils/storage";

export async function exportCandidatesToExcel(
  candidates: CandidateWithRelations[],
  filename: string
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Candidates");

  sheet.columns = [
    { header: "Candidate", key: "candidate", width: 28 },
    { header: "Email", key: "email", width: 32 },
    { header: "Status", key: "status", width: 18 },
    { header: "Score", key: "score", width: 12 },
    { header: "Recommendation", key: "recommendation", width: 18 },
    { header: "Jobs", key: "jobs", width: 34 }
  ];

  candidates.forEach((candidate) => {
    sheet.addRow({
      candidate: candidate.fullName,
      email: candidate.primaryEmail,
      status: candidate.status,
      score: candidate.overallScore ?? "",
      recommendation: candidate.recommendation ?? "",
      jobs: candidate.applications.map((application) => application.job?.title ?? "Spontaneous").join(", ")
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  await safeWriteFile(`storage/exports/${filename}`, Buffer.from(buffer));
  return `storage/exports/${filename}`;
}
