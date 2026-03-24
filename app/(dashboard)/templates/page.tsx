import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";

export default async function TemplatesPage() {
  const templates = await prisma.emailTemplate.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Email Templates</h1>
        <p className="mt-2 text-sm text-muted">
          Manage recruiter-approved templates for acknowledgements, hold notices, rejections, and interview invitations.
        </p>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {templates.map((template) => (
          <Card key={template.id}>
            <h3 className="text-lg font-semibold">{template.name}</h3>
            <p className="mt-2 text-sm text-muted">{template.subjectTemplate}</p>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950/90 p-4 text-xs text-slate-100">
              {template.bodyTemplate}
            </pre>
          </Card>
        ))}
      </div>
    </div>
  );
}
