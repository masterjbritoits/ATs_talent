import { Candidate } from "@prisma/client";

import { ParsedCandidateProfile } from "@/lib/types";
import { stringArray } from "@/lib/utils/json";

export function inferLanguages(text: string) {
  return ["english", "portuguese", "spanish", "french"]
    .filter((language) => text.toLowerCase().includes(language))
    .map((language) => language[0].toUpperCase() + language.slice(1));
}

export function inferYearsExperience(text: string) {
  const match = text.match(/(\d+)\+?\s+years?/i);
  return match ? Number(match[1]) : null;
}

export function inferSeniority(yearsExperience: number | null) {
  if (!yearsExperience) return "Unknown";
  if (yearsExperience >= 6) return "Senior";
  if (yearsExperience >= 3) return "Mid";
  return "Junior";
}

export function extractCandidateFromText(input: {
  text: string;
  fallbackEmail: string;
  senderEmail: string;
}): ParsedCandidateProfile {
  const lines = input.text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const emailMatch = input.text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)?.[0] ?? null;
  const phoneMatch = input.text.match(/(\+?\d[\d\s-]{8,}\d)/)?.[0] ?? null;
  const linkedinUrl = input.text.match(/https?:\/\/(www\.)?linkedin\.com\/[^\s]+/i)?.[0] ?? null;
  const githubUrl = input.text.match(/https?:\/\/(www\.)?github\.com\/[^\s]+/i)?.[0] ?? null;
  const skills = [
    ".net",
    "c#",
    "react",
    "typescript",
    "next.js",
    "power apps",
    "power automate",
    "azure",
    "terraform",
    "qa",
    "playwright",
    "business analyst",
    "kotlin",
    "ios"
  ].filter((skill) => input.text.toLowerCase().includes(skill));
  const firstMeaningful = lines[0] ?? input.senderEmail.split("@")[0];
  const yearsExperience = inferYearsExperience(input.text);

  return {
    fullName: firstMeaningful.replace(/cv|resume|curriculum vitae/gi, "").trim(),
    primaryEmail: emailMatch ?? input.fallbackEmail,
    phone: phoneMatch,
    linkedinUrl,
    githubUrl,
    location: lines.find((line) => /(porto|lisbon|braga|aveiro|coimbra)/i.test(line)) ?? null,
    country: /portugal/i.test(input.text) ? "Portugal" : null,
    currentTitle:
      lines.find((line) => /(developer|engineer|analyst|consultant|specialist)/i.test(line)) ??
      null,
    yearsExperience,
    skills,
    languages: inferLanguages(input.text),
    education: lines.filter((line) => /(bsc|msc|mba|degree|university)/i.test(line)).slice(0, 3),
    workHistory: lines.filter((line) => /(engineer|developer|analyst|consultant|manager)/i.test(line)).slice(0, 4),
    domainSignals: ["banking", "fintech", "enterprise", "microsoft 365"].filter((keyword) =>
      input.text.toLowerCase().includes(keyword)
    ),
    certifications: [],
    summary: lines.slice(0, 4).join(" ").slice(0, 400),
    confidence: skills.length > 1 ? 0.82 : 0.58,
    rawSignals: { firstLines: lines.slice(0, 10) }
  };
}

export function extractCandidateFromEmail(input: {
  subject: string;
  bodyText: string;
  senderEmail: string;
}): ParsedCandidateProfile {
  return extractCandidateFromText({
    text: `${input.subject}\n${input.bodyText}`,
    fallbackEmail: input.senderEmail,
    senderEmail: input.senderEmail
  });
}

export function buildParsedCandidateProfile(candidate: Candidate): ParsedCandidateProfile {
  return {
    fullName: candidate.fullName,
    primaryEmail: candidate.primaryEmail,
    phone: candidate.phone,
    linkedinUrl: candidate.linkedinUrl,
    githubUrl: candidate.githubUrl,
    location: candidate.location,
    country: candidate.country,
    currentTitle: candidate.currentTitle,
    yearsExperience: candidate.yearsExperience,
    skills: stringArray(candidate.parsedSkillsJson),
    languages: stringArray(candidate.parsedLanguagesJson),
    education: stringArray(candidate.parsedEducationJson),
    workHistory: stringArray(candidate.parsedExperienceJson),
    domainSignals: stringArray(candidate.domainSignalsJson),
    certifications: [],
    summary: candidate.summary ?? "",
    confidence: (candidate.confidenceScore ?? 60) / 100,
    rawSignals: {}
  };
}
