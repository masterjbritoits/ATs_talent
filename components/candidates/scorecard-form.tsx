"use client";

import { useState } from "react";

const COMPETENCIES: Record<string, string[]> = {
  BEHAVIOURAL: ["Communication", "Teamwork", "Problem Solving", "Cultural Fit", "Motivation"],
  TECHNICAL: ["Technical Depth", "Code Quality", "Architecture", "Problem Solving", "Communication"],
  PROJECT: ["Project Fit", "Technical Alignment", "Communication", "Team Dynamics", "Adaptability"],
  CLIENT: ["Presentation", "Client Facing", "Communication", "Seniority", "Cultural Fit"],
  SANITY_CHECK: ["Communication", "Availability", "Expectations Alignment", "Motivation"],
};

type Props = {
  applicationId: string;
  interviewType?: string;
  onSubmitted?: () => void;
};

export function ScorecardForm({ applicationId, interviewType = "BEHAVIOURAL", onSubmitted }: Props) {
  const competencies = COMPETENCIES[interviewType] ?? COMPETENCIES.BEHAVIOURAL;
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(competencies.map((c) => [c, 3]))
  );
  const [recommendation, setRecommendation] = useState<"ADVANCE" | "HOLD" | "REJECT">("ADVANCE");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const overallScore = Math.round(
    (Object.values(scores).reduce((a, b) => a + b, 0) / (competencies.length * 5)) * 100
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/applications/${applicationId}/scorecards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interviewType, scores, overallScore, recommendation, notes }),
    });

    setSubmitting(false);
    if (res.ok) {
      setDone(true);
      onSubmitted?.();
    } else {
      const d = await res.json().catch(() => null);
      setError(d?.error ?? "Error submitting scorecard");
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center text-emerald-700 font-medium">
        Scorecard submitted ✓
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="font-semibold text-slate-800">
          {interviewType.replace(/_/g, " ")} Scorecard
        </h3>
        <p className="text-sm text-slate-500 mt-1">Score each competency 1 (poor) → 5 (excellent)</p>
      </div>

      <div className="space-y-4">
        {competencies.map((comp) => (
          <div key={comp} className="flex items-center gap-4">
            <span className="w-44 text-sm text-slate-700 shrink-0">{comp}</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setScores((s) => ({ ...s, [comp]: v }))}
                  className={`h-8 w-8 rounded-lg text-sm font-semibold transition-all ${
                    scores[comp] >= v
                      ? "bg-sky-600 text-white"
                      : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-400">{scores[comp]}/5</span>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-slate-50 px-4 py-3 flex items-center gap-3">
        <span className="text-sm text-slate-600">Overall score:</span>
        <span
          className={`text-2xl font-bold ${
            overallScore >= 80 ? "text-emerald-600" : overallScore >= 60 ? "text-amber-600" : "text-rose-600"
          }`}
        >
          {overallScore}
        </span>
        <span className="text-sm text-slate-400">/ 100</span>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Recommendation</label>
        <div className="flex gap-2">
          {(["ADVANCE", "HOLD", "REJECT"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRecommendation(r)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                recommendation === r
                  ? r === "ADVANCE"
                    ? "bg-emerald-600 text-white"
                    : r === "HOLD"
                    ? "bg-amber-500 text-white"
                    : "bg-rose-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Notes <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          placeholder="Key observations, strengths, concerns..."
        />
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Scorecard"}
      </button>
    </form>
  );
}
