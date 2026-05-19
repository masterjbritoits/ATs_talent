import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { BookingForm } from "@/components/scheduling/booking-form";

export const dynamic = "force-dynamic";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const slot = await prisma.schedulingSlot.findUnique({
    where: { token },
    include: {
      application: {
        include: {
          candidate: { select: { fullName: true } },
          job: { select: { title: true } },
        },
      },
    },
  });

  if (!slot) notFound();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-8">
          <p className="text-xs uppercase tracking-widest text-sky-400 mb-1">ITSector</p>
          <h1 className="text-2xl font-bold">Confirm your interview</h1>

          <div className="mt-6 space-y-3 rounded-xl bg-slate-800/60 p-4">
            <div>
              <p className="text-xs text-slate-500">Candidate</p>
              <p className="text-sm font-semibold">{slot.application.candidate.fullName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Position</p>
              <p className="text-sm font-semibold">{slot.application.job?.title ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Date & time</p>
              <p className="text-sm font-semibold">
                {new Date(slot.startsAt).toLocaleString("pt-PT", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            {slot.location && (
              <div>
                <p className="text-xs text-slate-500">Location / Link</p>
                <p className="text-sm font-semibold">{slot.location}</p>
              </div>
            )}
          </div>

          <BookingForm
            token={token}
            isAlreadyBooked={slot.isBooked}
          />
        </div>
      </div>
    </div>
  );
}
