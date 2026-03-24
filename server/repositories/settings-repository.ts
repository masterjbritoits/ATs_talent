import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

export class SettingsRepository {
  list() {
    return prisma.systemSetting.findMany({ orderBy: { key: "asc" } });
  }

  upsert(key: string, valueJson: unknown) {
    return prisma.systemSetting.upsert({
      where: { key },
      create: { key, valueJson: valueJson as Prisma.InputJsonValue },
      update: { valueJson: valueJson as Prisma.InputJsonValue }
    });
  }
}
