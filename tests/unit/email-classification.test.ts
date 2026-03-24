import { describe, expect, it } from "vitest";

import { classifyRecruitmentEmail } from "@/server/services/email-classification/service";

describe("classifyRecruitmentEmail", () => {
  it("classifies candidate applications with CV attachments", () => {
    const result = classifyRecruitmentEmail({
      subject: "Application for React Developer",
      fromAddress: "candidate@email.com",
      bodyText: "Please find attached my CV.",
      attachmentNames: ["cv.pdf"]
    });

    expect(result).toBe("candidate_application");
  });

  it("classifies forwarded internal applications", () => {
    const result = classifyRecruitmentEmail({
      subject: "FW: Candidate CV",
      fromAddress: "recruiter@itsector.pt",
      bodyText: "Forwarding a profile.",
      attachmentNames: ["candidate.docx"]
    });

    expect(result).toBe("forwarded_application");
  });
});
