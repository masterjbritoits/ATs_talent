import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"]
  });
}

export const prisma = global.prisma ?? createPrismaClient();

// Prevent multiple instances in development hot-reload
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

