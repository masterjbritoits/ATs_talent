import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/guards";
import { OfferPanel } from "@/components/offers/offer-panel";

export const dynamic = "force-dynamic";

export default async function OffersPage() {
  await requireUser();

  const offers = await prisma.offerLetter.findMany({
    include: {
      application: {
        include: {
          candidate: { select: { id: true, fullName: true, primaryEmail: true } },
          job: { select: { id: true, title: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Candidates in PROPOSAL_SENT stage without an offer
  const eligibleApplications = await prisma.application.findMany({
    where: {
      status: "PROPOSAL_SENT",
      offer: null,
    },
    include: {
      candidate: { select: { id: true, fullName: true } },
      job: { select: { id: true, title: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Offer Management</h1>
        <p className="mt-1 text-sm text-muted">
          Create, send, and track offers for candidates in proposal stage.
        </p>
      </div>
      <OfferPanel offers={offers as never[]} eligible={eligibleApplications as never[]} />
    </div>
  );
}
