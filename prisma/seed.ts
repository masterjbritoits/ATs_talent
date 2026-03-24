import {
  ApplicationStatus,
  CandidateStatus,
  JobStatus,
  Recommendation,
  UserRole
} from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/session";
import { DEFAULT_SCORING } from "@/lib/constants/app";

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.interviewEvent.deleteMany();
  await prisma.recruiterNote.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.emailMessage.deleteMany();
  await prisma.application.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.job.deleteMany();
  await prisma.emailTemplate.deleteMany();
  await prisma.scoringConfig.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.user.deleteMany();
  await prisma.importRun.deleteMany();

  const adminPassword = await hashPassword("Admin123!");
  const recruiterPassword = await hashPassword("Recruiter123!");

  const [admin, recruiter] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Andre Admin",
        email: "admin@itsector.pt",
        passwordHash: adminPassword,
        role: UserRole.ADMIN
      }
    }),
    prisma.user.create({
      data: {
        name: "Joana Recruiter",
        email: "joana.recruiter@itsector.pt",
        passwordHash: recruiterPassword,
        role: UserRole.RECRUITER
      }
    })
  ]);

  const jobs = await Promise.all(
    ([
      ["NET Developer", "Engineering", "Porto", "Mid", [".net", "c#", "sql", "api"]],
      ["Senior .NET Developer", "Engineering", "Porto", "Senior", [".net", "c#", "azure", "microservices"]],
      ["React Developer", "Engineering", "Braga", "Mid", ["react", "typescript", "next.js", "css"]],
      ["Power Apps Developer", "Business Apps", "Porto", "Mid", ["power apps", "power automate", "microsoft 365"]],
      ["Business Analyst", "Consulting", "Lisbon", "Mid", ["requirements", "stakeholders", "banking"]],
      ["QA Engineer", "Quality", "Porto", "Mid", ["qa", "testing", "automation", "playwright"]],
      ["DevOps Engineer", "Platform", "Porto", "Senior", ["azure", "terraform", "ci/cd", "docker"]],
      ["Mobile Developer", "Engineering", "Porto", "Mid", ["android", "ios", "react native", "kotlin"]]
    ] as [string, string, string, string, string[]][]).map(
      ([title, department, location, seniority, skills], index) =>
        prisma.job.create({
        data: {
          title,
          department,
          location,
          seniority,
          employmentType: "Full-time",
          description: `${title} role focused on enterprise delivery for banking and technology clients.`,
          requiredSkillsJson: skills,
          optionalSkillsJson: ["english", "agile", "banking"],
          requiredLanguagesJson: ["Portuguese", "English"],
          keywordsJson: [title, ...skills],
          minYearsExperience: seniority === "Senior" ? 5 : 2,
          status: JobStatus.OPEN,
          externalUrl: `https://careers.itsector.pt/jobs/${index + 1}`,
          sourceType: "seed",
          sourceReference: "seed.ts"
        }
      })
    )
  );

  await prisma.scoringConfig.create({
    data: {
      configJson: DEFAULT_SCORING
    }
  });

  await prisma.systemSetting.createMany({
    data: [
      {
        key: "mailbox",
        valueJson: {
          pollingEnabled: false,
          pollingIntervalMinutes: 15,
          mailboxEmail: "careers@itsector.pt",
          graphEnabled: false
        }
      },
      {
        key: "ocr",
        valueJson: {
          enabled: false,
          language: "eng"
        }
      },
      {
        key: "ai",
        valueJson: {
          enabled: false,
          provider: "none"
        }
      }
    ]
  });

  await prisma.emailTemplate.createMany({
    data: [
      {
        name: "Application Received",
        type: "application_received",
        subjectTemplate: "Application received for {{jobTitle}}",
        bodyTemplate:
          "Hello {{candidateName}},\n\nWe have received your application for {{jobTitle}}. Our talent team will review it and come back to you.\n\nRegards,\nJoana"
      },
      {
        name: "Rejection",
        type: "rejection",
        subjectTemplate: "Update on your application for {{jobTitle}}",
        bodyTemplate:
          "Hello {{candidateName}},\n\nThank you for your interest in {{jobTitle}}. After review, we will not proceed further at this stage.\n\nRegards,\nJoana"
      },
      {
        name: "Manual Review Hold",
        type: "manual_review_hold",
        subjectTemplate: "Your application is under review",
        bodyTemplate:
          "Hello {{candidateName}},\n\nYour profile is currently under review by our team. We will contact you with the next steps.\n\nRegards,\nJoana"
      },
      {
        name: "Talent Pool",
        type: "talent_pool",
        subjectTemplate: "Staying in touch for future ITSector opportunities",
        bodyTemplate:
          "Hello {{candidateName}},\n\nWe would like to keep your profile in our talent pool for future opportunities aligned with your experience.\n\nRegards,\nJoana"
      },
      {
        name: "Request More Information",
        type: "request_more_information",
        subjectTemplate: "Additional information request",
        bodyTemplate:
          "Hello {{candidateName}},\n\nCould you please share more detail regarding {{missingInfo}}?\n\nRegards,\nJoana"
      },
      {
        name: "Interview Invitation",
        type: "interview_invitation",
        subjectTemplate: "Interview invitation for {{jobTitle}}",
        bodyTemplate:
          "Hello {{candidateName}},\n\nWe would like to invite you for an interview regarding {{jobTitle}} on {{dateTime}}.\n\nRegards,\nJoana"
      },
      {
        name: "Internal Recruiter Note Draft",
        type: "internal_note_draft",
        subjectTemplate: "[Internal] {{candidateName}} review note",
        bodyTemplate: "Candidate summary:\n{{summary}}\n\nSuggested next step:\n{{nextStep}}"
      }
    ]
  });

  const candidateFixtures = [
    {
      fullName: "Miguel Fernandes",
      primaryEmail: "miguel.fernandes@email.com",
      phone: "+351910000001",
      linkedinUrl: "https://linkedin.com/in/miguelfernandes",
      location: "Porto",
      country: "Portugal",
      currentTitle: "Senior .NET Developer",
      summary: "Backend engineer with banking integrations and Azure delivery experience.",
      yearsExperience: 7,
      skills: [".net", "c#", "azure", "microservices", "sql"],
      languages: ["Portuguese", "English"],
      education: ["MSc Computer Engineering"],
      experience: ["Lead engineer at fintech project", "Built APIs for banking client"],
      domain: ["banking", "enterprise integration"],
      status: CandidateStatus.SHORTLISTED,
      overallScore: 88,
      recommendation: Recommendation.ADVANCE,
      confidenceScore: 91,
      duplicateGroupKey: "dup-miguel",
      inTalentPool: false,
      jobIndex: 1
    },
    {
      fullName: "Miguel A. Fernandes",
      primaryEmail: "miguel.a.fernandes@email.com",
      phone: "+351910000001",
      linkedinUrl: "https://linkedin.com/in/miguelfernandes",
      location: "Porto",
      country: "Portugal",
      currentTitle: ".NET Consultant",
      summary: "Same profile forwarded by an internal recruiter.",
      yearsExperience: 7,
      skills: [".net", "c#", "azure", "microservices"],
      languages: ["Portuguese", "English"],
      education: ["MSc Computer Engineering"],
      experience: ["Consultant for digital banking"],
      domain: ["banking"],
      status: CandidateStatus.MANUAL_REVIEW,
      overallScore: 85,
      recommendation: Recommendation.ADVANCE,
      confidenceScore: 80,
      duplicateGroupKey: "dup-miguel",
      inTalentPool: false,
      jobIndex: 1
    },
    {
      fullName: "Sara Costa",
      primaryEmail: "sara.costa@email.com",
      phone: "+351910000002",
      linkedinUrl: "https://linkedin.com/in/saracosta",
      location: "Braga",
      country: "Portugal",
      currentTitle: "React Developer",
      summary: "Frontend engineer with strong TypeScript and product-facing experience.",
      yearsExperience: 4,
      skills: ["react", "typescript", "next.js", "testing library"],
      languages: ["Portuguese", "English"],
      education: ["BSc Software Engineering"],
      experience: ["Built internal portals", "Maintained design systems"],
      domain: ["fintech", "web platforms"],
      status: CandidateStatus.NEW,
      overallScore: 82,
      recommendation: Recommendation.ADVANCE,
      confidenceScore: 86,
      duplicateGroupKey: null,
      inTalentPool: false,
      jobIndex: 2
    },
    {
      fullName: "Tiago Rocha",
      primaryEmail: "tiago.rocha@email.com",
      phone: "+351910000003",
      linkedinUrl: "https://linkedin.com/in/tiagorocha",
      location: "Porto",
      country: "Portugal",
      currentTitle: "QA Automation Engineer",
      summary: "Automation tester near-fit for QA and DevOps support roles.",
      yearsExperience: 5,
      skills: ["qa", "playwright", "api testing", "azure devops"],
      languages: ["Portuguese", "English"],
      education: ["BSc Information Systems"],
      experience: ["Led regression automation", "CI pipeline test integration"],
      domain: ["banking", "quality engineering"],
      status: CandidateStatus.TALENT_POOL,
      overallScore: 69,
      recommendation: Recommendation.MANUAL_REVIEW,
      confidenceScore: 76,
      duplicateGroupKey: null,
      inTalentPool: true,
      jobIndex: 5
    },
    {
      fullName: "Ana Ribeiro",
      primaryEmail: "ana.ribeiro@email.com",
      phone: "+351910000004",
      location: "Lisbon",
      country: "Portugal",
      currentTitle: "Business Analyst",
      summary: "Strong stakeholder management and requirements delivery for regulated sectors.",
      yearsExperience: 6,
      skills: ["requirements", "stakeholders", "banking", "process design"],
      languages: ["Portuguese", "English", "Spanish"],
      education: ["MBA", "BSc Management"],
      experience: ["Business analyst in digital banking"],
      domain: ["banking", "compliance"],
      status: CandidateStatus.SHORTLISTED,
      overallScore: 84,
      recommendation: Recommendation.ADVANCE,
      confidenceScore: 90,
      duplicateGroupKey: null,
      inTalentPool: false,
      jobIndex: 4
    },
    {
      fullName: "Rita Almeida",
      primaryEmail: "rita.almeida@email.com",
      phone: "+351910000005",
      location: "Coimbra",
      country: "Portugal",
      currentTitle: "Power Platform Specialist",
      summary: "Power Apps and Power Automate consultant with Microsoft 365 integrations.",
      yearsExperience: 5,
      skills: ["power apps", "power automate", "microsoft 365", "sharepoint"],
      languages: ["Portuguese", "English"],
      education: ["BSc Information Technology"],
      experience: ["Delivered workflow apps for enterprise teams"],
      domain: ["internal tools", "workflow automation"],
      status: CandidateStatus.NEW,
      overallScore: 80,
      recommendation: Recommendation.ADVANCE,
      confidenceScore: 82,
      duplicateGroupKey: null,
      inTalentPool: false,
      jobIndex: 3
    },
    {
      fullName: "Pedro Lima",
      primaryEmail: "pedro.lima@email.com",
      phone: "+351910000006",
      location: "Porto",
      country: "Portugal",
      currentTitle: "DevOps Engineer",
      summary: "Platform engineer with Terraform, Azure, and release automation background.",
      yearsExperience: 8,
      skills: ["azure", "terraform", "ci/cd", "kubernetes"],
      languages: ["Portuguese", "English"],
      education: ["BSc Computer Engineering"],
      experience: ["Designed landing zones", "Improved release reliability"],
      domain: ["cloud", "operations"],
      status: CandidateStatus.MANUAL_REVIEW,
      overallScore: 77,
      recommendation: Recommendation.ADVANCE,
      confidenceScore: 79,
      duplicateGroupKey: null,
      inTalentPool: false,
      jobIndex: 6
    },
    {
      fullName: "Joao Martins",
      primaryEmail: "joao.martins@email.com",
      phone: "+351910000007",
      location: "Aveiro",
      country: "Portugal",
      currentTitle: "Mobile Developer",
      summary: "Cross-platform developer with Kotlin and React Native experience.",
      yearsExperience: 4,
      skills: ["android", "kotlin", "react native", "ios"],
      languages: ["Portuguese", "English"],
      education: ["BSc Computer Science"],
      experience: ["Built customer-facing mobile banking app"],
      domain: ["mobile", "banking"],
      status: CandidateStatus.NEW,
      overallScore: 78,
      recommendation: Recommendation.ADVANCE,
      confidenceScore: 74,
      duplicateGroupKey: null,
      inTalentPool: false,
      jobIndex: 7
    },
    {
      fullName: "Claudia Sousa",
      primaryEmail: "claudia.sousa@email.com",
      phone: "+351910000008",
      location: "Porto",
      country: "Portugal",
      currentTitle: "Junior React Developer",
      summary: "Near fit for frontend role, better suited for future openings.",
      yearsExperience: 2,
      skills: ["react", "javascript", "css"],
      languages: ["Portuguese", "English"],
      education: ["Coding bootcamp"],
      experience: ["Small agency frontend work"],
      domain: ["web"],
      status: CandidateStatus.TALENT_POOL,
      overallScore: 58,
      recommendation: Recommendation.MANUAL_REVIEW,
      confidenceScore: 68,
      duplicateGroupKey: null,
      inTalentPool: true,
      jobIndex: 2
    },
    {
      fullName: "Luis Teixeira",
      primaryEmail: "luis.teixeira@email.com",
      phone: "+351910000009",
      location: "Porto",
      country: "Portugal",
      currentTitle: "Support Engineer",
      summary: "Spontaneous application with transferable technical support experience.",
      yearsExperience: 3,
      skills: ["sql", "support", "monitoring"],
      languages: ["Portuguese", "English"],
      education: ["BSc Networks"],
      experience: ["Production support for enterprise apps"],
      domain: ["support"],
      status: CandidateStatus.MANUAL_REVIEW,
      overallScore: 49,
      recommendation: Recommendation.MANUAL_REVIEW,
      confidenceScore: 55,
      duplicateGroupKey: null,
      inTalentPool: false,
      jobIndex: null
    },
    {
      fullName: "Ines Carvalho",
      primaryEmail: "ines.carvalho@email.com",
      phone: "+351910000010",
      location: "Lisbon",
      country: "Portugal",
      currentTitle: "QA Analyst",
      summary: "Functional QA applicant without enough automation depth yet.",
      yearsExperience: 3,
      skills: ["qa", "test cases", "jira"],
      languages: ["Portuguese", "English"],
      education: ["BSc Multimedia"],
      experience: ["Manual testing in telecom"],
      domain: ["quality"],
      status: CandidateStatus.REJECTED,
      overallScore: 41,
      recommendation: Recommendation.REJECT,
      confidenceScore: 62,
      duplicateGroupKey: null,
      inTalentPool: false,
      jobIndex: 5
    },
    {
      fullName: "Daniel Faria",
      primaryEmail: "daniel.faria@email.com",
      phone: "+351910000011",
      location: "Porto",
      country: "Portugal",
      currentTitle: ".NET Developer",
      summary: "Solid backend engineer slightly below target seniority for senior opening.",
      yearsExperience: 4,
      skills: [".net", "c#", "sql", "apis"],
      languages: ["Portuguese", "English"],
      education: ["BSc Computer Engineering"],
      experience: ["Delivered internal systems"],
      domain: ["enterprise apps"],
      status: CandidateStatus.MANUAL_REVIEW,
      overallScore: 72,
      recommendation: Recommendation.MANUAL_REVIEW,
      confidenceScore: 73,
      duplicateGroupKey: "dup-daniel",
      inTalentPool: false,
      jobIndex: 0
    },
    {
      fullName: "Daniel M. Faria",
      primaryEmail: "daniel.m.faria@email.com",
      phone: "+351910000011",
      location: "Porto",
      country: "Portugal",
      currentTitle: ".NET Software Engineer",
      summary: "Possible duplicate from forwarded CV and direct application.",
      yearsExperience: 4,
      skills: [".net", "c#", "sql", "azure"],
      languages: ["Portuguese", "English"],
      education: ["BSc Computer Engineering"],
      experience: ["Worked on insurance and enterprise apps"],
      domain: ["enterprise apps"],
      status: CandidateStatus.NEW,
      overallScore: 73,
      recommendation: Recommendation.MANUAL_REVIEW,
      confidenceScore: 70,
      duplicateGroupKey: "dup-daniel",
      inTalentPool: false,
      jobIndex: 0
    }
  ];

  for (const fixture of candidateFixtures) {
    const candidate = await prisma.candidate.create({
      data: {
        fullName: fixture.fullName,
        primaryEmail: fixture.primaryEmail,
        phone: fixture.phone,
        linkedinUrl: fixture.linkedinUrl,
        githubUrl: null,
        location: fixture.location,
        country: fixture.country,
        currentTitle: fixture.currentTitle,
        summary: fixture.summary,
        yearsExperience: fixture.yearsExperience,
        parsedSkillsJson: fixture.skills,
        parsedLanguagesJson: fixture.languages,
        parsedEducationJson: fixture.education,
        parsedExperienceJson: fixture.experience,
        domainSignalsJson: fixture.domain,
        sourceType: fixture.jobIndex === null ? "spontaneous_application" : "candidate_email",
        status: fixture.status,
        overallScore: fixture.overallScore,
        recommendation: fixture.recommendation,
        confidenceScore: fixture.confidenceScore,
        assignedRecruiterId: recruiter.id,
        duplicateGroupKey: fixture.duplicateGroupKey ?? undefined,
        isInTalentPool: fixture.inTalentPool
      }
    });

    const job = fixture.jobIndex === null ? null : jobs[fixture.jobIndex];
    const applicationStatus: ApplicationStatus =
      fixture.status === CandidateStatus.REJECTED
        ? "REJECTED"
        : fixture.status === CandidateStatus.SHORTLISTED
          ? "ADVANCED"
          : fixture.inTalentPool
            ? "TALENT_POOL"
            : "REVIEW";

    const application = await prisma.application.create({
      data: {
        candidateId: candidate.id,
        jobId: job?.id,
        source: fixture.jobIndex === null ? "spontaneous_application" : "mailbox_sync",
        status: applicationStatus,
        appliedAt: new Date(Date.now() - Math.floor(Math.random() * 12) * 86400000),
        score: fixture.overallScore,
        recommendation: fixture.recommendation,
        rankingPosition: fixture.jobIndex === null ? null : 1,
        scoreBreakdownJson: {
          requiredSkills: Math.min(30, fixture.skills.length * 7),
          optionalSkills: 7,
          yearsExperience: fixture.yearsExperience,
          languages: fixture.languages.length * 3,
          location: 5,
          titleSeniority: 8,
          domain: 8,
          cvQuality: 5,
          recruiterCustom: 3
        },
        rationaleJson: {
          matchedSkills: fixture.skills.slice(0, 4),
          missingSkills: fixture.jobIndex === 1 ? ["event-driven architecture"] : [],
          strongSignals: [fixture.summary],
          weakSignals: fixture.inTalentPool ? ["Role fit not immediate"] : [],
          confidence: fixture.confidenceScore
        }
      }
    });

    await prisma.emailMessage.create({
      data: {
        candidateId: candidate.id,
        applicationId: application.id,
        graphMessageId: `seed-msg-${candidate.id}`,
        internetMessageId: `seed-int-${candidate.id}`,
        conversationId: `seed-conv-${candidate.id}`,
        direction: "INBOUND",
        fromAddress: candidate.primaryEmail,
        toAddressesJson: ["careers@itsector.pt"],
        ccAddressesJson: [],
        subject: job ? `Application for ${job.title}` : "Spontaneous application",
        bodyText: `${candidate.fullName} submitted an application.`,
        bodyHtml: `<p>${candidate.fullName} submitted an application.</p>`,
        receivedAt: new Date(),
        processedAt: new Date(),
        rawHeadersJson: { source: "seed" }
      }
    });

    await prisma.attachment.create({
      data: {
        candidateId: candidate.id,
        applicationId: application.id,
        originalFilename: `${candidate.fullName.replace(/\s+/g, "_")}_CV.pdf`,
        normalizedFilename: `${candidate.id}-cv.pdf`,
        mimeType: "application/pdf",
        filePath: `storage/attachments/${candidate.id}-cv.pdf`,
        parsedText: `${candidate.summary} Skills: ${fixture.skills.join(", ")}`,
        parserType: "seed",
        parserConfidence: fixture.confidenceScore / 100,
        attachmentType: "cv"
      }
    });

    await prisma.recruiterNote.create({
      data: {
        candidateId: candidate.id,
        authorId: recruiter.id,
        note:
          fixture.inTalentPool
            ? "Keep profile warm for adjacent openings."
            : "Initial profile review created from seeded operational dataset."
      }
    });
  }

  await prisma.importRun.create({
    data: {
      type: "job_import",
      source: "seed-json",
      status: "completed",
      summaryJson: {
        imported: jobs.length,
        updated: 0,
        skipped: 0
      },
      startedAt: new Date(),
      finishedAt: new Date()
    }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      entityType: "seed",
      entityId: "initial",
      action: "seed_completed",
      metadataJson: {
        users: 2,
        jobs: jobs.length,
        candidates: candidateFixtures.length
      }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
