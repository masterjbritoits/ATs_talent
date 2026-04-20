"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ApplyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    form.set("jobId", id);

    const res = await fetch("/api/careers/apply", { method: "POST", body: form });
    setSubmitting(false);

    if (res.ok) {
      router.push("/careers/obrigado");
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Erro ao enviar candidatura. Por favor tente novamente.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto max-w-2xl px-6 py-4">
          <Link href={`/careers/${id}`} className="text-sm text-sky-400 hover:underline">
            ← Voltar à vaga
          </Link>
          <h1 className="mt-3 text-2xl font-bold">Formulário de Candidatura</h1>
          <p className="mt-1 text-sm text-slate-400">Preenche os teus dados para te candidatares.</p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Name + Phone */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Nome completo <span className="text-rose-400">*</span>
              </label>
              <input
                name="fullName"
                required
                autoComplete="name"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                placeholder="Maria Silva"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Telefone</label>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                placeholder="+351 912 345 678"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Email <span className="text-rose-400">*</span>
            </label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="maria.silva@email.com"
            />
          </div>

          {/* LinkedIn */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              LinkedIn{" "}
              <span className="text-slate-500 font-normal">(opcional)</span>
            </label>
            <input
              name="linkedinUrl"
              type="url"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="https://linkedin.com/in/o-teu-perfil"
            />
          </div>

          {/* CV upload */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              CV (PDF ou DOCX) <span className="text-rose-400">*</span>
            </label>
            <input
              name="cv"
              type="file"
              accept=".pdf,.doc,.docx"
              required
              className="w-full cursor-pointer rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-300 file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-sky-700 file:px-3 file:py-1 file:text-xs file:font-medium file:text-white hover:file:bg-sky-600"
            />
            <p className="mt-1 text-xs text-slate-500">Máximo 10 MB</p>
          </div>

          {/* Language preference */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Língua preferida para comunicação
            </label>
            <select
              name="preferredLanguage"
              defaultValue="pt"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="pt">Português (Portugal)</option>
              <option value="es">Español (España)</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* GDPR consent */}
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                name="gdprConsent"
                type="checkbox"
                required
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-600 bg-slate-800 accent-sky-500"
              />
              <span className="text-sm text-slate-400 leading-relaxed">
                Autorizo o tratamento dos meus dados pessoais para efeitos de recrutamento, nos termos do{" "}
                <span className="text-sky-400">
                  Regulamento Geral sobre a Proteção de Dados (RGPD)
                </span>
                . Os dados serão conservados por um período máximo de 12 meses e não serão partilhados com terceiros sem o meu consentimento.{" "}
                <span className="text-rose-400">*</span>
              </span>
            </label>
          </div>

          {error && (
            <div className="rounded-lg border border-rose-800 bg-rose-900/30 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "A enviar..." : "Submeter candidatura →"}
          </button>
        </form>
      </main>

      <footer className="mt-16 border-t border-slate-800 py-6 text-center text-xs text-slate-600">
        ITSector · careers@itsector.pt · Todos os dados tratados ao abrigo do RGPD
      </footer>
    </div>
  );
}
