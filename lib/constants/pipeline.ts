export const PIPELINE_STAGES = [
  { value: "NEW",                    order: 1,  color: "blue",    terminal: false },
  { value: "SANITY_CHECK",           order: 2,  color: "indigo",  terminal: false },
  { value: "BEHAVIOURAL_INTERVIEW",  order: 3,  color: "violet",  terminal: false },
  { value: "TECHNICAL_INTERVIEW",    order: 4,  color: "purple",  terminal: false },
  { value: "PROJECT_INTERVIEW",      order: 5,  color: "fuchsia", terminal: false },
  { value: "CLIENT_INTERVIEW",       order: 6,  color: "pink",    terminal: false },
  { value: "PROPOSAL_SENT",          order: 7,  color: "amber",   terminal: false },
  { value: "PROPOSAL_REJECTED",      order: 8,  color: "rose",    terminal: true  },
  { value: "AWARDED",                order: 9,  color: "green",   terminal: true  },
  { value: "MANUAL_REVIEW",          order: 10, color: "orange",  terminal: false },
  { value: "SHORTLISTED",            order: 11, color: "cyan",    terminal: false },
  { value: "REJECTED",               order: 12, color: "red",     terminal: true  },
  { value: "HIRED",                  order: 13, color: "emerald", terminal: true  },
  { value: "TALENT_POOL",            order: 14, color: "slate",   terminal: false },
] as const;

export type PipelineStageValue = (typeof PIPELINE_STAGES)[number]["value"];

export const STAGE_LABELS: Record<string, { pt: string; es: string; en: string }> = {
  NEW:                   { pt: "Candidatura Recebida",         es: "Candidatura Recibida",         en: "Application Received"      },
  SANITY_CHECK:          { pt: "Sanity Check",                 es: "Verificación Inicial",         en: "Sanity Check"              },
  BEHAVIOURAL_INTERVIEW: { pt: "Entrevista Comportamental",    es: "Entrevista de Comportamiento", en: "Behavioural Interview"     },
  TECHNICAL_INTERVIEW:   { pt: "Entrevista Técnica",           es: "Entrevista Técnica",           en: "Technical Interview"       },
  PROJECT_INTERVIEW:     { pt: "Entrevista em Projeto",        es: "Entrevista de Proyecto",       en: "Project Interview"         },
  CLIENT_INTERVIEW:      { pt: "Entrevista no Cliente",        es: "Entrevista con el Cliente",    en: "Client Interview"          },
  PROPOSAL_SENT:         { pt: "Em Proposta",                  es: "En Propuesta",                 en: "Proposal Sent"             },
  PROPOSAL_REJECTED:     { pt: "Proposta Recusada",            es: "Propuesta Rechazada",          en: "Proposal Rejected"         },
  AWARDED:               { pt: "Adjudicado",                   es: "Adjudicado",                   en: "Awarded"                   },
  MANUAL_REVIEW:         { pt: "Revisão Manual",               es: "Revisión Manual",              en: "Manual Review"             },
  SHORTLISTED:           { pt: "Shortlist",                    es: "Preseleccionado",              en: "Shortlisted"               },
  REJECTED:              { pt: "Rejeitado",                    es: "Rechazado",                    en: "Rejected"                  },
  TALENT_POOL:           { pt: "Talent Pool",                  es: "Bolsa de Talento",             en: "Talent Pool"               },
  HIRED:                 { pt: "Contratado",                   es: "Contratado",                   en: "Hired"                     },
  REVIEW:                { pt: "Em Análise",                   es: "En Análisis",                  en: "In Review"                 },
  ADVANCED:              { pt: "Avançado",                     es: "Avanzado",                     en: "Advanced"                  },
  INTERVIEW_SCHEDULED:   { pt: "Entrevista Marcada",           es: "Entrevista Programada",        en: "Interview Scheduled"       },
};

export function stageLabel(value: string, lang: "pt" | "es" | "en" = "pt"): string {
  return STAGE_LABELS[value]?.[lang] ?? value;
}

export const STAGE_BADGE_CLASS: Record<string, string> = {
  NEW:                   "bg-blue-100 text-blue-700",
  SANITY_CHECK:          "bg-indigo-100 text-indigo-700",
  BEHAVIOURAL_INTERVIEW: "bg-violet-100 text-violet-700",
  TECHNICAL_INTERVIEW:   "bg-purple-100 text-purple-700",
  PROJECT_INTERVIEW:     "bg-fuchsia-100 text-fuchsia-700",
  CLIENT_INTERVIEW:      "bg-pink-100 text-pink-700",
  PROPOSAL_SENT:         "bg-amber-100 text-amber-700",
  PROPOSAL_REJECTED:     "bg-rose-100 text-rose-700",
  AWARDED:               "bg-green-100 text-green-700",
  MANUAL_REVIEW:         "bg-orange-100 text-orange-700",
  SHORTLISTED:           "bg-cyan-100 text-cyan-700",
  REJECTED:              "bg-red-100 text-red-700",
  HIRED:                 "bg-emerald-100 text-emerald-700",
  TALENT_POOL:           "bg-slate-100 text-slate-700",
  REVIEW:                "bg-orange-100 text-orange-700",
  ADVANCED:              "bg-green-100 text-green-700",
  INTERVIEW_SCHEDULED:   "bg-violet-100 text-violet-700",
};

// Which email template to auto-trigger when an application moves to a given stage
export const STAGE_EMAIL_TRIGGER: Record<string, string> = {
  NEW:                   "APPLICATION_RECEIVED",
  SANITY_CHECK:          "SANITY_CHECK_SUMMARY",
  BEHAVIOURAL_INTERVIEW: "BEHAVIOURAL_INTERVIEW_INVITE",
  TECHNICAL_INTERVIEW:   "TECHNICAL_INTERVIEW_INVITE",
  PROJECT_INTERVIEW:     "PROJECT_INTERVIEW_INVITE",
  CLIENT_INTERVIEW:      "CLIENT_INTERVIEW_INVITE",
  PROPOSAL_SENT:         "PROPOSAL_SENT",
  PROPOSAL_REJECTED:     "REJECTION_FEEDBACK",
  REJECTED:              "REJECTION_FEEDBACK",
  TALENT_POOL:           "TALENT_POOL_WELCOME",
};

// Which stage transitions create calendar events
export const STAGE_CREATES_CALENDAR_EVENT: Record<string, boolean> = {
  BEHAVIOURAL_INTERVIEW: true,
  TECHNICAL_INTERVIEW:   true,
  PROJECT_INTERVIEW:     true,
  CLIENT_INTERVIEW:      true,
};

export const INTERVIEW_TYPE_LABELS = {
  BEHAVIOURAL: { pt: "Comportamental", es: "Comportamiento", en: "Behavioural" },
  TECHNICAL:   { pt: "Técnica",        es: "Técnica",        en: "Technical"   },
  PROJECT:     { pt: "em Projeto",     es: "de Proyecto",    en: "Project"      },
  CLIENT:      { pt: "no Cliente",     es: "con el Cliente", en: "Client"       },
} as const;
