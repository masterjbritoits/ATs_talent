/**
 * AI provider abstraction.
 *
 * Production target: Microsoft Foundry (Azure AI Foundry) using the
 * azure-ai-projects SDK.  Foundry exposes an OpenAI-compatible chat
 * completions endpoint so the implementation uses the standard fetch-based
 * approach until the JS SDK reaches stable.
 *
 * Provider resolution order:
 *   1. AI_PROVIDER=foundry  → FoundryProvider  (preferred, production)
 *   2. AI_PROVIDER=openai   → OpenAI-compatible provider
 *   3. AI_PROVIDER=disabled or unset → DisabledAiProvider (safe no-op)
 *
 * All providers must be toggled via AI_ENABLED=true AND AI_PROVIDER=<name>.
 * Each feature is additionally gated by a per-feature flag so teams can
 * roll out capabilities incrementally.
 */
import { EmailDraftContext, EmailDraftResult } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// Provider interface
// ─────────────────────────────────────────────────────────────

export interface AiProvider {
  /** Summarise a candidate CV into 3-5 recruiter-readable bullet points. */
  summarizeCandidate?(input: { profileText: string }): Promise<string>;
  /** Generate an email draft (subject + body) for a given communication type. */
  generateEmailDraft?(input: EmailDraftContext & { templateType: string }): Promise<EmailDraftResult>;
  /** Explain why a candidate matches or does not match a job description. */
  explainProfile?(input: { profileText: string; jobText: string }): Promise<string>;
  /** Suggest structured interview questions tailored to a candidate/role pair. */
  suggestInterviewQuestions?(input: {
    candidateSummary: string;
    jobTitle: string;
    requiredSkills: string[];
  }): Promise<string[]>;
}

// ─────────────────────────────────────────────────────────────
// Disabled provider (default — safe fallback)
// ─────────────────────────────────────────────────────────────

class DisabledAiProvider implements AiProvider {
  private _warn() {
    console.warn(
      "[ai] AI provider is disabled. Set AI_ENABLED=true and AI_PROVIDER=foundry " +
        "(or openai) to enable AI features."
    );
  }

  async generateEmailDraft(): Promise<EmailDraftResult> {
    this._warn();
    throw new Error("AI provider is disabled.");
  }
}

// ─────────────────────────────────────────────────────────────
// Microsoft Foundry provider
// ─────────────────────────────────────────────────────────────

