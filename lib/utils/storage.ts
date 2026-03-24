import fs from "node:fs/promises";
import path from "node:path";

import { STORAGE_DIRS } from "@/lib/constants/app";

export async function ensureStorageDirs() {
  await Promise.all(
    STORAGE_DIRS.map((dir) => fs.mkdir(path.join(process.cwd(), dir), { recursive: true }))
  );
}

export async function safeWriteFile(relativePath: string, content: Buffer | string) {
  const target = path.normalize(path.join(process.cwd(), relativePath));
  const base = path.normalize(process.cwd());
  if (!target.startsWith(base)) {
    throw new Error("Invalid file path");
  }

  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, content);
}
