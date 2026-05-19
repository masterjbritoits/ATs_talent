import Link from "next/link";
import { ReactNode } from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  CalendarClock,
  ClipboardCheck,
  ExternalLink,
  FileCheck,
  FileText,
  Inbox,
  Kanban,
  LayoutDashboard,
  Mail,
  Settings,
  TrendingUp,
  Users,
  UserSquare2,
  Workflow
} from "lucide-react";

import { APP_NAME } from "@/lib/constants/app";
import { requireUser } from "@/lib/auth/guards";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/candidates", label: "Candidates", icon: Users },
  { href: "/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { href: "/pipeline", label: "Pipeline Board", icon: Kanban },
  { href: "/scorecards", label: "Scorecards", icon: ClipboardCheck },
  { href: "/offers", label: "Offers", icon: FileCheck },
  { href: "/scheduling", label: "Scheduling", icon: CalendarClock },
  { href: "/sequences", label: "Sequences", icon: Workflow },
  { href: "/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/job-publishing", label: "Publishing", icon: ExternalLink },
  { href: "/talent-pool", label: "Talent Pool", icon: UserSquare2 },
  { href: "/templates", label: "Templates", icon: Mail },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/admin/users", label: "Users", icon: FileText }
];

export async function AppShell({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-72 border-r border-slate-200 bg-[#0f223d] p-6 text-slate-100 lg:block">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">ITSector</p>
          <h1 className="mt-2 text-2xl font-semibold">{APP_NAME}</h1>
          <p className="mt-2 text-sm text-slate-400">Talent operations for Joana</p>
        </div>
        <nav className="space-y-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white/90 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Recruitment Console</p>
            <h2 className="text-xl font-semibold text-foreground">Operational ATS Workspace</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-border bg-slate-50 px-3 py-2 text-sm">
              Signed in as <span className="font-semibold">{user.name}</span>
            </div>
            <form action="/api/auth/logout" method="post">
              <Button variant="secondary" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
