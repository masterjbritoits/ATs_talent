"use client";

import { useState } from "react";

export function BookingForm({ token, isAlreadyBooked }: { token: string; isAlreadyBooked: boolean }) {
  const [status, setStatus] = useState<"idle" | "loading" | "booked" | "error">(
    isAlreadyBooked ? "booked" : "idle"
  );

  async function confirm() {
    setStatus("loading");
    const res = await fetch(`/api/book/${token}`, { method: "POST" });
    setStatus(res.ok ? "booked" : "error");
  }

  if (status === "booked") {
    return (
      <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-900/20 p-5 text-center">
        <p className="text-lg font-semibold text-emerald-400">Interview confirmed ✓</p>
        <p className="mt-1 text-sm text-slate-400">
          You will receive a calendar invitation by email shortly.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-900/20 p-5 text-center">
        <p className="text-sm text-rose-400">
          Something went wrong. Please contact your recruiter directly.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <p className="text-sm text-slate-400">
        Click below to confirm your attendance at this interview slot.
      </p>
      <button
        onClick={confirm}
        disabled={status === "loading"}
        className="w-full rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:opacity-50"
      >
        {status === "loading" ? "Confirming..." : "Confirm interview"}
      </button>
    </div>
  );
}
