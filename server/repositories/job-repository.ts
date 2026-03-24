import { prisma } from "@/lib/db/prisma";

export class JobRepository {
  listOpen() {
    return prisma.job.findMany({
      where: { status: "OPEN" },
      orderBy: [{ title: "asc" }]
    });
  }

  listAll() {
    return prisma.job.findMany({
      include: {
        applications: { include: { candidate: true } }
      },
      orderBy: { updatedAt: "desc" }
    });
  }

  getById(id: string) {
    return prisma.job.findUnique({
      where: { id },
      include: {
        applications: {
          include: { candidate: true },
          orderBy: [{ score: "desc" }, { updatedAt: "desc" }]
        }
      }
    });
  }
}