/**
 * Uses the Azure AI Foundry project endpoint.
 * Required env vars:
 *   AZURE_AI_FOUNDRY_ENDPOINT   — project endpoint, e.g. https://<hub>.openai.azure.com/
 *   AZURE_AI_FOUNDRY_DEPLOYMENT — model deployment name, e.g. gpt-4o
 *   AZURE_AI_FOUNDRY_API_KEY    — API key (or use Managed Identity; key is fallback)
 */
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
        content:
          "You are a senior technical recruiter at an enterprise software consultancy. " +
          "Summarise the candidate profile in 4 concise bullet points focusing on role fit, " +
          "key skills, seniority, and any notable signals. Be objective and evidence-based. " +
          "Output only the bullet points, no preamble."
      },
      { role: "user", content: input.profileText }
    ]);
  }

  async generateEmailDraft(
    input: EmailDraftContext & { templateType: string }
  ): Promise<EmailDraftResult> {
    const prompt =
      `Template type: ${input.templateType}\n` +
      `Candidate name: ${input.candidateName ?? "Candidate"}\n` +
      `Job title: ${input.jobTitle ?? "the position"}\n` +
      `Recruiter name: ${input.recruiterName ?? "the recruiting team"}\n` +
      `Company: ITSector\n` +
      `Additional context: ${input.extraContext ?? "none"}\n\n` +
      `Write a professional recruitment email with subject and body. ` +
      `Return JSON: { "subject": "...", "body": "..." }`;

    const raw = await this.chat([
      {
        role: "system",
        content:
          "You are a professional recruiter. Write clear, warm, and concise recruitment emails " +
          "in the language of the candidate (default: Portuguese). Return only valid JSON."
      },
      { role: "user", content: prompt }
    ]);

    try {
      // Strip markdown code fences if present
      const cleaned = raw.replace(/^```json?\s*/i, "").replace(/```$/i, "").trim();
      const parsed = JSON.parse(cleaned);
      return { subject: parsed.subject, body: parsed.body, provider: "foundry" };
    } catch {
      // Fallback: treat entire response as body
      return { subject: `Re: ${input.jobTitle ?? "Your application"}`, body: raw, provider: "foundry" };
    }
  }

  async explainProfile(input: { profileText: string; jobText: string }): Promise<string> {
    return this.chat([
      {
        role: "system",
        content:
          "You are a senior technical recruiter. Analyse the match between the candidate and " +
          "the job description. Return a concise explanation: what fits well, what gaps exist, " +
          "and one recommendation. Be factual; do not invent skills or experience."
      },
      {
        role: "user",
        content: `CANDIDATE:\n${input.profileText}\n\nJOB:\n${input.jobText}`
      }
    ]);
  }

  async suggestInterviewQuestions(input: {
    candidateSummary: string;
    jobTitle: string;
    requiredSkills: string[];
  }): Promise<string[]> {
    const prompt =
      `Job: ${input.jobTitle}\n` +
      `Required skills: ${input.requiredSkills.join(", ")}\n` +
      `Candidate summary: ${input.candidateSummary}\n\n` +
      `Generate 6 structured interview questions (2 technical, 2 behavioural, 2 situational). ` +
      `Return a JSON array of strings.`;

    const raw = await this.chat([
      {
        role: "system",
        content:
          "You are an experienced technical interviewer. Generate precise, objective interview " +
          "questions tailored to the role and candidate background. Return only a JSON array."
      },
      { role: "user", content: prompt }
    ]);

    try {
      const cleaned = raw.replace(/^```json?\s*/i, "").replace(/```$/i, "").trim();
      return JSON.parse(cleaned);
    } catch {
      return raw.split("\n").filter((line) => line.trim().startsWith("-") || /^\d+\./.test(line.trim()))
        .map((line) => line.replace(/^[-\d.]+\s*/, "").trim());
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Provider factory
// ─────────────────────────────────────────────────────────────

export function getAiProvider(): AiProvider {
  if (process.env.AI_ENABLED !== "true") {
    return new DisabledAiProvider();
  }

  switch (process.env.AI_PROVIDER) {
    case "foundry": {
      const endpoint = process.env.AZURE_AI_FOUNDRY_ENDPOINT;
      const deployment = process.env.AZURE_AI_FOUNDRY_DEPLOYMENT;
      const apiKey = process.env.AZURE_AI_FOUNDRY_API_KEY;
      if (!endpoint || !deployment || !apiKey) {
        console.error(
          "[ai] AI_PROVIDER=foundry but AZURE_AI_FOUNDRY_ENDPOINT, " +
            "AZURE_AI_FOUNDRY_DEPLOYMENT or AZURE_AI_FOUNDRY_API_KEY is missing. " +
            "Falling back to disabled provider."
        );
        return new DisabledAiProvider();
      }
      return new FoundryProvider(endpoint, deployment, apiKey);
    }

    case "openai":
    case "azure-openai":
    case "anthropic":
    case "local":
    default:
      console.warn(`[ai] AI_PROVIDER="${process.env.AI_PROVIDER}" is not yet implemented. Using disabled provider.`);
      return new DisabledAiProvider();
  }
}

/** Returns true when AI features are fully configured and enabled. */
export function isAiEnabled(): boolean {
  return (
    process.env.AI_ENABLED === "true" &&
    !!process.env.AI_PROVIDER &&
    process.env.AI_PROVIDER !== "disabled"
  );
}

