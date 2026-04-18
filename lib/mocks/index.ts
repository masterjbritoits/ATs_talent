/**
 * Mock data and providers for local development and testing.
 * When real credentials (Graph, Foundry, etc) are not configured,
 * the app automatically uses these mocks to provide full functionality.
 */

export const MOCK_CANDIDATES = [
  {
    id: "mock-1",
    fullName: "Alice Chen",
    primaryEmail: "alice.chen@example.com",
    phone: "+351 912 345 678",
    currentTitle: "Senior Software Engineer",
    yearsExperience: 8,
    location: "Lisbon, Portugal",
    linkedinUrl: "https://linkedin.com/in/alice-chen",
    summary: "Full-stack engineer with 8 years enterprise experience",
    parsedSkillsJson: ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS"],
    parsedLanguagesJson: ["English", "Mandarin", "Portuguese"],
    sourceType: "email",
    status: "NEW",
    confidenceScore: 0.92
  },
  {
    id: "mock-2",
    fullName: "Bruno Silva",
    primaryEmail: "bruno.silva@example.com",
    phone: "+351 923 456 789",
    currentTitle: "Product Manager",
    yearsExperience: 6,
    location: "Porto, Portugal",
    linkedinUrl: "https://linkedin.com/in/bruno-silva",
    summary: "Product leader with B2B SaaS background",
    parsedSkillsJson: ["Product Strategy", "Analytics", "Agile", "Data Science"],
    parsedLanguagesJson: ["English", "Portuguese", "Spanish"],
    sourceType: "email",
    status: "INTERVIEW_SCHEDULED",
    confidenceScore: 0.88
  },
  {
    id: "mock-3",
    fullName: "Carla Sousa",
    primaryEmail: "carla.sousa@example.com",
    phone: "+351 934 567 890",
    currentTitle: "Data Scientist",
    yearsExperience: 5,
    location: "Remote",
    linkedinUrl: "https://linkedin.com/in/carla-sousa",
    summary: "ML specialist with focus on NLP",
    parsedSkillsJson: ["Python", "TensorFlow", "Kubernetes", "SQL", "MLOps"],
    parsedLanguagesJson: ["English", "Portuguese"],
    sourceType: "email",
    status: "SHORTLISTED",
    confidenceScore: 0.85
  }
];

export const MOCK_JOBS = [
  {
    id: "job-1",
    title: "Senior Backend Engineer",
    department: "Engineering",
    location: "Lisbon",
    seniority: "Senior",
    employmentType: "Full-time",
    description: "Build scalable APIs and data pipelines",
    requiredSkillsJson: ["Node.js", "PostgreSQL", "AWS", "System Design"],
    minYearsExperience: 5,
    status: "OPEN"
  },
  {
    id: "job-2",
    title: "Product Manager",
    department: "Product",
    location: "Porto",
    seniority: "Mid-level",
    employmentType: "Full-time",
    description: "Lead product strategy for B2B platform",
    requiredSkillsJson: ["Product Strategy", "Analytics", "Communication"],
    minYearsExperience: 3,
    status: "OPEN"
  },
  {
    id: "job-3",
    title: "ML Engineer",
    department: "Engineering",
    location: "Remote",
    seniority: "Senior",
    employmentType: "Full-time",
    description: "Develop ML models for enterprise applications",
    requiredSkillsJson: ["Python", "TensorFlow", "MLOps", "Data Engineering"],
    minYearsExperience: 4,
    status: "OPEN"
  }
];

