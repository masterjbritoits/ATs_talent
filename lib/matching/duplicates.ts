import { Candidate } from "@prisma/client";

import { DuplicateSuggestion } from "@/lib/types";

function normalizeName(name: string) {
  return name.toLowerCase().replace(/[^a-z]/g, "");
}

export function detectDuplicates(candidates: Candidate[]): DuplicateSuggestion[] {
  const groups = new Map<string, Candidate[]>();

  for (const candidate of candidates) {
    const key =
      candidate.duplicateGroupKey ??
      `${candidate.phone ?? ""}|${candidate.linkedinUrl ?? ""}|${normalizeName(candidate.fullName)}`;
    const items = groups.get(key) ?? [];
    items.push(candidate);
    groups.set(key, items);
  }

  return Array.from(groups.entries())
    .filter(([, items]) => items.length > 1)
    .map(([groupKey, items]) => ({
      groupKey,
      candidateIds: items.map((item) => item.id),
      confidence: Math.min(98, 70 + items.length * 8),
      reason: [
        items.every((item) => item.phone === items[0].phone)
          ? "Shared phone number"
          : "Shared duplicate group",
        items.some((item) => item.linkedinUrl) ? "LinkedIn overlap" : "Name similarity"
      ]
    }));
}
