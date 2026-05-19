import { ReactNode } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BriefcaseBusiness, Users, LogOut } from "lucide-react";

import { requireUser } from "@/lib/auth/guards";

export default async function ManagerLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  if (!["HIRING_MANAGER", "ADMIN"].includes(user.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 border-r border-slate-200 bg-[#0f223d] p-6 text-slate-100 lg:block">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-slate-400">ITSector</p>
          <h1 className="mt-2 text-lg font-semibold">Manager Portal</h1>
          <p className="mt-1 text-xs text-slate-400">{user.name}</p>
        </div>
        <nav className="space-y-2">
          <Link href="/manager" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-200 hover:bg-white/10">
            <BriefcaseBusiness className="h-4 w-4" /> My Vacancies
          </Link>
          <Link href="/manager/candidates" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-200 hover:bg-white/10">
            <Users className="h-4 w-4" /> Candidates
          </Link>
        </nav>
        <form action="/api/auth/logout" method="post" className="mt-auto pt-8">
          <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-white">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </form>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
