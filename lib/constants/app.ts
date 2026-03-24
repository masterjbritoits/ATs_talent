export const APP_NAME = "ITSector Talent Inbox ATS";

export const STORAGE_DIRS = [
  "storage/raw-emails",
  "storage/attachments",
  "storage/processed",
  "storage/ocr",
  "storage/exports",
  "storage/temp"
] as const;

export const DEFAULT_SCORING = {
  weights: {
    requiredSkills: 30,
    optionalSkills: 10,
    yearsExperience: 15,
    languages: 10,
    location: 5,
    titleSeniority: 10,
    domain: 10,
    cvQuality: 5,
    recruiterCustom: 5
  },
  thresholds: {
    advance: 75,
    manualReview: 45
  }
};
