import { createWorker } from "tesseract.js";

export async function runOcr(filePath: string, language = "eng") {
  const worker = await createWorker(language);
  const {
    data: { text }
  } = await worker.recognize(filePath);
  await worker.terminate();
  return text;
}
