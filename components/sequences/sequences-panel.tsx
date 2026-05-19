"use client";

import { useState } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

type Sequence = {
  id: string;
  name: string;
  triggerStage: string;
  stepsJson: unknown;
  isActive: boolean;
  _count: { enrollments: number };
};

type Step = { delayDays: number; templateType: string };

export function SequencesPanel({
  sequences: initial,
  stageOptions,
  templateOptions,
}: {
  sequences: Sequence[];
  stageOptions: { value: string; label: string }[];
  templateOptions: string[];
}) {
  const [sequences, setSequences] = useState(initial);
  const [creating, setCreating] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [triggerStage, setTriggerStage] = useState(stageOptions[0]?.value ?? "");
  const [steps, setSteps] = useState<Step[]>([{ delayDays: 0, templateType: templateOptions[0] ?? "" }]);
  const [saving, setSaving] = useState(false);

  async function create() {
    setSaving(true);
    const res = await fetch("/api/sequences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, triggerStage, steps }),
    });
    setSaving(false);
    if (res.ok) {
      const s = await res.json();
      setSequences((p) => [{ ...s, _count: { enrollments: 0 } }, ...p]);
      setCreating(false);
      setName("");
      setSteps([{ delayDays: 0, templateType: templateOptions[0] ?? "" }]);
    }
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/sequences/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    setSequences((p) => p.map((s) => (s.id === id ? { ...s, isActive: !current } : s)));
  }

  async function deleteSeq(id: string) {
    if (!confirm("Delete this sequence?")) return;
    await fetch(`/api/sequences/${id}`, { method: "DELETE" });
    setSequences((p) => p.filter((s) => s.id !== id));
  }

  function addStep() {
    setSteps((p) => [...p, { delayDays: (p[p.length - 1]?.delayDays ?? 0) + 3, templateType: templateOptions[0] ?? "" }]);
  }

  function updateStep(i: number, key: keyof Step, value: string | number) {
    setSteps((p) => p.map((s, idx) => (idx === i ? { ...s, [key]: value } : s)));
  }

  function removeStep(i: number) {
    setSteps((p) => p.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex justify-end">
        <button
          onClick={() => setCreating((v) => !v)}
          className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
        >
          <Plus className="h-4 w-4" />
          New sequence
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-6 space-y-5">
          <h2 className="text-base font-semibold text-sky-800">New Email Sequence</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Interview invitation drip"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Trigger stage</label>
              <select
                value={triggerStage}
                onChange={(e) => setTriggerStage(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500"
              >
                {stageOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-700">Steps</label>
            <div className="space-y-2">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-5 text-right">{i + 1}.</span>
                  <input
                    type="number"
                    min={0}
                    value={step.delayDays}
                    onChange={(e) => updateStep(i, "delayDays", Number(e.target.value))}
                    className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs focus:outline-none"
                    title="Delay (days)"
                  />
                  <span className="text-xs text-slate-500">days after trigger →</span>
                  <select
                    value={step.templateType}
                    onChange={(e) => updateStep(i, "templateType", e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs focus:outline-none"
                  >
                    {templateOptions.length > 0 ? (
                      templateOptions.map((t) => <option key={t} value={t}>{t}</option>)
                    ) : (
                      <option value="CUSTOM">CUSTOM</option>
                    )}
                  </select>
                  <button onClick={() => removeStep(i)} className="text-slate-400 hover:text-rose-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addStep}
              className="mt-2 text-xs text-sky-600 hover:underline"
            >
              + Add step
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={create}
              disabled={saving || !name}
              className="rounded-xl bg-sky-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Create"}
            </button>
            <button onClick={() => setCreating(false)} className="text-sm text-slate-500 hover:text-slate-700">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
        {sequences.map((s) => {
          const steps = Array.isArray(s.stepsJson) ? (s.stepsJson as Step[]) : [];
          return (
            <div key={s.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-medium text-slate-800">{s.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Trigger: <span className="font-medium">{s.triggerStage}</span>
                  {" · "}{steps.length} step{steps.length !== 1 ? "s" : ""}
                  {" · "}{s._count.enrollments} enrollment{s._count.enrollments !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold ${s.isActive ? "text-emerald-600" : "text-slate-400"}`}>
                  {s.isActive ? "Active" : "Inactive"}
                </span>
                <button onClick={() => toggleActive(s.id, s.isActive)} className="text-slate-400 hover:text-sky-600">
                  {s.isActive ? (
                    <ToggleRight className="h-5 w-5 text-sky-500" />
                  ) : (
                    <ToggleLeft className="h-5 w-5" />
                  )}
                </button>
                <button onClick={() => deleteSeq(s.id)} className="text-slate-300 hover:text-rose-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
        {sequences.length === 0 && (
          <div className="px-6 py-10 text-center text-sm text-slate-400">
            No sequences yet. Create the first one to start automating candidate communication.
          </div>
        )}
      </div>
    </div>
  );
}
