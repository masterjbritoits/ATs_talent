import fs from "node:fs/promises";
import path from "node:path";

import { uploadBlob, downloadBlob } from "@/lib/storage/blob-client";
import { STORAGE_DIRS } from "@/lib/constants/app";

/** True when Azure Blob storage is configured and should be used. */
function useAzureBlob(): boolean {
  return !!(
    process.env.AZURE_STORAGE_ACCOUNT_NAME ||
    process.env.AZURE_STORAGE_CONNECTION_STRING
  );
}

/**
 * Ensures local storage directories exist.
 * No-op in production (Blob storage has no directories to create).
 */
export async function ensureStorageDirs() {
  if (useAzureBlob()) return;
  await Promise.all(
    STORAGE_DIRS.map((dir) => fs.mkdir(path.join(process.cwd(), dir), { recursive: true }))
  );
}

/**
 * Writes a file to Azure Blob Storage (production) or the local filesystem
 * (development). `relativePath` is the same path format used throughout the
 * existing codebase, e.g. `storage/attachments/candidate-key-file.pdf`.
 */
export async function safeWriteFile(relativePath: string, content: Buffer | string) {
  if (useAzureBlob()) {
    await uploadBlob(relativePath, content);
    return;
  }

  // Local filesystem path — guard against path traversal
  const target = path.normalize(path.join(process.cwd(), relativePath));
  const base = path.normalize(process.cwd());
  if (!target.startsWith(base)) {
    throw new Error("Invalid file path — path traversal detected.");
  }

  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, content);
}

/**
 * Reads a file from Azure Blob Storage (production) or the local filesystem
 * (development). Returns null when the file does not exist.
 */
export async function safeReadFile(relativePath: string): Promise<Buffer | null> {
  if (useAzureBlob()) {
    return downloadBlob(relativePath);
  }

  const target = path.normalize(path.join(process.cwd(), relativePath));
  const base = path.normalize(process.cwd());
  if (!target.startsWith(base)) {
    throw new Error("Invalid file path — path traversal detected.");
  }

  try {
    return await fs.readFile(target);
  } catch {
    return null;
  }
}

