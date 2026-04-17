"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BriefcaseBusiness, Building2, CheckCircle2, Copy, Globe, Megaphone } from "lucide-react";

import { Card } from "@/components/ui/card";

type JobPublishingPanelProps = {
  jobs: Array<{
    id: string;
    title: string;
    department: string;
    location: string;
    seniority: string;
    employmentType: string;
    description: string;
    requiredSkillsJson: unknown;
    optionalSkillsJson: unknown;
    requiredLanguagesJson: unknown;
    minYearsExperience: number;
    status: string;
  }>;
  initialJobId?: string;
};

const publishingChannels = [
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/talent/post-a-job",
    description: "Canal prioritario para perfis especializados e alcance profissional.",
    icon: BriefcaseBusiness,
    audience: "Tecnologia, perfis senior e hiring internacional"
  },
  {
    name: "SAPO Emprego",
    href: "https://emprego.sapo.pt/",
    description: "Portal nacional para reforcar a exposicao da vaga em Portugal.",
    icon: Globe,
    audience: "Mercado portugues e candidaturas generalistas"
  },
  {
    name: "Net-Empregos",
    href: "https://www.net-empregos.com/",
    description: "Canal de volume para acelerar a divulgacao e captar candidatos ativos.",
    icon: Megaphone,
    audience: "Volume de candidatos e funcoes operacionais ou mistas"
  }
] as const;

function buildJobPost(job: JobPublishingPanelProps["jobs"][number]) {
  const requiredSkills = readStringList(job.requiredSkillsJson).join(", ");
  const optionalSkills = readStringList(job.optionalSkillsJson).join(", ");
  const languages = readStringList(job.requiredLanguagesJson).join(", ");

  return [
    `${job.title} | ${job.department}`,
    "",
    `Localizacao: ${job.location}`,
    `Senioridade: ${job.seniority}`,
    `Modelo contratual: ${job.employmentType}`,
    `Experiencia minima: ${job.minYearsExperience} anos`,
    "",
    "Sobre a oportunidade",
    job.description,
    "",
    "Requisitos obrigatorios",
    requiredSkills || "Definir competencias obrigatorias no ATS.",
    "",
    "Valorizamos tambem",
    optionalSkills || "Sem requisitos opcionais definidos.",
    "",
    "Idiomas",
    languages || "Sem idiomas obrigatorios definidos.",
    "",
    "Candidatura",
    "Responder ao anuncio ou contactar a equipa de Talent Acquisition da ITSector."
  ].join("\n");
}

function readStringList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

export function JobPublishingPanel({ jobs, initialJobId }: JobPublishingPanelProps) {
  const openJobs = useMemo(() => jobs.filter((job) => job.status === "OPEN"), [jobs]);
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId ?? openJobs[0]?.id ?? "");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    if (initialJobId) {
      setSelectedJobId(initialJobId);
      return;
    }

    if (!openJobs.some((job) => job.id === selectedJobId)) {
      setSelectedJobId(openJobs[0]?.id ?? "");
    }
  }, [initialJobId, openJobs, selectedJobId]);

  const selectedJob = openJobs.find((job) => job.id === selectedJobId) ?? openJobs[0];
  const generatedPost = selectedJob ? buildJobPost(selectedJob) : "";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(generatedPost);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2500);
    } catch {
      setCopyState("error");
    }
  }

  return (
    <section className="space-y-6">
      <Card className="border-slate-200 bg-gradient-to-r from-[#0f223d] to-[#1f4f89] text-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-200">Job Publishing Hub</p>
            <h2 className="mt-2 text-2xl font-semibold">Publicacao multicanal semi-automatica</h2>
            <p className="mt-3 text-sm text-slate-100/85">
              Seleciona a vaga do ATS, gera automaticamente o texto de publicacao e abre os canais
              externos a partir do mesmo contexto.
            </p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-slate-100">
            <p className="font-semibold">Fluxo automatico</p>
            <p className="mt-1 text-slate-200">Escolher job, copiar anuncio e abrir LinkedIn, SAPO ou Net-Empregos.</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex-1">
              <label htmlFor="job-selector" className="text-sm font-semibold text-foreground">
                Vaga no ATS
              </label>
              <select
                id="job-selector"
                value={selectedJob?.id ?? ""}
                onChange={(event) => {
                  setSelectedJobId(event.target.value);
                  setCopyState("idle");
                }}
                className="mt-2 h-11 w-full rounded-xl border border-border bg-slate-50 px-3"
              >
                {openJobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} | {job.location} | {job.seniority}
                  </option>
                ))}
              </select>
            </div>
            {selectedJob ? (
              <Link
                href={`/jobs/${selectedJob.id}`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-semibold text-foreground transition hover:bg-slate-50"
              >
                Ver detalhe da vaga
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>

          {selectedJob ? (
            <>
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Departamento</p>
                  <p className="mt-2 text-sm font-semibold">{selectedJob.department}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Localizacao</p>
                  <p className="mt-2 text-sm font-semibold">{selectedJob.location}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Senioridade</p>
                  <p className="mt-2 text-sm font-semibold">{selectedJob.seniority}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Contrato</p>
                  <p className="mt-2 text-sm font-semibold">{selectedJob.employmentType}</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Descricao pronta para publicar</h3>
                    <p className="mt-1 text-sm text-muted">
                      Texto gerado automaticamente a partir dos dados registados no ATS.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-[#132f55]"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar descricao
                  </button>
                </div>
                <textarea
                  readOnly
                  value={generatedPost}
                  className="mt-4 min-h-[360px] w-full rounded-2xl border border-border bg-slate-50 px-4 py-4 text-sm text-slate-700"
                />
                {copyState === "copied" ? (
                  <p className="mt-3 inline-flex items-center gap-2 text-sm text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Descricao copiada para a area de transferencia.
                  </p>
                ) : null}
                {copyState === "error" ? (
                  <p className="mt-3 text-sm text-rose-700">
                    Nao foi possivel copiar automaticamente. Podes copiar manualmente a partir do texto acima.
                  </p>
                ) : null}
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-muted">Nao existem vagas abertas para publicar neste momento.</p>
          )}
        </Card>

        <div className="space-y-4">
          {publishingChannels.map(({ name, href, description, icon: Icon, audience }) => (
            <Card key={name} className="flex h-full flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-2xl bg-slate-100 p-3 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    External portal
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{name}</h3>
                <p className="mt-2 text-sm text-muted">{description}</p>
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Best fit</p>
                  <p className="mt-2 text-sm text-slate-700">{audience}</p>
                </div>
              </div>
              <Link
                href={href}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#132f55]"
              >
                Abrir {name}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Card>
          ))}

          <Card>
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-slate-100 p-3 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Checklist automatizada</h3>
                <div className="mt-3 space-y-3">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-sm font-semibold">1. Selecionar vaga</p>
                    <p className="mt-2 text-sm text-muted">
                      O painel usa apenas jobs abertos para evitar publicacao de vagas fechadas ou pausadas.
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-sm font-semibold">2. Gerar anuncio</p>
                    <p className="mt-2 text-sm text-muted">
                      A descricao e montada automaticamente com titulo, localizacao, senioridade e skills.
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-sm font-semibold">3. Abrir portal</p>
                    <p className="mt-2 text-sm text-muted">
                      Abre o canal externo e cola o conteudo ja preparado. O preenchimento total depende de cada portal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
