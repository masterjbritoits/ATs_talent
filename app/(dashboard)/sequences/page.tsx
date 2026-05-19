import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/guards";
import { SequencesPanel } from "@/components/sequences/sequences-panel";
import { PIPELINE_STAGES, STAGE_LABELS } from "@/lib/constants/pipeline";

export const dynamic = "force-dynamic";

const TEMPLATE_TYPES = [
  "APPLICATION_RECEIVED",
  "CV_SHORTLISTED",
  "PHONE_SCREEN_INVITE",
  "TECHNICAL_TEST_INVITE",
  "FIRST_INTERVIEW_INVITE",
  "SECOND_INTERVIEW_INVITE",
  "CLIENT_INTERVIEW_INVITE",
  "PROPOSAL_SENT",
  "REJECTION",
  "TALENT_POOL_ADDED",
];

export default async function SequencesPage() {
  await requireUser();

  const sequences = await prisma.emailSequence.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { enrollments: true } } },
  });

  const stageOptions = PIPELINE_STAGES.map((s) => ({
    value: s.value,
    label: STAGE_LABELS[s.value]?.pt ?? s.value,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Email Sequences</h1>
        <p className="mt-1 text-sm text-muted">
          Drip email sequences triggered automatically when candidates reach a stage.
        </p>
      </div>
      <SequencesPanel
        sequences={sequences as Parameters<typeof SequencesPanel>[0]["sequences"]}
        stageOptions={stageOptions}
        templateOptions={TEMPLATE_TYPES}
      />
    </div>
  );
}
