import { Job } from "@prisma/client";

import { DEFAULT_SCORING } from "@/lib/constants/app";
import { ParsedCandidateProfile, ScoreResult, normalizeRecommendation } from "@/lib/types";
import { stringArray } from "@/lib/utils/json";

function normalizeSkill(value: string) {
  return value.trim().toLowerCase();
}

export function scoreCandidateAgainstJob(
  candidate: ParsedCandidateProfile,
  job: Job,
  customFactor = 3
): ScoreResult {
  const requiredSkills = stringArray(job.requiredSkillsJson).map(normalizeSkill);
  const optionalSkills = stringArray(job.optionalSkillsJson).map(normalizeSkill);
  const requiredLanguages = stringArray(job.requiredLanguagesJson).map(normalizeSkill);
  const keywords = stringArray(job.keywordsJson).map(normalizeSkill);
  const candidateSkills = candidate.skills.map(normalizeSkill);
  const candidateLanguages = candidate.languages.map(normalizeSkill);
  const matchedRequired = requiredSkills.filter((skill) => candidateSkills.includes(skill));
  const matchedOptional = optionalSkills.filter((skill) => candidateSkills.includes(skill));
  const matchedLanguages = requiredLanguages.filter((language) =>
    candidateLanguages.includes(language)
  );

  const yearsScore = Math.min(
    DEFAULT_SCORING.weights.yearsExperience,
    ((candidate.yearsExperience ?? 0) / Math.max(job.minYearsExperience, 1)) *
      DEFAULT_SCORING.weights.yearsExperience
  );
  const requiredScore =
    requiredSkills.length === 0
      ? DEFAULT_SCORING.weights.requiredSkills
      : (matchedRequired.length / requiredSkills.length) * DEFAULT_SCORING.weights.requiredSkills;
  const optionalScore =
    optionalSkills.length === 0
      ? DEFAULT_SCORING.weights.optionalSkills
      : (matchedOptional.length / optionalSkills.length) * DEFAULT_SCORING.weights.optionalSkills;
  const languageScore =
    requiredLanguages.length === 0
      ? DEFAULT_SCORING.weights.languages
      : (matchedLanguages.length / requiredLanguages.length) * DEFAULT_SCORING.weights.languages;
  const titleSeniorityScore =
    (candidate.currentTitle?.toLowerCase().includes(job.title.toLowerCase()) ? 7 : 3) +
    (candidate.currentTitle?.toLowerCase().includes(job.seniority.toLowerCase()) ? 3 : 0);
  const locationScore =
    candidate.location?.toLowerCase().includes(job.location.toLowerCase())
      ? DEFAULT_SCORING.weights.location
      : candidate.country?.toLowerCase() === "portugal"
        ? 3
        : 1;
  const domainHits = keywords.filter((keyword) =>
    candidateSkills.includes(keyword) ||
    candidate.domainSignals.map(normalizeSkill).includes(keyword)
  ).length;
  const domainScore = Math.min(DEFAULT_SCORING.weights.domain, domainHits * 2);
  const cvQualityScore = Math.min(DEFAULT_SCORING.weights.cvQuality, Math.max(candidate.confidence * 5, 2));
  const recruiterCustom = Math.min(DEFAULT_SCORING.weights.recruiterCustom, customFactor);

  const score = Math.round(
    requiredScore +
      optionalScore +
      yearsScore +
      languageScore +
      locationScore +
      titleSeniorityScore +
      domainScore +
      cvQualityScore +
      recruiterCustom
  );
  const confidence = Math.min(
    99,
    Math.round((candidate.confidence * 100 + matchedRequired.length * 7 + matchedLanguages.length * 4) / 1.25)
  );

  return {
    score,
    recommendation: normalizeRecommendation(score, DEFAULT_SCORING.thresholds),
    confidence,
    breakdown: {
      requiredSkills: Math.round(requiredScore),
      optionalSkills: Math.round(optionalScore),
      yearsExperience: Math.round(yearsScore),
      languages: Math.round(languageScore),
      location: Math.round(locationScore),
      titleSeniority: Math.round(titleSeniorityScore),
      domain: Math.round(domainScore),
      cvQuality: Math.round(cvQualityScore),
      recruiterCustom
    },
    rationale: {
      matchedSkills: matchedRequired,
      missingSkills: requiredSkills.filter((skill) => !matchedRequired.includes(skill)),
      strongSignals: [
        `${candidate.yearsExperience ?? 0} years of experience`,
        `${matchedLanguages.length} language fit(s)`,
        `${candidate.currentTitle ?? "Candidate"} profile aligned to ${job.title}`
      ],
      weakSignals: [
        ...(matchedOptional.length ? [] : ["Optional skill coverage is limited"]),
        ...(score < DEFAULT_SCORING.thresholds.advance ? ["Recruiter review recommended before advancing"] : [])
      ],
      explanation: [
        `Matched required skills: ${matchedRequired.join(", ") || "none"}`,
        `Matched optional skills: ${matchedOptional.join(", ") || "none"}`,
        `Domain hits: ${domainHits}`
      ]
    }
  };
}
