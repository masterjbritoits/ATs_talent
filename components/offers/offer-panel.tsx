"use client";

import { useState } from "react";

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  SENT: "bg-sky-100 text-sky-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  EXPIRED: "bg-orange-100 text-orange-700",
};

type Offer = {
  id: string;
  status: string;
  salary: string | null;
  startDate: string | null;
  notes: string | null;
  benefitsJson: string[];
  createdAt: string;
  application: {
    id: string;
    candidate: { id: string; fullName: string; primaryEmail: string };
    job: { title: string } | null;
  };
};

type Eligible = {
  id: string;
  candidate: { id: string; fullName: string };
  job: { title: string } | null;
};

export function OfferPanel({ offers: initialOffers, eligible }: { offers: Offer[]; eligible: Eligible[] }) {
  const [offers, setOffers] = useState(initialOffers);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<Offer | null>(null);

  // Create form state
  const [appId, setAppId] = useState(eligible[0]?.id ?? "");
  const [salary, setSalary] = useState("");
  const [startDate, setStartDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function createOffer() {
    setSaving(true);
    setErr(null);
    const res = await fetch("/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: appId, salary, startDate: startDate || undefined, notes }),
    });
    setSaving(false);
    if (res.ok) {
      const newOffer = await res.json();
      // Reload to get full relations — simple approach
      window.location.reload();
    } else {
      const d = await res.json().catch(() => null);
      setErr(d?.error ?? "Error creating offer");
    }
  }

  async function updateStatus(offerId: string, status: string) {
    await fetch(`/api/offers/${offerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setOffers((prev) => prev.map((o) => (o.id === offerId ? { ...o, status } : o)));
    if (selected?.id === offerId) setSelected((s) => s ? { ...s, status } : s);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left: list */}
      <div className="rounded-2xl border border-border bg-white shadow-soft overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Offers ({offers.length})
          </span>
          {eligible.length > 0 && (
            <button
              onClick={() => setCreating(true)}
              className="rounded-lg bg-sky-600 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-500"
            >
              + New offer
            </button>
          )}
        </div>
        <div className="divide-y divide-slate-100 overflow-y-auto" style={{ maxHeight: "70vh" }}>
          {offers.map((o) => (
            <button
              key={o.id}
              onClick={() => setSelected(o)}
              className={`w-full text-left px-4 py-3 transition hover:bg-slate-50 ${selected?.id === o.id ? "bg-sky-50 border-l-4 border-sky-500" : ""}`}
            >
              <p className="text-sm font-semibold text-slate-800">{o.application.candidate.fullName}</p>
              <p className="text-xs text-slate-500">{o.application.job?.title ?? "No vacancy"}</p>
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[o.status] ?? ""}`}>
                {o.status}
              </span>
            </button>
          ))}
          {offers.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-slate-400">
              No offers yet.{" "}
              {eligible.length > 0 ? "Create the first one →" : "Move candidates to PROPOSAL_SENT stage first."}
            </div>
          )}
        </div>
      </div>

      {/* Right: detail or create */}
      <div className="lg:col-span-2">
        {creating ? (
          <div className="rounded-2xl border border-border bg-white p-6 shadow-soft space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">New Offer</h2>
              <button onClick={() => setCreating(false)} className="text-slate-400 hover:text-slate-600 text-sm">
                Cancel
              </button>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Candidate</label>
              <select
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
              >
                {eligible.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.candidate.fullName} — {e.job?.title ?? "No vacancy"}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Salary / Package</label>
                <input
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. 45,000 EUR/year"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Start date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Notes / Conditions</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Remote work policy, benefits, signing bonus..."
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>

            {err && <p className="text-sm text-rose-600">{err}</p>}

            <button
              onClick={createOffer}
              disabled={saving || !appId}
              className="w-full rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Offer (DRAFT)"}
            </button>
          </div>
        ) : selected ? (
          <div className="rounded-2xl border border-border bg-white p-6 shadow-soft space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">{selected.application.candidate.fullName}</h2>
                <p className="text-sm text-slate-500">
                  {selected.application.job?.title ?? "No vacancy"} · {selected.application.candidate.primaryEmail}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${STATUS_BADGE[selected.status] ?? ""}`}>
                {selected.status}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 rounded-xl bg-slate-50 p-4">
              <div>
                <p className="text-xs text-slate-500">Salary</p>
                <p className="text-sm font-semibold">{selected.salary ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Start date</p>
                <p className="text-sm font-semibold">
                  {selected.startDate ? new Date(selected.startDate).toLocaleDateString("pt-PT") : "—"}
                </p>
              </div>
            </div>

            {selected.notes && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Notes</p>
                <p className="text-sm text-slate-700">{selected.notes}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-slate-500 mb-2">Update status</p>
              <div className="flex flex-wrap gap-2">
                {["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"]
                  .filter((s) => s !== selected.status)
                  .map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected.id, s)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${STATUS_BADGE[s] ?? "bg-slate-100 text-slate-600"} hover:opacity-80`}
                    >
                      → {s}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-white p-12 text-center text-slate-400 shadow-soft">
            Select an offer to view details.
          </div>
        )}
      </div>
    </div>
  );
}
