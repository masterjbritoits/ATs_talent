import { NextRequest, NextResponse } from "next/server";
import path from "node:path";

import { prisma } from "@/lib/db/prisma";
import { safeWriteFile } from "@/lib/utils/storage";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = new Set(["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart data" }, { status: 400 });
  }

  const fullName        = String(formData.get("fullName") ?? "").trim();
  const email           = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone           = String(formData.get("phone") ?? "").trim() || null;
  const linkedinUrl     = String(formData.get("linkedinUrl") ?? "").trim() || null;
  const jobId           = String(formData.get("jobId") ?? "").trim() || null;
  const preferredLang   = String(formData.get("preferredLanguage") ?? "pt").trim();
  const gdprConsentRaw  = formData.get("gdprConsent");
  const cvFile          = formData.get("cv") as File | null;

  // Validate required fields
  if (!fullName || !email) {
    return NextResponse.json({ error: "fullName e email são obrigatórios." }, { status: 400 });
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email inválido." }, { status: 400 });
  }

  if (!gdprConsentRaw) {
    return NextResponse.json({ error: "Consentimento RGPD é obrigatório." }, { status: 400 });
  }

  if (!cvFile || cvFile.size === 0) {
    return NextResponse.json({ error: "CV é obrigatório." }, { status: 400 });
  }

  if (cvFile.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "Ficheiro demasiado grande (máximo 10 MB)." }, { status: 413 });
  }

  if (!ALLOWED_MIME.has(cvFile.type)) {
    return NextResponse.json({ error: "Formato de ficheiro não suportado. Use PDF ou DOCX." }, { status: 415 });
  }

  // Sanitise filename — strip path components, keep only alphanumeric + extension
  const safeName = path
    .basename(cvFile.name)
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 120);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("x-real-ip")
    ?? "unknown";

  const cvBuffer = Buffer.from(await cvFile.arrayBuffer());

  // Upsert candidate
  const candidate = await prisma.candidate.upsert({
    where:  { primaryEmail: email },
    update: {
      fullName,
      phone,
      linkedinUrl,
      preferredLanguage: preferredLang,
      gdprConsent:       new Date(),
      gdprConsentIp:     ip,
    },
    create: {
      fullName,
      primaryEmail:          email,
      phone,
      linkedinUrl,
      preferredLanguage:     preferredLang,
      gdprConsent:           new Date(),
      gdprConsentIp:         ip,
      sourceType:            "CAREERS_PORTAL",
      parsedSkillsJson:      [],
      parsedLanguagesJson:   [],
      parsedEducationJson:   [],
      parsedExperienceJson:  [],
      domainSignalsJson:     {},
      status:                "NEW",
    },
  });

  // Persist CV to storage
  const relPath = `storage/attachments/${candidate.id}-${Date.now()}-${safeName}`;
  await safeWriteFile(relPath, cvBuffer);

  // Create attachment record
  const attachment = await prisma.attachment.create({
    data: {
      candidateId:        candidate.id,
      originalFilename:   cvFile.name.slice(0, 255),
      normalizedFilename: safeName,
      mimeType:           cvFile.type,
      filePath:           relPath,
      attachmentType:     "CV",
    },
  });

  // Create application
  const application = await prisma.application.create({
    data: {
      candidateId:       candidate.id,
      jobId:             jobId || null,
      source:            "CAREERS_PORTAL",
      status:            "NEW",
      appliedAt:         new Date(),
      scoreBreakdownJson: {},
      rationaleJson:     {},
      attachments:       { connect: [{ id: attachment.id }] },
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      entityType:   "Application",
      entityId:     application.id,
      action:       "CAREERS_APPLY",
      metadataJson: {
        candidateId: candidate.id,
        jobId:       jobId,
        source:      "CAREERS_PORTAL",
        ip,
      },
    },
  });

  return NextResponse.json({ ok: true, applicationId: application.id });
}
