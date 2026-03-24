import { EmailTemplate } from "@prisma/client";

import { EmailDraftContext } from "@/lib/types";

export function renderTemplate(template: EmailTemplate, context: EmailDraftContext) {
  const values = {
    candidateName: context.candidateName,
    jobTitle: context.jobTitle,
    recruiterName: context.recruiterName,
    missingInfo: context.missingInfo ?? "the requested information",
    dateTime: context.dateTime ?? "the proposed time",
    summary: context.summary ?? "",
    nextStep: context.nextStep ?? ""
  };

  const render = (input: string) =>
    input.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key as keyof typeof values] ?? "");

  return {
    subject: render(template.subjectTemplate),
    body: render(template.bodyTemplate)
  };
}
