import { prisma } from "@/lib/db/prisma";

async function main() {
  const count = await prisma.emailTemplate.count();
  console.log(`Email templates available: ${count}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
