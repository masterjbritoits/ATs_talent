import { ApplicationStatus, CandidateStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { createGraphCalendarEvent } from "@/lib/graph/client";

export async function scheduleInterview(input: {
  candidateId: string;
  applicationId?: string;
  title: string;
  startsAt: string;
  endsAt: string;
  attendeeEmails: string[];
  location?: string;
  notes?: string;
}) {
  let graphEventId: string | null = null;

  if (process.env.MICROSOFT_CLIENT_SECRET) {
    const response = await createGraphCalendarEvent({
      subject: input.title,
      start: input.startsAt,
      end: input.endsAt,
      attendees: input.attendeeEmails,
      location: input.location,
      body: input.notes
    });
    graphEventId = response?.id ?? null;
  }

  const event = await prisma.interviewEvent.create({
    data: {
      candidateId: input.candidateId,
      applicationId: input.applicationId,
      graphEventId,
      title: input.title,
      startsAt: new Date(input.startsAt),
      endsAt: new Date(input.endsAt),
      location: input.location,
      attendeeEmailsJson: input.attendeeEmails,
      notes: input.notes
    }
  });

  await prisma.candidate.update({
    where: { id: input.candidateId },
    data: { status: CandidateStatus.INTERVIEW_SCHEDULED }
  });

  if (input.applicationId) {
    await prisma.application.update({
      where: { id: input.applicationId },
      data: { status: ApplicationStatus.INTERVIEW_SCHEDULED }
    });
  }

  return event;
}
