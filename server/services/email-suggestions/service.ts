import { getAiProvider } from "@/lib/ai/providers";
import { prisma } from "@/lib/db/prisma";
import { renderTemplate } from "@/lib/emails/templates";
import { EmailDraftContext, EmailDraftResult } from "@/lib/types";

export async function generateEmailDraft(type: string, context: EmailDraftContext): Promise<EmailDraftResult> {
  if (process.env.AI_ENABLED === "true") {
    const aiProvider = getAiProvider();
    const aiDraft = await aiProvider.generateEmailDraft?.({
      ...context,
      templateType: type
    });
    if (aiDraft) {
      return aiDraft;
    }
  }

  const template = await prisma.emailTemplate.findUnique({ where: { type } });
  if (!template) {
    throw new Error(`Missing email template for ${type}`);
  }

  const rendered = renderTemplate(template, context);
  return {
    ...rendered,
    provider: "local-heuristic"
  };
}
