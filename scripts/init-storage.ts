import { ensureStorageDirs } from "@/lib/utils/storage";

ensureStorageDirs()
  .then(() => {
    console.log("Storage folders initialized.");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