export const MOCK_ATTACHMENTS = [
  {
    id: "att-1",
    filename: "alice_cv.pdf",
    mimeType: "application/pdf",
    parsedText: `Alice Chen - Senior Software Engineer
8 years experience building enterprise systems
Skills: TypeScript, React, Node.js, PostgreSQL, AWS
Education: BS Computer Science, CMU`
  },
  {
    id: "att-2",
    filename: "bruno_resume.docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    parsedText: `Bruno Silva - Product Manager
6 years in B2B SaaS
Led 3 successful product launches
Skills: Product Strategy, Data Analytics, Agile`
  }
];

export const MOCK_EMAIL_TEMPLATES = [
  {
    type: "outreach",
    subjectTemplate: "Exciting opportunity at ITSector",
    bodyTemplate: `Hi {{candidateName}},

We have an exciting {{jobTitle}} position that aligns with your background in {{topSkill}}.

Would you be interested in learning more?

Best regards,
{{recruiterName}}
ITSector`
  },
  {
    type: "interview_scheduling",
    subjectTemplate: "Interview scheduled: {{jobTitle}}",
    bodyTemplate: `Hi {{candidateName}},

Thank you for your interest! We'd like to invite you for an interview.

Date: {{interviewDate}}
Time: {{interviewTime}}
Location: {{location}}

Best regards,
{{recruiterName}}`
  },
  {
    type: "rejection",
    subjectTemplate: "Thank you for applying",
    bodyTemplate: `Hi {{candidateName}},

Thank you for your interest in the {{jobTitle}} position. While your background is strong, we're moving forward with other candidates.

We'd love to stay in touch for future opportunities.

Best regards,
{{recruiterName}}`
  }
];

/**
 * Mock Graph API responses for mailbox, calendar, and identity
 */
export function generateMockGraphMessages() {
  return {
    value: [
      {
        id: "msg-1",
        subject: "Interested in Senior Backend Engineer role",
        from: { emailAddress: { address: "alice.chen@example.com" } },
        bodyPreview: "Hi, I saw your job posting and I'm very interested...",
        receivedDateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        hasAttachments: true,
        attachments: [
          { id: "att-1", name: "alice_cv.pdf", contentType: "application/pdf", size: 204800 }
        ]
      },
      {
        id: "msg-2",
        subject: "CV - Product Manager application",
        from: { emailAddress: { address: "bruno.silva@example.com" } },
        bodyPreview: "Please find my resume attached...",
        receivedDateTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        hasAttachments: true,
        attachments: [
          { id: "att-2", name: "bruno_resume.docx", contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 102400 }
        ]
      }
    ]
  };
}

export function generateMockAiSummary(profileText: string): string {
  return `
• 8 years of experience in enterprise software development
• Strong backend expertise with TypeScript, Node.js, and PostgreSQL
• Proven track record in system design and scalable architecture
• Located in Lisbon, open to relocation
• Highly confident match (90%+) for senior backend roles
  `.trim();
}

export function generateMockEmailDraft(templateType: string, context: any) {
  const templates: Record<string, { subject: string; body: string }> = {
    outreach: {
      subject: `Exciting ${context.jobTitle} opportunity at ITSector`,
      body: `Hi ${context.candidateName},

We have an exciting ${context.jobTitle} position that aligns perfectly with your background.

Your expertise in ${context.topSkill} would be valuable for our team working on enterprise-scale systems.

Would you be interested in learning more? Let's schedule a brief call this week.

Best regards,
${context.recruiterName}
ITSector Talent Team`
    },
    interview: {
      subject: `Interview scheduled: ${context.jobTitle}`,
      body: `Hi ${context.candidateName},

Thank you for your interest! We're impressed with your background.

We'd like to invite you for an interview:
📅 Date: ${context.interviewDate || "TBD"}
⏰ Time: ${context.interviewTime || "2:00 PM CET"}
📍 Location: ${context.location || "Lisbon HQ / Virtual"}

Looking forward to meeting you!

Best regards,
${context.recruiterName}`
    },
    rejection: {
      subject: `Thank you for your interest in the ${context.jobTitle} role`,
      body: `Hi ${context.candidateName},

Thank you for your time and for your interest in our ${context.jobTitle} position. 

While your background is impressive, we've decided to move forward with other candidates at this stage.

We'd love to keep you in our talent pool for future opportunities that might be a better fit.

Best regards,
${context.recruiterName}
ITSector Talent Team`
    }
  };

  return templates[templateType] || templates.outreach;
}

export function generateMockInterviewQuestions(candidateSummary: string, jobTitle: string) {
  return [
    `Describe your most complex project and how you approached scaling it to handle 1M+ users.`,
    `Tell us about a time you had to make a difficult technical decision under time pressure.`,
    `How do you stay current with technology trends in ${jobTitle}?`,
    `Describe your experience with ${jobTitle === "Senior Backend Engineer" ? "distributed systems" : "stakeholder management"}.`,
    `What attracted you to this role and how do you see yourself contributing?`,
    `Walk us through your approach to mentoring junior team members.`
  ];
}

export function generateMockMatchExplanation(profileText: string, jobText: string): string {
  return `
**Match Analysis: 92% Fit**

**Strengths:**
- 8+ years backend experience aligns with senior-level requirement
- TypeScript & PostgreSQL expertise matches our exact tech stack
- System design background ideal for scalability challenges
- Portuguese-based, can work in Lisbon office

**Gaps:**
- Limited Cloud (AWS) experience mentioned in CV
- No mentioned Kubernetes/containerization background

**Recommendation:** Strong candidate for technical interview. Could benefit from onboarding support on AWS stack, but core skills are solid.
  `.trim();
}
