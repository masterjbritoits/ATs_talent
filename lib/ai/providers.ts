import {
  generateMockAiSummary,
  generateMockEmailDraft,
  generateMockMatchExplanation,
  generateMockInterviewQuestions
} from "@/lib/mocks";
import { EmailDraftContext, EmailDraftResult } from "@/lib/types";

export interface AiProvider {
  summarizeCandidate?(input: { profileText: string }): Promise<string>;
  generateEmailDraft?(input: EmailDraftContext & { templateType: string }): Promise<EmailDraftResult>;
  explainProfile?(input: { profileText: string; jobText: string }): Promise<string>;
  suggestInterviewQuestions?(input: {
    candidateSummary: string;
    jobTitle: string;
    requiredSkills: string[];
  }): Promise<string[]>;
}

class MockAiProvider implements AiProvider {
  async summarizeCandidate(input: { profileText: string }): Promise<string> {
    console.log("[ai] Using mock summary (Foundry not configured)");
    return generateMockAiSummary(input.profileText);
  }

  async generateEmailDraft(input: EmailDraftContext & { templateType: string }): Promise<EmailDraftResult> {
    console.log("[ai] Using mock email draft (Foundry not configured)");
    const draft = generateMockEmailDraft(input.templateType, input);
    return { subject: draft.subject, body: draft.body, provider: "mock" };
  }

  async explainProfile(input: { profileText: string; jobText: string }): Promise<string> {
    console.log("[ai] Using mock profile explanation (Foundry not configured)");
    return generateMockMatchExplanation(input.profileText, input.jobText);
  }

  async suggestInterviewQuestions(input: {
    candidateSummary: string;
    jobTitle: string;
    requiredSkills: string[];
  }): Promise<string[]> {
    console.log("[ai] Using mock interview questions (Foundry not configured)");
    return generateMockInterviewQuestions(input.candidateSummary, input.jobTitle);
  }
}

class DisabledAiProvider implements AiProvider {
  async generateEmailDraft(): Promise<EmailDraftResult> {
    throw new Error("AI provider is disabled. Set AI_ENABLED=true to enable AI features.");
  }
}

class FoundryProvider implements AiProvider {
  private endpoint: string;
  private deployment: string;
  private apiKey: string;

  constructor(endpoint: string, deployment: string, apiKey: string) {
    this.endpoint = endpoint.replace(/\/$/, "");
    this.deployment = deployment;
    this.apiKey = apiKey;
  }

  private async chat(messages: { role: "system" | "user" | "assistant"; content: string }[]): Promise<string> {
    const url = `${this.endpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=2024-10-21`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": this.apiKey
      },
      body: JSON.stringify({ messages, max_tokens: 1024, temperature: 0.3 })
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Foundry API error ${res.status}: ${text}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  }

  async summarizeCandidate(input: { profileText: string }): Promise<string> {
    return this.chat([
      {
        role: "system",
        content: "You are a senior recruiter. Summarize in 4 bullets focused on fit, skills, seniority, and signals."
      },
      { role: "user", content: input.profileText }
    ]);
  }

  async generateEmailDraft(input: EmailDraftContext & { templateType: string }): Promise<EmailDraftResult> {
    const raw = await this.chat([
      {
        role: "system",
        content: "You are a professional recruiter. Write clear, warm recruitment emails. Return only valid JSON."
      },
      {
        role: "user",
        content: `Generate a ${input.templateType} email for ${input.candidateName} about ${input.jobTitle}. Return: { "subject": "...", "body": "..." }`
      }
    ]);

    try {
      const cleaned = raw.replace(/^```json?\s*/i, "").replace(/```$/i, "").trim();
      const parsed = JSON.parse(cleaned);
      return { subject: parsed.subject, body: parsed.body, provider: "foundry" };
    } catch {
      return { subject: `Re: ${input.jobTitle}`, body: raw, provider: "foundry" };
    }
  }

  async explainProfile(input: { profileText: string; jobText: string }): Promise<string> {
    return this.chat([
      {
        role: "system",
        content: "Analyze candidate-job fit. Return concise: what fits, gaps, and one recommendation."
      },
      { role: "user", content: `Candidate:\n${input.profileText}\n\nJob:\n${input.jobText}` }
    ]);
  }

  async suggestInterviewQuestions(input: {
    candidateSummary: string;
    jobTitle: string;
    requiredSkills: string[];
  }): Promise<string[]> {
    const raw = await this.chat([
      {
        role: "system",
        content: "Generate 6 interview questions (2 technical, 2 behavioral, 2 situational). Return JSON array."
      },
      {
        role: "user",
        content: `Role: ${input.jobTitle}, Skills: ${input.requiredSkills.join(", ")}`
      }
    ]);

    try {
      const cleaned = raw.replace(/^```json?\s*/i, "").replace(/```$/i, "").trim();
      return JSON.parse(cleaned);
    } catch {
      return raw.split("\n").filter(l => /^\d+\./.test(l.trim())).map(l => l.replace(/^\d+\.\s*/, ""));
    }
  }
}

export function getAiProvider(): AiProvider {
  if (process.env.NODE_ENV !== "production" && process.env.AI_ENABLED !== "true") {
    console.log("[ai] Auto-enabling mock provider for local development");
    return new MockAiProvider();
  }

  if (process.env.AI_ENABLED !== "true") {
    return new DisabledAiProvider();
  }

  if (process.env.AI_PROVIDER === "foundry") {
    const endpoint = process.env.AZURE_AI_FOUNDRY_ENDPOINT;
    const deployment = process.env.AZURE_AI_FOUNDRY_DEPLOYMENT;
    const apiKey = process.env.AZURE_AI_FOUNDRY_API_KEY;
    if (!endpoint || !deployment || !apiKey) {
      console.warn("[ai] Foundry credentials missing, using mock");
      return new MockAiProvider();
    }
    return new FoundryProvider(endpoint, deployment, apiKey);
  }

  console.log("[ai] Using mock provider");
  return new MockAiProvider();
}

export function isAiEnabled(): boolean {
  return (
    process.env.AI_ENABLED === "true" &&
    !!process.env.AI_PROVIDER &&
    process.env.AI_PROVIDER !== "disabled"
  );
}

export function isAiMocked(): boolean {
  return !process.env.AZURE_AI_FOUNDRY_ENDPOINT;
}
