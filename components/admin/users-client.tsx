"use client";

import { useState, useTransition } from "react";
import { UserCheck, UserX, Shield, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/date";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
};

export function AdminUsersClient({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const patch = async (userId: string, body: Record<string, unknown>) => {
    setLoadingId(userId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to update user");
        return;
      }
      const updated: User = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    } catch {
      setError("Network error");
    } finally {
      setLoadingId(null);
    }
  };

  const toggleActive = (user: User) =>
    startTransition(() => void patch(user.id, { isActive: !user.isActive }));

  const toggleRole = (user: User) =>
    startTransition(() => void patch(user.id, { role: user.role === "ADMIN" ? "RECRUITER" : "ADMIN" }));

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
          {error}
        </div>
      )}
      {users.map((user) => {
        const isLoading = loadingId === user.id;
        return (
          <Card key={user.id}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{user.name}</p>
                  <Badge tone={user.isActive ? "success" : "danger"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge tone={user.role === "ADMIN" ? "warning" : "info"}>
                    {user.role === "ADMIN" ? (
                      <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Admin
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Recruiter
                      </span>
                    )}
                  </Badge>
                </div>
                <p className="text-sm text-muted">{user.email}</p>
                <p className="text-xs text-muted/60">Created {formatDate(user.createdAt, "dd MMM yyyy")}</p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => toggleRole(user)}
                  disabled={isLoading}
                >
                  {user.role === "ADMIN" ? (
                    <>
                      <User className="h-3.5 w-3.5" />
                      Set Recruiter
                    </>
                  ) : (
                    <>
                      <Shield className="h-3.5 w-3.5" />
                      Set Admin
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => toggleActive(user)}
                  disabled={isLoading}
                  className={user.isActive ? "text-rose-400 hover:text-rose-300" : "text-emerald-400 hover:text-emerald-300"}
                >
                  {user.isActive ? (
                    <>
                      <UserX className="h-3.5 w-3.5" />
                      {isLoading ? "Updating…" : "Deactivate"}
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-3.5 w-3.5" />
                      {isLoading ? "Updating…" : "Activate"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
      {users.length === 0 && (
        <p className="py-8 text-center text-sm text-muted">No users found</p>
      )}
    </div>
  );
}
