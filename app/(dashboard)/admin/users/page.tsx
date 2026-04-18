import { Users } from "lucide-react";

import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { AdminUsersClient } from "@/components/admin/users-client";

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true }
  });

  const totalActive = users.filter((u) => u.isActive).length;
  const totalAdmins = users.filter((u) => u.role === "ADMIN").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-sky-500/10 p-3">
            <Users className="h-5 w-5 text-sky-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">User Management</h1>
            <p className="mt-1 text-sm text-muted">
              {users.length} users · {totalActive} active · {totalAdmins} admins
            </p>
          </div>
        </div>
      </Card>

      <AdminUsersClient initialUsers={users} />
    </div>
  );
}
