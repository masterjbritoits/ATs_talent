import {
  Application,
  Attachment,
  Candidate,
  CandidateStatus,
  EmailMessage,
  EmailTemplate,
  Job,
  Recommendation
} from "@prisma/client";

export type CandidateWithRelations = Candidate & {
  applications: (Application & { job: Job | null })[];
  attachments: Attachment[];
  emails: EmailMessage[];
};

export type DashboardMetrics = {
  statusCounts: Record<string, number>;
  byRole: { role: string; count: number }[];
  byDay: { day: string; count: number }[];
  sourceDistribution: { source: string; count: number }[];
  pendingEmailActions: number;
  duplicateCandidates: number;
  upcomingInterviews: number;
  openJobsCount: number;
};

export type ParsedCandidateProfile = {
  fullName: string;
  primaryEmail: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  location: string | null;
  country: string | null;
  currentTitle: string | null;
  yearsExperience: number | null;
  skills: string[];
  languages: string[];
  education: string[];
  workHistory: string[];
  domainSignals: string[];
  certifications: string[];
  summary: string;
  confidence: number;
  rawSignals: Record<string, unknown>;
};

export type ScoreResult = {
  score: number;
  recommendation: Recommendation;
  confidence: number;
  rationale: {
    matchedSkills: string[];
    missingSkills: string[];
    strongSignals: string[];
    weakSignals: string[];
    explanation: string[];
  };
  breakdown: Record<string, number>;
};

export type RecruitmentEmailClassification =
  | "candidate_application"
  | "spontaneous_application"
  | "forwarded_application"
  | "noise"
  | "manual_review";

export type MailAttachmentInput = {
  filename: string;
  contentType: string;
  contentBytes?: string;
};

export type MailboxMessageInput = {
  graphMessageId: string;
  internetMessageId?: string;
  conversationId?: string;
  subject: string;
  fromAddress: string;
  toAddresses: string[];
  ccAddresses: string[];
  bodyText?: string;
  bodyHtml?: string;
  receivedAt?: string;
  rawHeaders?: Record<string, unknown>;
  attachments: MailAttachmentInput[];
};

export type EmailDraftContext = {
  candidateName: string;
  jobTitle: string;
  recruiterName: string;
  missingInfo?: string;
  dateTime?: string;
  summary?: string;
  nextStep?: string;
};

export type EmailDraftResult = {
  subject: string;
  body: string;
  provider: string;
};

export type VacancyImportRecord = {
  title: string;
  department: string;
  location: string;
  seniority: string;
  employmentType: string;
  description: string;
  requiredSkills: string[];
  optionalSkills: string[];
  requiredLanguages: string[];
  keywords: string[];
  minYearsExperience: number;
  externalUrl?: string;
  sourceType: string;
  sourceReference?: string;
};

export type DuplicateSuggestion = {
  groupKey: string;
  candidateIds: string[];
  confidence: number;
  reason: string[];
};

export type TalentPoolSuggestion = {
  jobId: string;
  title: string;
  score: number;
  rationale: string;
};

export type MailSyncResult = {
  importedMessages: number;
  skippedMessages: number;
  candidatesCreated: number;
  candidatesUpdated: number;
  applicationsCreated: number;
};

export function normalizeRecommendation(
  score: number,
  thresholds: { advance: number; manualReview: number }
) {
  if (score >= thresholds.advance) {
    return Recommendation.ADVANCE;
  }

  if (score >= thresholds.manualReview) {
    return Recommendation.MANUAL_REVIEW;
  }

  return Recommendation.REJECT;
}

export function candidateStatusFromRecommendation(
  recommendation: Recommendation,
  keepInPool = false
): CandidateStatus {
  if (keepInPool) {
    return CandidateStatus.TALENT_POOL;
  }

  if (recommendation === Recommendation.ADVANCE) {
    return CandidateStatus.SHORTLISTED;
  }

  if (recommendation === Recommendation.MANUAL_REVIEW) {
    return CandidateStatus.MANUAL_REVIEW;
  }

  return CandidateStatus.REJECTED;
}
