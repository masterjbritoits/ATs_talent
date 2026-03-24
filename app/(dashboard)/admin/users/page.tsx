import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Recruiter & Admin Users</h1>
        <p className="mt-2 text-sm text-muted">
          Local account administration with role and activation visibility for controlled workstation usage.
        </p>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {users.map((user) => (
          <Card key={user.id}>
            <h3 className="text-lg font-semibold">{user.name}</h3>
            <p className="mt-2 text-sm text-muted">
              {user.email} · {user.role} · {user.isActive ? "Active" : "Inactive"}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
