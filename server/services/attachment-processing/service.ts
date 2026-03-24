import path from "node:path";

import { parseDocx, parsePdf } from "@/lib/parsing/attachments";
import { runOcr } from "@/lib/ocr/tesseract";
import { envBool } from "@/lib/utils/env";
import { safeWriteFile } from "@/lib/utils/storage";

function detectAttachmentType(filename: string) {
  const lower = filename.toLowerCase();
  if (lower.includes("cv") || lower.includes("resume")) return "cv";
  if (lower.includes("cover")) return "cover_letter";
  if (lower.includes("portfolio")) return "portfolio";
  return "supporting_document";
}

export async function processAttachment(input: {
  fileName: string;
  contentType: string;
  base64Content?: string;
  candidateKey: string;
}) {
  const normalizedFilename = `${input.candidateKey}-${input.fileName.replace(/[^\w.-]/g, "_")}`;
  const relativePath = `storage/attachments/${normalizedFilename}`;
  const fileBuffer = input.base64Content ? Buffer.from(input.base64Content, "base64") : Buffer.from("");
  await safeWriteFile(relativePath, fileBuffer);

  let parsedText = "";
  let parserType = "none";
  let parserConfidence = 0.2;
  const extension = path.extname(input.fileName).toLowerCase();

  if (extension === ".pdf") {
    parsedText = await parsePdf(relativePath).catch(() => "");
    parserType = "pdf-parse";
    parserConfidence = parsedText.length > 100 ? 0.84 : 0.45;
  } else if (extension === ".docx") {
    parsedText = await parseDocx(relativePath).catch(() => "");
    parserType = "mammoth";
    parserConfidence = parsedText.length > 100 ? 0.86 : 0.48;
  }

  if (envBool("OCR_ENABLED") && parsedText.length < 80) {
    parsedText = await runOcr(relativePath, process.env.OCR_LANGUAGE ?? "eng").catch(() => parsedText);
    parserType = "tesseract";
    parserConfidence = parsedText.length > 80 ? 0.63 : parserConfidence;
  }

  return {
    originalFilename: input.fileName,
    normalizedFilename,
    mimeType: input.contentType,
    filePath: relativePath,
    parsedText,
    parserType,
    parserConfidence,
    attachmentType: detectAttachmentType(input.fileName)
  };
}
