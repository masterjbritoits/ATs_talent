import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/guards";
import { formatDate } from "@/lib/utils/date";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SchedulingPage() {
  await requireUser();

  const slots = await prisma.schedulingSlot.findMany({
    orderBy: { startsAt: "asc" },
    include: {
      application: {
        include: {
          candidate: { select: { id: true, fullName: true } },
          job: { select: { title: true } },
        },
      },
    },
    where: {
      startsAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // last 7 days + future
    },
  });

  const upcoming = slots.filter((s) => !s.isBooked && s.startsAt > new Date());
  const booked = slots.filter((s) => s.isBooked);
  const expired = slots.filter((s) => !s.isBooked && s.startsAt <= new Date());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Candidate Scheduling</h1>
        <p className="mt-1 text-sm text-muted">
          Manage self-scheduling slots sent to candidates.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Awaiting confirmation", value: upcoming.length, color: "sky" },
          { label: "Confirmed", value: booked.length, color: "emerald" },
          { label: "Expired / Missed", value: expired.length, color: "orange" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-white p-5 shadow-soft">
            <p className={`text-3xl font-bold text-${s.color}-600`}>{s.value}</p>
            <p className="mt-1 text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tables */}
      {[
        { title: "Awaiting confirmation", data: upcoming, badge: "bg-sky-100 text-sky-700", badgeText: "Pending" },
        { title: "Confirmed", data: booked, badge: "bg-emerald-100 text-emerald-700", badgeText: "Booked" },
        { title: "Expired / Missed", data: expired, badge: "bg-orange-100 text-orange-700", badgeText: "Expired" },
      ].map((section) => (
        <div key={section.title} className="rounded-2xl border border-border bg-white shadow-soft overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-base font-semibold">{section.title}</h2>
          </div>
          {section.data.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-slate-400">None</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Candidate</th>
                  <th className="px-4 py-3 font-medium">Position</th>
                  <th className="px-4 py-3 font-medium">Date / Time</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {section.data.map((slot) => (
                  <tr key={slot.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium text-slate-800">
                      {slot.application.candidate.fullName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {slot.application.job?.title ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(slot.startsAt).toLocaleString("pt-PT", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{slot.location ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${section.badge}`}>
                        {section.badgeText}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`/book/${slot.token}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-sky-600 hover:underline"
                      >
                        View booking page
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}
