import fs from "node:fs/promises";
import mammoth from "mammoth";
import pdfParse from "pdf-parse";

export async function parsePdf(filePath: string) {
  const buffer = await fs.readFile(filePath);
  const result = await pdfParse(buffer);
  return result.text;
}

export async function parseDocx(filePath: string) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}
