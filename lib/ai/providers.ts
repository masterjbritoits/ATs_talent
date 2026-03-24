import { EmailDraftContext, EmailDraftResult } from "@/lib/types";

export interface AiProvider {
  summarizeCandidate?(input: { profileText: string }): Promise<string>;
  generateEmailDraft?(input: EmailDraftContext & { templateType: string }): Promise<EmailDraftResult>;
  explainProfile?(input: { profileText: string; jobText: string }): Promise<string>;
}

class DisabledAiProvider implements AiProvider {
  async generateEmailDraft(): Promise<EmailDraftResult> {
    throw new Error("AI provider is disabled.");
  }
}

export function getAiProvider(): AiProvider {
  if (process.env.AI_ENABLED !== "true") {
    return new DisabledAiProvider();
  }

  switch (process.env.AI_PROVIDER) {
    case "openai":
    case "azure-openai":
    case "anthropic":
    case "local":
      return new DisabledAiProvider();
    default:
      return new DisabledAiProvider();
  }
}
