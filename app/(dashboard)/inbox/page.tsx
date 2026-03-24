import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils/date";
import { SyncPanel } from "@/components/inbox/sync-panel";
import { Card } from "@/components/ui/card";

export default async function InboxPage() {
  const emails = await prisma.emailMessage.findMany({
    include: { candidate: true, application: { include: { job: true } } },
    orderBy: { createdAt: "desc" },
    take: 20
  });

  return (
    <div className="space-y-6">
      <SyncPanel />
      <Card>
        <h3 className="text-lg font-semibold">Inbox Processing Log</h3>
        <div className="mt-4 space-y-4">
          {emails.map((email) => (
            <div key={email.id} className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{email.subject}</p>
                  <p className="text-sm text-muted">
                    {email.fromAddress} · {email.candidate?.fullName ?? "Unmapped"} ·{" "}
                    {email.application?.job?.title ?? "No role mapped"}
                  </p>
                </div>
                <p className="text-sm text-muted">{formatDate(email.createdAt, "dd MMM yyyy HH:mm")}</p>
              </div>
              <p className="mt-3 text-sm text-muted">{email.bodyText?.slice(0, 180) ?? "No preview available."}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
