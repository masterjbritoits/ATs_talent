import { RecruitmentEmailClassification } from "@/lib/types";

const recruitmentKeywords = [
  "cv",
  "curriculum",
  "resume",
  "application",
  "candidate",
  "developer",
  "engineer",
  "analyst"
];

export function classifyRecruitmentEmail(input: {
  subject: string;
  fromAddress: string;
  bodyText?: string | null;
  attachmentNames: string[];
}): RecruitmentEmailClassification {
  const text = `${input.subject} ${input.bodyText ?? ""}`.toLowerCase();
  const hasCvAttachment = input.attachmentNames.some((name) =>
    /\.(pdf|docx?)$/i.test(name.toLowerCase())
  );

  if (input.fromAddress.endsWith("@itsector.pt") && hasCvAttachment) {
    return "forwarded_application";
  }

  if (!hasCvAttachment && !recruitmentKeywords.some((keyword) => text.includes(keyword))) {
    return "noise";
  }

  if (text.includes("spontaneous") || text.includes("open application")) {
    return "spontaneous_application";
  }

  if (recruitmentKeywords.some((keyword) => text.includes(keyword)) && hasCvAttachment) {
    return "candidate_application";
  }

  return "manual_review";
}
