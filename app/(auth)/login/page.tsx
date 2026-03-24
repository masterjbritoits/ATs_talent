import { redirect } from "next/navigation";

import { prisma } from "@/lib/db/prisma";
import { createSession, getSessionUserId, verifyPassword } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";

async function loginAction(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    redirect("/login?error=invalid");
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export default async function LoginPage() {
  const existing = await getSessionUserId();
  if (existing) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-soft lg:grid-cols-[1.15fr_0.85fr]">
        <div className="bg-[linear-gradient(160deg,#10294b_0%,#153964_50%,#12889b_100%)] p-10 text-white">
          <p className="text-xs uppercase tracking-[0.24em] text-blue-100">ITSector Talent</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight">
            Inbox-driven hiring, turned into a structured ATS.
          </h1>
          <p className="mt-6 max-w-xl text-sm text-blue-50/90">
            Connect Microsoft 365, parse incoming CVs, score candidates against open roles,
            coordinate outreach, and keep a reusable talent pool without leaving the workstation.
          </p>
        </div>
        <div className="p-10">
          <h2 className="text-2xl font-semibold text-foreground">Recruiter Login</h2>
          <p className="mt-2 text-sm text-muted">Use a local account to access the ATS.</p>
          <form action={loginAction} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Email</label>
              <input
                name="email"
                type="email"
                className="h-11 w-full rounded-xl border border-border bg-slate-50 px-4"
                defaultValue="joana.recruiter@itsector.pt"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Password</label>
              <input
                name="password"
                type="password"
                className="h-11 w-full rounded-xl border border-border bg-slate-50 px-4"
                defaultValue="Recruiter123!"
              />
            </div>
            <Button className="w-full" type="submit">
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
