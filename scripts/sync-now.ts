import { ensureStorageDirs } from "@/lib/utils/storage";
import { runMailboxSync } from "@/server/services/inbox-sync/service";

async function main() {
  await ensureStorageDirs();
  const result = await runMailboxSync();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
